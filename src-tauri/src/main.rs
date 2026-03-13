#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
mod menu;

mod streaming;
mod upload;

use tauri::{utils::config::AppUrl, WindowUrl};

/// Add GStreamer bin directory to PATH if not already present
/// This is needed because the GStreamer installer sets PATH but requires
/// a restart/relogin for the change to take effect
#[cfg(target_os = "windows")]
fn setup_gstreamer_path() {
    // Standard GStreamer installation paths
    let gst_paths = [
        "C:\\Program Files\\gstreamer\\1.0\\msvc_x86_64\\bin",
        "C:\\gstreamer\\1.0\\msvc_x86_64\\bin",
    ];

    // Check if GStreamer is already in PATH
    if let Ok(path) = std::env::var("PATH") {
        if path.to_lowercase().contains("gstreamer") {
            log::info!("GStreamer already in PATH");
            return;
        }
    }

    // Find and add GStreamer to PATH
    for gst_path in &gst_paths {
        let path = std::path::Path::new(gst_path);
        if path.exists() && path.join("gstreamer-1.0-0.dll").exists() {
            if let Ok(current_path) = std::env::var("PATH") {
                let new_path = format!("{};{}", gst_path, current_path);
                std::env::set_var("PATH", &new_path);
                log::info!("Added GStreamer to PATH: {}", gst_path);
            }
            return;
        }
    }

    log::warn!("GStreamer installation not found in standard locations");
}

#[cfg(not(target_os = "windows"))]
fn setup_gstreamer_path() {
    // No-op on non-Windows platforms
}

fn main() {
    // Initialize logger for debug output
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    // Add GStreamer to PATH before initialization
    setup_gstreamer_path();

    // Initialize GStreamer (uses system installation set up by NSIS installer)
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
