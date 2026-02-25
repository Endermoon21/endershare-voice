/**
 * Game Streaming Context - Native Capture Edition
 * 
 * Manages game streaming using native Electron capture with hardware encoding.
 * No external software required - works entirely within the app.
 * 
 * Features:
 * - Electron desktopCapturer for source selection
 * - WebCodecs hardware encoding (NVENC/AMF)
 * - Direct WebRTC streaming to LiveKit
 * - Optional Sunshine detection for enhanced quality
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { LocalTrack, Track, Room, LocalVideoTrack, LocalAudioTrack } from 'livekit-client';
import { 
  getCaptureSources, 
  captureSource, 
  captureWithPicker,
  checkHardwareEncodingSupport,
  getOptimalEncodingSettings,
  CaptureSource,
  CaptureOptions,
} from './GameCapture';
import { sunshineController, SunshineStatus } from './SunshineController';
import { useLiveKitContext } from './LiveKitContext';

export interface GameStreamState {
  // Capture sources
  sources: CaptureSource[];
  loadingSources: boolean;
  selectedSource: CaptureSource | null;
  
  // Stream state
  streaming: boolean;
  streamStarting: boolean;
  streamError: string | null;
  
  // Hardware info
  hardwareEncoding: {
    h264: boolean;
    hevc: boolean;
    av1: boolean;
    nvenc: boolean;
  } | null;
  
  // Sunshine integration
  sunshineAvailable: boolean;
  
  // Stream stats
  streamStats: {
    width: number;
    height: number;
    frameRate: number;
    codec: string;
    bitrate: number;
  } | null;
}

export interface GameStreamContextValue extends GameStreamState {
  // Source management
  refreshSources: () => Promise<void>;
  selectSource: (source: CaptureSource | null) => void;
  
  // Streaming
  startGameStream: (options?: CaptureOptions) => Promise<boolean>;
  stopGameStream: () => Promise<void>;
  
  // Use browser picker (fallback)
  startWithPicker: (options?: CaptureOptions) => Promise<boolean>;
}

const GameStreamContext = createContext<GameStreamContextValue | null>(null);

export const useGameStream = (): GameStreamContextValue => {
  const context = useContext(GameStreamContext);
  if (!context) {
    throw new Error('useGameStream must be used within a GameStreamProvider');
  }
  return context;
};

export const GameStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { room, isConnected, currentRoom } = useLiveKitContext();
  
  const [state, setState] = useState<GameStreamState>({
    sources: [],
    loadingSources: false,
    selectedSource: null,
    streaming: false,
    streamStarting: false,
    streamError: null,
    hardwareEncoding: null,
    sunshineAvailable: false,
    streamStats: null,
  });

  const localTracksRef = useRef<LocalTrack[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Check hardware encoding on mount
  useEffect(() => {
    checkHardwareEncodingSupport().then(support => {
      setState(prev => ({ ...prev, hardwareEncoding: support }));
      console.log('[GameStream] Hardware encoding support:', support);
    });
  }, []);

  // Monitor Sunshine availability
  useEffect(() => {
    sunshineController.startMonitoring(10000); // Check every 10s
    
    const unsubscribe = sunshineController.subscribe((status: SunshineStatus) => {
      setState(prev => ({ ...prev, sunshineAvailable: status.available }));
    });

    return () => {
      sunshineController.stopMonitoring();
      unsubscribe();
    };
  }, []);

  // Refresh capture sources
  const refreshSources = useCallback(async () => {
    setState(prev => ({ ...prev, loadingSources: true }));
    
    try {
      const sources = await getCaptureSources();
      setState(prev => ({ 
        ...prev, 
        sources,
        loadingSources: false,
      }));
      console.log('[GameStream] Found', sources.length, 'capture sources');
    } catch (e: any) {
      console.error('[GameStream] Failed to get sources:', e);
      setState(prev => ({ 
        ...prev, 
        loadingSources: false,
        streamError: e.message,
      }));
    }
  }, []);

  // Select a source
  const selectSource = useCallback((source: CaptureSource | null) => {
    setState(prev => ({ ...prev, selectedSource: source }));
  }, []);

  // Publish stream to LiveKit
  const publishToLiveKit = useCallback(async (stream: MediaStream, options: CaptureOptions): Promise<boolean> => {
    if (!room || !isConnected) {
      throw new Error('Not connected to a voice channel');
    }

    const encodingSettings = await getOptimalEncodingSettings();
    console.log('[GameStream] Using encoding:', encodingSettings);

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    // Create LiveKit tracks
    const tracks: LocalTrack[] = [];

    if (videoTrack) {
      // Apply content hint for encoder optimization
      videoTrack.contentHint = options.contentHint || 'motion';
      
      const lkVideoTrack = new LocalVideoTrack(videoTrack, undefined, false);
      tracks.push(lkVideoTrack);

      // Publish with optimized settings
      await room.localParticipant.publishTrack(lkVideoTrack, {
        source: Track.Source.ScreenShare,
        videoEncoding: {
          maxBitrate: encodingSettings.bitrate,
          maxFramerate: options.frameRate || 60,
        },
        simulcast: false, // Single high-quality stream
        videoCodec: encodingSettings.codec === 'h264' ? 'h264' : 
                    encodingSettings.codec === 'vp9' ? 'vp9' : 'h264',
        degradationPreference: 'maintain-framerate',
      });

      console.log('[GameStream] Video track published');
    }

    if (audioTrack) {
      const lkAudioTrack = new LocalAudioTrack(audioTrack, undefined, false);
      tracks.push(lkAudioTrack);

      await room.localParticipant.publishTrack(lkAudioTrack, {
        source: Track.Source.ScreenShareAudio,
        audioBitrate: 128_000,
      });

      console.log('[GameStream] Audio track published');
    }

    localTracksRef.current = tracks;
    mediaStreamRef.current = stream;

    // Get actual stream info
    const settings = videoTrack?.getSettings();
    setState(prev => ({
      ...prev,
      streaming: true,
      streamStarting: false,
      streamStats: settings ? {
        width: settings.width || 1920,
        height: settings.height || 1080,
        frameRate: settings.frameRate || 60,
        codec: encodingSettings.codec,
        bitrate: encodingSettings.bitrate,
      } : null,
    }));

    return true;
  }, [room, isConnected]);

  // Start streaming from selected source
  const startGameStream = useCallback(async (options: CaptureOptions = {}): Promise<boolean> => {
    if (!state.selectedSource) {
      setState(prev => ({ ...prev, streamError: 'No source selected' }));
      return false;
    }

    if (!isConnected || !currentRoom) {
      setState(prev => ({ ...prev, streamError: 'Join a voice channel first' }));
      return false;
    }

    setState(prev => ({ ...prev, streamStarting: true, streamError: null }));

    try {
      const captureOptions: CaptureOptions = {
        width: 1920,
        height: 1080,
        frameRate: 60,
        audio: true,
        contentHint: 'motion',
        ...options,
      };

      console.log('[GameStream] Capturing source:', state.selectedSource.name);
      const stream = await captureSource(state.selectedSource.id, captureOptions);
      
      console.log('[GameStream] Publishing to LiveKit...');
      await publishToLiveKit(stream, captureOptions);

      return true;
    } catch (e: any) {
      console.error('[GameStream] Failed to start:', e);
      setState(prev => ({
        ...prev,
        streamStarting: false,
        streamError: e.message,
      }));
      return false;
    }
  }, [state.selectedSource, isConnected, currentRoom, publishToLiveKit]);

  // Start with browser picker (fallback)
  const startWithPicker = useCallback(async (options: CaptureOptions = {}): Promise<boolean> => {
    if (!isConnected || !currentRoom) {
      setState(prev => ({ ...prev, streamError: 'Join a voice channel first' }));
      return false;
    }

    setState(prev => ({ ...prev, streamStarting: true, streamError: null }));

    try {
      const captureOptions: CaptureOptions = {
        width: 1920,
        height: 1080,
        frameRate: 60,
        audio: true,
        contentHint: 'motion',
        ...options,
      };

      console.log('[GameStream] Starting with browser picker...');
      const stream = await captureWithPicker(captureOptions);
      
      console.log('[GameStream] Publishing to LiveKit...');
      await publishToLiveKit(stream, captureOptions);

      return true;
    } catch (e: any) {
      console.error('[GameStream] Failed to start:', e);
      setState(prev => ({
        ...prev,
        streamStarting: false,
        streamError: e.message,
      }));
      return false;
    }
  }, [isConnected, currentRoom, publishToLiveKit]);

  // Stop streaming
  const stopGameStream = useCallback(async (): Promise<void> => {
    console.log('[GameStream] Stopping stream...');

    // Unpublish and stop tracks
    for (const track of localTracksRef.current) {
      try {
        if (room) {
          await room.localParticipant.unpublishTrack(track);
        }
        track.stop();
      } catch (e) {
        console.error('[GameStream] Error stopping track:', e);
      }
    }
    localTracksRef.current = [];

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    setState(prev => ({
      ...prev,
      streaming: false,
      streamStats: null,
    }));

    console.log('[GameStream] Stream stopped');
  }, [room]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.streaming) {
        stopGameStream();
      }
    };
  }, []);

  const contextValue: GameStreamContextValue = {
    ...state,
    refreshSources,
    selectSource,
    startGameStream,
    stopGameStream,
    startWithPicker,
  };

  return (
    <GameStreamContext.Provider value={contextValue}>
      {children}
    </GameStreamContext.Provider>
  );
};

export default GameStreamContext;
