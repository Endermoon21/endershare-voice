#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
mod menu;

mod streaming;
mod upload;

use tauri::{utils::config::AppUrl, WindowUrl};

fn main() {
    // Initialize logger for debug output
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    // Initialize GStreamer (uses system installation set up by NSIS installer)
    // GStreamer installer sets GSTREAMER_1_0_ROOT_MSVC_X86_64 and adds bin to PATH
    if let Err(e) = gstreamer::init() {
        log::error!("Failed to initialize GStreamer: {}. Streaming will not be available.", e);
        log::error!("Please ensure GStreamer is installed. The installer should have set it up automatically.");
    } else {
        log::info!("GStreamer initialized successfully");

        // Log loaded plugins for debugging
        let registry = gstreamer::Registry::get();
        let plugins: Vec<String> = registry.plugins().iter()
            .map(|p| p.plugin_name().to_string())
            .collect();
        log::info!("GStreamer plugins loaded: {} total", plugins.len());

        // Check for critical plugins
        let has_rswebrtc = gstreamer::ElementFactory::find("whipclientsink").is_some();
        let has_d3d11 = gstreamer::ElementFactory::find("d3d11screencapturesrc").is_some();
        log::info!("Critical plugins - whipclientsink: {}, d3d11screencapturesrc: {}", has_rswebrtc, has_d3d11);
    }

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
        // Register streaming and upload commands
        .invoke_handler(tauri::generate_handler![
            streaming::list_capture_sources,
            streaming::start_stream,
            streaming::stop_stream,
            streaming::get_stream_status,
            streaming::check_gstreamer,
            upload::native_upload_file,
            upload::cancel_native_upload,
        ])
        .run(context)
        .expect("error while building tauri application")
}
