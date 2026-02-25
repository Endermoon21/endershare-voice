/**
 * GameCapture - Native game capture for Electron
 * 
 * Uses Electron's desktopCapturer API to list and capture
 * screens/windows with optimized settings for game streaming.
 * Falls back to browser APIs when not in Electron.
 */

export interface CaptureSource {
  id: string;
  name: string;
  thumbnail: string; // base64 data URL
  appIcon?: string;
  type: 'screen' | 'window';
}

export interface CaptureOptions {
  width?: number;
  height?: number;
  frameRate?: number;
  audio?: boolean;
  contentHint?: 'motion' | 'detail' | 'text';
}

const DEFAULT_OPTIONS: CaptureOptions = {
  width: 1920,
  height: 1080,
  frameRate: 60,
  audio: true,
  contentHint: 'motion',
};

// Check if we're in Electron
const isElectron = (): boolean => {
  return !!(window as any).electron || 
         typeof process !== 'undefined' && 
         process.versions && 
         !!(process.versions as any).electron;
};

// Get Electron's desktopCapturer if available
const getDesktopCapturer = (): any => {
  try {
    // Try modern Electron with contextBridge
    if ((window as any).electron?.desktopCapturer) {
      return (window as any).electron.desktopCapturer;
    }
    // Try direct require (older Electron or nodeIntegration enabled)
    if (typeof require !== 'undefined') {
      const { desktopCapturer } = require('electron');
      return desktopCapturer;
    }
  } catch (e) {
    console.log('[GameCapture] desktopCapturer not available:', e);
  }
  return null;
};

/**
 * Get available capture sources (screens and windows)
 */
export async function getCaptureSources(): Promise<CaptureSource[]> {
  const desktopCapturer = getDesktopCapturer();
  
  if (desktopCapturer) {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 320, height: 180 },
        fetchWindowIcons: true,
      });

      return sources.map((source: any) => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        appIcon: source.appIcon?.toDataURL(),
        type: source.id.startsWith('screen:') ? 'screen' : 'window',
      }));
    } catch (e) {
      console.error('[GameCapture] Failed to get sources:', e);
    }
  }

  // Fallback: return empty array, UI will show browser picker option
  return [];
}

/**
 * Capture a specific source by ID
 */
export async function captureSource(
  sourceId: string,
  options: CaptureOptions = {}
): Promise<MediaStream> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Build constraints for getUserMedia
  const constraints: MediaStreamConstraints = {
    audio: opts.audio ? {
      // @ts-ignore - Electron-specific constraint
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
      },
    } : false,
    video: {
      // @ts-ignore - Electron-specific constraint
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: opts.width,
        maxWidth: opts.width,
        minHeight: opts.height,
        maxHeight: opts.height,
        minFrameRate: opts.frameRate,
        maxFrameRate: opts.frameRate,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);

  // Apply content hint for encoding optimization
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack && opts.contentHint) {
    // @ts-ignore - contentHint may not be in types
    videoTrack.contentHint = opts.contentHint;
  }

  return stream;
}

/**
 * Start capture with browser's native picker (fallback)
 */
export async function captureWithPicker(
  options: CaptureOptions = {}
): Promise<MediaStream> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: { ideal: opts.width },
      height: { ideal: opts.height },
      frameRate: { ideal: opts.frameRate },
    },
    audio: opts.audio,
  });

  // Apply content hint
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack && opts.contentHint) {
    // @ts-ignore
    videoTrack.contentHint = opts.contentHint;
  }

  return stream;
}

/**
 * Check hardware encoding support
 */
export async function checkHardwareEncodingSupport(): Promise<{
  h264: boolean;
  hevc: boolean;
  av1: boolean;
  nvenc: boolean;
}> {
  const result = {
    h264: false,
    hevc: false,
    av1: false,
    nvenc: false,
  };

  // Check WebCodecs support
  if ('VideoEncoder' in window) {
    const VideoEncoder = (window as any).VideoEncoder;

    // Check H.264
    try {
      const h264Config = {
        codec: 'avc1.640028', // H.264 High Profile Level 4
        width: 1920,
        height: 1080,
        bitrate: 6_000_000,
        framerate: 60,
        hardwareAcceleration: 'prefer-hardware',
      };
      const h264Support = await VideoEncoder.isConfigSupported(h264Config);
      result.h264 = h264Support.supported;
    } catch (e) {}

    // Check HEVC
    try {
      const hevcConfig = {
        codec: 'hvc1.1.6.L120.90', // HEVC Main Profile
        width: 1920,
        height: 1080,
        bitrate: 6_000_000,
        framerate: 60,
        hardwareAcceleration: 'prefer-hardware',
      };
      const hevcSupport = await VideoEncoder.isConfigSupported(hevcConfig);
      result.hevc = hevcSupport.supported;
    } catch (e) {}

    // Check AV1
    try {
      const av1Config = {
        codec: 'av01.0.08M.08', // AV1 Main Profile Level 4.0
        width: 1920,
        height: 1080,
        bitrate: 6_000_000,
        framerate: 60,
        hardwareAcceleration: 'prefer-hardware',
      };
      const av1Support = await VideoEncoder.isConfigSupported(av1Config);
      result.av1 = av1Support.supported;
    } catch (e) {}
  }

  // Detect NVIDIA GPU (heuristic - NVENC likely available)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        result.nvenc = /nvidia/i.test(renderer);
      }
    }
  } catch (e) {}

  return result;
}

/**
 * Get optimal encoding settings based on hardware
 */
export async function getOptimalEncodingSettings(): Promise<{
  codec: 'h264' | 'h265' | 'av1' | 'vp9';
  bitrate: number;
  hardwareAccelerated: boolean;
}> {
  const support = await checkHardwareEncodingSupport();

  // Prefer H.264 with NVENC for lowest latency
  if (support.nvenc && support.h264) {
    return {
      codec: 'h264',
      bitrate: 8_000_000, // 8 Mbps for NVENC
      hardwareAccelerated: true,
    };
  }

  // Fall back to H.264 software
  if (support.h264) {
    return {
      codec: 'h264',
      bitrate: 6_000_000,
      hardwareAccelerated: false,
    };
  }

  // VP9 fallback
  return {
    codec: 'vp9',
    bitrate: 4_000_000,
    hardwareAccelerated: false,
  };
}

export default {
  getCaptureSources,
  captureSource,
  captureWithPicker,
  checkHardwareEncodingSupport,
  getOptimalEncodingSettings,
  isElectron,
};
