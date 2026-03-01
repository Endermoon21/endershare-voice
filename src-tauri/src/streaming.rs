//! Native game streaming via FFmpeg and GStreamer WHIP
//!
//! This module provides:
//! - Screen/window enumeration via Windows API
//! - FFmpeg sidecar management for WHIP streaming
//! - GStreamer sidecar with whipclientsink for TURN support
//! - Stream status monitoring

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::fs::OpenOptions;
use std::io::Write;
use tauri::api::process::{Command, CommandChild, CommandEvent};
use tauri::{AppHandle, Manager};

/// Streaming backend
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "lowercase")]
pub enum StreamBackend {
    FFmpeg,
    #[default]
    GStreamer,
}

/// Capture source (screen or window)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureSource {
    pub id: String,
    pub name: String,
    pub source_type: String, // "screen" or "window"
    pub width: Option<u32>,
    pub height: Option<u32>,
}

/// Stream configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamConfig {
    pub source_id: String,
    pub whip_url: String,
    pub width: u32,
    pub height: u32,
    pub fps: u32,
    pub bitrate: u32,        // in kbps
    pub encoder: String,     // "nvenc", "qsv", "amf", "x264"
    pub preset: String,      // encoder preset (p1-p7 for nvenc)
    pub audio_enabled: bool,
    pub bearer_token: Option<String>,
    #[serde(default)]
    pub backend: StreamBackend,
    pub turn_server: Option<String>,  // For GStreamer TURN support
}

/// Stream status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamStatus {
    pub active: bool,
    pub source_id: Option<String>,
    pub whip_url: Option<String>,
    pub duration_seconds: u64,
    pub error: Option<String>,
    pub backend: Option<String>,
}

/// FFmpeg availability info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FFmpegInfo {
    pub available: bool,
    pub version: Option<String>,
    pub encoders: Vec<String>,
    pub whip_support: bool,
}

/// GStreamer availability info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GStreamerInfo {
    pub available: bool,
    pub version: Option<String>,
    pub has_whip: bool,
    pub has_d3d11: bool,
    pub has_x264: bool,
    pub has_openh264: bool,
}

/// Shared state that can be sent across threads
#[derive(Clone, Default)]
pub struct SharedState {
    pub last_error: Arc<Mutex<Option<String>>>,
    pub is_running: Arc<Mutex<bool>>,
}

/// State for managing streams
pub struct StreamingState {
    stream_child: Mutex<Option<CommandChild>>,
    current_config: Mutex<Option<StreamConfig>>,
    start_time: Mutex<Option<std::time::Instant>>,
    shared: SharedState,
    current_backend: Mutex<Option<StreamBackend>>,
}

impl Default for StreamingState {
    fn default() -> Self {
        Self {
            stream_child: Mutex::new(None),
            current_config: Mutex::new(None),
            start_time: Mutex::new(None),
            shared: SharedState::default(),
            current_backend: Mutex::new(None),
        }
    }
}

