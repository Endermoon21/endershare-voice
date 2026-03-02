import { useState, useCallback, useEffect, useRef } from 'react';
import { ConnectionQuality } from './LiveKitContext';

// Butter theme ping colors
export const PING_COLORS = {
  excellent: '#23a55a',  // Green - RTT < 50ms
  good: '#f0b232',       // Yellow - RTT < 100ms
  poor: '#e67e22',       // Orange - RTT < 200ms
  bad: '#f23f43',        // Red - RTT >= 200ms
  unknown: '#949ba4',    // Gray - No data
};

export interface PingSample {
  ping: number;
  timestamp: number;
  color: string;
}

export interface PingHistoryStats {
  samples: PingSample[];
  lastPing: number;
  averagePing: number;
  minPing: number;
  maxPing: number;
  jitter: number;
  packetLoss: number;
  bitrate: number;
}

const MAX_SAMPLES = 30; // Show last 30 samples (30 seconds at 1s interval)
const SAMPLE_INTERVAL = 1000; // Sample every 1 second

export function getPingColor(pingMs: number): string {
  if (pingMs <= 0) return PING_COLORS.unknown;
  if (pingMs < 50) return PING_COLORS.excellent;
  if (pingMs < 100) return PING_COLORS.good;
  if (pingMs < 200) return PING_COLORS.poor;
  return PING_COLORS.bad;
}

export function getPingQuality(pingMs: number): 'excellent' | 'good' | 'poor' | 'bad' | 'unknown' {
  if (pingMs <= 0) return 'unknown';
  if (pingMs < 50) return 'excellent';
  if (pingMs < 100) return 'good';
  if (pingMs < 200) return 'poor';
  return 'bad';
}

export function usePingHistory(connectionQuality: ConnectionQuality | null): PingHistoryStats {
  const [samples, setSamples] = useState<PingSample[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add a new sample
  const addSample = useCallback((ping: number) => {
    const sample: PingSample = {
      ping: Math.round(ping),
      timestamp: Date.now(),
      color: getPingColor(ping),
    };

    setSamples(prev => {
      const newSamples = [...prev, sample];
      // Keep only the last MAX_SAMPLES
      if (newSamples.length > MAX_SAMPLES) {
        return newSamples.slice(-MAX_SAMPLES);
      }
      return newSamples;
    });
  }, []);

  // Sample ping at regular intervals
  useEffect(() => {
    if (connectionQuality) {
      // Add initial sample
      addSample(connectionQuality.rtt);

      // Set up interval for regular sampling
      intervalRef.current = setInterval(() => {
        if (connectionQuality) {
          addSample(connectionQuality.rtt);
        }
      }, SAMPLE_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [connectionQuality?.rtt, addSample]);

  // Calculate stats
  const lastPing = samples.length > 0 ? samples[samples.length - 1].ping : 0;

  const validSamples = samples.filter(s => s.ping > 0);
  const averagePing = validSamples.length > 0
    ? Math.round(validSamples.reduce((sum, s) => sum + s.ping, 0) / validSamples.length)
    : 0;

  const minPing = validSamples.length > 0
    ? Math.min(...validSamples.map(s => s.ping))
    : 0;

  const maxPing = validSamples.length > 0
    ? Math.max(...validSamples.map(s => s.ping))
    : 0;

  return {
    samples,
    lastPing,
    averagePing,
    minPing,
    maxPing,
    jitter: connectionQuality ? Math.round(connectionQuality.jitter * 10) / 10 : 0,
    packetLoss: connectionQuality ? Math.round(connectionQuality.packetLoss * 100) / 100 : 0,
    bitrate: connectionQuality ? Math.round(connectionQuality.bitrate / 1000) : 0,
  };
}
