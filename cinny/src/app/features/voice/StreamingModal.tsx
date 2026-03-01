/**
 * Streaming Modal - Native GStreamer WHIP streaming with controls
 *
 * Features:
 * - Source selection (screens/windows)
 * - Quality presets (Performance, Balanced, Quality)
 * - Custom settings (resolution, fps, bitrate)
 * - Audio capture toggle
 * - Live streaming stats
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { useLiveKitContext } from "./LiveKitContext";
import {
  isNativeStreamingAvailable,
  listNativeCaptureSources,
  startNativeStream,
  stopNativeStream,
  getNativeStreamStatus,
  checkGStreamer,
  formatStreamDuration,
  NativeCaptureSource,
  GStreamerInfo,
  NativeStreamStatus,
  NativeStreamConfig,
} from "./nativeStreaming";
import { createWhipIngress, deleteWhipIngress, WhipIngressInfo } from "./SunshineController";
import { Track } from "livekit-client";
import * as css from "./voicePanel.css";

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const WindowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <circle cx="6.5" cy="6" r="1" fill="currentColor" />
    <circle cx="9.5" cy="6" r="1" fill="currentColor" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" opacity="0.5" />
  </svg>
);

// Quality presets
type QualityPreset = "performance" | "balanced" | "quality" | "custom";

interface PresetConfig {
  label: string;
  description: string;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
}

const QUALITY_PRESETS: Record<Exclude<QualityPreset, "custom">, PresetConfig> = {
  performance: {
    label: "Performance",
    description: "720p30 • Low latency",
    width: 1280,
    height: 720,
    fps: 30,
    bitrate: 4000,
  },
  balanced: {
    label: "Balanced",
    description: "1080p30 • Recommended",
    width: 1920,
    height: 1080,
    fps: 30,
    bitrate: 6000,
  },
  quality: {
    label: "Quality",
    description: "1080p60 • High bitrate",
    width: 1920,
    height: 1080,
    fps: 60,
    bitrate: 10000,
  },
};

// Resolution options for custom
const RESOLUTIONS = [
  { label: "720p", width: 1280, height: 720 },
  { label: "1080p", width: 1920, height: 1080 },
  { label: "1440p", width: 2560, height: 1440 },
];

interface StreamingModalProps {
  onClose: () => void;
}

export function StreamingModal({ onClose }: StreamingModalProps) {
  const { isConnected, currentRoom, room, screenShareInfo, getScreenShareElement } = useLiveKitContext();

  // State
  const [gstreamerInfo, setGStreamerInfo] = useState<GStreamerInfo | null>(null);
  const [sources, setSources] = useState<NativeCaptureSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<NativeCaptureSource | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<NativeStreamStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // WHIP ingress
  const [whipIngress, setWhipIngress] = useState<WhipIngressInfo | null>(null);
  const [creatingIngress, setCreatingIngress] = useState(false);

  // Self-preview
  const [showPreview, setShowPreview] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Settings
  const [preset, setPreset] = useState<QualityPreset>("balanced");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customRes, setCustomRes] = useState(RESOLUTIONS[1]); // 1080p
  const [customFps, setCustomFps] = useState(60);
  const [customBitrate, setCustomBitrate] = useState(6000);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Get effective settings based on preset
  const getEffectiveSettings = useCallback(() => {
    if (preset === "custom") {
      return {
        width: customRes.width,
        height: customRes.height,
        fps: customFps,
        bitrate: customBitrate,
      };
    }
    return QUALITY_PRESETS[preset];
  }, [preset, customRes, customFps, customBitrate]);

  // Initialize - check GStreamer and load sources
  useEffect(() => {
    async function init() {
      try {
        const info = await checkGStreamer();
        setGStreamerInfo(info);
        if (!info.available) {
          setError("GStreamer not available. Please install GStreamer.");
        }
      } catch (e: any) {
        setError(e.message || "Failed to check GStreamer");
      }
    }
    if (isNativeStreamingAvailable()) {
      init();
    }
  }, []);

  // Load sources when GStreamer is available
  const loadSources = useCallback(async () => {
    try {
      const sourceList = await listNativeCaptureSources();
      setSources(sourceList);
      if (sourceList.length > 0 && !selectedSource) {
        setSelectedSource(sourceList[0]);
      }
    } catch (e: any) {
      console.error("Failed to load sources:", e);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (gstreamerInfo && gstreamerInfo.available) {
      loadSources();
    }
  }, [gstreamerInfo, loadSources]);

  // Poll stream status while streaming
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      try {
        const status = await getNativeStreamStatus();
        setStreamStatus(status);
        if (!status.active) {
          setIsStreaming(false);
          if (status.error) {
            setError(status.error);
          }
        }
      } catch (e) {
        console.error("Failed to get stream status:", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Self-preview: subscribe to own stream
  useEffect(() => {
    if (!showPreview || !isStreaming || !room) return;

    const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
      if (track.kind === Track.Kind.Video && track.source === Track.Source.ScreenShare) {
        if (previewVideoRef.current && track.attach) {
          track.attach(previewVideoRef.current);
        }
      }
    };

    room.on('trackSubscribed', handleTrackSubscribed);

    // Check existing tracks
    room.participants.forEach((participant: any) => {
      participant.tracks.forEach((publication: any) => {
        if (publication.track &&
            publication.track.kind === Track.Kind.Video &&
            publication.track.source === Track.Source.ScreenShare) {
          if (previewVideoRef.current && publication.track.attach) {
            publication.track.attach(previewVideoRef.current);
          }
        }
      });
    });

    return () => {
      room.off('trackSubscribed', handleTrackSubscribed);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = null;
      }
    };
  }, [showPreview, isStreaming, room]);

  // Start streaming
  const startStream = async () => {
    if (!selectedSource || !gstreamerInfo) return;

    setLoading(true);
    setError(null);

    try {
      // Create WHIP ingress
      setCreatingIngress(true);
      const ingress = await createWhipIngress(currentRoom || "default", `${selectedSource.name}-stream`);
      setWhipIngress(ingress);
      setCreatingIngress(false);

      // Build config
      const settings = getEffectiveSettings();
      const config: NativeStreamConfig = {
        source_id: selectedSource.id,
        whip_url: ingress.whipUrl,
        width: settings.width,
        height: settings.height,
        fps: settings.fps,
        bitrate: settings.bitrate,
        audio_enabled: audioEnabled,
        bearer_token: ingress.streamKey,
      };

      // Start native stream
      await startNativeStream(config);
      setIsStreaming(true);
    } catch (e: any) {
      setError(e.message || "Failed to start stream");
      // Clean up ingress on error
      if (whipIngress) {
        try {
          await deleteWhipIngress(whipIngress.ingressId);
        } catch {}
      }
      setWhipIngress(null);
    } finally {
      setLoading(false);
      setCreatingIngress(false);
    }
  };

  // Stop streaming
  const stopStream = async () => {
    setStopping(true);
    try {
      await stopNativeStream();
      if (whipIngress) {
        await deleteWhipIngress(whipIngress.ingressId);
        setWhipIngress(null);
      }
      setIsStreaming(false);
      setStreamStatus(null);
      setShowPreview(false);
    } catch (e: any) {
      setError(e.message || "Failed to stop stream");
    } finally {
      setStopping(false);
    }
  };

  // Render
  if (!isNativeStreamingAvailable()) {
    return (
      <FocusTrap>
        <div className={css.ModalOverlay} onClick={onClose}>
          <div className={css.StreamingModal} onClick={(e) => e.stopPropagation()}>
            <div className={css.StreamingModalHeader}>
              <h3>Native Streaming</h3>
              <button className={css.IconButton} onClick={onClose}><CloseIcon /></button>
            </div>
            <div className={css.StreamingModalContent} style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "var(--text-secondary)" }}>
                Native streaming is only available in the desktop app.
              </p>
            </div>
          </div>
        </div>
      </FocusTrap>
    );
  }

  const isGstAvailable = gstreamerInfo && gstreamerInfo.available;

  return (
    <FocusTrap>
      <div className={css.ModalOverlay} onClick={onClose}>
        <div className={css.StreamingModal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={css.StreamingModalHeader}>
            <h3>
              {isStreaming ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={css.LiveIndicator}><LiveIcon /></span>
                  Live
                </span>
              ) : "Start Streaming"}
            </h3>
            <button className={css.IconButton} onClick={onClose}><CloseIcon /></button>
          </div>

          <div className={css.StreamingModalContent}>
            {error && (
              <div className={css.StreamError}>
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {/* Live Stats */}
            {isStreaming && streamStatus && (
              <div className={css.StreamStats}>
                <div className={css.StreamStatItem}>
                  <span className={css.StreamStatLabel}>Duration</span>
                  <span className={css.StreamStatValue}>
                    {formatStreamDuration(streamStatus.duration_seconds)}
                  </span>
                </div>
                <div className={css.StreamStatItem}>
                  <span className={css.StreamStatLabel}>Source</span>
                  <span className={css.StreamStatValue}>{selectedSource ? selectedSource.name : "Unknown"}</span>
                </div>
                <div className={css.StreamStatItem}>
                  <span className={css.StreamStatLabel}>Quality</span>
                  <span className={css.StreamStatValue}>
                    {getEffectiveSettings().width}x{getEffectiveSettings().height}@{getEffectiveSettings().fps}fps
                  </span>
                </div>
              </div>
            )}

            {/* Self-preview */}
            {isStreaming && (
              <div className={css.PreviewSection}>
                <button
                  className={css.PreviewToggle}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
                {showPreview && (
                  <div className={css.PreviewContainer}>
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", borderRadius: "8px", background: "#000" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Source Selection */}
            {!isStreaming && isGstAvailable && (
              <div className={css.StreamSection}>
                <div className={css.StreamSectionHeader}>
                  <h4>Capture Source</h4>
                  <button className={css.RefreshButton} onClick={loadSources} title="Refresh sources">
                    <RefreshIcon />
                  </button>
                </div>
                <div className={css.SourceList}>
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      className={`${css.SourceButton} ${selectedSource && selectedSource.id === source.id ? css.SourceButtonSelected : ""}`}
                      onClick={() => setSelectedSource(source)}
                    >
                      {source.source_type === "screen" ? <MonitorIcon /> : <WindowIcon />}
                      <span className={css.SourceName}>{source.name}</span>
                      {selectedSource && selectedSource.id === source.id && <CheckIcon />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Presets */}
            {!isStreaming && isGstAvailable && (
              <div className={css.StreamSection}>
                <h4>Quality</h4>
                <div className={css.PresetGrid}>
                  {(Object.entries(QUALITY_PRESETS) as [Exclude<QualityPreset, "custom">, PresetConfig][]).map(
                    ([key, config]) => (
                      <button
                        key={key}
                        className={`${css.PresetButton} ${preset === key ? css.PresetButtonSelected : ""}`}
                        onClick={() => setPreset(key)}
                      >
                        <span className={css.PresetLabel}>{config.label}</span>
                        <span className={css.PresetDesc}>{config.description}</span>
                      </button>
                    )
                  )}
                  <button
                    className={`${css.PresetButton} ${preset === "custom" ? css.PresetButtonSelected : ""}`}
                    onClick={() => setPreset("custom")}
                  >
                    <span className={css.PresetLabel}>Custom</span>
                    <span className={css.PresetDesc}>Manual settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Settings */}
            {!isStreaming && isGstAvailable && (
              <div className={css.StreamSection}>
                <button
                  className={css.AdvancedToggle}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  Advanced Settings
                  {showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </button>

                {showAdvanced && (
                  <div className={css.AdvancedSettings}>
                    {preset === "custom" && (
                      <>
                        <div className={css.SettingRow}>
                          <label>Resolution</label>
                          <select
                            value={`${customRes.width}x${customRes.height}`}
                            onChange={(e) => {
                              const [w, h] = e.target.value.split("x").map(Number);
                              setCustomRes({ label: e.target.value, width: w, height: h });
                            }}
                          >
                            {RESOLUTIONS.map((r) => (
                              <option key={r.label} value={`${r.width}x${r.height}`}>
                                {r.label} ({r.width}x{r.height})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={css.SettingRow}>
                          <label>Frame Rate</label>
                          <select value={customFps} onChange={(e) => setCustomFps(Number(e.target.value))}>
                            <option value={30}>30 fps</option>
                            <option value={60}>60 fps</option>
                          </select>
                        </div>
                        <div className={css.SettingRow}>
                          <label>Bitrate (kbps)</label>
                          <input
                            type="number"
                            value={customBitrate}
                            onChange={(e) => setCustomBitrate(Number(e.target.value))}
                            min={1000}
                            max={50000}
                            step={500}
                          />
                        </div>
                      </>
                    )}
                    <div className={css.SettingRow}>
                      <label>Audio</label>
                      <label className={css.Toggle}>
                        <input
                          type="checkbox"
                          checked={audioEnabled}
                          onChange={(e) => setAudioEnabled(e.target.checked)}
                        />
                        <span className={css.ToggleSlider} />
                      </label>
                    </div>
                  </div>
                )}

                {gstreamerInfo && (
                  <div className={css.StreamEncoderInfo}>
                    GStreamer {gstreamerInfo.version} • Hardware encoding enabled
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={css.StreamingModalFooter}>
            {isStreaming ? (
              <button className={css.StopButton} onClick={stopStream} disabled={stopping}>
                {stopping ? "Stopping..." : "Stop Streaming"}
              </button>
            ) : (
              <button
                className={css.StartButton}
                onClick={startStream}
                disabled={loading || !selectedSource || !isGstAvailable}
              >
                {loading ? (creatingIngress ? "Creating stream..." : "Starting...") : "Start Streaming"}
              </button>
            )}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
