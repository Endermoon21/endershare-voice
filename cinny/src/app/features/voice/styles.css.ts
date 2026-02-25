import { style, keyframes, globalStyle } from '@vanilla-extract/css';
import { color, config } from 'folds';

// Discord-style animations
const speakingPulse = keyframes({
  '0%': { boxShadow: '0 0 0 0 rgba(35, 165, 90, 0.5)' },
  '70%': { boxShadow: '0 0 0 6px rgba(35, 165, 90, 0)' },
  '100%': { boxShadow: '0 0 0 0 rgba(35, 165, 90, 0)' },
});

const slideIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(4px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

// Discord timing
const discordEase = 'cubic-bezier(0.4, 0, 0.2, 1)';

// Main voice panel container (bottom of sidebar)
export const VoicePanel = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#232428', // Discord panel bg
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
});

// Voice room info section (when connected)
export const VoiceRoom = style({
  padding: '8px',
  animation: `${slideIn} 0.15s ${discordEase}`,
});

export const VoiceRoomHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  borderRadius: '4px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#23a55a', // Discord green
  transition: `background-color 0.15s ${discordEase}`,
  ':hover': {
    backgroundColor: 'rgba(79, 84, 92, 0.4)',
  },
});

export const VoiceStatusDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#23a55a',
  flexShrink: 0,
  boxShadow: '0 0 8px rgba(35, 165, 90, 0.5)',
});

export const VoiceRoomName = style({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const ExpandBtn = style({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#b5bac1',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `color 0.15s ${discordEase}`,
  ':hover': {
    color: '#dbdee1',
  },
});

export const VoiceLeaveBtn = style({
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#b5bac1',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `color 0.15s ${discordEase}, background-color 0.15s ${discordEase}`,
  ':hover': {
    backgroundColor: 'rgba(242, 63, 67, 0.16)',
    color: '#f23f43',
  },
});

// Participant list in sidebar
export const ParticipantList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
  maxHeight: '120px',
  overflowY: 'auto',
  padding: '0 0 4px 16px',
});

export const Participant = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '13px',
  transition: `background-color 0.1s ${discordEase}`,
  ':hover': {
    backgroundColor: 'rgba(79, 84, 92, 0.32)',
  },
});

export const ParticipantSpeaking = style({
  backgroundColor: 'rgba(35, 165, 90, 0.08)',
  ':hover': {
    backgroundColor: 'rgba(35, 165, 90, 0.12)',
  },
});

export const ParticipantAvatar = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#5865f2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: 600,
  color: '#fff',
  position: 'relative',
  flexShrink: 0,
});

export const SpeakingRing = style({
  position: 'absolute',
  inset: '-3px',
  borderRadius: '50%',
  border: '2px solid #23a55a',
  animation: `${speakingPulse} 1.2s ease-out infinite`,
});

export const ParticipantName = style({
  flex: 1,
  color: '#dbdee1',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const MutedIcon = style({
  color: '#f23f43',
  flexShrink: 0,
});

export const ScreenShareIcon = style({
  color: '#23a55a',
  flexShrink: 0,
});

// User panel (always visible at bottom)
export const UserPanel = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  backgroundColor: '#1e1f22', // Discord darkest bg
});

export const UserInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
  minWidth: 0,
});

export const UserAvatar = style({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#5865f2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '13px',
  color: '#fff',
  position: 'relative',
  flexShrink: 0,
  overflow: 'hidden',
});

globalStyle(`${UserAvatar} img`, {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
});

export const UserStatusDot = style({
  position: 'absolute',
  bottom: '-2px',
  right: '-2px',
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  backgroundColor: '#80848e', // Discord idle/offline
  border: '3px solid #1e1f22',
  transition: `background-color 0.2s ${discordEase}`,
});

export const UserStatusDotConnected = style({
  backgroundColor: '#23a55a',
  boxShadow: '0 0 4px rgba(35, 165, 90, 0.5)',
});

export const UserDetails = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  gap: '0px',
});

export const UserName = style({
  fontSize: '14px',
  fontWeight: 500,
  color: '#f2f3f5',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.2,
});

export const UserStatus = style({
  fontSize: '12px',
  color: '#949ba4',
  lineHeight: 1.2,
  transition: `color 0.15s ${discordEase}`,
});

export const UserStatusConnected = style({
  color: '#23a55a',
});

// Control buttons
export const UserControls = style({
  display: 'flex',
  gap: '4px',
});

export const ControlBtn = style({
  width: '32px',
  height: '32px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#b5bac1',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `background-color 0.17s ${discordEase}, color 0.17s ${discordEase}`,
  ':hover': {
    backgroundColor: 'rgba(79, 84, 92, 0.6)',
    color: '#dbdee1',
  },
  ':active': {
    backgroundColor: 'rgba(79, 84, 92, 0.4)',
  },
});

export const ControlBtnDisabled = style({
  opacity: 0.5,
  cursor: 'not-allowed',
  pointerEvents: 'none',
});

export const ControlBtnActive = style({
  backgroundColor: 'rgba(242, 63, 67, 0.16)',
  color: '#f23f43',
  ':hover': {
    backgroundColor: 'rgba(242, 63, 67, 0.24)',
    color: '#f23f43',
  },
});

export const ControlBtnScreen = style({
  backgroundColor: 'rgba(35, 165, 90, 0.16)',
  color: '#23a55a',
  ':hover': {
    backgroundColor: 'rgba(35, 165, 90, 0.24)',
    color: '#23a55a',
  },
});

export const DisconnectBtn = style({
  width: '32px',
  height: '32px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'rgba(242, 63, 67, 0.16)',
  color: '#f23f43',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `background-color 0.17s ${discordEase}`,
  ':hover': {
    backgroundColor: 'rgba(242, 63, 67, 0.32)',
  },
  ':active': {
    backgroundColor: 'rgba(242, 63, 67, 0.24)',
  },
});

// Avatar with image - transparent background
export const UserAvatarWithImage = style({
  backgroundColor: 'transparent',
});

export const ParticipantAvatarWithImage = style({
  backgroundColor: 'transparent',
  overflow: 'hidden',
});

globalStyle(`${ParticipantAvatarWithImage} img`, {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover',
});
