#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[cfg(target_os = "macos")]
mod menu;

mod streaming;
mod upload;

use tauri::{utils::config::AppUrl, WindowUrl};

/// Set up bundled GStreamer DLLs for loading
/// DLLs are copied to the app directory by the NSIS installer
#[cfg(target_os = "windows")]
fn setup_bundled_gstreamer() {
    use std::os::windows::ffi::OsStrExt;
    use std::io::Write;

    // Create a debug log file for troubleshooting
    let debug_log = || -> Option<std::fs::File> {
        let exe_path = std::env::current_exe().ok()?;
        let app_dir = exe_path.parent()?;
        let log_path = app_dir.join("gstreamer-debug.log");
        std::fs::File::create(log_path).ok()
    };

    let mut log_file = debug_log();
    let log = |file: &mut Option<std::fs::File>, msg: &str| {
        if let Some(f) = file {
            let _ = writeln!(f, "{}", msg);
        }
    };

    if let Ok(exe_path) = std::env::current_exe() {
        log(&mut log_file, &format!("exe_path: {:?}", exe_path));

        if let Some(app_dir) = exe_path.parent() {
            log(&mut log_file, &format!("app_dir: {:?}", app_dir));

            // List all DLLs in app_dir for debugging
            if let Ok(entries) = std::fs::read_dir(app_dir) {
                let dlls: Vec<String> = entries
                    .filter_map(|e| e.ok())
                    .filter(|e| e.path().extension().map_or(false, |ext| ext == "dll"))
                    .map(|e| e.file_name().to_string_lossy().to_string())
                    .collect();
                log(&mut log_file, &format!("DLLs in app_dir: {:?}", dlls));
            }

            // Also check resources folder
            let resources_dir = app_dir.join("resources");
            if resources_dir.exists() {
                if let Ok(entries) = std::fs::read_dir(&resources_dir) {
                    let dlls: Vec<String> = entries
                        .filter_map(|e| e.ok())
                        .filter(|e| e.path().extension().map_or(false, |ext| ext == "dll"))
                        .map(|e| e.file_name().to_string_lossy().to_string())
                        .collect();
                    log(&mut log_file, &format!("DLLs in resources: {:?}", dlls));
                }
            } else {
                log(&mut log_file, "resources folder does not exist");
            }

            // Check if bundled DLLs exist
            let gst_dll = app_dir.join("gstreamer-1.0-0.dll");
            log(&mut log_file, &format!("Checking for: {:?} exists={}", gst_dll, gst_dll.exists()));

            if gst_dll.exists() {
                // Set DLL search directory for transitive dependencies
                #[link(name = "kernel32")]
                extern "system" {
                    fn SetDllDirectoryW(lpPathName: *const u16) -> i32;
                }

                let wide: Vec<u16> = app_dir.as_os_str().encode_wide().chain(std::iter::once(0)).collect();
                let result = unsafe { SetDllDirectoryW(wide.as_ptr()) };
                log(&mut log_file, &format!("SetDllDirectory result: {}", result));
                if result != 0 {
                    log::info!("SetDllDirectory succeeded for {:?}", app_dir);
                } else {
                    log::warn!("SetDllDirectory failed for {:?}", app_dir);
                }

                // Also add to PATH for transitive dependencies
                if let Ok(current_path) = std::env::var("PATH") {
                    let new_path = format!("{};{}", app_dir.display(), current_path);
                    std::env::set_var("PATH", &new_path);
                    log(&mut log_file, "Added app_dir to PATH");
                    log::info!("Added app_dir to PATH");
                }

                // Set plugin path to app directory
                std::env::set_var("GST_PLUGIN_PATH", app_dir);
                log(&mut log_file, &format!("Set GST_PLUGIN_PATH to {:?}", app_dir));
                log::info!("Set GST_PLUGIN_PATH to {:?}", app_dir);

                // Enable GStreamer debug output
                std::env::set_var("GST_DEBUG", "3");
                std::env::set_var("GST_DEBUG_FILE", app_dir.join("gstreamer-runtime.log").to_string_lossy().to_string());

                // Use app-local registry
                let registry_path = app_dir.join("gstreamer-registry.bin");
                std::env::set_var("GST_REGISTRY", &registry_path);
                log(&mut log_file, &format!("Set GST_REGISTRY to {:?}", registry_path));

                // Disable forking for plugin scanning
                std::env::set_var("GST_REGISTRY_FORK", "no");

                // Isolate from system plugins
                std::env::set_var("GST_PLUGIN_SYSTEM_PATH", "");

                log(&mut log_file, "GStreamer setup complete");
            } else {
                log(&mut log_file, "gstreamer-1.0-0.dll NOT FOUND in app_dir");
                log::warn!("Bundled GStreamer DLLs not found in {:?}", app_dir);
            }
        }
    }
}

#[cfg(not(target_os = "windows"))]
fn setup_bundled_gstreamer() {
    // No-op on non-Windows platforms
}

fn main() {
    // Initialize logger for debug output
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    // Set up bundled GStreamer before initialization
    setup_bundled_gstreamer();

    // Initialize GStreamer
    if let Err(e) = gstreamer::init() {
        log::error!("Failed to initialize GStreamer: {}. Streaming will not be available.", e);
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
