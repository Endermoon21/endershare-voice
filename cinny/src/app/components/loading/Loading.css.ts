import { style, keyframes, createVar, globalStyle } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

// ============================================
// ANIMATION KEYFRAMES
// ============================================

// Circular progress rotation
const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

// Pulsing animation
const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
});

// Bounce animation for dots
const bounce = keyframes({
  '0%, 80%, 100%': { transform: 'scale(0)' },
  '40%': { transform: 'scale(1)' },
});

// Shimmer effect
const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

// Wave animation
const wave = keyframes({
  '0%, 100%': { transform: 'scaleY(0.5)' },
  '50%': { transform: 'scaleY(1)' },
});

// Spin with fade
const spinFade = keyframes({
  '0%': { opacity: 1, transform: 'rotate(0deg)' },
  '50%': { opacity: 0.5 },
  '100%': { opacity: 1, transform: 'rotate(360deg)' },
});

// Ring expansion
const ringExpand = keyframes({
  '0%': { transform: 'scale(0.8)', opacity: 1 },
  '100%': { transform: 'scale(1.2)', opacity: 0 },
});

// ============================================
// CIRCULAR PROGRESS RING
// ============================================

const progressValue = createVar();

export const ProgressRingContainer = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ProgressRingSvg = style({
  transform: 'rotate(-90deg)',
});

export const ProgressRingBackground = style({
  fill: 'none',
  stroke: color.SurfaceVariant.Container,
});

export const ProgressRingForeground = style({
  fill: 'none',
  stroke: color.Primary.Main,
  strokeLinecap: 'round',
  transition: 'stroke-dashoffset 0.3s ease',
});

export const ProgressRingAnimated = style({
  animation: `${rotate} 1.5s linear infinite`,
});

export const ProgressRingText = style({
  position: 'absolute',
  fontSize: toRem(12),
  fontWeight: 600,
  color: color.Surface.OnContainer,
});

// Size variants
export const ProgressRingSmall = style({ width: toRem(32), height: toRem(32) });
export const ProgressRingMedium = style({ width: toRem(48), height: toRem(48) });
export const ProgressRingLarge = style({ width: toRem(64), height: toRem(64) });

// ============================================
// CUSTOM SPINNERS
// ============================================

// Dots spinner
export const DotsSpinner = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: toRem(4),
});

export const DotsSpinnerDot = style({
  width: toRem(8),
  height: toRem(8),
  borderRadius: '50%',
  backgroundColor: color.Primary.Main,
  animation: `${bounce} 1.4s ease-in-out infinite both`,
  selectors: {
    '&:nth-child(1)': { animationDelay: '-0.32s' },
    '&:nth-child(2)': { animationDelay: '-0.16s' },
    '&:nth-child(3)': { animationDelay: '0s' },
  },
});

// Wave spinner (audio bars style)
export const WaveSpinner = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: toRem(2),
  height: toRem(24),
});

export const WaveSpinnerBar = style({
  width: toRem(4),
  height: '100%',
  backgroundColor: color.Primary.Main,
  borderRadius: toRem(2),
  animation: `${wave} 1s ease-in-out infinite`,
  selectors: {
    '&:nth-child(1)': { animationDelay: '0s' },
    '&:nth-child(2)': { animationDelay: '0.1s' },
    '&:nth-child(3)': { animationDelay: '0.2s' },
    '&:nth-child(4)': { animationDelay: '0.3s' },
    '&:nth-child(5)': { animationDelay: '0.4s' },
  },
});

// Pulse spinner (expanding ring)
export const PulseSpinner = style({
  position: 'relative',
  width: toRem(40),
  height: toRem(40),
});

export const PulseSpinnerRing = style({
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  border: `3px solid ${color.Primary.Main}`,
  animation: `${ringExpand} 1.5s ease-out infinite`,
  selectors: {
    '&:nth-child(2)': { animationDelay: '0.5s' },
  },
});

export const PulseSpinnerCore = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: toRem(12),
  height: toRem(12),
  borderRadius: '50%',
  backgroundColor: color.Primary.Main,
  animation: `${pulse} 1.5s ease-in-out infinite`,
});

// Gradient spinner
export const GradientSpinner = style({
  width: toRem(40),
  height: toRem(40),
  borderRadius: '50%',
  background: `conic-gradient(from 0deg, transparent, ${color.Primary.Main})`,
  animation: `${rotate} 1s linear infinite`,
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    inset: toRem(4),
    borderRadius: '50%',
    backgroundColor: color.Surface.Container,
  },
});

