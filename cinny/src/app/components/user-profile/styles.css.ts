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

// ============================================
// DEFAULT PROFILE BANNERS
// ============================================

// Animated gradient shift for banners
const gradientShift = keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
  '100%': { backgroundPosition: '0% 50%' },
});

// Base banner style
export const ProfileBanner = style({
  width: '100%',
  height: toRem(120),
  position: 'relative',
  overflow: 'hidden',
});

// Default gradient banners (when user has no custom banner)
export const ProfileBannerDefault = style({
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 15s ease infinite`,
});

// Color variants - these can be assigned based on user ID hash
export const ProfileBannerBlue = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #5865f2 50%, #3498db 75%, #667eea 100%)',
}]);

export const ProfileBannerPurple = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 25%, #6366f1 50%, #8b5cf6 75%, #a855f7 100%)',
}]);

export const ProfileBannerPink = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 25%, #e879f9 50%, #f43f5e 75%, #ec4899 100%)',
}]);

export const ProfileBannerRed = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #ef4444 0%, #f97316 25%, #dc2626 50%, #ea580c 75%, #ef4444 100%)',
}]);

export const ProfileBannerOrange = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 25%, #f59e0b 50%, #fb923c 75%, #f97316 100%)',
}]);

export const ProfileBannerYellow = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #eab308 0%, #facc15 25%, #fde047 50%, #ca8a04 75%, #eab308 100%)',
}]);

export const ProfileBannerGreen = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 25%, #4ade80 50%, #15803d 75%, #22c55e 100%)',
}]);

export const ProfileBannerTeal = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 25%, #2dd4bf 50%, #0f766e 75%, #14b8a6 100%)',
}]);

export const ProfileBannerCyan = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 25%, #22d3ee 50%, #0e7490 75%, #06b6d4 100%)',
}]);

// Special animated banners
export const ProfileBannerRainbow = style([ProfileBanner, {
  background: 'linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 8s ease infinite`,
}]);

export const ProfileBannerNightSky = style([ProfileBanner, {
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  position: 'relative',
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle at 50% 60%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.12) 1px, transparent 1px)',
    backgroundSize: '100px 100px',
    animation: `${sparkle} 3s ease-in-out infinite`,
  },
}]);

export const ProfileBannerSunset = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #ff9f43 50%, #ee5a24 75%, #ff6b6b 100%)',
}]);

export const ProfileBannerOcean = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 25%, #90e0ef 50%, #0096c7 75%, #0077b6 100%)',
}]);

export const ProfileBannerForest = style([ProfileBannerDefault, {
  background: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 25%, #52b788 50%, #1b4332 75%, #2d6a4f 100%)',
}]);

