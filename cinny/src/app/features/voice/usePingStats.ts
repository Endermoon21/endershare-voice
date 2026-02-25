import { useMemo } from 'react';
import { ConnectionQuality } from './LiveKitContext';

// Butter theme colors
const PING_COLORS = {
  excellent: '#23a55a',  // Green - RTT < 50ms
  good: '#f0b232',       // Yellow - RTT < 100ms
  poor: '#e67e22',       // Orange - RTT < 200ms
  bad: '#f23f43',        // Red - RTT >= 200ms
  unknown: '#949ba4',    // Gray - No data
};

export interface PingStats {
  ping: number;           // RTT in ms
  jitter: number;         // Jitter in ms
  packetLoss: number;     // Percentage
  bitrate: number;        // kbps
  quality: 'excellent' | 'good' | 'poor' | 'bad' | 'unknown';
  color: string;          // CSS color based on quality
  label: string;          // Human-readable quality label
}

export function usePingStats(connectionQuality: ConnectionQuality | null): PingStats {
  return useMemo(() => {
    if (!connectionQuality) {
      return {
        ping: 0,
        jitter: 0,
        packetLoss: 0,
        bitrate: 0,
        quality: 'unknown',
        color: PING_COLORS.unknown,
        label: 'Connecting...',
      };
    }

    const { rtt, jitter, packetLoss, bitrate, quality } = connectionQuality;
    
    // Determine color based on RTT thresholds
    let color: string;
    let label: string;
    
    if (rtt < 50) {
      color = PING_COLORS.excellent;
      label = 'Excellent';
    } else if (rtt < 100) {
      color = PING_COLORS.good;
      label = 'Good';
    } else if (rtt < 200) {
      color = PING_COLORS.poor;
      label = 'Poor';
    } else {
      color = PING_COLORS.bad;
      label = 'Bad';
    }
    
    // Override if unknown
    if (quality === 'unknown') {
      color = PING_COLORS.unknown;
      label = 'Connecting...';
    }

    return {
      ping: Math.round(rtt),
      jitter: Math.round(jitter * 10) / 10,
      packetLoss: Math.round(packetLoss * 100) / 100,
      bitrate: Math.round(bitrate / 1000),
      quality,
      color,
      label,
    };
  }, [connectionQuality]);
}

// Helper function to get color for a specific ping value
export function getPingColor(pingMs: number): string {
  if (pingMs < 50) return PING_COLORS.excellent;
  if (pingMs < 100) return PING_COLORS.good;
  if (pingMs < 200) return PING_COLORS.poor;
  return PING_COLORS.bad;
}
