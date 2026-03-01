/**
 * Native Streaming - Tauri bindings for GStreamer WHIP streaming
 *
 * Provides native screen capture and hardware-accelerated streaming
 * via GStreamer sidecar with WHIP output to LiveKit.
 *
 * GStreamer uses whipclientsink with full TURN/ICE support.
 */

// Check if we're running in Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Tauri invoke function
const invoke = isTauri
  ? (window as any).__TAURI__.invoke
  : async () => {
      throw new Error('Not running in Tauri');
    };

/** Capture source (screen or window) */
export interface NativeCaptureSource {
  id: string;
  name: string;
  source_type: 'screen' | 'window';
  width: number | null;
  height: number | null;
}

/** Stream configuration */
export interface NativeStreamConfig {
  source_id: string;
  whip_url: string;
  width: number;
  height: number;
  fps: number;
  bitrate: number; // in kbps
  audio_enabled: boolean;
  bearer_token?: string;
  turn_server?: string;
}

/** Stream status */
export interface NativeStreamStatus {
  active: boolean;
  source_id: string | null;
  whip_url: string | null;
  duration_seconds: number;
  error: string | null;
}

/** GStreamer availability info */
export interface GStreamerInfo {
  available: boolean;
  version: string | null;
  has_whip: boolean;
  has_d3d11: boolean;
}

/**
 * Check if native streaming is available (running in Tauri)
 */
export function isNativeStreamingAvailable(): boolean {
  return isTauri;
}

/**
 * List available capture sources (screens and windows)
 */
export async function listNativeCaptureSources(): Promise<NativeCaptureSource[]> {
  if (!isTauri) {
    throw new Error('Native streaming requires Tauri desktop app');
  }
  return invoke('list_capture_sources');
}

/**
 * Start streaming to WHIP endpoint
 */
export async function startNativeStream(config: NativeStreamConfig): Promise<void> {
  if (!isTauri) {
    throw new Error('Native streaming requires Tauri desktop app');
  }
  return invoke('start_stream', { config });
}

/**
 * Stop streaming
 */
export async function stopNativeStream(): Promise<void> {
  if (!isTauri) {
    throw new Error('Native streaming requires Tauri desktop app');
  }
  return invoke('stop_stream');
}

/**
 * Get current stream status
 */
export async function getNativeStreamStatus(): Promise<NativeStreamStatus> {
  if (!isTauri) {
    throw new Error('Native streaming requires Tauri desktop app');
  }
  return invoke('get_stream_status');
}

/**
 * Check GStreamer availability and capabilities
 */
export async function checkGStreamer(): Promise<GStreamerInfo> {
  if (!isTauri) {
    return {
      available: false,
      version: null,
      has_whip: false,
      has_d3d11: false,
    };
  }
  return invoke('check_gstreamer');
}

/**
 * Create default stream config
 */
export function createDefaultStreamConfig(
  sourceId: string,
  whipUrl: string,
  options?: {
    turnServer?: string;
  }
): NativeStreamConfig {
  return {
    source_id: sourceId,
    whip_url: whipUrl,
    width: 1280,
    height: 720,
    fps: 60,
    bitrate: 6000, // 6 Mbps default
    audio_enabled: false,
    turn_server: options?.turnServer,
  };
}

/**
 * Format duration for display
 */
export function formatStreamDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