export const ProfileBannerNeon = style([ProfileBanner, {
  background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)',
  position: 'relative',
  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 25%, rgba(255,0,255,0.1) 50%, rgba(0,255,255,0.1) 75%, transparent 100%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 3s ease-in-out infinite`,
  },
}]);

// Mesh gradient banner (modern style)
export const ProfileBannerMesh = style([ProfileBanner, {
  background: `
    radial-gradient(at 40% 20%, #7c3aed 0px, transparent 50%),
    radial-gradient(at 80% 0%, #f472b6 0px, transparent 50%),
    radial-gradient(at 0% 50%, #06b6d4 0px, transparent 50%),
    radial-gradient(at 80% 50%, #8b5cf6 0px, transparent 50%),
    radial-gradient(at 0% 100%, #3b82f6 0px, transparent 50%),
    radial-gradient(at 80% 100%, #f97316 0px, transparent 50%),
    radial-gradient(at 0% 0%, #10b981 0px, transparent 50%)
  `,
  backgroundColor: '#1a1a2e',
}]);

// Banner overlay gradient (for text readability)
export const ProfileBannerOverlay = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '50%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
  pointerEvents: 'none',
});

// Banner with custom image
export const ProfileBannerImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
  selectors: {
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
});

// Edit banner button overlay
export const ProfileBannerEditButton = style({
  position: 'absolute',
  top: config.space.S200,
  right: config.space.S200,
  padding: `${config.space.S100} ${config.space.S200}`,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  borderRadius: config.radii.R300,
  fontSize: toRem(12),
  fontWeight: 500,
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  border: 'none',
  backdropFilter: 'blur(4px)',
  selectors: {
    [`${ProfileBanner}:hover &`]: {
      opacity: 1,
    },
  },
});

// ============================================
// TIMEZONE DISPLAY
// ============================================

export const TimezoneChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: toRem(6),
  padding: `${toRem(4)} ${toRem(10)}`,
  backgroundColor: color.SurfaceVariant.Container,
  borderRadius: toRem(12),
  fontSize: toRem(12),
  fontWeight: 500,
  color: color.SurfaceVariant.OnContainer,
  transition: 'background-color 0.15s ease, transform 0.1s ease',
  cursor: 'default',
  selectors: {
    '&:hover': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
      transform: 'scale(1.02)',
    },
  },
});

export const TimezoneIcon = style({
  fontSize: toRem(14),
  opacity: 0.8,
});

export const TimezoneTime = style({
  fontWeight: 600,
  color: color.Surface.OnContainer,
});

export const TimezoneLabel = style({
  opacity: 0.7,
  fontSize: toRem(11),
});

// Animated clock icon
const clockTick = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const TimezoneClockAnimated = style({
  animation: `${clockTick} 60s linear infinite`,
});

// ============================================
// ACTIVITY STATUS (Spotify, Gaming, Streaming)
// ============================================

// Activity card container
export const ActivityCard = style({
  display: 'flex',
  gap: config.space.S300,
  padding: config.space.S300,
  backgroundColor: color.Background.Container,
  borderRadius: toRem(8),
  animation: `${contentFadeIn} 0.3s ${discordPopEase} 0.35s both`,
  overflow: 'hidden',
});

// Large cover art (left side)
export const ActivityCover = style({
  width: toRem(80),
  height: toRem(80),
  borderRadius: toRem(8),
  flexShrink: 0,
  objectFit: 'cover',
  backgroundColor: color.SurfaceVariant.Container,
  position: 'relative',
  overflow: 'hidden',
});

export const ActivityCoverImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'transform 0.3s ease',
  selectors: {
    [`${ActivityCard}:hover &`]: {
      transform: 'scale(1.05)',
    },
  },
});

// Small platform icon overlay (bottom-right of cover)
export const ActivityPlatformIcon = style({
  position: 'absolute',
  bottom: toRem(-4),
  right: toRem(-4),
  width: toRem(24),
  height: toRem(24),
  borderRadius: toRem(6),
  backgroundColor: color.Surface.Container,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
});

// Activity content (right side)
export const ActivityContent = style({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: toRem(2),
});

// Activity type label
export const ActivityTypeLabel = style({
  fontSize: toRem(11),
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  color: color.SurfaceVariant.OnContainer,
});

// Spotify-specific green label
export const ActivityTypeLabelSpotify = style([ActivityTypeLabel, {
  color: '#1DB954',
}]);

// Gaming label
export const ActivityTypeLabelGaming = style([ActivityTypeLabel, {
  color: '#7289da',
}]);

// Streaming/live label
export const ActivityTypeLabelStreaming = style([ActivityTypeLabel, {
  color: '#f04747',
}]);

// Rich activity title (song name, game name)
export const RichActivityTitle = style({
  fontSize: toRem(14),
  fontWeight: 600,
  color: color.Surface.OnContainer,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// Rich activity subtitle (artist, details)
export const RichActivitySubtitle = style({
  fontSize: toRem(13),
  color: color.SurfaceVariant.OnContainer,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

// Rich activity details (state, elapsed time)
export const RichActivityDetails = style({
  fontSize: toRem(12),
  color: color.SurfaceVariant.OnContainer,
  opacity: 0.8,
});

// Progress bar for music
export const ActivityProgressContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  marginTop: toRem(4),
});

export const ActivityProgressBar = style({
  flex: 1,
  height: toRem(4),
  backgroundColor: color.SurfaceVariant.ContainerLine,
  borderRadius: toRem(2),
  overflow: 'hidden',
});

export const ActivityProgressFill = style({
  height: '100%',
  backgroundColor: '#1DB954',
  borderRadius: toRem(2),
  transition: 'width 1s linear',
});

export const ActivityProgressTime = style({
  fontSize: toRem(11),
  color: color.SurfaceVariant.OnContainer,
  fontFamily: 'monospace',
  minWidth: toRem(36),
});

// Live badge (pulsing red)
const livePulse = keyframes({
  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
  '50%': { opacity: 0.8, transform: 'scale(1.1)' },
});

export const LiveBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${toRem(2)} ${toRem(6)}`,
  backgroundColor: '#f04747',
  color: '#fff',
  fontSize: toRem(10),
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderRadius: toRem(3),
  animation: `${livePulse} 1.5s ease-in-out infinite`,
});

// Spotify-styled activity card
export const ActivityCardSpotify = style([ActivityCard, {
  borderLeft: `3px solid #1DB954`,
}]);

// Gaming-styled activity card
export const ActivityCardGaming = style([ActivityCard, {
  borderLeft: `3px solid #7289da`,
}]);

// Streaming-styled activity card
export const ActivityCardStreaming = style([ActivityCard, {
  borderLeft: `3px solid #f04747`,
}]);

// ============================================
// MUTUAL FRIENDS AVATAR STACK
// ============================================

export const MutualFriendsContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: config.space.S200,
  padding: `${config.space.S100} ${config.space.S200}`,
  backgroundColor: color.SurfaceVariant.Container,
  borderRadius: toRem(16),
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, transform 0.1s ease',
  selectors: {
    '&:hover': {
      backgroundColor: color.SurfaceVariant.ContainerHover,
      transform: 'scale(1.02)',
    },
  },
});

export const MutualFriendsAvatarStack = style({
  display: 'flex',
  alignItems: 'center',
});

export const MutualFriendsAvatar = style({
  width: toRem(24),
  height: toRem(24),
  borderRadius: '50%',
  border: `2px solid ${color.Surface.Container}`,
  objectFit: 'cover',
  marginLeft: toRem(-8),
  transition: 'transform 0.15s ease, z-index 0s',
  position: 'relative',
  selectors: {
    '&:first-child': {
      marginLeft: 0,
    },
    '&:hover': {
      transform: 'scale(1.15)',
      zIndex: 10,
    },
  },
});

// Stagger animation for avatar stack
const avatarStackIn = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-10px) scale(0.8)' },
  '100%': { opacity: 1, transform: 'translateX(0) scale(1)' },
});

export const MutualFriendsAvatarAnimated = style([MutualFriendsAvatar, {
  animation: `${avatarStackIn} 0.2s ${discordPopEase} both`,
  selectors: {
    '&:nth-child(1)': { animationDelay: '0s' },
    '&:nth-child(2)': { animationDelay: '0.05s' },
    '&:nth-child(3)': { animationDelay: '0.1s' },
    '&:nth-child(4)': { animationDelay: '0.15s' },
  },
}]);

export const MutualFriendsOverflow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: toRem(24),
  height: toRem(24),
  borderRadius: '50%',
  backgroundColor: color.SurfaceVariant.ContainerActive,
  border: `2px solid ${color.Surface.Container}`,
  marginLeft: toRem(-8),
  fontSize: toRem(10),
  fontWeight: 600,
  color: color.SurfaceVariant.OnContainer,
});

