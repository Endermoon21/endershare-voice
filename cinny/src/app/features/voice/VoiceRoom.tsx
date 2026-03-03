import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useLiveKitContext, VoiceParticipant } from "./LiveKitContext";
import { useMatrixClient } from "../../hooks/useMatrixClient";
import { StreamingModal } from "./StreamingModal";
import { getNativeStreamStatus, isNativeStreamingAvailable } from "./nativeStreaming";
import * as css from "./voiceRoom.css";

// Color palette for user tiles (Discord-like accent colors)
const TILE_COLORS = [
  // Muted pastels like Discord profile banners
  "#c9a87c", // Tan (like Discord screenshot)
  "#7289da", // Soft blue
  "#99aab5", // Soft gray-blue
  "#8e6e63", // Muted brown
  "#9b8aa6", // Soft purple
  "#87a889", // Sage green
  "#c4a484", // Warm tan
  "#8fa3bf", // Steel blue
  "#a4b494", // Muted olive
  "#b5838d", // Dusty rose
];

function getColorForUser(identity: string): string {
  let hash = 0;
  for (let i = 0; i < identity.length; i++) {
    hash = identity.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TILE_COLORS[Math.abs(hash) % TILE_COLORS.length];
}

// Discord-style filled icons
const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" />
    <path d="M6 12a6 6 0 0 0 12 0h-2a4 4 0 0 1-8 0H6Z" />
    <path d="M11 18.93A6.01 6.01 0 0 1 6 13h2a4 4 0 0 0 8 0h2a6.01 6.01 0 0 1-5 5.93V22h-2v-3.07Z" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 .06.65l7.94-7.94V6a4 4 0 0 0-4-4Z" />
    <path d="M18 12h-2c0 .34-.04.67-.12 1l1.62 1.62c.32-.82.5-1.7.5-2.62Z" />
    <path d="M11 18.93A6.01 6.01 0 0 1 6 13h2a4 4 0 0 0 6.29 3.29l1.42 1.42A5.98 5.98 0 0 1 13 18.93V22h-2v-3.07Z" />
    <path d="M2.1 2.1l19.8 19.8 1.4-1.4L3.5.7 2.1 2.1Z" />
  </svg>
);

const MicOffSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 0-4 4v6l8-8V6a4 4 0 0 0-4-4Z" />
    <path d="M2.1 2.1l19.8 19.8 1.4-1.4L3.5.7 2.1 2.1Z" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-1a7 7 0 0 1 14 0v1h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9Z" />
  </svg>
);

const HeadphonesOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-1a7 7 0 0 1 14 0v1h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9Z" />
    <path d="M2.1 2.1l19.8 19.8 1.4-1.4L3.5.7 2.1 2.1Z" />
  </svg>
);

const DeafenedSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-1a7 7 0 0 1 14 0v1h-2" />
    <path d="M2.1 2.1l19.8 19.8 1.4-1.4L3.5.7 2.1 2.1Z" />
  </svg>
);

// Screen share - simple monitor with arrow
const ScreenShareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v2h10v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 13H4V5h16v11Z" />
    <path d="M12 15l4-4h-3V7h-2v4H8l4 4Z" />
  </svg>
);

const ScreenShareOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v2h10v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 13H4V5h16v11Z" />
    <path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8Z" />
  </svg>
);

const ScreenShareSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2 4C2 2.897 2.897 2 4 2H20C21.103 2 22 2.897 22 4V15C22 16.103 21.103 17 20 17H13V19H17V21H7V19H11V17H4C2.897 17 2 16.103 2 15V4ZM4 4V15H20V4H4Z" />
  </svg>
);

// Simple phone disconnect icon (phone with X)
const DisconnectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85a.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9Z" />
    <path d="M18.59 5L20 6.41 13.41 13 20 19.59 18.59 21 12 14.41 5.41 21 4 19.59 10.59 13 4 6.41 5.41 5 12 11.59 18.59 5Z" />
  </svg>
);

const VoiceChannelIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a1 1 0 0 0-1-1h-.06a1 1 0 0 0-.74.32L5.92 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.92l4.28 4.68a1 1 0 0 0 .74.32H11a1 1 0 0 0 1-1V3Z" />
    <path d="M15.5 12c0-1.5-.9-2.8-2.2-3.4v6.8c1.3-.6 2.2-1.9 2.2-3.4Z" />
    <path d="M14.3 5.2v1.6c2.3.8 4 3 4 5.6s-1.7 4.8-4 5.6v1.6c3.2-.9 5.5-3.8 5.5-7.2s-2.3-6.3-5.5-7.2Z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3Zm-2-4h2V7h3V5H5v5Zm12 7h-3v2h5v-5h-2v3ZM14 5v2h3v3h2V5h-5Z" />
  </svg>
);

const PipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 7h-8v6h8V7Zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 16H3V5h18v14Z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    <path d="M21 9V6h-2v3h-3v2h3v3h2v-3h3V9h-3Z" opacity="0.6" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02ZM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77Z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63Zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71ZM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3ZM12 4L9.91 6.09 12 8.18V4Z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L17 9.882V8C17 6.897 16.103 6 15 6H4C2.897 6 2 6.897 2 8V16C2 17.103 2.897 18 4 18H15C16.103 18 17 17.103 17 16V14.118L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z" />
  </svg>
);

// Screen share active - same icon, color handled by CSS
const ScreenShareActiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v2h10v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 13H4V5h16v11Z" />
    <path d="M12 15l4-4h-3V7h-2v4H8l4 4Z" />
  </svg>
);

interface ParticipantControlProps {
  participant: VoiceParticipant;
  avatarUrl?: string;
  displayName: string;
  onClose: () => void;
}

function ParticipantControl({ participant, avatarUrl, displayName, onClose }: ParticipantControlProps) {
  const { participantVolumes, setParticipantVolume } = useLiveKitContext();
  const [localMuted, setLocalMuted] = useState(false);
  const volume = participantVolumes[participant.identity] ?? 1;
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setParticipantVolume(participant.identity, newVolume);
    if (newVolume > 0 && localMuted) setLocalMuted(false);
  };

  const toggleLocalMute = () => {
    if (localMuted) {
      setParticipantVolume(participant.identity, 1);
      setLocalMuted(false);
    } else {
      setParticipantVolume(participant.identity, 0);
      setLocalMuted(true);
    }
  };

  return (
    <div ref={popupRef} className={css.ParticipantPopup} onClick={(e) => e.stopPropagation()}>
      <div className={css.PopupHeader}>
        <div className={css.PopupAvatar}>
          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : displayName.charAt(0).toUpperCase()}
        </div>
        <span className={css.PopupName}>{displayName}</span>
      </div>
      <div className={css.VolumeControl}>
        <div className={css.VolumeLabel}>
          <span>User Volume</span>
          <span className={css.VolumeValue}>{Math.round(volume * 100)}%</span>
        </div>
        <div className={css.VolumeSliderContainer}>
          <span className={css.VolumeIcon}>{volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}</span>
          <input type="range" min="0" max="2" step="0.01" value={volume} onChange={handleVolumeChange} className={css.VolumeSlider} />
        </div>
      </div>
      <button className={classNames(css.LocalMuteBtn, { [css.LocalMuteBtnActive]: localMuted || volume === 0 })} onClick={toggleLocalMute}>
        {localMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
        <span>{localMuted || volume === 0 ? "Unmute User" : "Mute User"}</span>
      </button>
    </div>
  );
}

interface ParticipantTileProps {
  participant: VoiceParticipant;
  avatarUrl?: string;
  displayName: string;
}

