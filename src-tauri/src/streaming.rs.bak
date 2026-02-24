//! Native game streaming via FFmpeg WHIP
//!
//! This module provides:
//! - Screen/window enumeration via Windows API
//! - FFmpeg sidecar management for WHIP streaming
//! - Stream status monitoring
//!
//! Verified against:
//! - FFmpeg WHIP muxer (merged June 2025)
//! - Tauri 1.x sidecar API
//! - Windows 0.62 crate

use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::api::process::{Command, CommandChild, CommandEvent};
use tauri::{AppHandle, Manager};

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
}

/// Stream status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamStatus {
    pub active: bool,
    pub source_id: Option<String>,
    pub whip_url: Option<String>,
    pub duration_seconds: u64,
    pub error: Option<String>,
}

/// FFmpeg availability info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FFmpegInfo {
    pub available: bool,
    pub version: Option<String>,
    pub encoders: Vec<String>,
    pub whip_support: bool,
}

/// Shared state that can be sent across threads
#[derive(Clone, Default)]
pub struct SharedState {
    pub last_error: Arc<Mutex<Option<String>>>,
    pub is_running: Arc<Mutex<bool>>,
}

/// State for managing streams
pub struct StreamingState {
    ffmpeg_child: Mutex<Option<CommandChild>>,
    current_config: Mutex<Option<StreamConfig>>,
    start_time: Mutex<Option<std::time::Instant>>,
    shared: SharedState,
}

impl Default for StreamingState {
    fn default() -> Self {
        Self {
            ffmpeg_child: Mutex::new(None),
            current_config: Mutex::new(None),
            start_time: Mutex::new(None),
            shared: SharedState::default(),
        }
    }
}