export const MutualFriendsText = style({
  fontSize: toRem(12),
  fontWeight: 500,
  color: color.SurfaceVariant.OnContainer,
});

// ============================================
// BANNER COLOR EXTRACTION (CSS Variable Setup)
// ============================================

// Profile with extracted accent color
export const ProfileWithAccent = style({
  vars: {
    '--profile-accent': color.Primary.Main,
    '--profile-accent-dark': color.Primary.MainActive,
    '--profile-accent-light': color.Primary.Container,
    '--profile-accent-glow': color.Primary.Main,
  },
});

// Apply extracted color to banner gradient
export const ProfileBannerAccent = style({
  background: `linear-gradient(135deg, var(--profile-accent) 0%, var(--profile-accent-dark) 100%)`,
  backgroundSize: '200% 200%',
  animation: `${gradientShift} 15s ease infinite`,
});

// Apply extracted color to card border glow
export const ProfileCardAccent = style({
  border: '2px solid transparent',
  backgroundImage: `linear-gradient(${color.Surface.Container}, ${color.Surface.Container}), linear-gradient(135deg, var(--profile-accent), var(--profile-accent-dark))`,
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px var(--profile-accent-glow)',
});

// Avatar ring with accent color
export const AvatarRingAccent = style({
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--profile-accent), var(--profile-accent-dark))',
  boxShadow: '0 0 15px var(--profile-accent-glow)',
});

