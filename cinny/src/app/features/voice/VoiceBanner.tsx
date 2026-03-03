import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useLiveKitContext } from './LiveKitContext';
import { PingVisualizer } from './PingVisualizer';
import { MediaControlsRow } from './MediaControlsRow';
import * as css from './voicePanel.css';

// Discord-style icons (20px for panel buttons)
// Noise filter uses same icon - color changes via CSS when active
const NoiseFilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h2V9H3Zm4-3v12h2V6H7Zm4-3v18h2V3h-2Zm4 5v8h2V8h-2Zm4-3v14h2V5h-2Z" />
  </svg>
);

// Simple phone disconnect icon (phone with X)
const DisconnectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85a.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9Z" />
    <path d="M18.59 5L20 6.41 13.41 13 20 19.59 18.59 21 12 14.41 5.41 21 4 19.59 10.59 13 4 6.41 5.41 5 12 11.59 18.59 5Z" />
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
