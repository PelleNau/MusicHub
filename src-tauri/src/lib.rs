use tauri::Manager;

mod app_menu;
mod commands;
mod sidecar;
mod tray;

pub fn run() {
    let _ = env_logger::builder().is_test(false).try_init();

    tauri::Builder::default()
        .menu(|app| app_menu::build(app))
        .on_menu_event(app_menu::handle_event)
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let sidecar_state = sidecar::build_state();
            app.manage(sidecar_state.clone());
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                sidecar::launch_and_monitor(app_handle, sidecar_state).await;
            });

            tray::setup(app)?;
            log::info!("MusicHub shell initialized");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_sidecar_status,
            commands::restart_sidecar,
            commands::get_shell_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running MusicHub");
}
