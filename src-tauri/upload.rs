//! Native file upload for Matrix media API
//!
//! Features:
//! - Bypasses WebView CORS issues by uploading directly from Rust
//! - Real-time progress tracking with streaming body
//! - Cancellation support via CancellationToken
//! - Automatic retry with exponential backoff
//! - Configurable timeouts

use base64::{engine::general_purpose::STANDARD as BASE64, Engine as _};
use futures_util::stream::{self, StreamExt};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use reqwest::Body;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Manager, State, Window};
use tokio::sync::{Mutex, RwLock};
use tokio::time::sleep;
use tokio_util::sync::CancellationToken;

/// Upload progress event payload
#[derive(Clone, Serialize)]
pub struct UploadProgress {
    pub id: String,
    pub loaded: u64,
    pub total: u64,
    pub status: UploadStatus,
}

#[derive(Clone, Serialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UploadStatus {
    Uploading,
    Retrying,
    Cancelled,
    Complete,
    Error,
}

/// Upload result with mxc URI
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadResult {
    pub content_uri: String,
}

/// Error response from Matrix server
#[derive(Debug, Deserialize)]
struct MatrixError {
    errcode: Option<String>,
    error: Option<String>,
}

/// Configuration for upload behavior
#[derive(Clone)]
pub struct UploadConfig {
    /// Maximum number of retry attempts
    pub max_retries: u32,
    /// Initial retry delay (doubles each attempt)
    pub initial_retry_delay_ms: u64,
    /// Request timeout in seconds
    pub timeout_secs: u64,
    /// Chunk size for progress reporting (bytes)
    pub progress_chunk_size: usize,
}

impl Default for UploadConfig {
    fn default() -> Self {
        Self {
            max_retries: 3,
            initial_retry_delay_ms: 1000,
            timeout_secs: 300, // 5 minutes for large files
            progress_chunk_size: 65536, // 64KB chunks for progress
        }
    }
}

/// Active upload tracking
struct ActiveUpload {
    cancel_token: CancellationToken,
    file_name: String,
}

/// State for tracking active uploads - managed by Tauri
#[derive(Default)]
pub struct UploadState {
    active_uploads: RwLock<HashMap<String, ActiveUpload>>,
    config: UploadConfig,
}

impl UploadState {
    pub fn new() -> Self {
        Self {
            active_uploads: RwLock::new(HashMap::new()),
            config: UploadConfig::default(),
        }
    }
}

