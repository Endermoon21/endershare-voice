import { style, keyframes, globalStyle } from '@vanilla-extract/css';
import { color, config, toRem } from 'folds';

// ============================================
// PROFILE CARD ANIMATIONS
// ============================================

// Discord-style pop easing
const discordPopEase = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Main profile card entrance
const profileSlideIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'scale(0.9) translateY(10px)',
  },
  '100%': {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
});

// Backdrop fade
const backdropFade = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

// Hero section slide
const heroSlideIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(-10px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

// Avatar bounce in
const avatarBounceIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(-50%) scale(0.5)',
  },
  '60%': {
    opacity: 1,
    transform: 'translateY(-50%) scale(1.1)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(-50%) scale(1)',
  },
});

// Content stagger fade
const contentFadeIn = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(8px)',
  },
  '100%': {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

export const ProfilePopupContainer = style({
  animation: `${profileSlideIn} 0.25s ${discordPopEase}`,
  transformOrigin: 'top left',
});

export const UserHeader = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  padding: config.space.S200,
});

export const UserHero = style({
  position: 'relative',
  animation: `${heroSlideIn} 0.3s ${discordPopEase}`,
});

export const UserHeroCoverContainer = style({
  height: toRem(96),
  overflow: 'hidden',
});
export const UserHeroCover = style({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
  filter: 'blur(16px)',
  transform: 'scale(2)',
});

export const UserHeroAvatarContainer = style({
  position: 'relative',
  height: toRem(29),
});
export const UserAvatarContainer = style({
  position: 'absolute',
  left: config.space.S400,
  top: 0,
  transform: 'translateY(-50%)',
  backgroundColor: color.Surface.Container,
  animation: `${avatarBounceIn} 0.4s ${discordPopEase} 0.1s both`,
});
export const UserHeroAvatar = style({
  outline: `${config.borderWidth.B600} solid ${color.Surface.Container}`,
  transition: 'transform 0.2s ease, outline-color 0.2s ease',
  selectors: {
    'button&': {
      cursor: 'pointer',
    },
    'button&:hover': {
      transform: 'scale(1.05)',
    },
  },
});
export const UserHeroAvatarImg = style({
  transition: 'filter 0.2s ease',
  selectors: {
    [`button${UserHeroAvatar}:hover &`]: {
      filter: 'brightness(0.7)',
    },
  },
});

// Staggered content sections animation
export const ProfileSection = style({
  animation: `${contentFadeIn} 0.25s ${discordPopEase} both`,
  selectors: {
    '&:nth-child(1)': { animationDelay: '0.15s' },
    '&:nth-child(2)': { animationDelay: '0.2s' },
    '&:nth-child(3)': { animationDelay: '0.25s' },
    '&:nth-child(4)': { animationDelay: '0.3s' },
  },
});

// ============================================
// DISCORD/NITRO-STYLE PROFILE ENHANCEMENTS
// ============================================

// Shimmer animation for badges
const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% center' },
  '100%': { backgroundPosition: '200% center' },
});

// Sparkle animation
const sparkle = keyframes({
  '0%, 100%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
  '50%': { opacity: 1, transform: 'scale(1) rotate(180deg)' },
});

// Float animation for decorations
const float = keyframes({
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-4px)' },
});

// Rainbow border animation
const rainbowBorder = keyframes({
  '0%': { borderColor: '#ff0000' },
  '16%': { borderColor: '#ff7f00' },
  '33%': { borderColor: '#ffff00' },
  '50%': { borderColor: '#00ff00' },
  '66%': { borderColor: '#0000ff' },
  '83%': { borderColor: '#9400d3' },
  '100%': { borderColor: '#ff0000' },
});

// ============================================
// ENHANCED BANNER (Discord-style)
// ============================================

export const UserHeroBannerLarge = style({
  height: toRem(120),
  overflow: 'hidden',
  position: 'relative',
});

export const UserHeroBannerGradient = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
  pointerEvents: 'none',
});

