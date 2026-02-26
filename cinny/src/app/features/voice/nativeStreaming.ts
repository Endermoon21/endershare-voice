/**
 * Native Streaming - Tauri bindings for FFmpeg WHIP streaming
 *
 * Provides native screen capture and hardware-accelerated streaming
 * via FFmpeg sidecar with WHIP output to LiveKit.
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
  encoder: 'nvenc' | 'qsv' | 'amf' | 'x264';
  preset: string;
  audio_enabled: boolean;
  bearer_token?: string;
}

/** Stream status */
export interface NativeStreamStatus {
  active: boolean;
  source_id: string | null;
  whip_url: string | null;
  duration_seconds: number;
  error: string | null;
}

/** FFmpeg availability info */
export interface FFmpegInfo {
  available: boolean;
  version: string | null;
  encoders: string[];
  whip_support: boolean;
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
 * Check FFmpeg availability and capabilities
 */
export async function checkFFmpeg(): Promise<FFmpegInfo> {
  if (!isTauri) {
    return {
      available: false,
      version: null,
      encoders: [],
      whip_support: false,
    };
  }
  return invoke('check_ffmpeg');
}

/**
 * Get best available encoder
 */
export function getBestEncoder(info: FFmpegInfo): 'nvenc' | 'qsv' | 'amf' | 'x264' {
  // Prefer hardware encoders in order: NVENC > QSV > AMF > x264
  if (info.encoders.includes('nvenc')) return 'nvenc';
  if (info.encoders.includes('qsv')) return 'qsv';
  if (info.encoders.includes('amf')) return 'amf';
  return 'x264';
}

/**
 * Get encoder preset based on encoder type
 */
export function getEncoderPreset(encoder: string, quality: 'performance' | 'balanced' | 'quality'): string {
  const presets: Record<string, Record<string, string>> = {
    nvenc: {
      performance: 'p1',
      balanced: 'p4',
      quality: 'p7',
    },
    qsv: {
      performance: 'veryfast',
      balanced: 'medium',
      quality: 'veryslow',
    },
    amf: {
      performance: 'speed',
      balanced: 'balanced',
      quality: 'quality',
    },
    x264: {
      performance: 'ultrafast',
      balanced: 'medium',
      quality: 'slow',
    },
  };

  return presets[encoder]?.[quality] || 'medium';
}

/**
 * Create default stream config
 */
export function createDefaultStreamConfig(
  sourceId: string,
  whipUrl: string,
  ffmpegInfo: FFmpegInfo
): NativeStreamConfig {
  const encoder = getBestEncoder(ffmpegInfo);

  return {
    source_id: sourceId,
    whip_url: whipUrl,
    width: 1280,
    height: 720,
    fps: 60,
    bitrate: 10000, // 8 Mbps
    encoder,
    preset: getEncoderPreset(encoder, 'balanced'),
    audio_enabled: false, // Start without audio for simplicity
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
