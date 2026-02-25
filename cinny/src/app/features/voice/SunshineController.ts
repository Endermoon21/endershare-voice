/**
 * SunshineController - Integration with Sunshine game streaming server
 *
 * Sunshine is a self-hosted game streaming server for Moonlight.
 * This controller detects if Sunshine is running and can interact
 * with its REST API and our WHIP ingress for game streaming to LiveKit.
 *
 * Sunshine API docs: https://docs.lizardbyte.dev/projects/sunshine/
 */

export interface SunshineStatus {
  available: boolean;
  version?: string;
  hostname?: string;
  streaming?: boolean;
}

export interface SunshineApp {
  name: string;
  id: number;
  cmd?: string;
  detached?: string[];
}

export interface SunshineClient {
  address: string;
  uniqueId: string;
}

export interface WhipIngressInfo {
  success: boolean;
  ingressId: string;
  whipUrl: string;
  whipLocalUrl: string;
  streamKey: string;
  room: string;
  username: string;
  existing?: boolean;
  instructions: {
    sunshine: string;
    sunshineLocal: string;
    obs: string;
  };
}

const SUNSHINE_PORT = 47990;
const SUNSHINE_TIMEOUT = 2000; // 2 seconds
const TOKEN_SERVER_URL = 'https://token.endershare.org';

/**
 * Build Sunshine API URL
 */
function sunshineUrl(path: string, host = 'localhost'): string {
  return `https://${host}:${SUNSHINE_PORT}${path}`;
}

/**
 * Make a request to Sunshine API
 * Note: Sunshine uses self-signed certs, so we need to handle that
 */
async function sunshineRequest<T>(
  path: string,
  options: RequestInit = {},
  host = 'localhost'
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUNSHINE_TIMEOUT);

  try {
    const response = await fetch(sunshineUrl(path, host), {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json() as T;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      console.log('[Sunshine] Request timed out');
    } else {
      console.log('[Sunshine] Request failed:', e.message);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check if Sunshine is running and get its status
 */
export async function checkSunshineStatus(host = 'localhost'): Promise<SunshineStatus> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SUNSHINE_TIMEOUT);

    const response = await fetch(sunshineUrl('/', host), {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok || response.status === 401) {
      return {
        available: true,
        hostname: host,
      };
    }

    return { available: false };
  } catch (e) {
    return { available: false };
  }
}

/**
 * Create a WHIP ingress for streaming to LiveKit
 */
export async function createWhipIngress(
  room: string,
  username: string,
  streamName?: string
): Promise<WhipIngressInfo | null> {
  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/ingress/whip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room,
        username,
        streamName: streamName || `${username}-gamestream`,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json() as WhipIngressInfo;
  } catch (e: any) {
    console.error('[WHIP] Failed to create ingress:', e.message);
    return null;
  }
}

/**
 * Delete a WHIP ingress
 */
export async function deleteWhipIngress(ingressId: string): Promise<boolean> {
  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/ingress/${ingressId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (e: any) {
    console.error('[WHIP] Failed to delete ingress:', e.message);
    return false;
  }
}

/**
 * List all active ingresses
 */
export async function listWhipIngresses(): Promise<any[]> {
  try {
    const response = await fetch(`${TOKEN_SERVER_URL}/ingress`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.ingresses || [];
  } catch (e: any) {
    console.error('[WHIP] Failed to list ingresses:', e.message);
    return [];
  }
}

/**
 * Get list of configured applications in Sunshine
 */
export async function getSunshineApps(
  host = 'localhost',
  username?: string,
  password?: string
): Promise<SunshineApp[]> {
  const headers: HeadersInit = {};

  if (username && password) {
    headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
  }

  const result = await sunshineRequest<{ apps: SunshineApp[] }>(
    '/api/apps',
    { headers },
    host
  );

  return result?.apps || [];
}

/**
 * Get currently connected clients
 */
export async function getSunshineClients(
  host = 'localhost',
  username?: string,
  password?: string
): Promise<SunshineClient[]> {
  const headers: HeadersInit = {};

  if (username && password) {
    headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
  }

  const result = await sunshineRequest<{ clients: SunshineClient[] }>(
    '/api/clients',
    { headers },
    host
  );

  return result?.clients || [];
}

/**
 * Launch an application via Sunshine
 */
export async function launchSunshineApp(
  appId: number,
  host = 'localhost',
  username?: string,
  password?: string
): Promise<boolean> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (username && password) {
    headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
  }

  const result = await sunshineRequest<{ status: string }>(
    '/api/apps/launch',
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: appId }),
    },
    host
  );

  return result?.status === 'ok';
}

/**
 * Close the current streaming session
 */
export async function closeSunshineSession(
  host = 'localhost',
  username?: string,
  password?: string
): Promise<boolean> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (username && password) {
    headers['Authorization'] = 'Basic ' + btoa(`${username}:${password}`);
  }

  const result = await sunshineRequest<{ status: string }>(
    '/api/apps/close',
    {
      method: 'POST',
      headers,
    },
    host
  );

  return result?.status === 'ok';
}

/**
 * SunshineController class for managing Sunshine integration
 */
export class SunshineController {
  private host: string;
  private username?: string;
  private password?: string;
  private _status: SunshineStatus = { available: false };
  private statusCheckInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(status: SunshineStatus) => void> = new Set();

  // WHIP ingress state
  private _activeIngress: WhipIngressInfo | null = null;

  constructor(host = 'localhost', username?: string, password?: string) {
    this.host = host;
    this.username = username;
    this.password = password;
  }

  /**
   * Start monitoring Sunshine status
   */
  startMonitoring(intervalMs = 5000): void {
    this.checkStatus();
    this.statusCheckInterval = setInterval(() => this.checkStatus(), intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  /**
   * Subscribe to status changes
   */
  subscribe(callback: (status: SunshineStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this._status);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this._status));
  }

  /**
   * Check current status
   */
  async checkStatus(): Promise<SunshineStatus> {
    this._status = await checkSunshineStatus(this.host);
    this.notifyListeners();
    return this._status;
  }

  /**
   * Get current status (cached)
   */
  get status(): SunshineStatus {
    return this._status;
  }

  /**
   * Get active WHIP ingress
   */
  get activeIngress(): WhipIngressInfo | null {
    return this._activeIngress;
  }

  /**
   * Create WHIP ingress for streaming
   */
  async createIngress(room: string, username: string): Promise<WhipIngressInfo | null> {
    const ingress = await createWhipIngress(room, username);
    if (ingress) {
      this._activeIngress = ingress;
    }
    return ingress;
  }

  /**
   * Stop the active ingress
   */
  async stopIngress(): Promise<boolean> {
    if (this._activeIngress) {
      const success = await deleteWhipIngress(this._activeIngress.ingressId);
      if (success) {
        this._activeIngress = null;
      }
      return success;
    }
    return true;
  }

  /**
   * Get configured apps
   */
  async getApps(): Promise<SunshineApp[]> {
    return getSunshineApps(this.host, this.username, this.password);
  }

  /**
   * Launch an app
   */
  async launchApp(appId: number): Promise<boolean> {
    return launchSunshineApp(appId, this.host, this.username, this.password);
  }

  /**
   * Close current session
   */
  async closeSession(): Promise<boolean> {
    return closeSunshineSession(this.host, this.username, this.password);
  }

  /**
   * Get connected clients
   */
  async getClients(): Promise<SunshineClient[]> {
    return getSunshineClients(this.host, this.username, this.password);
  }
}

// Singleton instance for default localhost Sunshine
export const sunshineController = new SunshineController();

export default SunshineController;
