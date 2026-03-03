# Discord Server Voice Call UI/UX/CSS Research

Comprehensive research into Discord's voice channel design patterns for implementation reference.

**Last Updated:** March 2026 (includes March 2025 UI overhaul changes)

---

## 0. MARCH 2025 UI OVERHAUL - KEY CHANGES

Discord released a major desktop redesign on **March 25, 2025**. Key changes:

### New Theme System
- **4 themes:** Light, Ash, Dark, Onyx
- **Onyx:** Pure black (OLED-friendly) - previously mobile-only "Midnight"
- **Ash:** Mid-gray, closest to old dark theme
- **Dark:** Slightly darker blue-gray than before

### Voice Panel Redesign
- **Centralized controls:** All voice/video buttons in a single action bar
- **Stronger color indicators:**
  - **Red glow** when muted (more prominent than before)
  - **Green glow** when camera is active
- **Resizable channel list**
- **Inbox moved to title bar** (more space for calls)

### Visual Changes
- Higher contrast throughout
- Darker colors overall
- More rounded corners
- 3 density settings: Spacious, Default, Compact
- Refreshed icons and illustrations

---

## 1. COLOR SYSTEM

### Dark Theme Primary Colors (Post-March 2025)
| Variable | Hex | Usage |
|----------|-----|-------|
| `--background-primary` | `#313338` | Main content area background |
| `--background-secondary` | `#2b2d31` | Sidebars, panels |
| `--background-tertiary` | `#1e1f22` | Inputs, dropdowns |
| `--background-floating` | `#111214` | Popouts, modals |
| `--text-normal` | `#dbdee1` | Primary text |
| `--text-muted` | `#949ba4` | Secondary/muted text |
| `--header-primary` | `#f2f3f5` | Headers, titles |

### Theme Backgrounds (March 2025+)
| Theme | Primary BG | Secondary BG |
|-------|------------|--------------|
| Light | `#ffffff` | `#f2f3f5` |
| Ash | `#3a3c41` | `#313338` |
| Dark | `#313338` | `#2b2d31` |
| Onyx | `#000000` | `#111111` |

### Status Colors
| Status | Hex | RGB |
|--------|-----|-----|
| Online/Speaking | `#23a55a` | rgb(35, 165, 90) |
| Idle | `#f0b232` | rgb(240, 178, 50) |
| DND | `#f23f43` | rgb(242, 63, 67) |
| Streaming | `#593695` | rgb(89, 54, 149) |
| Offline | `#80848e` | rgb(128, 132, 142) |

### Brand Colors
| Name | Hex |
|------|-----|
| Blurple (new) | `#5865f2` |
| Blurple (classic) | `#7289da` |
| Green | `#57f287` |
| Yellow | `#fee75c` |
| Fuchsia | `#eb459e` |
| Red | `#ed4245` |

---

## 2. TYPOGRAPHY

### Font Stack
```css
font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

### Font Sizes
| Element | Size | Weight |
|---------|------|--------|
| Body text | 14-15px | 400 |
| Channel names | 15px | 500 |
| Category headers | 12px | 700 (uppercase) |
| Username | 14px | 500 |
| Timestamps | 11px | 400 |
| Tooltips | 14px | 500 |
| Button text | 14px | 500 |

### Line Heights
- Body: 1.375 (20px at 14px)
- Compact: 1.125 (16px)
- Headers: 1.2

---

## 3. SPACING SYSTEM

### Common Values
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-xxl: 24px;
```

### Component Padding
| Component | Padding |
|-----------|---------|
| Buttons | 2px 16px (small), 10px 16px (medium) |
| Cards | 12-16px |
| Modal body | 16px 20px |
| List items | 8px 12px |
| Voice panel | 8px |

---

## 4. BORDER RADIUS

| Element | Radius |
|---------|--------|
| Avatars | 50% (circle) |
| Server icons | 50% → 33% on hover/active |
| Buttons | 3px (small), 4px (medium) |
| Cards/Panels | 8px |
| Modals | 8px |
| Tooltips | 5px |
| Inputs | 3px |
| Badges | 4px |

---

## 5. VOICE PANEL (Bottom Left)

### Structure
```
┌─────────────────────────────────────┐
│ [Signal] Voice Connected ▼          │  ← Header (clickable)
│         Channel Name                │
├─────────────────────────────────────┤
│ ┌────┐                              │
│ │ AV │ Username              [Mic]  │  ← User row
│ └────┘ #1234                [Deaf]  │
│                             [Gear]  │
└─────────────────────────────────────┘
```

