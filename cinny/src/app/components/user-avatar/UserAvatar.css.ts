import { style, keyframes, createVar } from '@vanilla-extract/css';
import { color } from 'folds';

// ============================================
// ANIMATED AVATAR BORDERS & FRAMES
// ============================================

// Rainbow gradient rotation animation
const rainbowSpin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

// Glow pulse animation
const glowPulse = keyframes({
  '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
  '50%': { opacity: 1, transform: 'scale(1.05)' },
});

// Shimmer effect
const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% center' },
  '100%': { backgroundPosition: '200% center' },
});

// Base UserAvatar style
export const UserAvatar = style({
  backgroundColor: color.Secondary.Container,
  color: color.Secondary.OnContainer,
  textTransform: 'capitalize',

  selectors: {
    '&[data-image-loaded="true"]': {
      backgroundColor: 'transparent',
    },
  },
});

// ============================================
// AVATAR FRAME WRAPPER - Wrap avatar in this for effects
// ============================================

// Base frame container
export const AvatarFrame = style({
  position: 'relative',
  display: 'inline-flex',
  borderRadius: '50%',
});

// Rainbow animated border ring
export const AvatarFrameRainbow = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '3px',
  borderRadius: '50%',
  background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)',
  backgroundSize: '400% 400%',
  animation: `${rainbowSpin} 3s linear infinite`,

  '::before': {
    content: '""',
    position: 'absolute',
    inset: '3px',
    borderRadius: '50%',
    background: color.Surface.Container,
  },
});

// Gradient glow ring (purple/blue)
export const AvatarFrameGlow = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '3px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  boxShadow: '0 0 15px rgba(102, 126, 234, 0.5), 0 0 30px rgba(118, 75, 162, 0.3)',
  animation: `${glowPulse} 2s ease-in-out infinite`,
});

// Gold/premium frame
export const AvatarFrameGold = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '3px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f5af19 0%, #f12711 25%, #f5af19 50%, #f12711 75%, #f5af19 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 3s ease-in-out infinite`,
  boxShadow: '0 0 10px rgba(245, 175, 25, 0.4)',
});

// Cyan/teal tech frame
export const AvatarFrameCyan = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '3px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 50%, #00d2ff 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 2.5s ease-in-out infinite`,
  boxShadow: '0 0 12px rgba(0, 210, 255, 0.4)',
});

// Green/success frame (for online status emphasis)
export const AvatarFrameOnline = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '2px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  boxShadow: '0 0 8px rgba(56, 239, 125, 0.4)',
  animation: `${glowPulse} 2.5s ease-in-out infinite`,
});

// Pink/magenta frame
export const AvatarFramePink = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '3px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 2.5s ease-in-out infinite`,
  boxShadow: '0 0 10px rgba(240, 147, 251, 0.4)',
});

// Fire/red frame
export const AvatarFrameFire = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '3px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f12711 0%, #f5af19 30%, #f12711 60%, #f5af19 100%)',
  backgroundSize: '300% 300%',
  animation: `${shimmer} 1.5s ease-in-out infinite`,
  boxShadow: '0 0 12px rgba(241, 39, 17, 0.5)',
});

// Static elegant frame (no animation, subtle gradient)
export const AvatarFrameElegant = style({
  position: 'relative',
  display: 'inline-flex',
  padding: '2px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${color.Primary.Main} 0%, ${color.Secondary.Main} 100%)`,
  boxShadow: `0 0 8px ${color.Primary.Container}`,
});

// Hover effect for all frames
export const AvatarFrameHover = style({
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',

  ':hover': {
    transform: 'scale(1.08)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
});