// ============================================
// ENHANCED ANIMATED AVATAR FRAMES
// ============================================

// Liquid/morphing frame
const liquidMorph = keyframes({
  '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
  '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
});

export const AvatarFrameLiquid = style({
  position: 'relative',
  padding: toRem(4),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 3s ease-in-out infinite, ${liquidMorph} 8s ease-in-out infinite`,
  boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)',
});

// Electric/lightning frame
const electricFlash = keyframes({
  '0%, 90%, 100%': { opacity: 1 },
  '92%, 94%, 96%': { opacity: 0.5 },
  '93%, 95%, 97%': { opacity: 1 },
});

export const AvatarFrameElectric = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 50%, #00ffff 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 2s linear infinite, ${electricFlash} 3s ease-in-out infinite`,
  boxShadow: '0 0 15px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 212, 255, 0.3)',
});

// Holographic frame
const holoShift = keyframes({
  '0%': { filter: 'hue-rotate(0deg)' },
  '100%': { filter: 'hue-rotate(360deg)' },
});

export const AvatarFrameHolographic = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
  backgroundSize: '300% 300%',
  animation: `${shimmer} 3s linear infinite, ${holoShift} 5s linear infinite`,
  boxShadow: '0 0 20px rgba(255, 0, 128, 0.4)',
});

// Starfield frame
const starTwinkle = keyframes({
  '0%, 100%': { boxShadow: '0 0 10px #fff, inset 0 0 10px rgba(255,255,255,0.1)' },
  '50%': { boxShadow: '0 0 20px #fff, inset 0 0 15px rgba(255,255,255,0.2)' },
});

export const AvatarFrameStarfield = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  animation: `${starTwinkle} 2s ease-in-out infinite`,
});

// Neon glow frame
const neonPulse = keyframes({
  '0%, 100%': {
    boxShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff',
  },
  '50%': {
    boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #00ffff',
  },
});

export const AvatarFrameNeon = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: '#000',
  animation: `${neonPulse} 2s ease-in-out infinite`,
});

// Seasonal: Winter frost frame
const frostShimmer = keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '100%': { backgroundPosition: '200% 50%' },
});

export const AvatarFrameFrost = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #d299c2 50%, #a8edea 75%, #fed6e3 100%)',
  backgroundSize: '200% 200%',
  animation: `${frostShimmer} 4s linear infinite`,
  boxShadow: '0 0 15px rgba(168, 237, 234, 0.5)',
});

// Seasonal: Autumn leaves frame
export const AvatarFrameAutumn = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #ff6b35 0%, #f7c59f 25%, #efa94a 50%, #d62828 75%, #ff6b35 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 4s ease-in-out infinite`,
  boxShadow: '0 0 12px rgba(255, 107, 53, 0.4)',
});

// Seasonal: Spring bloom frame
export const AvatarFrameSpring = style({
  position: 'relative',
  padding: toRem(3),
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 25%, #ff9a9e 50%, #fecfef 75%, #ffecd2 100%)',
  backgroundSize: '200% 200%',
  animation: `${shimmer} 4s ease-in-out infinite`,
  boxShadow: '0 0 12px rgba(252, 182, 159, 0.5)',
});

// ============================================
// CUSTOM PROFILE THEMES
// ============================================

// Theme: Midnight Purple
export const ProfileThemeMidnight = style({
  vars: {
    '--profile-accent': '#7c3aed',
    '--profile-accent-dark': '#5b21b6',
    '--profile-accent-light': '#a78bfa',
    '--profile-accent-glow': 'rgba(124, 58, 237, 0.4)',
    '--profile-bg': '#1e1b4b',
    '--profile-surface': '#312e81',
  },
});

// Theme: Ocean Blue
export const ProfileThemeOcean = style({
  vars: {
    '--profile-accent': '#0ea5e9',
    '--profile-accent-dark': '#0369a1',
    '--profile-accent-light': '#7dd3fc',
    '--profile-accent-glow': 'rgba(14, 165, 233, 0.4)',
    '--profile-bg': '#0c4a6e',
    '--profile-surface': '#075985',
  },
});

