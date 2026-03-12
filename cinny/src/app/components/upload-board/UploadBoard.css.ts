import { style, keyframes } from '@vanilla-extract/css';
import { DefaultReset, color, config, toRem } from 'folds';

// ============================================
// UPLOAD BOARD ANIMATIONS
// ============================================

const slideUp = keyframes({
  '0%': { opacity: 0, transform: 'translateY(20px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const progressGlow = keyframes({
  '0%, 100%': { boxShadow: `0 0 0 0 ${color.Primary.Container}` },
  '50%': { boxShadow: `0 0 15px 2px ${color.Primary.Container}` },
});

export const UploadBoardBase = style([
  DefaultReset,
  {
    position: 'relative',
    pointerEvents: 'none',
  },
]);

export const UploadBoardContainer = style([
  DefaultReset,
  {
    position: 'absolute',
    bottom: config.space.S200,
    left: 0,
    right: 0,
    zIndex: config.zIndex.Max,
  },
]);

export const UploadBoard = style({
  maxWidth: toRem(400),
  width: '100%',
  maxHeight: toRem(450),
  height: '100%',
  backgroundColor: color.Surface.Container,
  color: color.Surface.OnContainer,
  borderRadius: config.radii.R400,
  boxShadow: config.shadow.E200,
  border: `${config.borderWidth.B300} solid ${color.Surface.ContainerLine}`,
  overflow: 'hidden',
  pointerEvents: 'all',
  animation: `${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1)`,
});

export const UploadBoardUploading = style({
  animation: `${progressGlow} 2s ease-in-out infinite`,
});

export const UploadBoardHeaderContent = style({
  height: '100%',
  padding: `0 ${config.space.S200}`,
});

export const UploadBoardContent = style({
  padding: config.space.S200,
  paddingBottom: 0,
  paddingRight: 0,
});

// ============================================
// OVERALL PROGRESS INDICATOR
// ============================================

export const OverallProgressContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S100} ${config.space.S200}`,
  backgroundColor: color.Background.Container,
  borderRadius: config.radii.R300,
});

export const OverallProgressBar = style({
  flex: 1,
  height: toRem(4),
  backgroundColor: color.SurfaceVariant.Container,
  borderRadius: toRem(2),
  overflow: 'hidden',
});

export const OverallProgressFill = style({
  height: '100%',
  backgroundColor: color.Primary.Main,
  borderRadius: toRem(2),
  transition: 'width 0.2s ease-out',
});

export const OverallProgressText = style({
  fontSize: toRem(12),
  fontWeight: 600,
  color: color.Primary.Main,
  minWidth: toRem(36),
  textAlign: 'right',
});
