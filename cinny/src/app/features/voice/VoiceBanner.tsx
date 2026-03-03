import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useLiveKitContext } from './LiveKitContext';
import { PingVisualizer } from './PingVisualizer';
import { MediaControlsRow } from './MediaControlsRow';
import * as css from './voicePanel.css';

// Discord-style icons (20px for panel buttons)
const NoiseFilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h2V9H3Zm4-3v12h2V6H7Zm4-3v18h2V3h-2Zm4 5v8h2V8h-2Zm4-3v14h2V5h-2Z" />
  </svg>
);

const NoiseFilterActiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h2V9H3Zm4-3v12h2V6H7Zm4-3v18h2V3h-2Zm4 5v8h2V8h-2Zm4-3v14h2V5h-2Z" />
    <circle cx="12" cy="12" r="4" fill="#23a55a" />
  </svg>
);

const DisconnectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.1169 1.11603L22.8839 2.88303L19.7679 6.00003L21.9999 8.23203V11.001C21.9999 11.5523 21.5513 12.001 20.9999 12.001C20.6637 12.001 20.3554 11.8464 20.154 11.601L18.3539 9.80003L14.1209 14.034L16.3169 16.231C19.1619 15.035 22.5249 15.563 24.8839 17.921L23.4699 19.335C21.6119 17.479 18.7609 17.127 16.5279 18.281L19.7679 21.519L17.9999 23.285L2.88388 8.16903L4.64988 6.40203L6.71988 8.47203C5.56588 6.23803 5.91788 3.38903 7.77388 1.53003L9.18788 2.94403C6.82988 5.30203 6.30188 8.66503 7.49688 11.511L10.3219 8.68703C10.1229 8.48503 9.99988 8.20903 9.99988 7.90003V4.00003C9.99988 3.44772 10.4476 3.00003 10.9999 3.00003H12.9999C13.5522 3.00003 13.9999 3.44772 13.9999 4.00003V4.90003L18.3539 0.545029L18.3544 0.544995C18.7449 0.154471 19.3781 0.154471 19.7686 0.545029L21.1169 1.11603ZM12.7069 9.87803L14.8279 12.001L14.8289 12.002L12.7069 9.87803Z" />
  </svg>
);

export function VoiceBanner() {
  const {
    currentRoom,
    disconnect,
    isNoiseFilterEnabled,
    isNoiseFilterPending,
    setNoiseFilterEnabled,
    isNoiseFilterSupported,
  } = useLiveKitContext();

  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const roomDisplayName = currentRoom
    ? currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)
    : 'Voice Channel';

  const handleToggle = () => {
    console.log('[VoiceBanner] handleToggle called', {
      isNoiseFilterPending,
      isNoiseFilterEnabled,
      isNoiseFilterSupported,
    });
    if (!isNoiseFilterPending) {
      setNoiseFilterEnabled(!isNoiseFilterEnabled);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModal]);

  return (
    <div className={css.VoiceBanner} style={{ position: 'relative' }}>
      {/* Noise Suppression Modal */}
      {showModal && (
        <div ref={modalRef} className={css.RNNoiseModal}>
          <div className={css.RNNoiseModalHeader}>
            <span className={css.RNNoiseModalIcon}>
              {isNoiseFilterEnabled ? <NoiseFilterActiveIcon /> : <NoiseFilterIcon />}
            </span>
            <span className={css.RNNoiseModalTitle}>Noise Suppression</span>
          </div>
          <div className={css.RNNoiseModalContent}>
            {/* Enable/Disable Toggle */}
            <div className={css.RNNoiseModalRow}>
              <div className={css.RNNoiseModalLabel}>
                <span className={css.RNNoiseModalLabelText}>RNNoise</span>
                <span className={css.RNNoiseModalLabelDesc}>AI-powered noise removal</span>
              </div>
              <button
                className={classNames(css.ToggleSwitch, {
                  [css.ToggleSwitchActive]: isNoiseFilterEnabled,
                })}
                onClick={handleToggle}
                disabled={isNoiseFilterPending || !isNoiseFilterSupported}
                style={{ opacity: (isNoiseFilterPending || !isNoiseFilterSupported) ? 0.5 : 1 }}
              >
                <span className={css.ToggleSwitchKnob} />
              </button>
            </div>

            {/* Not supported warning */}
            {!isNoiseFilterSupported && (
              <div className={css.RNNoiseModalRow}>
                <span className={css.RNNoiseModalLabelDesc} style={{ color: '#F04747' }}>
                  Not supported in this browser
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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
            ref={buttonRef}
            className={classNames(css.NoiseFilterBtn, {
              [css.NoiseFilterBtnActive]: isNoiseFilterEnabled,
            })}
            onClick={() => setShowModal(!showModal)}
            title="Noise Suppression Settings"
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
