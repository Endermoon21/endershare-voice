import { useState, useEffect, useCallback } from 'react';

interface UseCallDurationReturn {
  duration: number;        // Total seconds
  formatted: string;       // MM:SS or HH:MM:SS
  startTime: number | null;
  reset: () => void;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
}

export function useCallDuration(isConnected: boolean): UseCallDurationReturn {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Start timer when connected
  useEffect(() => {
    if (isConnected && !startTime) {
      setStartTime(Date.now());
    } else if (!isConnected && startTime) {
      setStartTime(null);
      setDuration(0);
    }
  }, [isConnected, startTime]);

  // Update duration every second
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);

  const reset = useCallback(() => {
    setStartTime(null);
    setDuration(0);
  }, []);

  return {
    duration,
    formatted: formatDuration(duration),
    startTime,
    reset,
  };
}