export const UserHeroBannerImage = style({
  height: '100%',
  width: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
  selectors: {
    '&:hover': {
      transform: 'scale(1.02)',
    },
  },
});

// ============================================
// NITRO BADGES
// ============================================

export const BadgesRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: toRem(6),
  flexWrap: 'wrap',
  animation: `${contentFadeIn} 0.3s ${discordPopEase} 0.2s both`,
});

export const NitroBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${toRem(4)} ${toRem(8)}`,
  borderRadius: toRem(4),
  fontSize: toRem(11),
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  background: 'linear-gradient(135deg, #f47fff 0%, #7289da 50%, #5865f2 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 3s ease-in-out infinite`,
  color: '#fff',
  boxShadow: '0 2px 8px rgba(114, 137, 218, 0.4)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  cursor: 'default',
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(114, 137, 218, 0.6)',
    },
  },
});

export const BoostBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${toRem(4)} ${toRem(8)}`,
  borderRadius: toRem(4),
  fontSize: toRem(11),
  fontWeight: 600,
  background: 'linear-gradient(135deg, #ff73fa 0%, #f47fff 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 2s ease-in-out infinite`,
  color: '#fff',
  boxShadow: '0 2px 8px rgba(244, 127, 255, 0.4)',
  transition: 'transform 0.15s ease',
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
});