### Dimensions
| Element | Size |
|---------|------|
| Panel width | 240px (sidebar width) |
| Avatar size | 32px |
| Button size | 32px × 32px |
| Button icon | 20px |
| Status dot | 10px |
| Panel padding | 8px |
| Row gap | 8px |

### Voice Connected Header
- Font size: 12px
- Font weight: 600
- Color: `#23a55a` (green when connected)
- Text transform: uppercase
- Letter spacing: 0.02em

### Control Buttons (March 2025+ Design)

**Centralized Action Bar:** All controls now in a single horizontal bar.

```css
.control-button {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background: transparent;
  color: #b5bac1;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.control-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #dbdee1;
}

/* MUTED STATE - Now with prominent red glow (March 2025) */
.control-button.muted {
  background: rgba(242, 63, 67, 0.2);
  color: #f23f43;
  box-shadow: 0 0 8px rgba(242, 63, 67, 0.4);
}

.control-button.muted:hover {
  background: rgba(242, 63, 67, 0.3);
  box-shadow: 0 0 12px rgba(242, 63, 67, 0.5);
}

/* CAMERA ACTIVE - Green glow (March 2025) */
.control-button.camera-on {
  background: rgba(35, 165, 90, 0.2);
  color: #23a55a;
  box-shadow: 0 0 8px rgba(35, 165, 90, 0.4);
}
```

**Key Change:** Mute/deafen buttons now have a **solid bright red** appearance when active, providing stronger visual feedback that "catches your eyes."

---

## 6. SPEAKING INDICATOR

### Avatar Ring Animation
```css
@keyframes speaking-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(35, 165, 90, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(35, 165, 90, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(35, 165, 90, 0);
  }
}

.avatar-speaking {
  animation: speaking-pulse 1.5s ease-out infinite;
  border: 2px solid #23a55a;
}
```

### Streamkit Bounce Animation
```css
@keyframes speak-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.avatar-speaking {
  animation: speak-bounce 0.2s ease-in-out;
}
```

### Voice Activity Border
```css
.voice-avatar {
  border: 2px solid transparent;
  border-radius: 50%;
  transition: border-color 0.15s ease;
}

.voice-avatar.speaking {
  border-color: #23a55a;
}
```

---

## 7. CONNECTION QUALITY INDICATOR

### Signal Bars Icon
- 4 bars at increasing heights
- Heights: 4px, 7px, 10px, 13px
- Bar width: 3px
- Gap: 2px
- Border radius: 1px

### Quality Thresholds
| Quality | Ping | Bars | Color |
|---------|------|------|-------|
| Excellent | <50ms | 4 | `#23a55a` (green) |
| Good | <100ms | 3 | `#f0b232` (yellow) |
| Poor | <200ms | 2 | `#e67e22` (orange) |
| Bad | ≥200ms | 1 | `#f23f43` (red) |
| Unknown | N/A | 0 | `#949ba4` (gray) |

### Connection Stats Popup
Shows when clicking "Voice Connected":
- Ping (ms)
- Packet loss (%)
- Jitter (ms)
- Server region
- Historical ping graph

---

## 8. BUTTON STATES

### Default Button
```css
.button {
  background: transparent;
  color: #b5bac1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}
```

### Hover State
```css
.button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #dbdee1;
}
```

### Active/Pressed State
```css
.button:active {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(0.95);
}
```

### Disabled State
```css
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Danger Button (Muted/Deafened)
```css
.button-danger {
  background: rgba(242, 63, 67, 0.15);
  color: #f23f43;
}

