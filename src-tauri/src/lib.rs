mod commands;
mod sidecar;
mod tray;

pub fn run() {
    let _ = env_logger::builder().is_test(false).try_init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                sidecar::launch_and_monitor(app_handle).await;
            });

            tray::setup(app)?;
            log::info!("The Flightcase shell initialized");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_sidecar_status,
            commands::restart_sidecar,
            commands::get_shell_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running The Flightcase");
}