export const EarlySupporterBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${toRem(4)} ${toRem(8)}`,
  borderRadius: toRem(4),
  fontSize: toRem(11),
  fontWeight: 600,
  background: 'linear-gradient(135deg, #faa61a 0%, #f47b67 100%)',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(250, 166, 26, 0.4)',
  transition: 'transform 0.15s ease',
  selectors: {
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
});

export const VerifiedBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: toRem(20),
  height: toRem(20),
  borderRadius: '50%',
  background: '#5865f2',
  color: '#fff',
  fontSize: toRem(12),
  boxShadow: '0 2px 6px rgba(88, 101, 242, 0.4)',
});

// ============================================
// ABOUT ME SECTION (Discord-style)
// ============================================

export const AboutMeSection = style({
  backgroundColor: color.Background.Container,
  borderRadius: toRem(8),
  padding: config.space.S300,
  animation: `${contentFadeIn} 0.3s ${discordPopEase} 0.25s both`,
});

export const AboutMeLabel = style({
  fontSize: toRem(12),
  fontWeight: 700,
  textTransform: 'uppercase',
  color: color.SurfaceVariant.OnContainer,
  marginBottom: config.space.S200,
  letterSpacing: '0.02em',
});

export const AboutMeText = style({
  fontSize: toRem(14),
  lineHeight: 1.4,
  color: color.Surface.OnContainer,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

// ============================================
// MEMBER SINCE / ROLES SECTION
// ============================================

export const MemberInfoSection = style({
  backgroundColor: color.Background.Container,
  borderRadius: toRem(8),
  padding: config.space.S300,
  animation: `${contentFadeIn} 0.3s ${discordPopEase} 0.3s both`,
});

export const MemberInfoLabel = style({
  fontSize: toRem(12),
  fontWeight: 700,
  textTransform: 'uppercase',
  color: color.SurfaceVariant.OnContainer,
  marginBottom: config.space.S100,
  letterSpacing: '0.02em',
});

export const MemberInfoValue = style({
  fontSize: toRem(14),
  color: color.Surface.OnContainer,
});

export const RolesContainer = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: toRem(4),
  marginTop: config.space.S200,
});

export const RoleBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: toRem(4),
  padding: `${toRem(2)} ${toRem(8)}`,
  borderRadius: toRem(4),
  fontSize: toRem(12),
  fontWeight: 500,
  backgroundColor: color.SurfaceVariant.Container,
  color: color.SurfaceVariant.OnContainer,
  transition: 'background-color 0.15s ease, transform 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
      transform: 'scale(1.05)',
    },
  },
});

export const RoleDot = style({
  width: toRem(10),
  height: toRem(10),
  borderRadius: '50%',
  flexShrink: 0,
});

// ============================================
// PROFILE ACCENT THEMES
// ============================================

export const ProfileAccentPurple = style({
  selectors: {
    [`&${UserHeroCoverContainer}`]: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
});

export const ProfileAccentBlue = style({
  selectors: {
    [`&${UserHeroCoverContainer}`]: {
      background: 'linear-gradient(135deg, #5865f2 0%, #3498db 100%)',
    },
  },
});

export const ProfileAccentPink = style({
  selectors: {
    [`&${UserHeroCoverContainer}`]: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  },
});

export const ProfileAccentGold = style({
  selectors: {
    [`&${UserHeroCoverContainer}`]: {
      background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    },
  },
});

// ============================================
// SPARKLE/PARTICLE EFFECTS (Premium feel)
// ============================================

export const SparkleContainer = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
});

export const Sparkle = style({
  position: 'absolute',
  width: toRem(8),
  height: toRem(8),
  background: 'radial-gradient(circle, #fff 0%, transparent 70%)',
  borderRadius: '50%',
  animation: `${sparkle} 2s ease-in-out infinite`,
});

// Multiple sparkle positions
export const Sparkle1 = style([Sparkle, { top: '20%', left: '15%', animationDelay: '0s' }]);
export const Sparkle2 = style([Sparkle, { top: '30%', right: '20%', animationDelay: '0.4s' }]);
export const Sparkle3 = style([Sparkle, { top: '60%', left: '25%', animationDelay: '0.8s' }]);
export const Sparkle4 = style([Sparkle, { bottom: '25%', right: '15%', animationDelay: '1.2s' }]);
export const Sparkle5 = style([Sparkle, { top: '45%', left: '80%', animationDelay: '1.6s' }]);

// ============================================
// ANIMATED AVATAR FRAME (Nitro-style)
// ============================================

export const AvatarFrameAnimated = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #f47fff, #7289da, #5865f2, #f47fff)',
  backgroundSize: '300% 300%',
  animation: `${shimmer} 4s ease-in-out infinite`,
  boxShadow: '0 0 20px rgba(114, 137, 218, 0.5)',
});

export const AvatarFrameRainbowAnimated = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  border: `${toRem(3)} solid transparent`,
  animation: `${rainbowBorder} 3s linear infinite`,
  boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
});

// ============================================
// ACTIVITY STATUS (Discord-style)
// ============================================

export const ActivitySection = style({
  backgroundColor: color.Background.Container,
  borderRadius: toRem(8),
  padding: config.space.S300,
  animation: `${contentFadeIn} 0.3s ${discordPopEase} 0.35s both`,
});

export const ActivityHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  marginBottom: config.space.S200,
});

export const ActivityIcon = style({
  width: toRem(40),
  height: toRem(40),
  borderRadius: toRem(4),
  backgroundColor: color.SurfaceVariant.Container,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const ActivityTitle = style({
  fontSize: toRem(12),
  fontWeight: 700,
  textTransform: 'uppercase',
  color: color.SurfaceVariant.OnContainer,
  letterSpacing: '0.02em',
});

export const ActivityName = style({
  fontSize: toRem(14),
  fontWeight: 600,
  color: color.Surface.OnContainer,
});

export const ActivityDetails = style({
  fontSize: toRem(13),
  color: color.SurfaceVariant.OnContainer,
});

// ============================================
// PROFILE CARD CONTAINER (Enhanced)
// ============================================

export const ProfileCard = style({
  backgroundColor: color.Surface.Container,
  borderRadius: toRem(8),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  border: `1px solid ${color.Surface.ContainerLine}`,
  minWidth: toRem(300),
  maxWidth: toRem(340),
});

export const ProfileCardNitro = style([ProfileCard, {
  border: `2px solid transparent`,
  backgroundImage: `linear-gradient(${color.Surface.Container}, ${color.Surface.Container}), linear-gradient(135deg, #f47fff, #7289da, #5865f2)`,
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(114, 137, 218, 0.3)',
}]);
