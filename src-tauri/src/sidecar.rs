use std::sync::Arc;
use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use tokio::sync::{Mutex, Notify, RwLock};
use tokio::time::sleep;

const HEALTH_URL: &str = "http://127.0.0.1:8080/health";
const HEALTH_INTERVAL: Duration = Duration::from_secs(3);
const RESTART_DELAY: Duration = Duration::from_secs(2);
const MAX_RESTART_ATTEMPTS: u32 = 5;

#[derive(Clone, serde::Serialize)]
pub struct SidecarStatus {
    pub running: bool,
    pub pid: Option<u32>,
    pub restart_count: u32,
    pub healthy: bool,
    pub last_error: Option<String>,
}

pub struct SidecarState {
    pub status: RwLock<SidecarStatus>,
    child: Mutex<Option<CommandChild>>,
    restart_notify: Notify,
}

impl Default for SidecarState {
    fn default() -> Self {
        Self {
            status: RwLock::new(SidecarStatus {
                running: false,
                pid: None,
                restart_count: 0,
                healthy: false,
                last_error: None,
            }),
            child: Mutex::new(None),
            restart_notify: Notify::new(),
        }
    }
}

pub async fn launch_and_monitor(app: AppHandle) {
    let state = Arc::new(SidecarState::default());
    app.manage(state.clone());

    let mut restart_count: u32 = 0;

    loop {
        log::info!("Launching plugin_host sidecar (attempt {})", restart_count + 1);

        match spawn_sidecar(&app, &state).await {
            Ok(pid) => {
                {
                    let mut status = state.status.write().await;
                    status.running = true;
                    status.pid = Some(pid);
                    status.restart_count = restart_count;
                    status.last_error = None;
                }
                emit_status(&app, &state).await;
                wait_for_healthy(&app, &state).await;

                let terminate_reason = monitor_sidecar(&app, &state).await;

                {
                    let mut child = state.child.lock().await;
                    *child = None;
                }

                let mut status = state.status.write().await;
                status.running = false;
                status.healthy = false;
                status.pid = None;
                status.last_error = terminate_reason;
                drop(status);
                emit_status(&app, &state).await;
            }
            Err(err) => {
                log::error!("Failed to spawn plugin_host: {}", err);
                let mut status = state.status.write().await;
                status.running = false;
                status.healthy = false;
                status.pid = None;
                status.last_error = Some(err);
                drop(status);
                emit_status(&app, &state).await;
            }
        }

        restart_count += 1;
        if restart_count >= MAX_RESTART_ATTEMPTS {
            let message = format!("Exceeded max restart attempts ({MAX_RESTART_ATTEMPTS})");
            log::error!("{message}");
            let mut status = state.status.write().await;
            status.last_error = Some(message);
            drop(status);
            emit_status(&app, &state).await;
            break;
        }

        log::info!("Restarting plugin_host in {:?}...", RESTART_DELAY);
        sleep(RESTART_DELAY).await;
    }
}

pub async fn request_restart(app: &AppHandle) -> Result<(), String> {
    let state = app.state::<Arc<SidecarState>>();
    let child = {
        let mut slot = state.child.lock().await;
        slot.take()
    };
    if let Some(running_child) = child {
        running_child
            .kill()
            .map_err(|err| format!("Failed to terminate sidecar: {err}"))?;
    }
    state.restart_notify.notify_one();
    let _ = app.emit("sidecar:restart-requested", ());
    Ok(())
}

async fn spawn_sidecar(app: &AppHandle, state: &Arc<SidecarState>) -> Result<u32, String> {
    let shell = app.shell();
    let command = shell
        .sidecar("plugin_host")
        .map_err(|err| format!("Sidecar command error: {err}"))?
        .args(["--port", "8080", "--ws"]);

    let (mut rx, child) = command
        .spawn()
        .map_err(|err| format!("Spawn failed: {err}"))?;

    let pid = child.pid();
    {
        let mut slot = state.child.lock().await;
        *slot = Some(child);
    }

    let app_clone = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let text = String::from_utf8_lossy(&line).to_string();
                    log::debug!("[plugin_host] {text}");
                    let _ = app_clone.emit("sidecar:stdout", text);
                }
                CommandEvent::Stderr(line) => {
                    let text = String::from_utf8_lossy(&line).to_string();
                    log::warn!("[plugin_host] ERR: {text}");
                    let _ = app_clone.emit("sidecar:stderr", text);
                }
                CommandEvent::Terminated(status) => {
                    let payload = format!("{status:?}");
                    log::info!("[plugin_host] terminated with: {payload}");
                    let _ = app_clone.emit("sidecar:terminated", payload);
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(pid)
}

async fn monitor_sidecar(app: &AppHandle, state: &Arc<SidecarState>) -> Option<String> {
    loop {
        tokio::select! {
            _ = sleep(HEALTH_INTERVAL) => {
                match check_health().await {
                    Ok(true) => {
                        let mut status = state.status.write().await;
                        if !status.healthy {
                            status.healthy = true;
                            drop(status);
                            emit_status(app, state).await;
                        }
                    }
                    _ => {
                        log::warn!("plugin_host health check failed");
                        return Some("Health check failed".into());
                    }
                }
            }
            _ = state.restart_notify.notified() => {
                return Some("Restart requested".into());
            }
        }
    }
}

async fn check_health() -> Result<bool, ()> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .map_err(|_| ())?;

    match client.get(HEALTH_URL).send().await {
        Ok(resp) => Ok(resp.status().is_success()),
        Err(_) => Ok(false),
    }
}

async fn wait_for_healthy(app: &AppHandle, state: &Arc<SidecarState>) {
    for i in 0..20 {
        sleep(Duration::from_millis(250)).await;
        if let Ok(true) = check_health().await {
            log::info!("plugin_host healthy after {}ms", (i + 1) * 250);
            let mut status = state.status.write().await;
            status.healthy = true;
            drop(status);
            emit_status(app, state).await;
            return;
        }
    }

    log::warn!("plugin_host did not become healthy within 5s");
    let mut status = state.status.write().await;
    status.last_error = Some("plugin_host did not become healthy within 5s".into());
}

async fn emit_status(app: &AppHandle, state: &Arc<SidecarState>) {
    let status = state.status.read().await;
    let _ = app.emit("sidecar:status", status.clone());
}
