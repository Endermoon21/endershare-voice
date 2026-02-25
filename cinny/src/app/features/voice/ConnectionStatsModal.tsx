import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { useLiveKitContext } from './LiveKitContext';
import { usePingStats, PingStats } from './usePingStats';
import * as css from './voicePanel.css';

// Icons
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface ConnectionStatsModalProps {
  onClose: () => void;
}

function getQualityStyle(quality: PingStats['quality']) {
  switch (quality) {
    case 'excellent':
      return css.QualityExcellent;
    case 'good':
      return css.QualityGood;
    case 'poor':
      return css.QualityPoor;
    case 'bad':
      return css.QualityBad;
    default:
      return css.QualityBad;
  }
}

export function ConnectionStatsModal({ onClose }: ConnectionStatsModalProps) {
  const { connectionQuality } = useLiveKitContext();
  const pingStats = usePingStats(connectionQuality);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
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
          className={css.StatsModal}
          style={{
            backgroundColor: '#262621',
            borderRadius: '12px',
            minWidth: '320px',
            maxWidth: '400px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 251, 222, 0.08)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={css.StatsHeader}>
            <span className={css.StatsTitle}>Connection Stats</span>
            <button
              className={css.StatsCloseBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          <div className={css.StatsGrid}>
            <div className={css.StatCard}>
              <div className={css.StatLabel}>Ping</div>
              <div className={css.StatValue}>
                {pingStats.ping}
                <span className={css.StatUnit}>ms</span>
              </div>
            </div>

            <div className={css.StatCard}>
              <div className={css.StatLabel}>Jitter</div>
              <div className={css.StatValue}>
                {pingStats.jitter}
                <span className={css.StatUnit}>ms</span>
              </div>
            </div>

            <div className={css.StatCard}>
              <div className={css.StatLabel}>Packet Loss</div>
              <div className={css.StatValue}>
                {pingStats.packetLoss}
                <span className={css.StatUnit}>%</span>
              </div>
            </div>

            <div className={css.StatCard}>
              <div className={css.StatLabel}>Bitrate</div>
              <div className={css.StatValue}>
                {pingStats.bitrate}
                <span className={css.StatUnit}>kbps</span>
              </div>
            </div>
          </div>

          <div className={css.StatsQuality}>
            <span className={css.StatsQualityLabel}>Overall Quality:</span>
            <span
              className={classNames(
                css.StatsQualityBadge,
                getQualityStyle(pingStats.quality)
              )}
            >
              {pingStats.label}
            </span>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