// Discord-style spinner
export const DiscordSpinner = style({
  width: toRem(32),
  height: toRem(32),
  border: `3px solid ${color.SurfaceVariant.Container}`,
  borderTopColor: color.Primary.Main,
  borderRadius: '50%',
  animation: `${spinFade} 1s ease-in-out infinite`,
});

// ============================================
// ANIMATED PROGRESS BARS
// ============================================

export const ProgressBarContainer = style({
  position: 'relative',
  width: '100%',
  height: toRem(8),
  backgroundColor: color.SurfaceVariant.Container,
  borderRadius: toRem(4),
  overflow: 'hidden',
});

export const ProgressBarFill = style({
  height: '100%',
  backgroundColor: color.Primary.Main,
  borderRadius: toRem(4),
  transition: 'width 0.3s ease',
  position: 'relative',
});

// Shimmer effect on progress bar
export const ProgressBarShimmer = style({
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

// Striped progress bar
const stripes = keyframes({
  '0%': { backgroundPosition: '0 0' },
  '100%': { backgroundPosition: '40px 0' },
});

export const ProgressBarStriped = style({
  backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
  backgroundSize: '40px 40px',
  animation: `${stripes} 1s linear infinite`,
});

// Gradient progress bar
export const ProgressBarGradient = style({
  background: `linear-gradient(90deg, ${color.Primary.Main}, ${color.Success.Main})`,
});

// Color variants
export const ProgressBarSuccess = style({
  backgroundColor: color.Success.Main,
});

export const ProgressBarWarning = style({
  backgroundColor: color.Warning.Main,
});

export const ProgressBarError = style({
  backgroundColor: color.Critical.Main,
});

// Size variants
export const ProgressBarSmall = style({
  height: toRem(4),
});

export const ProgressBarLarge = style({
  height: toRem(12),
});

// ============================================
// INDETERMINATE PROGRESS
// ============================================

const indeterminate = keyframes({
  '0%': { left: '-35%', right: '100%' },
  '60%': { left: '100%', right: '-90%' },
  '100%': { left: '100%', right: '-90%' },
});

const indeterminateShort = keyframes({
  '0%': { left: '-200%', right: '100%' },
  '60%': { left: '107%', right: '-8%' },
  '100%': { left: '107%', right: '-8%' },
});

export const ProgressBarIndeterminate = style({
  position: 'relative',
  overflow: 'hidden',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: color.Primary.Main,
    animation: `${indeterminate} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite`,
    borderRadius: toRem(4),
  },
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: color.Primary.Main,
    animation: `${indeterminateShort} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite`,
    borderRadius: toRem(4),
  },
});

// ============================================
// SKELETON LOADERS
// ============================================

export const Skeleton = style({
  backgroundColor: color.SurfaceVariant.Container,
  borderRadius: config.radii.R300,
  background: `linear-gradient(90deg, ${color.SurfaceVariant.Container} 25%, ${color.SurfaceVariant.ContainerHover} 50%, ${color.SurfaceVariant.Container} 75%)`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 1.5s ease-in-out infinite`,
});

export const SkeletonText = style([Skeleton, {
  height: toRem(16),
  marginBottom: toRem(8),
}]);

export const SkeletonTextShort = style([SkeletonText, {
  width: '60%',
}]);

export const SkeletonAvatar = style([Skeleton, {
  width: toRem(40),
  height: toRem(40),
  borderRadius: '50%',
}]);

export const SkeletonButton = style([Skeleton, {
  width: toRem(80),
  height: toRem(32),
}]);

export const SkeletonImage = style([Skeleton, {
  width: '100%',
  height: toRem(200),
}]);

// ============================================
// UPLOAD PROGRESS RING (Special)
// ============================================

export const UploadProgressRing = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: toRem(56),
  height: toRem(56),
});

export const UploadProgressRingSvg = style({
  position: 'absolute',
  transform: 'rotate(-90deg)',
});

export const UploadProgressRingBg = style({
  fill: 'none',
  stroke: color.SurfaceVariant.Container,
  strokeWidth: 4,
});

export const UploadProgressRingFg = style({
  fill: 'none',
  stroke: color.Primary.Main,
  strokeWidth: 4,
  strokeLinecap: 'round',
  transition: 'stroke-dashoffset 0.2s ease',
  filter: `drop-shadow(0 0 4px ${color.Primary.Main})`,
});

export const UploadProgressRingPercent = style({
  fontSize: toRem(14),
  fontWeight: 700,
  color: color.Surface.OnContainer,
});

export const UploadProgressComplete = style({
  color: color.Success.Main,
  animation: `${pulse} 0.5s ease-out`,
});
