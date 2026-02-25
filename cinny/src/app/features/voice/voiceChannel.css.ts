import { style, keyframes, globalStyle } from '@vanilla-extract/css';
import { color, config } from 'folds';

// Speaking pulse animation - longer duration
const speakingPulse = keyframes({
  '0%': { boxShadow: '0 0 0 0 rgba(67, 181, 129, 0.5)' },
  '50%': { boxShadow: '0 0 0 4px rgba(67, 181, 129, 0.25)' },
  '100%': { boxShadow: '0 0 0 0 rgba(67, 181, 129, 0)' },
});

export const CategoryButton = style({
  padding: `${config.space.S100} ${config.space.S200}`,
  color: color.Secondary.Main,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.02em',
});

export const VoiceChannelButton = style({
  width: '100%',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'inherit',
  textAlign: 'left',
});

export const VoiceChannelConnected = style({
  backgroundColor: 'rgba(67, 181, 129, 0.15)',
});

export const VoiceAvatar = style({
  color: color.Secondary.Main,
});

export const VoiceAvatarConnected = style({
  color: color.Success.Main,
});

export const ParticipantCount = style({
  color: color.Secondary.Main,
  backgroundColor: color.Surface.Container,
  padding: '1px 6px',
  borderRadius: '8px',
  fontSize: '11px',
});

export const CallDuration = style({
  color: '#23a55a',
  fontSize: '11px',
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
});

export const ParticipantsList = style({
  paddingLeft: config.space.S600,
  paddingBottom: config.space.S100,
});

export const Participant = style({
  padding: `${config.space.S100} ${config.space.S200}`,
  borderRadius: config.radii.R300,
  transition: 'background-color 0.2s ease',
});

// Speaking state for sidebar participant row
export const Speaking = style({
  // removed background
});

export const ParticipantAvatar = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: color.Surface.Container,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: 600,
  color: color.Primary.Main,
  flexShrink: 0,
  border: '2px solid transparent',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
});

// Speaking avatar in sidebar - green ring with pulse
export const ParticipantAvatarSpeaking = style({
  borderColor: '#43b581',
  boxShadow: '0 0 6px rgba(67, 181, 129, 0.5)',
  animation: `${speakingPulse} 2s ease-in-out infinite`,
});

export const ParticipantName = style({
  color: color.Secondary.Main,
  flex: 1,
});

export const MutedIcon = style({
  color: color.Critical.Main,
  flexShrink: 0,
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

// Settings menu styles
export const SettingsButton = style({
  opacity: 0,
  transition: 'opacity 0.15s ease',
  selectors: {
    '[data-hovered="true"] &': {
      opacity: 1,
    },
  },
});

export const SettingsMenuContainer = style({
  position: 'relative',
});

export const SettingsMenu = style({
  position: 'absolute',
  top: '100%',
  right: 0,
  zIndex: 100,
  minWidth: '180px',
  backgroundColor: color.Surface.Container,
  borderRadius: config.radii.R400,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.24)',
  padding: config.space.S100,
  marginTop: config.space.S100,
});

export const SettingsMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S200} ${config.space.S300}`,
  borderRadius: config.radii.R300,
  cursor: 'pointer',
  color: color.Surface.OnContainer,
  fontSize: '14px',
  transition: 'background-color 0.1s ease',
  ':hover': {
    backgroundColor: color.Surface.ContainerHover,
  },
});

export const SettingsMenuItemDanger = style({
  color: color.Critical.Main,
  ':hover': {
    backgroundColor: 'rgba(242, 63, 67, 0.1)',
  },
});

export const SettingsMenuDivider = style({
  height: '1px',
  backgroundColor: color.Surface.ContainerLine,
  margin: `${config.space.S100} 0`,
});

// Modal styles
export const ModalOverlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
});

export const ModalContent = style({
  backgroundColor: color.Surface.Container,
  borderRadius: config.radii.R400,
  width: '440px',
  maxWidth: '90vw',
  maxHeight: '85vh',
  overflow: 'hidden',
  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.32)',
});

export const ModalHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: config.space.S400,
  borderBottom: `1px solid ${color.Surface.ContainerLine}`,
});

export const ModalTitle = style({
  fontSize: '18px',
  fontWeight: 600,
  color: color.Surface.OnContainer,
});

export const ModalBody = style({
  padding: config.space.S400,
  overflowY: 'auto',
  maxHeight: 'calc(85vh - 140px)',
});

export const ModalFooter = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: config.space.S400,
  borderTop: `1px solid ${color.Surface.ContainerLine}`,
});

export const FormGroup = style({
  marginBottom: config.space.S400,
});

export const FormLabel = style({
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  color: color.Secondary.Main,
  marginBottom: config.space.S100,
});

export const FormInput = style({
  width: '100%',
  padding: `${config.space.S200} ${config.space.S300}`,
  backgroundColor: color.Background.Container,
  border: `1px solid ${color.Surface.ContainerLine}`,
  borderRadius: config.radii.R300,
  color: color.Surface.OnContainer,
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  ':focus': {
    borderColor: color.Primary.Main,
  },
});

export const FormSelect = style({
  width: '100%',
  padding: `${config.space.S200} ${config.space.S300}`,
  backgroundColor: color.Background.Container,
  border: `1px solid ${color.Surface.ContainerLine}`,
  borderRadius: config.radii.R300,
  color: color.Surface.OnContainer,
  fontSize: '14px',
  outline: 'none',
  cursor: 'pointer',
  ':focus': {
    borderColor: color.Primary.Main,
  },
});

export const FormHint = style({
  fontSize: '12px',
  color: color.Secondary.Main,
  marginTop: config.space.S100,
});

export const SliderContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S300,
});

export const Slider = style({
  flex: 1,
  height: '4px',
  WebkitAppearance: 'none',
  appearance: 'none',
  backgroundColor: color.Surface.ContainerLine,
  borderRadius: '2px',
  outline: 'none',
  '::-webkit-slider-thumb': {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: color.Primary.Main,
    cursor: 'pointer',
  },
  '::-moz-range-thumb': {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    backgroundColor: color.Primary.Main,
    cursor: 'pointer',
    border: 'none',
  },
});

export const SliderValue = style({
  minWidth: '60px',
  textAlign: 'right',
  fontSize: '14px',
  color: color.Surface.OnContainer,
});

export const Button = style({
  padding: `${config.space.S200} ${config.space.S400}`,
  borderRadius: config.radii.R300,
  border: 'none',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
});

export const ButtonPrimary = style({
  backgroundColor: color.Primary.Main,
  color: '#fff',
  ':hover': {
    backgroundColor: color.Primary.MainHover,
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const ButtonSecondary = style({
  backgroundColor: color.Surface.ContainerHover,
  color: color.Surface.OnContainer,
  ':hover': {
    backgroundColor: color.Surface.ContainerActive,
  },
});

export const ButtonDanger = style({
  backgroundColor: 'transparent',
  color: color.Critical.Main,
  ':hover': {
    backgroundColor: 'rgba(242, 63, 67, 0.1)',
  },
});

export const DeleteSection = style({
  padding: config.space.S300,
  backgroundColor: 'rgba(242, 63, 67, 0.08)',
  borderRadius: config.radii.R300,
  marginTop: config.space.S400,
});

export const DeleteSectionTitle = style({
  fontSize: '14px',
  fontWeight: 600,
  color: color.Critical.Main,
  marginBottom: config.space.S100,
});

export const DeleteSectionText = style({
  fontSize: '13px',
  color: color.Secondary.Main,
  marginBottom: config.space.S300,
});
