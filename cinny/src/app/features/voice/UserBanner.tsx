import React, { useState, useRef, useCallback } from 'react';
import classNames from 'classnames';
import { useLiveKitContext } from './LiveKitContext';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { useCallDuration } from './useCallDuration';
import { useDeviceSelection } from './useDeviceSelection';
import { DeviceSelector } from './DeviceSelector';
import { UserProfilePopup } from './UserProfilePopup';
import { Settings } from '../settings';
import { Modal500 } from '../../components/Modal500';
import * as css from './voicePanel.css';

// Icons
const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="13" rx="3" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v3" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 2 20 20" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <path d="M16.95 16.95A7 7 0 0 1 5 12v-2" />
    <path d="M18.89 13.23A7 7 0 0 0 19 12v-2" />
    <path d="M12 19v3" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

const HeadphonesOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 14h-1.343" />
    <path d="M9.128 3.47A9 9 0 0 1 21 12v3.343" />
    <path d="m2 2 20 20" />
    <path d="M20.414 20.414A2 2 0 0 1 19 21h-1a2 2 0 0 1-2-2v-3" />
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 2.636-6.364" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const VoiceConnectedIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}>
    <path d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3Z" />
    <path d="M15.16 16.51c-.57.28-1.16-.2-1.16-.83v-.14c0-.43.28-.8.63-1.02a3 3 0 0 0 0-5.04c-.35-.23-.63-.6-.63-1.02v-.14c0-.63.59-1.1 1.16-.83a5 5 0 0 1 0 9.02Z" />
  </svg>
);

interface UserBannerProps {
  onSettingsChange?: (isOpen: boolean) => void;
}

export function UserBanner({ onSettingsChange }: UserBannerProps) {
  const mx = useMatrixClient();
  const {
    isConnected,
    currentRoom,
    isMuted,
    isDeafened,
    toggleMute,
    toggleDeafen,
    room,
  } = useLiveKitContext();

  const { formatted: callDuration } = useCallDuration(isConnected);
  const deviceSelection = useDeviceSelection(room);

  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInputDevices, setShowInputDevices] = useState(false);
  const [showOutputDevices, setShowOutputDevices] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const muteRef = useRef<HTMLButtonElement>(null);
  const deafenRef = useRef<HTMLButtonElement>(null);

  // Get user info
  const userId = mx.getUserId() || '';
  const user = mx.getUser(userId);
  const displayName = user?.displayName || userId.split(':')[0].slice(1);
  const avatarUrl = user?.avatarUrl
    ? mx.mxcUrlToHttp(user.avatarUrl, 32, 32, 'crop')
    : undefined;

  const roomDisplayName = currentRoom
    ? currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1)
    : '';

  const handleProfileClick = useCallback(() => {
    setShowProfilePopup((prev) => !prev);
  }, []);

  const handleMuteDropdown = useCallback(() => {
    setShowInputDevices((prev) => !prev);
    setShowOutputDevices(false);
  }, []);

  const handleDeafenDropdown = useCallback(() => {
    setShowOutputDevices((prev) => !prev);
    setShowInputDevices(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true); onSettingsChange?.(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false); onSettingsChange?.(false);
  }, []);

  return (
    <>
      <div className={css.UserBanner}>
        {/* Profile Section */}
        <div
          ref={profileRef}
          className={css.UserInfo}
          onClick={handleProfileClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
        >
          <div className={css.UserAvatar}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
            <div
              className={classNames(css.UserStatusBadge, {
                [css.UserStatusInCall]: isConnected,
                [css.UserStatusOnline]: !isConnected,
              })}
            />
          </div>
          <div className={css.UserDetails}>
            <span className={css.UserName}>{displayName}</span>
            <span
              className={classNames(css.UserStatus, {
                [css.UserStatusConnected]: isConnected,
              })}
            >
              {isConnected ? (
                <>
                  <VoiceConnectedIcon />
                  {roomDisplayName} - {callDuration}
                </>
              ) : (
                'Online'
              )}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className={css.UserControls}>
          {/* Mute with dropdown */}
          <div className={css.ControlBtnWithDropdown}>
            <button
              className={classNames(css.ControlBtnMain, {
                [css.ControlBtnActive]: isMuted,
              })}
              onClick={toggleMute}
              disabled={!isConnected}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{ opacity: isConnected ? 1 : 0.5 }}
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </button>
            <button
              ref={muteRef}
              className={css.ControlBtnDropdown}
              onClick={handleMuteDropdown}
              disabled={!isConnected}
              title="Select input device"
              style={{ opacity: isConnected ? 1 : 0.5 }}
            >
              <ChevronDownIcon />
            </button>
          </div>

          {/* Deafen with dropdown */}
          <div className={css.ControlBtnWithDropdown}>
            <button
              className={classNames(css.ControlBtnMain, {
                [css.ControlBtnActive]: isDeafened,
              })}
              onClick={toggleDeafen}
              disabled={!isConnected}
              title={isDeafened ? 'Undeafen' : 'Deafen'}
              style={{ opacity: isConnected ? 1 : 0.5 }}
            >
              {isDeafened ? <HeadphonesOffIcon /> : <HeadphonesIcon />}
            </button>
            <button
              ref={deafenRef}
              className={css.ControlBtnDropdown}
              onClick={handleDeafenDropdown}
              disabled={!isConnected}
              title="Select output device"
              style={{ opacity: isConnected ? 1 : 0.5 }}
            >
              <ChevronDownIcon />
            </button>
          </div>

          {/* Settings */}
          <button
            className={css.ControlBtn}
            onClick={handleOpenSettings}
            title="User Settings"
          >
            <SettingsIcon />
          </button>
        </div>

        {/* Popups */}
        {showProfilePopup && (
          <UserProfilePopup
            anchorRect={profileRef.current?.getBoundingClientRect() || null}
            onClose={() => setShowProfilePopup(false)}
          />
        )}

        {showInputDevices && (
          <DeviceSelector
            type="input"
            devices={deviceSelection.inputDevices}
            activeDeviceId={deviceSelection.activeInputId}
            onSelect={deviceSelection.switchInput}
            onClose={() => setShowInputDevices(false)}
            anchorRect={muteRef.current?.getBoundingClientRect() || null}
          />
        )}

        {showOutputDevices && (
          <DeviceSelector
            type="output"
            devices={deviceSelection.outputDevices}
            activeDeviceId={deviceSelection.activeOutputId}
            onSelect={deviceSelection.switchOutput}
            onClose={() => setShowOutputDevices(false)}
            anchorRect={deafenRef.current?.getBoundingClientRect() || null}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Modal500 requestClose={handleCloseSettings}>
          <Settings requestClose={handleCloseSettings} />
        </Modal500>
      )}
    </>
  );
}