// Theme: Sunset Orange
export const ProfileThemeSunset = style({
  vars: {
    '--profile-accent': '#f97316',
    '--profile-accent-dark': '#c2410c',
    '--profile-accent-light': '#fdba74',
    '--profile-accent-glow': 'rgba(249, 115, 22, 0.4)',
    '--profile-bg': '#431407',
    '--profile-surface': '#7c2d12',
  },
});

// Theme: Forest Green
export const ProfileThemeForest = style({
  vars: {
    '--profile-accent': '#22c55e',
    '--profile-accent-dark': '#15803d',
    '--profile-accent-light': '#86efac',
    '--profile-accent-glow': 'rgba(34, 197, 94, 0.4)',
    '--profile-bg': '#14532d',
    '--profile-surface': '#166534',
  },
});

// Theme: Cherry Blossom
export const ProfileThemeCherry = style({
  vars: {
    '--profile-accent': '#ec4899',
    '--profile-accent-dark': '#be185d',
    '--profile-accent-light': '#f9a8d4',
    '--profile-accent-glow': 'rgba(236, 72, 153, 0.4)',
    '--profile-bg': '#500724',
    '--profile-surface': '#831843',
  },
});

// Theme: Cosmic
export const ProfileThemeCosmic = style({
  vars: {
    '--profile-accent': '#8b5cf6',
    '--profile-accent-dark': '#6d28d9',
    '--profile-accent-light': '#c4b5fd',
    '--profile-accent-glow': 'rgba(139, 92, 246, 0.4)',
    '--profile-bg': '#1e1b4b',
    '--profile-surface': '#2e1065',
  },
});

// Theme: Blurple (Discord)
export const ProfileThemeBlurple = style({
  vars: {
    '--profile-accent': '#5865f2',
    '--profile-accent-dark': '#4752c4',
    '--profile-accent-light': '#7983f5',
    '--profile-accent-glow': 'rgba(88, 101, 242, 0.4)',
    '--profile-bg': '#1e1f22',
    '--profile-surface': '#2b2d31',
  },
});

// Theme: Rose Gold
export const ProfileThemeRoseGold = style({
  vars: {
    '--profile-accent': '#f472b6',
    '--profile-accent-dark': '#db2777',
    '--profile-accent-light': '#fbcfe8',
    '--profile-accent-glow': 'rgba(244, 114, 182, 0.4)',
    '--profile-bg': '#3b0764',
    '--profile-surface': '#581c87',
  },
});

// Theme: Cyberpunk
export const ProfileThemeCyberpunk = style({
  vars: {
    '--profile-accent': '#facc15',
    '--profile-accent-dark': '#ca8a04',
    '--profile-accent-light': '#fef08a',
    '--profile-accent-glow': 'rgba(250, 204, 21, 0.4)',
    '--profile-bg': '#0a0a0a',
    '--profile-surface': '#171717',
  },
});

// ============================================
// ENHANCED PROFILE PARTICLE EFFECTS
// ============================================

// More intense sparkle
const sparkleIntense = keyframes({
  '0%': { opacity: 0, transform: 'scale(0) rotate(0deg)' },
  '25%': { opacity: 1, transform: 'scale(1.2) rotate(90deg)' },
  '50%': { opacity: 0.8, transform: 'scale(0.8) rotate(180deg)' },
  '75%': { opacity: 1, transform: 'scale(1) rotate(270deg)' },
  '100%': { opacity: 0, transform: 'scale(0) rotate(360deg)' },
});

export const SparkleIntense = style({
  position: 'absolute',
  width: toRem(10),
  height: toRem(10),
  background: 'radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 30%, transparent 70%)',
  borderRadius: '50%',
  animation: `${sparkleIntense} 2.5s ease-in-out infinite`,
  willChange: 'transform, opacity',
});

// Star-shaped sparkle
export const SparkleStar = style({
  position: 'absolute',
  width: toRem(12),
  height: toRem(12),
  background: 'transparent',
  animation: `${sparkle} 2s ease-in-out infinite`,
  willChange: 'transform, opacity',
  '::before': {
    content: '"✦"',
    position: 'absolute',
    fontSize: toRem(12),
    color: '#fff',
    textShadow: '0 0 5px #fff, 0 0 10px #fff',
  },
});

// Heart particle
const heartFloat = keyframes({
  '0%': { opacity: 0, transform: 'translateY(0) scale(0)' },
  '50%': { opacity: 1, transform: 'translateY(-20px) scale(1)' },
  '100%': { opacity: 0, transform: 'translateY(-40px) scale(0.5)' },
});

