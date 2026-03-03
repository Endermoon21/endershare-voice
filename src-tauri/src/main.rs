#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
mod menu;

mod streaming;

use tauri::{utils::config::AppUrl, Manager, WindowUrl};

fn main() {
    // Initialize logger for debug output
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    let port = 44548;

    let mut context = tauri::generate_context!();
    let url = format!("http://localhost:{}", port).parse().unwrap();
    let window_url = WindowUrl::External(url);

    // Rewrite config for localhost IPC
    context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());
    context.config_mut().build.dev_path = AppUrl::Url(window_url.clone());

    let builder = tauri::Builder::default();

    #[cfg(target_os = "macos")]
    let builder = builder.menu(menu::menu());

    builder
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // Register streaming state
        .manage(streaming::StreamingState::default())
        // Register streaming commands
        .invoke_handler(tauri::generate_handler![
            streaming::list_capture_sources,
            streaming::start_stream,
            streaming::stop_stream,
            streaming::get_stream_status,
            streaming::check_ffmpeg,
        ])
        .run(context)
        .expect("error while building tauri application")
}
