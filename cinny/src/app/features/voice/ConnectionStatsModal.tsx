import React, { useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { useLiveKitContext } from './LiveKitContext';
import { usePingHistory, getPingColor, getPingQuality, PING_COLORS } from './usePingHistory';
import * as css from './voicePanel.css';

// Discord-style icons (20px)
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.4 4L12 10.4 5.6 4 4 5.6 10.4 12 4 18.4 5.6 20 12 13.6 18.4 20 20 18.4 13.6 12 20 5.6 18.4 4Z" />
  </svg>
);

const SignalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 17h4v4H2v-4Zm6-6h4v10H8V11Zm6-5h4v15h-4V6Zm6-4h4v19h-4V2Z" />
  </svg>
);

interface ConnectionStatsModalProps {
  onClose: () => void;
}

// Ping graph component
function PingGraph({ samples, maxPing }: { samples: { ping: number; color: string }[]; maxPing: number }) {
  const graphHeight = 80;
  const graphWidth = 300;
  const barWidth = 8;
  const barGap = 2;
  const maxBars = 30;

  // Normalize maxPing for scale (minimum 100ms for better visualization)
  const scaleMax = Math.max(maxPing, 100);

  // Pad samples to always show maxBars
  const paddedSamples = useMemo(() => {
    const result = [...samples];
    while (result.length < maxBars) {
      result.unshift({ ping: 0, color: PING_COLORS.unknown });
    }
    return result.slice(-maxBars);
  }, [samples]);

  return (
    <div className={css.PingGraphContainer}>
      <svg
        width={graphWidth}
        height={graphHeight}
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
        className={css.PingGraphSvg}
      >
        {/* Background grid lines */}
        <line x1="0" y1={graphHeight * 0.25} x2={graphWidth} y2={graphHeight * 0.25} stroke="rgba(255,251,222,0.05)" strokeWidth="1" />
        <line x1="0" y1={graphHeight * 0.5} x2={graphWidth} y2={graphHeight * 0.5} stroke="rgba(255,251,222,0.08)" strokeWidth="1" />
        <line x1="0" y1={graphHeight * 0.75} x2={graphWidth} y2={graphHeight * 0.75} stroke="rgba(255,251,222,0.05)" strokeWidth="1" />

        {/* Bars */}
        {paddedSamples.map((sample, index) => {
          const barHeight = sample.ping > 0
            ? Math.max(4, (sample.ping / scaleMax) * (graphHeight - 4))
            : 4;
          const x = index * (barWidth + barGap);
          const y = graphHeight - barHeight;

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={2}
              fill={sample.ping > 0 ? sample.color : 'rgba(255,251,222,0.1)'}
              opacity={sample.ping > 0 ? 1 : 0.3}
            />
          );
        })}
      </svg>

      {/* Scale labels */}
      <div className={css.PingGraphScale}>
        <span>{Math.round(scaleMax)}ms</span>
        <span>{Math.round(scaleMax / 2)}ms</span>
        <span>0ms</span>
      </div>
    </div>
  );
}

// Quality indicator component
function QualityIndicator({ quality, label }: { quality: string; label: string }) {
  const qualityClass = {
    excellent: css.QualityExcellent,
    good: css.QualityGood,
    poor: css.QualityPoor,
    bad: css.QualityBad,
    unknown: css.QualityBad,
  }[quality] || css.QualityBad;

  return (
    <span className={classNames(css.StatsQualityBadge, qualityClass)}>
      {label}
    </span>
  );
}

export function ConnectionStatsModal({ onClose }: ConnectionStatsModalProps) {
  const { connectionQuality } = useLiveKitContext();
  const pingHistory = usePingHistory(connectionQuality);
  const [, setRefresh] = useState(0);

  // Force refresh every second for smooth updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh(r => r + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const quality = getPingQuality(pingHistory.lastPing);
  const qualityLabel = {
    excellent: 'Excellent',
    good: 'Good',
    poor: 'Poor',
    bad: 'Bad',
    unknown: 'Connecting...',
  }[quality];

  return (
    <div
      className={css.StatsModalOverlay}
      onClick={onClose}
    >
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          clickOutsideDeactivates: true,
          onDeactivate: onClose,
          escapeDeactivates: true,
        }}
      >
        <div
          className={css.StatsModalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={css.StatsHeader}>
            <div className={css.StatsHeaderTitle}>
              <SignalIcon />
              <span className={css.StatsTitle}>Connection Stats</span>
            </div>
            <button
              className={css.StatsCloseBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Live Ping Graph */}
          <div className={css.PingGraphSection}>
            <div className={css.PingGraphHeader}>
              <span className={css.PingGraphLabel}>Latency</span>
              <QualityIndicator quality={quality} label={qualityLabel} />
            </div>

            <PingGraph
              samples={pingHistory.samples}
              maxPing={pingHistory.maxPing}
            />

            {/* Ping stats below graph */}
            <div className={css.PingStatsRow}>
              <div className={css.PingStat}>
                <span className={css.PingStatLabel}>Last</span>
                <span className={css.PingStatValue} style={{ color: getPingColor(pingHistory.lastPing) }}>
                  {pingHistory.lastPing}ms
                </span>
              </div>
              <div className={css.PingStat}>
                <span className={css.PingStatLabel}>Average</span>
                <span className={css.PingStatValue} style={{ color: getPingColor(pingHistory.averagePing) }}>
                  {pingHistory.averagePing}ms
                </span>
              </div>
              <div className={css.PingStat}>
                <span className={css.PingStatLabel}>Min</span>
                <span className={css.PingStatValue}>
                  {pingHistory.minPing}ms
                </span>
              </div>
              <div className={css.PingStat}>
                <span className={css.PingStatLabel}>Max</span>
                <span className={css.PingStatValue}>
                  {pingHistory.maxPing}ms
                </span>
              </div>
            </div>
          </div>

          {/* Other Stats */}
          <div className={css.OtherStatsSection}>
            <div className={css.OtherStatRow}>
              <span className={css.OtherStatLabel}>Jitter</span>
              <span className={css.OtherStatValue}>{pingHistory.jitter}ms</span>
            </div>
            <div className={css.OtherStatRow}>
              <span className={css.OtherStatLabel}>Packet Loss</span>
              <span className={css.OtherStatValue} style={{
                color: pingHistory.packetLoss > 1 ? PING_COLORS.bad :
                       pingHistory.packetLoss > 0.5 ? PING_COLORS.poor :
                       PING_COLORS.excellent
              }}>
                {pingHistory.packetLoss}%
              </span>
            </div>
            <div className={css.OtherStatRow}>
              <span className={css.OtherStatLabel}>Bitrate</span>
              <span className={css.OtherStatValue}>{pingHistory.bitrate} kbps</span>
            </div>
          </div>

          {/* Color Legend */}
          <div className={css.PingLegend}>
            <div className={css.PingLegendItem}>
              <span className={css.PingLegendDot} style={{ backgroundColor: PING_COLORS.excellent }} />
              <span>&lt;50ms</span>
            </div>
            <div className={css.PingLegendItem}>
              <span className={css.PingLegendDot} style={{ backgroundColor: PING_COLORS.good }} />
              <span>&lt;100ms</span>
            </div>
            <div className={css.PingLegendItem}>
              <span className={css.PingLegendDot} style={{ backgroundColor: PING_COLORS.poor }} />
              <span>&lt;200ms</span>
            </div>
            <div className={css.PingLegendItem}>
              <span className={css.PingLegendDot} style={{ backgroundColor: PING_COLORS.bad }} />
              <span>&gt;200ms</span>
            </div>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