export const ParticleHeart = style({
  position: 'absolute',
  fontSize: toRem(12),
  color: '#ff6b6b',
  animation: `${heartFloat} 3s ease-out infinite`,
  willChange: 'transform, opacity',
  '::before': {
    content: '"❤"',
  },
});

// Confetti particle
const confettiFall = keyframes({
  '0%': { opacity: 1, transform: 'translateY(-10px) rotate(0deg)' },
  '100%': { opacity: 0, transform: 'translateY(50px) rotate(720deg)' },
});

export const ParticleConfetti = style({
  position: 'absolute',
  width: toRem(8),
  height: toRem(8),
  borderRadius: toRem(2),
  animation: `${confettiFall} 2s ease-in infinite`,
  willChange: 'transform, opacity',
});

// Fire particle
const fireRise = keyframes({
  '0%': { opacity: 1, transform: 'translateY(0) scale(1)' },
  '100%': { opacity: 0, transform: 'translateY(-30px) scale(0)' },
});

export const ParticleFire = style({
  position: 'absolute',
  width: toRem(6),
  height: toRem(10),
  background: 'linear-gradient(to top, #ff4500, #ff8c00, #ffd700)',
  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
  animation: `${fireRise} 1s ease-out infinite`,
  willChange: 'transform, opacity',
  filter: 'blur(1px)',
});

// Bubble particle
const bubbleFloat = keyframes({
  '0%': { opacity: 0.8, transform: 'translateY(0) scale(0.5)' },
  '50%': { opacity: 1, transform: 'translateY(-30px) scale(1)' },
  '100%': { opacity: 0, transform: 'translateY(-60px) scale(0.8)' },
});

export const ParticleBubble = style({
  position: 'absolute',
  width: toRem(8),
  height: toRem(8),
  borderRadius: '50%',
  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(255,255,255,0.2))',
  border: '1px solid rgba(255,255,255,0.3)',
  animation: `${bubbleFloat} 3s ease-out infinite`,
  willChange: 'transform, opacity',
});

// Snow particle
const snowFall = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-10px) translateX(0)' },
  '50%': { opacity: 1 },
  '100%': { opacity: 0, transform: 'translateY(50px) translateX(20px)' },
});

export const ParticleSnow = style({
  position: 'absolute',
  width: toRem(6),
  height: toRem(6),
  background: '#fff',
  borderRadius: '50%',
  animation: `${snowFall} 4s linear infinite`,
  willChange: 'transform, opacity',
  boxShadow: '0 0 5px rgba(255,255,255,0.5)',
});

// Leaf particle
const leafFall = keyframes({
  '0%': { opacity: 1, transform: 'translateY(-10px) rotate(0deg) translateX(0)' },
  '25%': { transform: 'translateY(10px) rotate(90deg) translateX(10px)' },
  '50%': { transform: 'translateY(30px) rotate(180deg) translateX(-5px)' },
  '75%': { transform: 'translateY(50px) rotate(270deg) translateX(15px)' },
  '100%': { opacity: 0, transform: 'translateY(70px) rotate(360deg) translateX(0)' },
});

export const ParticleLeaf = style({
  position: 'absolute',
  fontSize: toRem(12),
  animation: `${leafFall} 5s ease-in-out infinite`,
  willChange: 'transform, opacity',
  '::before': {
    content: '"🍂"',
  },
});

// Particle container with hover trigger
export const ParticleContainerHover = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  selectors: {
    [`${ProfileCard}:hover &, ${ProfileCardNitro}:hover &`]: {
      opacity: 1,
    },
  },
});

// More sparkle positions for enhanced effects
export const Sparkle6 = style([SparkleIntense, { top: '15%', left: '70%', animationDelay: '0.2s' }]);
export const Sparkle7 = style([SparkleIntense, { top: '70%', left: '10%', animationDelay: '0.6s' }]);
export const Sparkle8 = style([SparkleIntense, { top: '50%', right: '5%', animationDelay: '1s' }]);
export const Sparkle9 = style([SparkleStar, { top: '25%', left: '50%', animationDelay: '0.3s' }]);
export const Sparkle10 = style([SparkleStar, { top: '75%', right: '25%', animationDelay: '0.7s' }]);