function ParticipantTile({ participant, avatarUrl, displayName }: ParticipantTileProps) {
  const [showPopup, setShowPopup] = useState(false);
  const { participantVolumes } = useLiveKitContext();
  const volume = participantVolumes[participant.identity] ?? 1;
  const isLocalMuted = volume === 0;
  const tileColor = getColorForUser(participant.identity);

  const handleClick = () => {
    if (!participant.isLocal) setShowPopup(true);
  };

  return (
    <div className={css.TileWrapper}>
      <div
        className={classNames(css.ParticipantTile, {
          [css.TileClickable]: !participant.isLocal
        })}
        style={{ backgroundColor: tileColor }}
        onClick={handleClick}
      >
        <div className={css.TileAvatarContainer}>
          <div className={classNames(css.TileAvatar, {
            [css.TileAvatarSpeaking]: participant.isSpeaking && !isLocalMuted,
          })}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className={css.TileAvatarImg} />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {participant.isScreenSharing && (
            <div className={classNames(css.TileStatusOverlay, css.TileStatusScreenShare)}>
              <ScreenShareSmallIcon />
            </div>
          )}
          {isLocalMuted ? (
            <div className={classNames(css.TileStatusOverlay, css.TileStatusMuted)}>
              <VolumeMuteIcon />
            </div>
          ) : participant.isDeafened ? (
            <div className={classNames(css.TileStatusOverlay, css.TileStatusDeafened)}>
              <DeafenedSmallIcon />
            </div>
          ) : participant.isMuted && (
            <div className={classNames(css.TileStatusOverlay, css.TileStatusMuted)}>
              <MicOffSmallIcon />
            </div>
          )}
        </div>
        <div className={css.TileInfo}>
          <span className={css.TileName}>{displayName}</span>
          {participant.isLocal && <span className={css.TileYou}>(You)</span>}
        </div>
      </div>
      {showPopup && (
        <ParticipantControl
          participant={participant}
          avatarUrl={avatarUrl}
          displayName={displayName}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}

export function VoiceRoom() {
  const mx = useMatrixClient();
  const {
    currentRoom, participants, isMuted, screenShareInfo, connectionQuality,
    disconnect, toggleMute, getScreenShareElement
  } = useLiveKitContext();

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [profileCache, setProfileCache] = useState<Record<string, { avatarUrl?: string; displayName: string }>>({});
  const [showStreamOverlay, setShowStreamOverlay] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Check streaming status periodically
  useEffect(() => {
    if (!isNativeStreamingAvailable()) return;
    const checkStatus = async () => {
      try {
        const status = await getNativeStreamStatus();
        setIsStreaming(status.active);
      } catch (e) {
        // Ignore errors
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      for (const p of participants) {
        if (profileCache[p.identity]) continue;
        if (!p.identity.startsWith("@")) {
          setProfileCache(prev => ({ ...prev, [p.identity]: { displayName: p.identity } }));
          continue;
        }
        try {
          const cachedUser = mx.getUser(p.identity);
          if (cachedUser?.avatarUrl) {
            const avatarUrl = mx.mxcUrlToHttp(cachedUser.avatarUrl, 120, 120, "crop") || undefined;
            setProfileCache(prev => ({ ...prev, [p.identity]: { avatarUrl, displayName: cachedUser.displayName || p.identity.split(":")[0].slice(1) } }));
            continue;
          }
          const baseUrl = mx.getHomeserverUrl();
          const res = await fetch(`${baseUrl}/_matrix/client/v3/profile/${encodeURIComponent(p.identity)}`);
          if (res.ok) {
            const profile = await res.json();
            let avatarUrl: string | undefined;
            if (profile.avatar_url) avatarUrl = mx.mxcUrlToHttp(profile.avatar_url, 120, 120, "crop") || undefined;
            setProfileCache(prev => ({ ...prev, [p.identity]: { avatarUrl, displayName: profile.displayname || p.identity.split(":")[0].slice(1) } }));
          } else {
            setProfileCache(prev => ({ ...prev, [p.identity]: { displayName: p.identity.split(":")[0].slice(1) } }));
          }
        } catch {
          setProfileCache(prev => ({ ...prev, [p.identity]: { displayName: p.identity.split(":")[0].slice(1) } }));
        }
      }
    };
    fetchProfiles();
  }, [participants, mx, profileCache]);

  useEffect(() => {
    if (screenShareInfo && videoContainerRef.current) {
      const videoEl = getScreenShareElement();
      if (videoEl) {
        videoContainerRef.current.innerHTML = "";
        videoEl.className = css.ScreenShareVideo;
        videoContainerRef.current.appendChild(videoEl);
      }
    } else if (videoContainerRef.current) {
      videoContainerRef.current.innerHTML = "";
    }
  }, [screenShareInfo, getScreenShareElement]);

  const roomDisplayName = currentRoom ? currentRoom.charAt(0).toUpperCase() + currentRoom.slice(1) : "Voice Channel";
  const qualityText = connectionQuality?.quality || "connecting";
  const getQualityClass = () => {
    switch (connectionQuality?.quality) {
      case "excellent": return css.QualityExcellent;
      case "good": return css.QualityGood;
      case "poor": return css.QualityPoor;
      default: return css.QualityBad;
    }
  };

  return (
    <div className={css.VoiceRoomContainer}>
      <div className={css.ChannelHeader}>
        <div className={css.ChannelName}>
          <VoiceChannelIcon />
          {roomDisplayName}
        </div>
        <div className={classNames(css.QualityBadge, getQualityClass())}>{qualityText}</div>
      </div>

      <div className={css.MainArea}>
        {screenShareInfo ? (
          <div 
            className={css.ScreenShareSection}
            onMouseEnter={() => setShowStreamOverlay(true)}
            onMouseLeave={() => setShowStreamOverlay(false)}
          >
            <div ref={videoContainerRef} className={css.VideoContainer} />
            
            {/* Stream overlay with controls */}
            <div className={classNames(css.StreamOverlay, { [css.StreamOverlayVisible]: showStreamOverlay })}>
              {/* Top bar - streamer info */}
              <div className={css.StreamTopBar}>
                <div className={css.StreamerBadge}>
                  <div className={css.StreamerAvatar}>
                    {profileCache[screenShareInfo.participantIdentity]?.avatarUrl ? (
                      <img src={profileCache[screenShareInfo.participantIdentity]?.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      (profileCache[screenShareInfo.participantIdentity]?.displayName || screenShareInfo.participantName).charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className={css.StreamerName}>
                    {profileCache[screenShareInfo.participantIdentity]?.displayName || screenShareInfo.participantName}
                  </span>
                  <span className={css.LiveBadge}>LIVE</span>
                </div>
                
                <div className={css.ViewerCount}>
                  <UsersIcon />
                  {participants.length}
                </div>
              </div>
              
              {/* Bottom bar - controls */}
              <div className={css.StreamBottomBar}>
                <div />
                <div className={css.StreamControls}>
                  <button 
                    className={css.StreamControlBtn} 
                    onClick={() => {
                      const video = videoContainerRef.current?.querySelector("video");
                      if (video && document.pictureInPictureEnabled) {
                        video.requestPictureInPicture().catch(console.error);
                      }
                    }}
                    title="Picture in Picture"
                  >
                    <PipIcon />
                  </button>
                  <button 
                    className={css.StreamControlBtn}
                    onClick={() => {
                      if (videoContainerRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoContainerRef.current.requestFullscreen().catch(console.error);
                        }
                      }
                    }}
                    title="Fullscreen"
                  >
                    <FullscreenIcon />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Viewer thumbnails at bottom */}
            <div className={css.ViewerThumbnails}>
              {participants.filter(p => !p.identity.endsWith("-stream")).map((p) => (
                <div 
                  key={p.identity} 
                  className={classNames(css.ViewerThumb, {
                    [css.ViewerThumbSpeaking]: p.isSpeaking,
                  })}
                  title={profileCache[p.identity]?.displayName || p.name}
                >
                  {profileCache[p.identity]?.avatarUrl ? (
                    <img src={profileCache[p.identity]?.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (profileCache[p.identity]?.displayName || p.name).charAt(0).toUpperCase()
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : participants.length > 0 ? (
          <div className={css.ParticipantGrid}>
            {participants.map((p) => (
              <ParticipantTile key={p.identity} participant={p} avatarUrl={profileCache[p.identity]?.avatarUrl} displayName={profileCache[p.identity]?.displayName || p.name} />
            ))}
          </div>
        ) : (
          <div className={css.EmptyState}>
            <VoiceChannelIcon />
            <span className={css.EmptyText}>Waiting for others to join...</span>
          </div>
        )}
      </div>

      <div className={css.ControlBar}>
        <div className={css.ControlGroup}>
          <button className={css.ControlBtn} disabled title="Video (Coming Soon)">
            <VideoIcon />
          </button>
          <button className={classNames(css.ControlBtn, { [css.ControlBtnActive]: isMuted })} onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </button>
          <button
            className={classNames(css.ControlBtn, { [css.ControlBtnActive]: isStreaming })}
            onClick={() => setShowStreamModal(true)}
            title={isStreaming ? "Streaming" : "Share Screen"}
          >
            {isStreaming ? <ScreenShareActiveIcon /> : <ScreenShareIcon />}
          </button>
        </div>
        <button className={css.DisconnectBtn} onClick={disconnect} title="Disconnect">
          <DisconnectIcon />
        </button>
      </div>

      {showStreamModal && <StreamingModal onClose={() => setShowStreamModal(false)} />}
    </div>
  );
}
