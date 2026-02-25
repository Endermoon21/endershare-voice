/**
 * OBS WebSocket Controller for Game Streaming
 * 
 * Handles communication with OBS Studio via obs-websocket-js v5
 * to enable automatic game streaming through WHIP to LiveKit.
 */

import OBSWebSocket, { EventSubscription, OBSResponseTypes } from 'obs-websocket-js';

export interface OBSConnectionOptions {
  host?: string;
  port?: number;
  password?: string;
}

export interface StreamConfig {
  whipUrl: string;
  streamKey: string;
  ingressId: string;
}

export interface OBSStreamStatus {
  active: boolean;
  reconnecting: boolean;
  timecode: string;
  duration: number;
  congestion: number;
  bytes: number;
  skippedFrames: number;
  totalFrames: number;
}

export interface OBSControllerState {
  connected: boolean;
  streaming: boolean;
  streamStatus: OBSStreamStatus | null;
  currentConfig: StreamConfig | null;
  error: string | null;
}

export type OBSStateChangeCallback = (state: OBSControllerState) => void;

class OBSController {
  private obs: OBSWebSocket;
  private state: OBSControllerState;
  private listeners: Set<OBSStateChangeCallback>;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private statusInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.obs = new OBSWebSocket();
    this.listeners = new Set();
    this.state = {
      connected: false,
      streaming: false,
      streamStatus: null,
      currentConfig: null,
      error: null,
    };

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.obs.on('ConnectionOpened', () => {
      console.log('[OBS] Connection opened');
      this.reconnectAttempts = 0;
    });

    this.obs.on('ConnectionClosed', () => {
      console.log('[OBS] Connection closed');
      this.updateState({ 
        connected: false, 
        streaming: false,
        streamStatus: null 
      });
      this.stopStatusPolling();
      this.attemptReconnect();
    });

    this.obs.on('ConnectionError', (err) => {
      console.error('[OBS] Connection error:', err);
      this.updateState({ 
        error: `Connection error: ${err.message || 'Unknown error'}` 
      });
    });

    this.obs.on('StreamStateChanged', (data) => {
      console.log('[OBS] Stream state changed:', data);
      const isActive = data.outputActive;
      this.updateState({ streaming: isActive });
      
      if (isActive) {
        this.startStatusPolling();
      } else {
        this.stopStatusPolling();
        this.updateState({ streamStatus: null });
      }
    });

