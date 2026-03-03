import { useState, useEffect, useCallback, useRef } from 'react';
import { Room, RoomEvent } from 'livekit-client';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
  isActive: boolean;
}

export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
  isActive: boolean;
}

interface UseDeviceSelectionReturn {
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
  videoDevices: VideoDevice[];
  activeInputId: string | null;
  activeOutputId: string | null;
  activeVideoId: string | null;
  switchInput: (deviceId: string) => Promise<void>;
  switchOutput: (deviceId: string) => Promise<void>;
  switchVideo: (deviceId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useDeviceSelection(room: Room | null): UseDeviceSelectionReturn {
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [activeOutputId, setActiveOutputId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch available devices
  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use LiveKit's static method to enumerate devices
      const [inputs, outputs, videos] = await Promise.all([
        Room.getLocalDevices('audioinput', true),
        Room.getLocalDevices('audiooutput', true),
        Room.getLocalDevices('videoinput', true),
      ]);

      // Get currently active devices from room
      const currentInputId = room?.getActiveDevice('audioinput') || null;
      const currentOutputId = room?.getActiveDevice('audiooutput') || null;
      const currentVideoId = room?.getActiveDevice('videoinput') || null;

      setActiveInputId(currentInputId);
      setActiveOutputId(currentOutputId);
      setActiveVideoId(currentVideoId);

      // Map to our AudioDevice interface
      setInputDevices(inputs.map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone (${d.deviceId.slice(0, 8)})`,
        kind: 'audioinput' as const,
        isActive: d.deviceId === currentInputId,
      })));

      setOutputDevices(outputs.map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Speaker (${d.deviceId.slice(0, 8)})`,
        kind: 'audiooutput' as const,
        isActive: d.deviceId === currentOutputId,
      })));

      setVideoDevices(videos.map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Camera (${d.deviceId.slice(0, 8)})`,
        kind: 'videoinput' as const,
        isActive: d.deviceId === currentVideoId,
      })));
    } catch (err) {
      console.error('[DeviceSelection] Error fetching devices:', err);
      setError(err instanceof Error ? err.message : 'Failed to enumerate devices');
    } finally {
      setIsLoading(false);
    }
  }, [room]);

  // Switch input device (microphone)
  const switchInput = useCallback(async (deviceId: string) => {
    if (!room) {
      setError('Not connected to a room');
      return;
    }

    try {
      await room.switchActiveDevice('audioinput', deviceId);
      setActiveInputId(deviceId);
      
      // Update isActive flags
      setInputDevices(prev => prev.map(d => ({
        ...d,
        isActive: d.deviceId === deviceId,
      })));
    } catch (err) {
      console.error('[DeviceSelection] Error switching input device:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch microphone');
    }
  }, [room]);

  // Switch output device (speakers)
  const switchOutput = useCallback(async (deviceId: string) => {
    if (!room) {
      setError('Not connected to a room');
      return;
    }

    try {
      await room.switchActiveDevice('audiooutput', deviceId);
      setActiveOutputId(deviceId);

      // Update isActive flags
      setOutputDevices(prev => prev.map(d => ({
        ...d,
        isActive: d.deviceId === deviceId,
      })));
    } catch (err) {
      console.error('[DeviceSelection] Error switching output device:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch speakers');
    }
  }, [room]);

  // Switch video device (camera)
  const switchVideo = useCallback(async (deviceId: string) => {
    if (!room) {
      setError('Not connected to a room');
      return;
    }

    try {
      await room.switchActiveDevice('videoinput', deviceId);
      setActiveVideoId(deviceId);

      // Update isActive flags
      setVideoDevices(prev => prev.map(d => ({
        ...d,
        isActive: d.deviceId === deviceId,
      })));
    } catch (err) {
      console.error('[DeviceSelection] Error switching video device:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch camera');
    }
  }, [room]);

  // Listen for device changes
  useEffect(() => {
    if (!room) return;

    const handleDevicesChanged = () => {
      // Debounce device refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        fetchDevices();
      }, 300);
    };

    room.on(RoomEvent.MediaDevicesChanged, handleDevicesChanged);
    
    // Also listen for active device changes
    room.on(RoomEvent.ActiveDeviceChanged, (kind, deviceId) => {
      if (kind === 'audioinput') {
        setActiveInputId(deviceId);
        setInputDevices(prev => prev.map(d => ({
          ...d,
          isActive: d.deviceId === deviceId,
        })));
      } else if (kind === 'audiooutput') {
        setActiveOutputId(deviceId);
        setOutputDevices(prev => prev.map(d => ({
          ...d,
          isActive: d.deviceId === deviceId,
        })));
      } else if (kind === 'videoinput') {
        setActiveVideoId(deviceId);
        setVideoDevices(prev => prev.map(d => ({
          ...d,
          isActive: d.deviceId === deviceId,
        })));
      }
    });

    // Initial fetch
    fetchDevices();

    return () => {
      room.off(RoomEvent.MediaDevicesChanged, handleDevicesChanged);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [room, fetchDevices]);

  return {
    inputDevices,
    outputDevices,
    videoDevices,
    activeInputId,
    activeOutputId,
    activeVideoId,
    switchInput,
    switchOutput,
    switchVideo,
    refresh: fetchDevices,
    isLoading,
    error,
  };
}
