import { style } from '@vanilla-extract/css';
import { color, config } from 'folds';

export const CallViewOverlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const CallView = style({
  width: '90%',
  maxWidth: '1200px',
  height: '80%',
  maxHeight: '800px',
  backgroundColor: color.Background.Container,
  borderRadius: config.radii.R400,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const Header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${config.space.S300} ${config.space.S400}`,
  borderBottom: `1px solid ${color.Background.ContainerLine}`,
});

export const HeaderLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  color: color.Background.OnContainer,
});

export const QualityBadge = style({
  padding: `${config.space.S100} ${config.space.S200}`,
  borderRadius: config.radii.R300,
  fontSize: '10px',
  fontWeight: 600,
  color: '#fff',
});

export const CloseBtn = style({
  width: '32px',
  height: '32px',
  borderRadius: config.radii.R300,
  border: 'none',
  backgroundColor: 'transparent',
  color: color.Background.OnContainer,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ':hover': {
    backgroundColor: color.Surface.ContainerHover,
  },
});

export const Content = style({
  flex: 1,
  overflow: 'auto',
  padding: config.space.S400,
});

export const ParticipantGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: config.space.S400,
});

export const ParticipantTile = style({
  backgroundColor: color.Surface.Container,
  borderRadius: config.radii.R400,
  padding: config.space.S400,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: config.space.S200,
  transition: 'box-shadow 0.2s',
});

export const Speaking = style({
  boxShadow: '0 0 0 3px #43b581',
});

export const TileAvatar = style({
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: color.Primary.Main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 600,
  color: '#fff',
});

export const TileInfo = style({
  textAlign: 'center',
});

export const TileName = style({
  color: color.Background.OnContainer,
});

export const TileIcons = style({
  display: 'flex',
  gap: config.space.S100,
  justifyContent: 'center',
  marginTop: config.space.S100,
});

export const MutedIcon = style({
  color: color.Critical.Main,
});

export const ScreenIcon = style({
  color: color.Success.Main,
});

export const ScreenShareContainer = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

export const VideoContainer = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000',
  borderRadius: config.radii.R400,
  overflow: 'hidden',
});

export const ScreenShareVideo = style({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

export const ScreenShareLabel = style({
  position: 'absolute',
  bottom: config.space.S300,
  left: config.space.S300,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: '#fff',
  padding: `${config.space.S100} ${config.space.S200}`,
  borderRadius: config.radii.R300,
  fontSize: '13px',
});

export const Controls = style({
  display: 'flex',
  justifyContent: 'center',
  gap: config.space.S300,
  padding: config.space.S400,
  borderTop: `1px solid ${color.Background.ContainerLine}`,
});

export const ControlBtn = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: color.Surface.Container,
  color: color.Background.OnContainer,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s, transform 0.1s',
  ':hover': {
    backgroundColor: color.Surface.ContainerHover,
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

export const Active = style({
  backgroundColor: color.Critical.Main,
  color: '#fff',
  ':hover': {
    backgroundColor: color.Critical.Main,
  },
});

export const ScreenActive = style({
  backgroundColor: color.Success.Main,
  color: '#fff',
  ':hover': {
    backgroundColor: color.Success.Main,
  },
});

export const DisconnectBtn = style({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: color.Critical.Main,
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.15s, transform 0.1s',
  ':hover': {
    filter: 'brightness(0.9)',
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});
