use tauri::{
    menu::{AboutMetadata, Menu, MenuEvent, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Emitter, Runtime,
};

const SCALE_UP_MENU_ID: &str = "view.scale_up";
const SCALE_DOWN_MENU_ID: &str = "view.scale_down";
const SCALE_RESET_MENU_ID: &str = "view.scale_reset";
const INTERFACE_SCALE_EVENT: &str = "app:interface-scale";

pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let pkg_info = app.package_info();
    let config = app.config();
    let about_metadata = AboutMetadata {
        name: Some(pkg_info.name.clone()),
        version: Some(pkg_info.version.to_string()),
        copyright: config.bundle.copyright.clone(),
        authors: config
            .bundle
            .publisher
            .clone()
            .map(|publisher| vec![publisher]),
        ..Default::default()
    };

    let scale_up = MenuItem::with_id(app, SCALE_UP_MENU_ID, "Scale Up", true, Some("CmdOrCtrl+="))?;
    let scale_down = MenuItem::with_id(
        app,
        SCALE_DOWN_MENU_ID,
        "Scale Down",
        true,
        Some("CmdOrCtrl+-"),
    )?;
    let scale_reset = MenuItem::with_id(
        app,
        SCALE_RESET_MENU_ID,
        "Actual Size",
        true,
        Some("CmdOrCtrl+0"),
    )?;

    let view_menu = Submenu::with_items(
        app,
        "View",
        true,
        &[
            &scale_up,
            &scale_down,
            &scale_reset,
            &PredefinedMenuItem::separator(app)?,
            #[cfg(target_os = "macos")]
            &PredefinedMenuItem::fullscreen(app, None)?,
        ],
    )?;

    let window_menu = Submenu::with_items(
        app,
        "Window",
        true,
        &[
            &PredefinedMenuItem::minimize(app, None)?,
            &PredefinedMenuItem::maximize(app, None)?,
            #[cfg(target_os = "macos")]
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::close_window(app, None)?,
        ],
    )?;

    let help_menu = Submenu::with_items(
        app,
        "Help",
        true,
        &[
            #[cfg(not(target_os = "macos"))]
            &PredefinedMenuItem::about(app, None, Some(about_metadata.clone()))?,
        ],
    )?;

    Menu::with_items(
        app,
        &[
            #[cfg(target_os = "macos")]
            &Submenu::with_items(
                app,
                pkg_info.name.clone(),
                true,
                &[
                    &PredefinedMenuItem::about(app, None, Some(about_metadata))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::services(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, None)?,
                    &PredefinedMenuItem::hide_others(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?,
            #[cfg(not(any(
                target_os = "linux",
                target_os = "dragonfly",
                target_os = "freebsd",
                target_os = "netbsd",
                target_os = "openbsd"
            )))]
            &Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &PredefinedMenuItem::close_window(app, None)?,
                    #[cfg(not(target_os = "macos"))]
                    &PredefinedMenuItem::quit(app, None)?,
                ],
            )?,
            &Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, None)?,
                    &PredefinedMenuItem::redo(app, None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, None)?,
                    &PredefinedMenuItem::copy(app, None)?,
                    &PredefinedMenuItem::paste(app, None)?,
                    &PredefinedMenuItem::select_all(app, None)?,
                ],
            )?,
            &view_menu,
            &window_menu,
            &help_menu,
        ],
    )
}

pub fn handle_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    let command = match event.id().as_ref() {
        SCALE_UP_MENU_ID => Some("up"),
        SCALE_DOWN_MENU_ID => Some("down"),
        SCALE_RESET_MENU_ID => Some("reset"),
        _ => None,
    };

    if let Some(command) = command {
        let _ = app.emit(INTERFACE_SCALE_EVENT, command);
    }
}