/// Log to debug file (Windows)
fn log_to_file(message: &str) {
    #[cfg(target_os = "windows")]
    {
        if let Ok(mut file) = OpenOptions::new()
            .create(true)
            .append(true)
            .open("C:\\Users\\VOLTA\\streaming_debug.log")
        {
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            let _ = writeln!(file, "[{}] {}", timestamp, message);
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        log::info!("{}", message);
    }
}

/// List available capture sources (screens and windows)
#[tauri::command]
pub async fn list_capture_sources() -> Result<Vec<CaptureSource>, String> {
    #[cfg(target_os = "windows")]
    {
        use std::panic;

        // Try to enumerate sources, fall back to desktop-only on error
        let result = panic::catch_unwind(|| {
            list_windows_sources_safe()
        });

        match result {
            Ok(Ok(sources)) if !sources.is_empty() => Ok(sources),
            _ => {
                // Fallback to just desktop
                Ok(vec![CaptureSource {
                    id: "desktop".to_string(),
                    name: "Desktop (Full Screen)".to_string(),
                    source_type: "screen".to_string(),
                    width: None,
                    height: None,
                }])
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(vec![CaptureSource {
            id: "desktop".to_string(),
            name: "Desktop".to_string(),
            source_type: "screen".to_string(),
            width: None,
            height: None,
        }])
    }
}

#[cfg(target_os = "windows")]
fn list_windows_sources_safe() -> Result<Vec<CaptureSource>, String> {
    use windows::Win32::Foundation::{BOOL, HWND, LPARAM, RECT};
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetWindowRect, GetWindowTextLengthW, GetWindowTextW, IsWindowVisible,
        GetWindowLongW, GWL_EXSTYLE, WS_EX_TOOLWINDOW,
    };

    let mut sources = Vec::new();

    // Always add desktop first
    sources.push(CaptureSource {
        id: "desktop".to_string(),
        name: "Desktop (Full Screen)".to_string(),
        source_type: "screen".to_string(),
        width: None,
        height: None,
    });

    // Enumerate windows
    unsafe {
        unsafe extern "system" fn enum_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
            let sources = &mut *(lparam.0 as *mut Vec<CaptureSource>);

            // Skip invisible windows
            if !IsWindowVisible(hwnd).as_bool() {
                return BOOL(1);
            }

            // Skip tool windows
            let ex_style = GetWindowLongW(hwnd, GWL_EXSTYLE) as u32;
            if ex_style & WS_EX_TOOLWINDOW.0 != 0 {
                return BOOL(1);
            }

            // Get window title
            let title_len = GetWindowTextLengthW(hwnd);
            if title_len == 0 {
                return BOOL(1);
            }

            let mut title_buf = vec![0u16; (title_len + 1) as usize];
            let len = GetWindowTextW(hwnd, &mut title_buf);
            if len == 0 {
                return BOOL(1);
            }

            let title = String::from_utf16_lossy(&title_buf[..len as usize]);

            // Filter out system windows
            let skip_titles = [
                "Program Manager",
                "Windows Input Experience",
                "Microsoft Text Input",
                "NVIDIA GeForce Overlay",
                "AMD Software",
                "Settings",
                "Task View",
                "Search",
                "",
            ];

            if skip_titles.iter().any(|&s| title.starts_with(s) || title == s) {
                return BOOL(1);
            }

            // Get window size
            let mut rect = RECT::default();
            if GetWindowRect(hwnd, &mut rect).is_ok() {
                let width = (rect.right - rect.left) as u32;
                let height = (rect.bottom - rect.top) as u32;

                // Skip tiny windows
                if width < 200 || height < 150 {
                    return BOOL(1);
                }

                // Limit to 20 windows max
                if sources.len() >= 21 {
                    return BOOL(0); // Stop enumeration
                }

                // Use title= format for gdigrab
                let escaped_title = title.replace("\"", "\\\"");
                sources.push(CaptureSource {
                    id: format!("title={}", escaped_title),
                    name: if title.len() > 45 {
                        format!("{}...", &title[..42])
                    } else {
                        title
                    },
                    source_type: "window".to_string(),
                    width: Some(width),
                    height: Some(height),
                });
            }

            BOOL(1)
        }

        let sources_ptr = &mut sources as *mut Vec<CaptureSource>;
        let _ = EnumWindows(Some(enum_callback), LPARAM(sources_ptr as isize));
    }

    Ok(sources)
}

/// Get GStreamer environment variables
fn get_gstreamer_env(app: &AppHandle) -> HashMap<String, String> {
    let mut env = HashMap::new();

    // Get the resource directory where GStreamer is bundled
    if let Some(resource_dir) = app.path_resolver().resource_dir() {
        let gst_bin = resource_dir.join("gstreamer").join("bin");
        let gst_plugins = resource_dir.join("gstreamer").join("lib").join("gstreamer-1.0");

        // Set GST_PLUGIN_PATH to our bundled plugins
        env.insert(
            "GST_PLUGIN_PATH".to_string(),
            gst_plugins.to_string_lossy().to_string()
        );

        // Disable system plugins to avoid conflicts
        env.insert("GST_PLUGIN_SYSTEM_PATH".to_string(), String::new());

        // Add GStreamer bin to PATH for DLL loading
        let current_path = std::env::var("PATH").unwrap_or_default();
        let new_path = format!("{};{}", gst_bin.to_string_lossy(), current_path);
        env.insert("PATH".to_string(), new_path);

        // Optional: disable registry updates for faster startup
        env.insert("GST_REGISTRY_UPDATE".to_string(), "no".to_string());

        log_to_file(&format!("GStreamer env: PLUGIN_PATH={}", gst_plugins.display()));
    } else {
        log_to_file("Warning: Could not get resource directory for GStreamer");
    }

    env
}

/// Start streaming to WHIP endpoint
#[tauri::command]
pub async fn start_stream(
    app: AppHandle,
    config: StreamConfig,
) -> Result<(), String> {
    let state = app.state::<StreamingState>();

    {
        let child = state.stream_child.lock().map_err(|e| e.to_string())?;
        if child.is_some() {
            return Err("Already streaming".to_string());
        }
    }

    let backend = config.backend.clone();
    let (command_name, args, env_vars): (_, Vec<String>, HashMap<String, String>) = match backend {
        StreamBackend::GStreamer => {
            let args = build_gstreamer_args(&config)?;
            let env = get_gstreamer_env(&app);
            ("gst-launch-1.0", args, env)
        }
        StreamBackend::FFmpeg => {
            let args = build_ffmpeg_args(&config)?;
            ("ffmpeg", args, HashMap::new())
        }
    };

    // Log the full command for debugging
    let cmd_str = format!("{} {}", command_name, args.join(" "));
    log::info!("[{}] Starting: {}", command_name, cmd_str);
    log_to_file(&format!("Starting {}: {}", command_name, cmd_str));

    let (mut rx, child) = Command::new_sidecar(command_name)
        .map_err(|e| format!("Failed to create {} sidecar: {}", command_name, e))?
        .envs(env_vars)
        .args(&args)
        .spawn()
        .map_err(|e| format!("Failed to spawn {}: {}", command_name, e))?;

    {
        let mut child_lock = state.stream_child.lock().map_err(|e| e.to_string())?;
        *child_lock = Some(child);
    }
    {
        let mut config_lock = state.current_config.lock().map_err(|e| e.to_string())?;
        *config_lock = Some(config);
    }
    {
        let mut start_lock = state.start_time.lock().map_err(|e| e.to_string())?;
        *start_lock = Some(std::time::Instant::now());
    }
    {
        let mut error_lock = state.shared.last_error.lock().map_err(|e| e.to_string())?;
        *error_lock = None;
    }
    {
        let mut running = state.shared.is_running.lock().map_err(|e| e.to_string())?;
        *running = true;
    }
    {
        let mut backend_lock = state.current_backend.lock().map_err(|e| e.to_string())?;
        *backend_lock = Some(backend);
    }

    let shared = state.shared.clone();
    let backend_name = command_name.to_string();

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stderr(line) => {
                    log::info!("[{}] {}", backend_name, line);
                    log_to_file(&line);
                    if line.contains("Error") || line.contains("error") || line.contains("ERROR") {
                        if let Ok(mut error) = shared.last_error.lock() {
                            *error = Some(line);
                        }
                    }
                }
                CommandEvent::Stdout(line) => {
                    log::debug!("[{} stdout] {}", backend_name, line);
                    log_to_file(&format!("[stdout] {}", line));
                }
                CommandEvent::Terminated(payload) => {
                    let msg = format!("{} exited with code: {:?}, signal: {:?}",
                        backend_name, payload.code, payload.signal);
                    log::error!("[{}] {}", backend_name, msg);
                    log_to_file(&msg);
                    if let Ok(mut running) = shared.is_running.lock() {
                        *running = false;
                    }
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(())
}

/// Stop streaming
#[tauri::command]
pub async fn stop_stream(app: AppHandle) -> Result<(), String> {
    let state = app.state::<StreamingState>();

    let child_opt = {
        let mut child_lock = state.stream_child.lock().map_err(|e| e.to_string())?;
        child_lock.take()
    };

    if let Some(child) = child_opt {
        log_to_file("Stopping stream (kill)");
        let _ = child.kill();
    }

    {
        let mut config = state.current_config.lock().map_err(|e| e.to_string())?;
        *config = None;
    }
    {
        let mut start = state.start_time.lock().map_err(|e| e.to_string())?;
        *start = None;
    }
    {
        let mut running = state.shared.is_running.lock().map_err(|e| e.to_string())?;
        *running = false;
    }
    {
        let mut backend = state.current_backend.lock().map_err(|e| e.to_string())?;
        *backend = None;
    }

    Ok(())
}

/// Get current stream status
#[tauri::command]
pub async fn get_stream_status(app: AppHandle) -> Result<StreamStatus, String> {
    let state = app.state::<StreamingState>();

    let child = state.stream_child.lock().map_err(|e| e.to_string())?;
    let config = state.current_config.lock().map_err(|e| e.to_string())?;
    let start_time = state.start_time.lock().map_err(|e| e.to_string())?;
    let last_error = state.shared.last_error.lock().map_err(|e| e.to_string())?;
    let backend = state.current_backend.lock().map_err(|e| e.to_string())?;

    let active = child.is_some();
    let duration_seconds = start_time
        .as_ref()
        .map(|t| t.elapsed().as_secs())
        .unwrap_or(0);

    Ok(StreamStatus {
        active,
        source_id: config.as_ref().map(|c| c.source_id.clone()),
        whip_url: config.as_ref().map(|c| c.whip_url.clone()),
        duration_seconds,
        error: last_error.clone(),
        backend: backend.as_ref().map(|b| match b {
            StreamBackend::FFmpeg => "ffmpeg".to_string(),
            StreamBackend::GStreamer => "gstreamer".to_string(),
        }),
    })
}

/// Check FFmpeg availability and capabilities
#[tauri::command]
pub async fn check_ffmpeg() -> Result<FFmpegInfo, String> {
    let version_result = Command::new_sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(["-version"])
        .output();

    let version_output = match version_result {
        Ok(output) => output,
        Err(_) => {
            return Ok(FFmpegInfo {
                available: false,
                version: None,
                encoders: vec![],
                whip_support: false,
            });
        }
    };

    let version_str = &version_output.stdout;
    let version = version_str
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(2))
        .map(|s| s.to_string());

    let encoders_output = Command::new_sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(["-encoders", "-hide_banner"])
        .output()
        .map_err(|e| e.to_string())?;

    let encoders_str = &encoders_output.stdout;
    let mut encoders = Vec::new();

    if encoders_str.contains("h264_nvenc") {
        encoders.push("nvenc".to_string());
    }
    if encoders_str.contains("h264_qsv") {
        encoders.push("qsv".to_string());
    }
    if encoders_str.contains("h264_amf") {
        encoders.push("amf".to_string());
    }
    if encoders_str.contains("h264_mf") {
        encoders.push("mf".to_string());
    }
    if encoders_str.contains("libx264") {
        encoders.push("x264".to_string());
    }

    let formats_output = Command::new_sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(["-muxers", "-hide_banner"])
        .output()
        .map_err(|e| e.to_string())?;

    let formats_str = &formats_output.stdout;
    let whip_support = formats_str.contains(" whip ");

    Ok(FFmpegInfo {
        available: true,
        version,
        encoders,
        whip_support,
    })
}

/// Check GStreamer availability and capabilities
#[tauri::command]
pub async fn check_gstreamer(app: AppHandle) -> Result<GStreamerInfo, String> {
    let env_vars = get_gstreamer_env(&app);

    // Check version
    let version_result = Command::new_sidecar("gst-launch-1.0")
        .map_err(|e| e.to_string())?
        .envs(env_vars.clone())
        .args(["--version"])
        .output();

    let version_output = match version_result {
        Ok(output) => output,
        Err(e) => {
            log_to_file(&format!("GStreamer not available: {}", e));
            return Ok(GStreamerInfo {
                available: false,
                version: None,
                has_whip: false,
                has_d3d11: false,
                has_x264: false,
                has_openh264: false,
            });
        }
    };

    let version_str = &version_output.stdout;
    let version = version_str
        .lines()
        .next()
        .map(|s| s.to_string());

    // Check for required elements by trying to inspect them
    // We'll use a simple pipeline test instead of gst-inspect for reliability
    let mut has_whip = false;
    let mut has_d3d11 = false;
    let mut has_x264 = false;
    let mut has_openh264 = false;

    // Check whipclientsink via plugin help
    if let Ok(whip_cmd) = Command::new_sidecar("gst-launch-1.0") {
        if let Ok(output) = whip_cmd
            .envs(env_vars.clone())
            .args(["--gst-plugin-help"])
            .output()
        {
            let help_str = format!("{}{}", output.stdout, output.stderr);
            has_whip = help_str.contains("whipclientsink") || help_str.contains("rswebrtc");
            has_d3d11 = help_str.contains("d3d11");
            has_x264 = help_str.contains("x264");
            has_openh264 = help_str.contains("openh264");
        }
    }

    log_to_file(&format!(
        "GStreamer check: version={:?}, whip={}, d3d11={}, x264={}, openh264={}",
        version, has_whip, has_d3d11, has_x264, has_openh264
    ));

    Ok(GStreamerInfo {
        available: true,
        version,
        has_whip,
        has_d3d11,
        has_x264,
        has_openh264,
    })
}

/// Build GStreamer pipeline arguments for WHIP streaming
fn build_gstreamer_args(config: &StreamConfig) -> Result<Vec<String>, String> {
    let mut pipeline_parts = Vec::new();

    // Screen capture source
    #[cfg(target_os = "windows")]
    {
        if config.source_id.starts_with("title=") {
            // Window capture - d3d11screencapturesrc doesn't support window titles well
            // Fall back to using desktop capture for now
            // TODO: Implement HWND-based window capture
            pipeline_parts.push("d3d11screencapturesrc monitor-index=0 show-cursor=true".to_string());
        } else {
            // Desktop capture with d3d11 (show-cursor=true to include mouse)
            pipeline_parts.push("d3d11screencapturesrc monitor-index=0 show-cursor=true".to_string());
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // Linux: use ximagesrc
        pipeline_parts.push("ximagesrc".to_string());
    }

    // Video caps and framerate - use single quotes for caps (works on Windows gst-launch)
    #[cfg(target_os = "windows")]
    {
        pipeline_parts.push(format!(
            "'video/x-raw(memory:D3D11Memory),framerate={}/1'",
            config.fps
        ));

        // D3D11 convert and scale - stay in GPU memory
        pipeline_parts.push("d3d11convert".to_string());
        pipeline_parts.push(format!(
            "'video/x-raw(memory:D3D11Memory),format=NV12,width={},height={}'",
            config.width, config.height
        ));

        // Keep in D3D11 memory for hardware encoder (mfh264enc/nvh264enc)
        // whipclientsink accepts video/x-raw(memory:D3D11Memory) and auto-selects
        // hardware encoder if available
    }

    #[cfg(not(target_os = "windows"))]
    {
        pipeline_parts.push("videoconvert".to_string());
        pipeline_parts.push(format!(
            "videoscale ! video/x-raw,width={},height={},framerate={}/1",
            config.width, config.height, config.fps
        ));
    }

    // whipclientsink handles encoding internally
    // It auto-discovers hardware encoders (mfh264enc, nvh264enc) if available
    // Encoder receives D3D11 memory directly for zero-copy encoding

    // WHIP sink with optimized bitrate settings
    // Bitrate properties are in bps (config.bitrate is kbps)
    let bitrate_bps = (config.bitrate * 1000) as u64;

    // Set min/max based on target bitrate
    // - min: 25% of target (floor for bad network)
    // - start: 80% of target (quick ramp-up)
    // - max: 150% of target (ceiling for burst)
    let min_bitrate = std::cmp::max(bitrate_bps / 4, 500_000);  // At least 500kbps
    let start_bitrate = bitrate_bps * 80 / 100;
    let max_bitrate = bitrate_bps * 150 / 100;

    let mut whip_args = format!(
        "whipclientsink name=whip min-bitrate={} max-bitrate={} start-bitrate={} \
         congestion-control=gcc signaller::whip-endpoint=\"{}\"",
        min_bitrate,
        max_bitrate,
        start_bitrate,
        config.whip_url
    );

    if let Some(ref token) = config.bearer_token {
        whip_args.push_str(&format!(" signaller::auth-token=\"{}\"", token));
    }

    if let Some(ref turn) = config.turn_server {
        // TURN server format: turn://username:password@host:port
        // GstValueArray syntax: <"value1", "value2">
        whip_args.push_str(&format!(" turn-servers=<\"{}\">", turn));
    }

    pipeline_parts.push(whip_args);

    // Build pipeline string - join with ! separator
    let pipeline_str = pipeline_parts.join(" ! ");

    log_to_file(&format!("GStreamer pipeline: {}", pipeline_str));

    // Pass as: gst-launch-1.0.exe -e "entire pipeline"
    // The pipeline must be a single quoted argument on Windows
    Ok(vec![
        "-e".to_string(),
        pipeline_str,
    ])
}

/// Build FFmpeg command arguments - optimized for WHIP streaming
fn build_ffmpeg_args(config: &StreamConfig) -> Result<Vec<String>, String> {
    let mut args = Vec::new();

    // Global options - optimized for low latency WHIP
    args.extend([
        "-hide_banner".to_string(),
        "-loglevel".to_string(), "info".to_string(),
        // Critical: nobuffer + flush_packets for real-time streaming
        "-fflags".to_string(), "+genpts+nobuffer+flush_packets".to_string(),
        "-flags".to_string(), "low_delay".to_string(),
        "-max_delay".to_string(), "0".to_string(),
        "-y".to_string(),
        "-nostdin".to_string(),
    ]);
    // Input source (Windows)
    #[cfg(target_os = "windows")]
    {
        if config.source_id.starts_with("title=") {
            // Window capture: use gdigrab with title (window capture not supported by ddagrab)
            args.extend([
                "-rtbufsize".to_string(), "64M".to_string(),
                "-thread_queue_size".to_string(), "512".to_string(),
                "-probesize".to_string(), "32".to_string(),
                "-analyzeduration".to_string(), "0".to_string(),
                "-f".to_string(), "gdigrab".to_string(),
                "-draw_mouse".to_string(), "1".to_string(),
                "-framerate".to_string(), config.fps.to_string(),
                "-i".to_string(), config.source_id.clone(),
            ]);
            // Scale filter for gdigrab - convert to yuv420p for NVENC compatibility
            if config.encoder == "nvenc" {
                args.extend([
                    "-vf".to_string(),
                    format!("scale={}:{}:flags=fast_bilinear,format=yuv420p", config.width, config.height),
                ]);
            } else {
                args.extend([
                    "-vf".to_string(),
                    format!("scale={}:{}:flags=fast_bilinear", config.width, config.height),
                ]);
            }
        } else if config.encoder == "nvenc" {
            // Desktop + NVENC: use gdigrab with pixel format conversion
            // Note: ddagrab + NVENC crashes (ShareX issue #7326), use gdigrab instead
            // gdigrab outputs bgra, must convert to nv12 for NVENC
            args.extend([
                "-rtbufsize".to_string(), "64M".to_string(),
                "-thread_queue_size".to_string(), "512".to_string(),
                "-probesize".to_string(), "32".to_string(),
                "-analyzeduration".to_string(), "0".to_string(),
                "-f".to_string(), "gdigrab".to_string(),
                "-draw_mouse".to_string(), "1".to_string(),
                "-framerate".to_string(), config.fps.to_string(),
                "-video_size".to_string(), format!("{}x{}", config.width, config.height),
                "-offset_x".to_string(), "0".to_string(),
                "-offset_y".to_string(), "0".to_string(),
                "-i".to_string(), "desktop".to_string(),
            ]);
            // Scale and convert bgra to nv12 for NVENC compatibility
            args.extend([
                "-vf".to_string(),
                format!("scale={}:{}:flags=fast_bilinear,format=nv12", config.width, config.height),
            ]);
        } else {
            // Desktop + x264/other: use gdigrab (CPU-based capture)
            // Capture primary monitor (2560x1440), then scale to target resolution
            args.extend([
                "-rtbufsize".to_string(), "64M".to_string(),
                "-thread_queue_size".to_string(), "512".to_string(),
                "-probesize".to_string(), "32".to_string(),
                "-analyzeduration".to_string(), "0".to_string(),
                "-f".to_string(), "gdigrab".to_string(),
                "-draw_mouse".to_string(), "1".to_string(),
                "-framerate".to_string(), config.fps.to_string(),
                "-video_size".to_string(), "2560x1440".to_string(), // Primary monitor
                "-offset_x".to_string(), "0".to_string(),
                "-offset_y".to_string(), "0".to_string(),
                "-i".to_string(), "desktop".to_string(),
            ]);
            // Scale primary monitor to target resolution
            args.extend([
                "-vf".to_string(),
                format!("scale={}:{}:flags=fast_bilinear", config.width, config.height),
            ]);
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        args.extend([
            "-f".to_string(), "x11grab".to_string(),
            "-framerate".to_string(), config.fps.to_string(),
            "-i".to_string(), ":0.0".to_string(),
        ]);
        // Scale filter for x11grab
        args.extend([
            "-vf".to_string(),
            format!("scale={}:{}:flags=fast_bilinear", config.width, config.height),
        ]);
    }

    // Video encoder with ultra-low latency settings
    match config.encoder.as_str() {

        "nvenc" => {
            // NVENC - minimal settings to avoid crashes
            args.extend([
                "-c:v".to_string(), "h264_nvenc".to_string(),
                "-preset".to_string(), "p1".to_string(),
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-bf".to_string(), "0".to_string(),
                "-g".to_string(), (config.fps * 2).to_string(),
            ]);
        }
        "qsv" => {
            args.extend([
                "-c:v".to_string(), "h264_qsv".to_string(),
                "-preset".to_string(), "veryfast".to_string(),
                "-profile:v".to_string(), "baseline".to_string(),
                "-bf".to_string(), "0".to_string(),
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-g".to_string(), (config.fps * 2).to_string(),
            ]);
        }
        "amf" => {
            args.extend([
                "-c:v".to_string(), "h264_amf".to_string(),
                "-usage".to_string(), "ultralowlatency".to_string(),
                "-profile:v".to_string(), "baseline".to_string(),
                "-bf".to_string(), "0".to_string(),
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-g".to_string(), (config.fps * 2).to_string(),
            ]);
        }
        "mf" => {
            // MediaFoundation hardware encoder - Windows built-in
            // Uses Intel/AMD/NVIDIA via Windows Media Foundation
            args.extend([
                "-c:v".to_string(), "h264_mf".to_string(),
                "-rate_control".to_string(), "4".to_string(),    // Low delay VBR
                "-scenario".to_string(), "4".to_string(),        // Live streaming
                "-hw_encoding".to_string(), "1".to_string(),     // Force hardware
                "-profile:v".to_string(), "baseline".to_string(), // WebRTC compatible
                "-bf".to_string(), "0".to_string(),              // No B-frames
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-g".to_string(), (config.fps * 2).to_string(),  // 2 second GOP
            ]);
        }
        _ => {
            // x264 fallback - WHIP optimized settings
            args.extend([
                "-c:v".to_string(), "libx264".to_string(),
                "-preset".to_string(), "ultrafast".to_string(),  // Fastest preset
                "-tune".to_string(), "zerolatency".to_string(),  // Essential for WHIP
                "-profile:v".to_string(), "baseline".to_string(), // No B-frames
                "-bf".to_string(), "0".to_string(),              // Explicitly no B-frames
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-bufsize".to_string(), format!("{}k", config.bitrate / 4),
                "-g".to_string(), (config.fps * 2).to_string(),   // 2 second GOP
                "-threads".to_string(), "1".to_string(),          // Single thread for WHIP
            ]);
        }
    }

    // Pixel format - only set for non-NVENC (NVENC auto-selects)
    if config.encoder != "nvenc" {
        args.extend(["-pix_fmt".to_string(), "yuv420p".to_string()]);
    }

    // Audio encoder
    if config.audio_enabled {
        args.extend([
            "-c:a".to_string(), "libopus".to_string(),
            "-ar".to_string(), "48000".to_string(),
            "-ac".to_string(), "2".to_string(),
            "-b:a".to_string(), "128k".to_string(),
        ]);
    } else {
        args.push("-an".to_string());
    }

    // WHIP output with flush and buffer
    args.extend([
        "-flush_packets".to_string(), "1".to_string(),
        "-ts_buffer_size".to_string(), "1048576".to_string(), // 1MB buffer
        "-whip_flags".to_string(), "dtls_active".to_string(),
        "-f".to_string(), "whip".to_string(),
    ]);

    // Bearer token
    if let Some(ref token) = config.bearer_token {
        args.extend(["-authorization".to_string(), token.clone()]);
    }

    // WHIP endpoint
    args.push(config.whip_url.clone());

    Ok(args)
}