.button-danger:hover {
  background: rgba(242, 63, 67, 0.25);
}
```

---

## 9. TOOLTIPS

### Styling
```css
.tooltip {
  background: #111214;
  color: #dbdee1;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 5px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
  max-width: 190px;
  word-wrap: break-word;
}
```

### Animation
```css
.tooltip {
  animation: tooltip-appear 0.1s ease-out;
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 10. MODALS

### Overlay
```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(0px);
}
```

### Modal Container
```css
.modal {
  background: #313338;
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1),
              0 24px 64px rgba(0, 0, 0, 0.4);
  max-width: 440px;
  max-height: 720px;
}

.modal-header {
  padding: 16px;
  border-bottom: 1px solid #3f4147;
}

.modal-body {
  padding: 16px 16px 20px;
  overflow-y: auto;
}
```

---

## 11. ANIMATION TIMINGS

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button hover | 0.15s | ease |
| Button press | 0.1s | ease-out |
| Modal open | 0.2s | ease-out |
| Tooltip show | 0.1s | ease-out |
| Status change | 0.2s | ease |
| Speaking pulse | 1.5s | ease-out (infinite) |
| Color transitions | 0.15s | ease |

### Easing Functions
```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

---

## 12. VOICE PARTICIPANTS GRID

### Layout
- Grid view: Equal-sized tiles
- Focus view: Large main + small tiles below
- Tile aspect ratio: 16:9 for video

### Participant Tile
```css
.participant-tile {
  background: #1e1f22;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.participant-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.participant-name {
  font-size: 14px;
  font-weight: 500;
  color: #dbdee1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
}
```

### Speaking State
```css
.participant-tile.speaking {
  box-shadow: inset 0 0 0 3px #23a55a;
}
```

---

## 13. ICONS

### Common Sizes
| Context | Size |
|---------|------|
| Panel buttons | 20px |
| Sidebar icons | 24px |
| Avatar status | 10-14px |
| Menu items | 18px |
| Close buttons | 24px |

### Mute/Deafen Icons
- Microphone with slash (muted)
- Headphones with slash (deafened)
- Stroke width: 2px
- Line cap: round
- Line join: round

---

## 14. CSS SELECTORS (BetterDiscord/Vencord)

### Voice Panel Selectors
```css
/* Voice connected panel */
[class*="panels_"]
[class*="container_"][class*="voiceCallWrapper_"]

/* User info area */
[class*="accountProfileCard_"]
[class*="avatarWrapper_"]

/* Control buttons */
[class*="button_"][class*="buttonColor_"]
[class*="actionButtons_"]

/* Speaking indicator */
[class*="speaking_"]
[class*="avatarSpeaking_"]
```

---

## 15. ACCESSIBILITY

### Focus States
```css
*:focus-visible {
  outline: 2px solid #00a8fc;
  outline-offset: 2px;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

---

## 16. 2026 UPDATES

### End-to-End Encryption (March 2026)
Starting March 2nd, 2026, all audio and video conversations require E2EE support:
- DMs and group DMs
- Voice channels
- Go Live streams

### Recent Fixes (February 2026)
- Fixed 1px gap between server header and channel list
- Fixed spacing between Accept/Deny buttons on friend requests
- Fixed padding in audio device modal
- Fixed padding in Voice RTC debug info panel
- Fixed element height consistency in Call UX (Disconnect button vs control tray)
- Fixed typing indicator padding in Text in Voice channels

---

## Sources

### Official Discord
- [Discord March 25, 2025 Changelog](https://discord.com/blog/discord-update-march-25-2025-changelog)
- [Discord Patch Notes February 2026](https://discord.com/blog/discord-patch-notes-february-4-2026)
- [Discord Appearance Settings](https://support.discord.com/hc/en-us/articles/207260127-How-to-Change-Discord-Color-Themes-and-Customize-Appearance-Settings)

### Design Resources
- [BetterDiscord CSS Variables](https://docs.betterdiscord.app/discord/variables)
- [Discord Color Codes 2025](https://color-wheel-artist.com/discord-color-codes)
- [DiscordSelectors Repository](https://github.com/Zerthox/DiscordSelectors)
- [Discord Streamkit Overlay CSS](https://github.com/Minepatcher/VTuber-Discord-Streamkit-Overlay-Voice-CSS)
- [Modern Indicators Theme](https://github.com/discord-extensions/modern-indicators)

### Figma UI Kits
- [Discord Voice Call UI](https://www.figma.com/community/file/1588161745458961914/discord-voice-call-ui)
- [Ultimate Discord Library](https://www.figma.com/community/file/1316822758717784787/ultimate-discord-library)
- [Discord UI Kit](https://www.figma.com/community/file/1087464748597886212/discord-ui-kit)

### Analysis Articles
- [Discord's March 2025 UI Overhaul Analysis (Medium)](https://medium.com/@negi28.sumit/discords-march-2025-ui-overhaul-loved-or-hated-fff69f5eaebe)
- [Discord New Design Overview (Whop)](https://whop.com/blog/discord-new-design/)
- [Discord Redesign Analysis (Engadget)](https://www.engadget.com/gaming/pc/discords-redesigned-pc-app-has-multiple-dark-modes-a-new-overlay-and-more-160019822.html)