/// List available capture sources (screens and windows)
#[tauri::command]
pub async fn list_capture_sources() -> Result<Vec<CaptureSource>, String> {
    #[cfg(target_os = "windows")]
    {
        list_windows_sources()
    }
    #[cfg(not(target_os = "windows"))]
    {
        // Fallback for non-Windows
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
fn list_windows_sources() -> Result<Vec<CaptureSource>, String> {
    use windows::Win32::Foundation::{BOOL, HWND, LPARAM, RECT};
    use windows::Win32::Graphics::Gdi::{
        EnumDisplayMonitors, GetMonitorInfoW, HDC, HMONITOR, MONITORINFOEXW,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, GetWindowRect, GetWindowTextLengthW, GetWindowTextW, IsWindowVisible,
    };

    let mut sources = Vec::new();

    // Enumerate monitors (screens)
    unsafe {
        unsafe extern "system" fn enum_monitors(
            monitor: HMONITOR,
            _hdc: HDC,
            _rect: *mut RECT,
            lparam: LPARAM,
        ) -> BOOL {
            let sources = unsafe { &mut *(lparam.0 as *mut Vec<CaptureSource>) };

            let mut info = MONITORINFOEXW::default();
            info.monitorInfo.cbSize = std::mem::size_of::<MONITORINFOEXW>() as u32;

            if unsafe { GetMonitorInfoW(monitor, &mut info.monitorInfo as *mut _ as *mut _).as_bool() } {
                let name_slice = &info.szDevice[..];
                let name_end = name_slice.iter().position(|&c| c == 0).unwrap_or(32);
                let name = String::from_utf16_lossy(&name_slice[..name_end]);

                let rect = info.monitorInfo.rcMonitor;
                let width = (rect.right - rect.left) as u32;
                let height = (rect.bottom - rect.top) as u32;
                let idx = sources.iter().filter(|s| s.source_type == "screen").count();

                sources.push(CaptureSource {
                    // Use "desktop" for first screen (gdigrab convention)
                    id: if idx == 0 { "desktop".to_string() } else { format!("screen:{}", idx) },
                    name: format!("Screen {} ({}x{})", idx + 1, width, height),
                    source_type: "screen".to_string(),
                    width: Some(width),
                    height: Some(height),
                });
            }
            BOOL(1)
        }

        let sources_ptr = &mut sources as *mut Vec<CaptureSource>;
        let _ = EnumDisplayMonitors(None, None, Some(enum_monitors), LPARAM(sources_ptr as isize));
    }

    // Enumerate windows
    unsafe {
        unsafe extern "system" fn enum_windows(hwnd: HWND, lparam: LPARAM) -> BOOL {
            let sources = unsafe { &mut *(lparam.0 as *mut Vec<CaptureSource>) };

            if !unsafe { IsWindowVisible(hwnd).as_bool() } {
                return BOOL(1);
            }

            let title_len = unsafe { GetWindowTextLengthW(hwnd) };
            if title_len == 0 {
                return BOOL(1);
            }

            let mut title_buf = vec![0u16; (title_len + 1) as usize];
            let len = unsafe { GetWindowTextW(hwnd, &mut title_buf) };
            if len == 0 {
                return BOOL(1);
            }

            let title = String::from_utf16_lossy(&title_buf[..len as usize]);

            // Skip system windows
            if title.is_empty()
                || title == "Program Manager"
                || title.starts_with("Windows Input Experience")
                || title.starts_with("Microsoft Text Input")
                || title.starts_with("NVIDIA GeForce")
            {
                return BOOL(1);
            }

            let mut rect = RECT::default();
            if unsafe { GetWindowRect(hwnd, &mut rect).is_ok() } {
                let width = (rect.right - rect.left) as u32;
                let height = (rect.bottom - rect.top) as u32;

                // Skip tiny windows
                if width < 100 || height < 100 {
                    return BOOL(1);
                }

                // Store HWND as hex for FFmpeg gdigrab
                sources.push(CaptureSource {
                    id: format!("hwnd=0x{:X}", hwnd.0 as usize),
                    name: if title.len() > 50 {
                        format!("{}...", &title[..47])
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
        let _ = EnumWindows(Some(enum_windows), LPARAM(sources_ptr as isize));
    }

    Ok(sources)
}

/// Start streaming to WHIP endpoint
#[tauri::command]
pub async fn start_stream(
    app: AppHandle,
    config: StreamConfig,
) -> Result<(), String> {
    let state = app.state::<StreamingState>();

    // Check if already streaming
    {
        let child = state.ffmpeg_child.lock().map_err(|e| e.to_string())?;
        if child.is_some() {
            return Err("Already streaming".to_string());
        }
    }

    // Build FFmpeg arguments
    let ffmpeg_args = build_ffmpeg_args(&config)?;

    // Start FFmpeg sidecar
    let (mut rx, child) = Command::new_sidecar("ffmpeg")
        .map_err(|e| format!("Failed to create FFmpeg sidecar: {}", e))?
        .args(&ffmpeg_args)
        .spawn()
        .map_err(|e| format!("Failed to spawn FFmpeg: {}", e))?;

    // Store state
    {
        let mut child_lock = state.ffmpeg_child.lock().map_err(|e| e.to_string())?;
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

    // Clone the shared state for the background task
    let shared = state.shared.clone();

    // Monitor FFmpeg output in background
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stderr(line) => {
                    // FFmpeg outputs progress to stderr
                    log::debug!("[FFmpeg] {}", line);

                    // Check for errors
                    if line.contains("Error") || line.contains("error") {
                        if let Ok(mut error) = shared.last_error.lock() {
                            *error = Some(line);
                        }
                    }
                }
                CommandEvent::Terminated(payload) => {
                    log::info!("[FFmpeg] Exited with code: {:?}", payload.code);

                    // Mark as not running
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

    // Take the child out of the mutex (don't hold lock across await)
    let child_opt = {
        let mut child_lock = state.ffmpeg_child.lock().map_err(|e| e.to_string())?;
        child_lock.take()
    };

    if let Some(mut child) = child_opt {
        // Send 'q' to FFmpeg for graceful shutdown
        if let Err(e) = child.write(b"q") {
            log::warn!("Failed to send quit to FFmpeg: {}", e);
        }

        // Wait briefly then kill if still running
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        let _ = child.kill();
    }

    // Clear state
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

    Ok(())
}

/// Get current stream status
#[tauri::command]
pub async fn get_stream_status(app: AppHandle) -> Result<StreamStatus, String> {
    let state = app.state::<StreamingState>();

    let child = state.ffmpeg_child.lock().map_err(|e| e.to_string())?;
    let config = state.current_config.lock().map_err(|e| e.to_string())?;
    let start_time = state.start_time.lock().map_err(|e| e.to_string())?;
    let last_error = state.shared.last_error.lock().map_err(|e| e.to_string())?;

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
    })
}

/// Check FFmpeg availability and capabilities
#[tauri::command]
pub async fn check_ffmpeg() -> Result<FFmpegInfo, String> {
    // Check if FFmpeg sidecar exists
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

    // stdout is already a String in Tauri's sidecar output
    let version_str = &version_output.stdout;
    let version = version_str
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(2))
        .map(|s| s.to_string());

    // Check encoders
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
    if encoders_str.contains("libx264") {
        encoders.push("x264".to_string());
    }

    // Check WHIP muxer support
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

/// Build FFmpeg command arguments
fn build_ffmpeg_args(config: &StreamConfig) -> Result<Vec<String>, String> {
    let mut args = Vec::new();

    // Global options
    args.extend([
        "-hide_banner".to_string(),
        "-loglevel".to_string(),
        "warning".to_string(),
        "-y".to_string(), // Overwrite
    ]);

    // Input source (Windows gdigrab)
    #[cfg(target_os = "windows")]
    {
        args.extend([
            "-f".to_string(),
            "gdigrab".to_string(),
            "-framerate".to_string(),
            config.fps.to_string(),
        ]);

        // Source ID is either "desktop" or "hwnd=0xXXXX"
        args.extend(["-i".to_string(), config.source_id.clone()]);
    }

    #[cfg(not(target_os = "windows"))]
    {
        // Linux x11grab
        args.extend([
            "-f".to_string(),
            "x11grab".to_string(),
            "-framerate".to_string(),
            config.fps.to_string(),
            "-video_size".to_string(),
            format!("{}x{}", config.width, config.height),
            "-i".to_string(),
            ":0.0".to_string(),
        ]);
    }

    // Audio input (optional)
    if config.audio_enabled {
        #[cfg(target_os = "windows")]
        {
            args.extend([
                "-f".to_string(),
                "dshow".to_string(),
                "-i".to_string(),
                "audio=virtual-audio-capturer".to_string(),
            ]);
        }
    }

    // Video scaling if needed
    args.extend([
        "-vf".to_string(),
        format!("scale={}:{}:flags=fast_bilinear", config.width, config.height),
    ]);

    // Video encoder with verified settings
    match config.encoder.as_str() {
        "nvenc" => {
            args.extend([
                "-c:v".to_string(), "h264_nvenc".to_string(),
                "-preset".to_string(), config.preset.clone(), // p1-p7
                "-tune".to_string(), "ll".to_string(),        // Low latency
                "-bf".to_string(), "0".to_string(),           // No B-frames (WebRTC requirement)
                "-profile:v".to_string(), "baseline".to_string(), // Maximum compatibility
                "-rc".to_string(), "cbr".to_string(),         // Constant bitrate
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-bufsize".to_string(), format!("{}k", config.bitrate / config.fps), // Minimal buffer
                "-g".to_string(), (config.fps * 2).to_string(), // Keyframe every 2 sec
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
        _ => {
            // x264 fallback
            args.extend([
                "-c:v".to_string(), "libx264".to_string(),
                "-preset".to_string(), "ultrafast".to_string(),
                "-tune".to_string(), "zerolatency".to_string(),
                "-profile:v".to_string(), "baseline".to_string(),
                "-bf".to_string(), "0".to_string(),
                "-b:v".to_string(), format!("{}k", config.bitrate),
                "-bufsize".to_string(), format!("{}k", config.bitrate / config.fps),
                "-g".to_string(), (config.fps * 2).to_string(),
            ]);
        }
    }

    // Audio encoder (Opus for WebRTC)
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

    // Output: WHIP muxer
    args.extend(["-f".to_string(), "whip".to_string()]);

    // Bearer token authorization (if provided)
    if let Some(ref token) = config.bearer_token {
        args.extend(["-authorization".to_string(), token.clone()]);
    }

    // WHIP endpoint URL
    args.push(config.whip_url.clone());

    Ok(args)
}
