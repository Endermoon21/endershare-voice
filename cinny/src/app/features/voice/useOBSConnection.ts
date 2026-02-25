/**
 * Hook for managing OBS WebSocket connection
 * 
 * Provides a simple interface for connecting to OBS
 * with auto-reconnection and state management.
 */

import { useState, useEffect, useCallback } from 'react';
import { obsController, OBSControllerState } from './OBSController';

export interface UseOBSConnectionOptions {
  host?: string;
  port?: number;
  password?: string;
  autoConnect?: boolean;
}

export interface UseOBSConnectionReturn {
  connected: boolean;
  connecting: boolean;
  streaming: boolean;
  error: string | null;
  streamStatus: OBSControllerState['streamStatus'];
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export const useOBSConnection = (options: UseOBSConnectionOptions = {}): UseOBSConnectionReturn => {
  const { 
    host = 'localhost', 
    port = 4455, 
    password,
    autoConnect = false,
  } = options;

  const [state, setState] = useState<{
    connected: boolean;
    connecting: boolean;
    streaming: boolean;
    error: string | null;
    streamStatus: OBSControllerState['streamStatus'];
  }>({
    connected: false,
    connecting: false,
    streaming: false,
    error: null,
    streamStatus: null,
  });

  // Subscribe to OBS controller state
  useEffect(() => {
    const unsubscribe = obsController.subscribe((obsState) => {
      setState(prev => ({
        ...prev,
        connected: obsState.connected,
        streaming: obsState.streaming,
        error: obsState.error,
        streamStatus: obsState.streamStatus,
      }));
    });

    return () => unsubscribe();
  }, []);

  // Connect function
  const connect = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, connecting: true, error: null }));
    
    try {
      const success = await obsController.connect({ host, port, password });
      setState(prev => ({ 
        ...prev, 
        connecting: false,
        error: success ? null : 'Failed to connect to OBS',
      }));
      return success;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: err.message,
      }));
      return false;
    }
  }, [host, port, password]);

  // Disconnect function
  const disconnect = useCallback(async (): Promise<void> => {
    await obsController.disconnect();
    setState(prev => ({
      ...prev,
      connected: false,
      streaming: false,
      error: null,
      streamStatus: null,
    }));
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !state.connected && !state.connecting) {
      connect();
    }
  }, [autoConnect]); // Only run on mount

  return {
    ...state,
    connect,
    disconnect,
  };
};

export default useOBSConnection;