/// Upload a file to Matrix media API with progress tracking and retry
#[tauri::command]
pub async fn native_upload_file(
    window: Window,
    state: State<'_, UploadState>,
    upload_id: String,
    homeserver: String,
    access_token: String,
    file_data_base64: String,
    file_name: String,
    content_type: String,
) -> Result<UploadResult, String> {
    // Decode base64 to bytes
    let file_data = BASE64
        .decode(&file_data_base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let total_size = file_data.len() as u64;

    log::info!(
        "Native upload starting: {} ({} bytes, {})",
        file_name,
        total_size,
        content_type
    );

    // Create cancellation token and register upload
    let cancel_token = CancellationToken::new();
    {
        let mut uploads = state.active_uploads.write().await;
        uploads.insert(
            upload_id.clone(),
            ActiveUpload {
                cancel_token: cancel_token.clone(),
                file_name: file_name.clone(),
            },
        );
    }

    // Build the upload URL
    let base_url = homeserver
        .trim_end_matches('/')
        .split("/_matrix")
        .next()
        .unwrap_or(&homeserver);

    let upload_url = format!(
        "{}/_matrix/media/v3/upload?filename={}",
        base_url,
        urlencoding::encode(&file_name)
    );

    log::info!("Upload URL: {}", upload_url);

    // Create HTTP client with timeout
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(state.config.timeout_secs))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    // Set up headers
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", access_token))
            .map_err(|e| format!("Invalid access token: {}", e))?,
    );
    headers.insert(
        CONTENT_TYPE,
        HeaderValue::from_str(&content_type)
            .map_err(|e| format!("Invalid content type: {}", e))?,
    );

    // Emit initial progress
    emit_progress(&window, &upload_id, 0, total_size, UploadStatus::Uploading);

    // Retry loop
    let config = state.config.clone();
    let mut last_error = String::new();

    for attempt in 0..=config.max_retries {
        // Check for cancellation before each attempt
        if cancel_token.is_cancelled() {
            cleanup_upload(&state, &upload_id).await;
            emit_progress(&window, &upload_id, 0, total_size, UploadStatus::Cancelled);
            return Err("Upload cancelled".to_string());
        }

        if attempt > 0 {
            // Exponential backoff
            let delay = config.initial_retry_delay_ms * (2_u64.pow(attempt - 1));
            log::info!(
                "Upload retry attempt {} for {} (waiting {}ms)",
                attempt,
                file_name,
                delay
            );
            emit_progress(&window, &upload_id, 0, total_size, UploadStatus::Retrying);

            // Wait with cancellation check
            tokio::select! {
                _ = sleep(Duration::from_millis(delay)) => {}
                _ = cancel_token.cancelled() => {
                    cleanup_upload(&state, &upload_id).await;
                    emit_progress(&window, &upload_id, 0, total_size, UploadStatus::Cancelled);
                    return Err("Upload cancelled".to_string());
                }
            }
        }

        // Create streaming body with progress tracking
        let progress_state = Arc::new(Mutex::new(0u64));
        let window_clone = window.clone();
        let upload_id_clone = upload_id.clone();
        let cancel_token_clone = cancel_token.clone();
        let chunk_size = config.progress_chunk_size;

        // Split data into chunks for progress tracking
        let chunks: Vec<Vec<u8>> = file_data
            .chunks(chunk_size)
            .map(|c| c.to_vec())
            .collect();

        let stream = stream::iter(chunks.into_iter().map(move |chunk| {
            let progress_state = progress_state.clone();
            let window = window_clone.clone();
            let upload_id = upload_id_clone.clone();
            let cancel_token = cancel_token_clone.clone();
            let chunk_len = chunk.len() as u64;

            async move {
                // Check cancellation
                if cancel_token.is_cancelled() {
                    return Err(std::io::Error::new(
                        std::io::ErrorKind::Interrupted,
                        "Upload cancelled",
                    ));
                }

                // Update progress
                let mut loaded = progress_state.lock().await;
                *loaded += chunk_len;
                emit_progress(&window, &upload_id, *loaded, total_size, UploadStatus::Uploading);

                Ok::<_, std::io::Error>(chunk)
            }
        }))
        .buffered(1)
        .map(|result| result.map(bytes::Bytes::from));

        let body = Body::wrap_stream(stream);

        // Perform the upload
        let result = client
            .post(&upload_url)
            .headers(headers.clone())
            .body(body)
            .send()
            .await;

        match result {
            Ok(response) => {
                let status = response.status();
                let response_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Failed to read response".to_string());

                log::info!("Upload response status: {}", status);

                if status.is_success() {
                    // Parse successful response
                    match serde_json::from_str::<UploadResult>(&response_text) {
                        Ok(result) => {
                            log::info!("Upload successful: {}", result.content_uri);
                            cleanup_upload(&state, &upload_id).await;
                            emit_progress(
                                &window,
                                &upload_id,
                                total_size,
                                total_size,
                                UploadStatus::Complete,
                            );
                            return Ok(result);
                        }
                        Err(e) => {
                            last_error = format!(
                                "Failed to parse response: {} (body: {})",
                                e, response_text
                            );
                        }
                    }
                } else if status.is_server_error() || status == 429 {
                    // Retry on 5xx errors or rate limiting
                    last_error = format!("Server error {}: {}", status, response_text);
                    log::warn!("{}", last_error);
                    continue;
                } else {
                    // Client error - don't retry
                    if let Ok(error) = serde_json::from_str::<MatrixError>(&response_text) {
                        last_error = format!(
                            "Matrix error {}: {} - {}",
                            status,
                            error.errcode.unwrap_or_default(),
                            error.error.unwrap_or_default()
                        );
                    } else {
                        last_error = format!("Upload failed with status {}: {}", status, response_text);
                    }
                    break; // Don't retry client errors
                }
            }
            Err(e) => {
                if e.is_timeout() {
                    last_error = format!("Upload timed out after {}s", config.timeout_secs);
                } else if e.is_connect() {
                    last_error = format!("Connection failed: {}", e);
                } else {
                    last_error = format!("Upload request failed: {}", e);
                }
                log::warn!("{}", last_error);
                // Continue to retry on network errors
            }
        }
    }

    // All retries exhausted
    cleanup_upload(&state, &upload_id).await;
    emit_progress(&window, &upload_id, 0, total_size, UploadStatus::Error);
    Err(last_error)
}

/// Cancel an active upload
#[tauri::command]
pub async fn cancel_native_upload(
    state: State<'_, UploadState>,
    upload_id: String,
) -> Result<(), String> {
    log::info!("Cancel upload requested: {}", upload_id);

    let uploads = state.active_uploads.read().await;
    if let Some(upload) = uploads.get(&upload_id) {
        log::info!("Cancelling upload: {}", upload.file_name);
        upload.cancel_token.cancel();
        Ok(())
    } else {
        log::warn!("Upload not found: {}", upload_id);
        Err(format!("Upload {} not found", upload_id))
    }
}

/// Get list of active uploads
#[tauri::command]
pub async fn get_active_uploads(state: State<'_, UploadState>) -> Result<Vec<String>, String> {
    let uploads = state.active_uploads.read().await;
    Ok(uploads.keys().cloned().collect())
}

/// Helper to emit progress events
fn emit_progress(window: &Window, id: &str, loaded: u64, total: u64, status: UploadStatus) {
    let _ = window.emit(
        "native-upload-progress",
        UploadProgress {
            id: id.to_string(),
            loaded,
            total,
            status,
        },
    );
}

/// Helper to clean up upload state
async fn cleanup_upload(state: &State<'_, UploadState>, upload_id: &str) {
    let mut uploads = state.active_uploads.write().await;
    uploads.remove(upload_id);
}
