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

// Discord-style icons (20px for panel buttons)
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
    <path d="M6 12a6 6 0 0 0 12 0h-2a4 4 0 0 1-8 0H6Z" />
    <path d="M11 18.93A6.01 6.01 0 0 1 6 13h2a4 4 0 0 0 8 0h2a6.01 6.01 0 0 1-5 5.93V22h-2v-3.07Z" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 .06.65l7.94-7.94V6a4 4 0 0 0-4-4Z" />
    <path d="M18 12h-2c0 .34-.04.67-.12 1l1.62 1.62c.32-.82.5-1.7.5-2.62Z" />
    <path d="M11 18.93A6.01 6.01 0 0 1 6 13h2a4 4 0 0 0 6.29 3.29l1.42 1.42A5.98 5.98 0 0 1 13 18.93V22h-2v-3.07Z" />
    <path d="M2.1 2.1l19.8 19.8 1.4-1.4L3.5.7 2.1 2.1Z" fill="currentColor" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-1a7 7 0 0 1 14 0v1h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9Z" />
  </svg>
);

const HeadphonesOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-1a7 7 0 0 1 14 0v1h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9Z" />
    <path d="M2.1 2.1l19.8 19.8 1.4-1.4L3.5.7 2.1 2.1Z" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.37 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58ZM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// Discord-style voice icon (smaller, for status)
const VoiceConnectedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3Z" />
    <path d="M15.5 12c0-1.5-.9-2.8-2.2-3.4v6.8c1.3-.6 2.2-1.9 2.2-3.4Z" />
    <path d="M14.3 5.2v1.6c2.3.8 4 3 4 5.6s-1.7 4.8-4 5.6v1.6c3.2-.9 5.5-3.8 5.5-7.2s-2.3-6.3-5.5-7.2Z" />
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
