use crate::sidecar::{request_restart, SidecarState, SidecarStatus};
use tauri::{AppHandle, Manager};

#[tauri::command]
pub async fn get_sidecar_status(app: AppHandle) -> Result<SidecarStatus, String> {
    let state = app.state::<std::sync::Arc<SidecarState>>();
    let status = state.status.read().await;
    Ok(status.clone())
}

#[tauri::command]
pub async fn restart_sidecar(app: AppHandle) -> Result<(), String> {
    request_restart(&app).await
}

#[tauri::command]
pub fn get_shell_info() -> serde_json::Value {
    serde_json::json!({
        "shell": "tauri",
        "version": env!("CARGO_PKG_VERSION"),
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
    })
}