    this.obs.on('Identified', () => {
      console.log('[OBS] Identified (authenticated)');
      this.updateState({ connected: true, error: null });
      // Check current streaming status
      this.checkStreamStatus();
    });
  }

  private updateState(partial: Partial<OBSControllerState>) {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  subscribe(callback: OBSStateChangeCallback): () => void {
    this.listeners.add(callback);
    // Immediately notify with current state
    callback({ ...this.state });
    return () => this.listeners.delete(callback);
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[OBS] Max reconnect attempts reached');
      this.updateState({ error: 'Failed to reconnect to OBS after multiple attempts' });
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[OBS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
      } catch (e) {
        // Will trigger another reconnect via ConnectionClosed
      }
    }, delay);
  }

  async connect(options: OBSConnectionOptions = {}): Promise<boolean> {
    const { host = 'localhost', port = 4455, password } = options;
    
    try {
      const url = `ws://${host}:${port}`;
      console.log('[OBS] Connecting to:', url);
      
      const result = await this.obs.connect(url, password, {
        eventSubscriptions: EventSubscription.All,
      });
      
      console.log('[OBS] Connected, version:', result.negotiatedRpcVersion);
      this.updateState({ connected: true, error: null });
      
      return true;
    } catch (err: any) {
      console.error('[OBS] Connect failed:', err);
      this.updateState({ 
        connected: false, 
        error: `Failed to connect: ${err.message || 'Unknown error'}` 
      });
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.stopStatusPolling();
    
    try {
      await this.obs.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    
    this.updateState({ 
      connected: false, 
      streaming: false, 
      streamStatus: null 
    });
  }

  async configureWhipStream(config: StreamConfig): Promise<boolean> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    try {
      // The WHIP URL for OBS should be the base URL + stream key
      const fullWhipUrl = `${config.whipUrl}/${config.streamKey}`;
      
      console.log('[OBS] Configuring WHIP stream:', fullWhipUrl);

      // Set the stream service to WHIP
      await this.obs.call('SetStreamServiceSettings', {
        streamServiceType: 'whip_custom',
        streamServiceSettings: {
          server: fullWhipUrl,
          bearer_token: '', // LiveKit uses the streamKey in URL, not bearer token
        },
      });

      this.updateState({ currentConfig: config });
      console.log('[OBS] WHIP stream configured');
      return true;
    } catch (err: any) {
      console.error('[OBS] Failed to configure stream:', err);
      throw new Error(`Failed to configure stream: ${err.message}`);
    }
  }

  async startStreaming(): Promise<boolean> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    if (this.state.streaming) {
      console.log('[OBS] Already streaming');
      return true;
    }

    try {
      console.log('[OBS] Starting stream...');
      await this.obs.call('StartStream');
      this.updateState({ streaming: true, error: null });
      this.startStatusPolling();
      return true;
    } catch (err: any) {
      console.error('[OBS] Failed to start stream:', err);
      throw new Error(`Failed to start stream: ${err.message}`);
    }
  }

  async stopStreaming(): Promise<boolean> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    if (!this.state.streaming) {
      console.log('[OBS] Not streaming');
      return true;
    }

    try {
      console.log('[OBS] Stopping stream...');
      await this.obs.call('StopStream');
      this.updateState({ streaming: false, streamStatus: null });
      this.stopStatusPolling();
      return true;
    } catch (err: any) {
      console.error('[OBS] Failed to stop stream:', err);
      throw new Error(`Failed to stop stream: ${err.message}`);
    }
  }

  private async checkStreamStatus() {
    try {
      const status = await this.obs.call('GetStreamStatus');
      const isActive = status.outputActive;
      
      this.updateState({ 
        streaming: isActive,
        streamStatus: isActive ? {
          active: status.outputActive,
          reconnecting: status.outputReconnecting,
          timecode: status.outputTimecode,
          duration: status.outputDuration,
          congestion: status.outputCongestion,
          bytes: status.outputBytes,
          skippedFrames: status.outputSkippedFrames,
          totalFrames: status.outputTotalFrames,
        } : null,
      });
      
      if (isActive) {
        this.startStatusPolling();
      }
    } catch (err: any) {
      console.error('[OBS] Failed to check stream status:', err);
    }
  }

  private startStatusPolling() {
    if (this.statusInterval) return;
    
    this.statusInterval = setInterval(async () => {
      if (!this.state.streaming || !this.state.connected) {
        this.stopStatusPolling();
        return;
      }
      
      try {
        const status = await this.obs.call('GetStreamStatus');
        this.updateState({
          streamStatus: {
            active: status.outputActive,
            reconnecting: status.outputReconnecting,
            timecode: status.outputTimecode,
            duration: status.outputDuration,
            congestion: status.outputCongestion,
            bytes: status.outputBytes,
            skippedFrames: status.outputSkippedFrames,
            totalFrames: status.outputTotalFrames,
          },
        });
      } catch (e) {
        // Ignore polling errors
      }
    }, 1000);
  }

  private stopStatusPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  // Get available scenes
  async getScenes(): Promise<string[]> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    try {
      const { scenes } = await this.obs.call('GetSceneList');
      return scenes.map(s => s.sceneName as string);
    } catch (err: any) {
      console.error('[OBS] Failed to get scenes:', err);
      throw new Error(`Failed to get scenes: ${err.message}`);
    }
  }

  // Get current scene
  async getCurrentScene(): Promise<string> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    try {
      const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
      return currentProgramSceneName;
    } catch (err: any) {
      console.error('[OBS] Failed to get current scene:', err);
      throw new Error(`Failed to get current scene: ${err.message}`);
    }
  }

  // Switch scene
  async setScene(sceneName: string): Promise<void> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
    } catch (err: any) {
      console.error('[OBS] Failed to set scene:', err);
      throw new Error(`Failed to set scene: ${err.message}`);
    }
  }

  // Get current encoder settings
  async getVideoSettings(): Promise<{
    baseWidth: number;
    baseHeight: number;
    outputWidth: number;
    outputHeight: number;
    fpsNumerator: number;
    fpsDenominator: number;
  }> {
    if (!this.state.connected) {
      throw new Error('Not connected to OBS');
    }

    try {
      const settings = await this.obs.call('GetVideoSettings');
      return {
        baseWidth: settings.baseWidth,
        baseHeight: settings.baseHeight,
        outputWidth: settings.outputWidth,
        outputHeight: settings.outputHeight,
        fpsNumerator: settings.fpsNumerator,
        fpsDenominator: settings.fpsDenominator,
      };
    } catch (err: any) {
      console.error('[OBS] Failed to get video settings:', err);
      throw new Error(`Failed to get video settings: ${err.message}`);
    }
  }

  getState(): OBSControllerState {
    return { ...this.state };
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  isStreaming(): boolean {
    return this.state.streaming;
  }
}

// Singleton instance
export const obsController = new OBSController();

// Also export the class for testing or multiple instances
export { OBSController };
