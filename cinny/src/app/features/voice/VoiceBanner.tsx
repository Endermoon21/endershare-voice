import React from 'react';
import classNames from 'classnames';
import { useLiveKitContext } from './LiveKitContext';
import { PingVisualizer } from './PingVisualizer';
import { MediaControlsRow } from './MediaControlsRow';
import * as css from './voicePanel.css';

// Icons
const NoiseFilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
    <circle cx="12" cy="9" r="1" fill="currentColor" />
  </svg>
);

const NoiseFilterActiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
    <path d="M8 8l8 4" strokeWidth="2.5" />
  </svg>
);

const DisconnectIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
    <line x1="22" x2="2" y1="2" y2="22" />
  </svg>
);

export function VoiceBanner() {
  const {
    currentRoom,
    disconnect,
    isNoiseFilterEnabled,
    isNoiseFilterPending,
    setNoiseFilterEnabled,
  } = useLiveKitContext();

  const roomDisplayName = currentRoom
    ? currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)
    : 'Voice Channel';

  const handleNoiseFilter = () => {
    if (!isNoiseFilterPending) {
      setNoiseFilterEnabled(!isNoiseFilterEnabled);
    }
  };

  return (
    <div className={css.VoiceBanner}>
      {/* Top Section */}
      <div className={css.VoiceBannerTop}>
        <div className={css.VoiceBannerInfo}>
          <PingVisualizer />
          <div className={css.VoiceStatusSection}>
            <span className={css.VoiceConnectedLabel}>Voice Connected</span>
            <span className={css.VoiceChannelName}>{roomDisplayName}</span>
          </div>
        </div>
        
        <div className={css.VoiceBannerControls}>
          <button
            className={classNames(css.NoiseFilterBtn, {
              [css.NoiseFilterBtnActive]: isNoiseFilterEnabled,
            })}
            onClick={handleNoiseFilter}
            disabled={isNoiseFilterPending}
            title={isNoiseFilterEnabled ? 'Disable Noise Filter' : 'Enable Noise Filter'}
            style={{ opacity: isNoiseFilterPending ? 0.5 : 1 }}
          >
            {isNoiseFilterEnabled ? <NoiseFilterActiveIcon /> : <NoiseFilterIcon />}
          </button>
          
          <button
            className={css.DisconnectBtn}
            onClick={disconnect}
            title="Disconnect"
          >
            <DisconnectIcon />
          </button>
        </div>
      </div>

      {/* Media Controls Row */}
      <MediaControlsRow />
    </div>
  );
}
