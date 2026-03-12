import { RecipeVariants, recipe } from '@vanilla-extract/recipes';
import { DefaultReset, config } from 'folds';
import { keyframes } from '@vanilla-extract/css';

// Slide up animation for bottom FAB (Jump to Latest)
const slideUpIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateX(-50%) translateY(20px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
  },
});

// Slide down animation for top FAB (Jump to Unread)
const slideDownIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateX(-50%) translateY(-20px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateX(-50%) translateY(0)',
  },
});

// Subtle floating animation to draw attention
const floatPulse = keyframes({
  '0%, 100%': {
    transform: 'translateX(-50%) translateY(0)',
  },
  '50%': {
    transform: 'translateX(-50%) translateY(-3px)',
  },
});

export const TimelineFloat = recipe({
  base: [
    DefaultReset,
    {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1,
      minWidth: 'max-content',
    },
  ],
  variants: {
    position: {
      Top: {
        top: config.space.S400,
        animation: `${slideDownIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1)`,
      },
      Bottom: {
        bottom: config.space.S400,
        animation: `${slideUpIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1), ${floatPulse} 2s ease-in-out 1s infinite`,
      },
    },
  },
  defaultVariants: {
    position: 'Top',
  },
});

export type TimelineFloatVariants = RecipeVariants<typeof TimelineFloat>;
