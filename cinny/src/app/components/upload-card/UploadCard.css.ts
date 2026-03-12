import { style, keyframes } from '@vanilla-extract/css';
import { RecipeVariants, recipe } from '@vanilla-extract/recipes';
import { RadiiVariant, color, config, toRem } from 'folds';

// ============================================
// UPLOAD CARD ANIMATIONS
// ============================================

const fadeSlideIn = keyframes({
  '0%': { opacity: 0, transform: 'translateY(10px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const progressPulse = keyframes({
  '0%, 100%': { boxShadow: `0 0 0 0 ${color.Primary.Container}` },
  '50%': { boxShadow: `0 0 0 4px ${color.Primary.Container}` },
});

const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

const checkmarkDraw = keyframes({
  '0%': { strokeDashoffset: 24 },
  '100%': { strokeDashoffset: 0 },
});

const scaleIn = keyframes({
  '0%': { transform: 'scale(0)' },
  '50%': { transform: 'scale(1.2)' },
  '100%': { transform: 'scale(1)' },
});

export const UploadCard = recipe({
  base: {
    padding: config.space.S300,
    backgroundColor: color.SurfaceVariant.Container,
    color: color.SurfaceVariant.OnContainer,
    borderColor: color.SurfaceVariant.ContainerLine,
    animation: `${fadeSlideIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1)`,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    selectors: {
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  variants: {
    radii: RadiiVariant,
    outlined: {
      true: {
        borderStyle: 'solid',
        borderWidth: config.borderWidth.B300,
      },
    },
    compact: {
      true: {
        padding: config.space.S100,
      },
    },
  },
  defaultVariants: {
    radii: '400',
  },
});

export type UploadCardVariant = RecipeVariants<typeof UploadCard>;

export const UploadCardError = style({
  padding: `0 ${config.space.S100}`,
  color: color.Critical.Main,
});

// ============================================
// CIRCULAR PROGRESS RING
// ============================================

export const UploadProgressRing = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: toRem(48),
  height: toRem(48),
  flexShrink: 0,
});

export const UploadProgressRingSvg = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  transform: 'rotate(-90deg)',
});

export const UploadProgressRingBg = style({
  fill: 'none',
  stroke: color.SurfaceVariant.ContainerLine,
  strokeWidth: 3,
});

export const UploadProgressRingFg = style({
  fill: 'none',
  stroke: color.Primary.Main,
  strokeWidth: 3,
  strokeLinecap: 'round',
  transition: 'stroke-dashoffset 0.2s ease-out',
  filter: `drop-shadow(0 0 3px ${color.Primary.Main})`,
});

export const UploadProgressRingUploading = style({
  animation: `${progressPulse} 1.5s ease-in-out infinite`,
  borderRadius: '50%',
});

export const UploadProgressPercent = style({
  fontSize: toRem(11),
  fontWeight: 700,
  color: color.Surface.OnContainer,
  zIndex: 1,
});

// ============================================
// ANIMATED PROGRESS BAR
// ============================================

export const UploadProgressBarContainer = style({
  position: 'relative',
  width: '100%',
  height: toRem(6),
  backgroundColor: color.SurfaceVariant.ContainerLine,
  borderRadius: toRem(3),
  overflow: 'hidden',
});

export const UploadProgressBarFill = style({
  height: '100%',
  backgroundColor: color.Primary.Main,
  borderRadius: toRem(3),
  transition: 'width 0.2s ease-out',
  position: 'relative',
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 1.5s ease-in-out infinite`,
  },
});

export const UploadProgressBarComplete = style({
  backgroundColor: color.Success.Main,
  '::after': {
    display: 'none',
  },
});

// ============================================
// SUCCESS CHECKMARK
// ============================================

export const UploadSuccessIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: toRem(48),
  height: toRem(48),
  borderRadius: '50%',
  backgroundColor: color.Success.Container,
  animation: `${scaleIn} 0.4s cubic-bezier(0.16, 1, 0.3, 1)`,
});

export const UploadSuccessCheckmark = style({
  stroke: color.Success.Main,
  strokeWidth: 3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
  strokeDasharray: 24,
  strokeDashoffset: 24,
  animation: `${checkmarkDraw} 0.3s ease-out 0.2s forwards`,
});

// ============================================
// UPLOAD STATES
// ============================================

export const UploadStateContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S300,
});

export const UploadStateInfo = style({
  flex: 1,
  minWidth: 0,
});

export const UploadFileName = style({
  fontSize: toRem(14),
  fontWeight: 500,
  color: color.Surface.OnContainer,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const UploadFileSize = style({
  fontSize: toRem(12),
  color: color.SurfaceVariant.OnContainer,
  marginTop: toRem(2),
});

export const UploadSpeed = style({
  fontSize: toRem(11),
  color: color.Primary.Main,
  fontWeight: 500,
});
