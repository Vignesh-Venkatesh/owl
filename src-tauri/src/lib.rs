mod indexer;

use indexer::AppEntry;
use std::process::{Command, Stdio};
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn search_apps(app: tauri::AppHandle) -> Vec<AppEntry> {
    let apps = indexer::index_apps();

    println!("search_apps returning {} apps", apps.len());
    let scope = app.asset_protocol_scope();

    for entry in &apps {
        if let Some(icon) = &entry.icon {
            if let Err(error) = scope.allow_file(icon) {
                eprintln!("warning: could not allow icon {}: {}", icon, error);
            }
        }
    }

    apps
}

#[tauri::command]
fn launch_app(exec: String, terminal: bool) -> Result<(), String> {
    // keeping is simple for now
    // not a complete parser
    let mut parts = exec.split_whitespace();

    let Some(program) = parts.next() else {
        return Err("cannot launch an empty Exec command".to_string());
    };

    let args: Vec<&str> = parts.collect();

    let mut command = if terminal {
        let mut terminal_command = Command::new("x-terminal-emulator");

        terminal_command.arg("-e").arg(program).args(&args);

        terminal_command
    } else {
        let mut app_command = Command::new(program);

        app_command.args(&args);

        app_command
    };

    command
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        // using spawn without wait coz it will start the application and return to its own event loop
        // instead of blocking until that app exits
        .spawn()
        .map_err(|error| format!("failed to launch application: {error}"))?;

    Ok(())
}

// startup function
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        // install global shortcut plugin
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.center();
                                let _ = window.set_focusable(true);
                                let _ = window.set_always_on_top(true);
                                let _ = window.unminimize();
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(),
        )
        // install opener plugin
        .plugin(tauri_plugin_opener::init())
        // making greet function callable from frontend
        .invoke_handler(tauri::generate_handler![greet, search_apps, launch_app])
        .on_window_event(|window, event| {
            if window.label() == "main" {
                if let tauri::WindowEvent::Focused(false) = event {
                    let _ = window.hide();
                }
            }
        })
        // runs during startup
        .setup(|app| {
            // shortcut
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::Space);

            // registering shortcut globally
            app.global_shortcut().register(shortcut)?;
            Ok(())
        })
        // launching the app
        .run(tauri::generate_context!())
        // crash message
        .expect("error while running tauri application");
}
