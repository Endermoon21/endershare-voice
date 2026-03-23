<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="Cinny-Min Logo" width="100">
</p>

<h1 align="center">Cinny-Min</h1>

<p align="center">
  <strong>Matrix client with Discord-style voice channels and native game streaming</strong>
</p>

<p align="center">
  <a href="https://github.com/Endermoon21/cinny-min/releases">
    <img alt="GitHub release" src="https://img.shields.io/github/v/release/Endermoon21/cinny-min?style=flat-square&color=blue">
  </a>
  <a href="https://github.com/Endermoon21/cinny-min/releases">
    <img alt="Downloads" src="https://img.shields.io/github/downloads/Endermoon21/cinny-min/total?style=flat-square&color=green">
  </a>
  <a href="https://github.com/Endermoon21/cinny-min/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-AGPL--3.0-blue?style=flat-square">
  </a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows-lightgrey?style=flat-square">
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#download">Download</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#development">Development</a>
</p>

---

## About

Cinny-Min is a fork of [Cinny](https://github.com/cinnyapp/cinny) rebuilt as a native desktop application with **LiveKit voice integration** and **native game streaming**. It brings Discord-style voice channels to the Matrix ecosystem while maintaining the elegant, minimal interface Cinny is known for.

Built with [Tauri](https://tauri.app) (Rust + WebView2) for a lightweight footprint and native performance.

## Features

### Voice Channels
- **LiveKit Integration** — Low-latency voice chat powered by [LiveKit](https://livekit.io)
- **RNNoise** — AI-powered noise suppression for crystal-clear audio
- **Discord-style UI** — Familiar voice channel interface with user avatars, mute states, and connection quality indicators
- **Draggable Categories** — Organize channels with collapsible, reorderable categories

### Game Streaming
- **Native GStreamer Pipeline** — Hardware-accelerated capture and encoding (NVENC, AMF, QuickSync)
- **WHIP Protocol** — WebRTC-based streaming with adaptive bitrate and congestion control
- **Window/Monitor Capture** — Stream specific applications or entire displays
- **Quality Presets** — Performance, Balanced, Quality, and Lossless modes
- **OBS Integration** — Optional OBS/Sunshine controller for advanced setups

### Matrix Features
- End-to-end encryption (via Matrix SDK)
- Spaces and room organization
- Rich message formatting
- File uploads with native CORS bypass
- Cross-signing and device verification

## Download

| Platform | Download | Notes |
|----------|----------|-------|
| **Windows** | [Cinny-Min.msi](https://github.com/Endermoon21/cinny-min/releases/latest/download/Cinny-Min_x64_en-US.msi) | Windows 10/11 (64-bit) |

> **Auto-updates:** The app checks for updates automatically and installs them in the background.

### System Requirements

- Windows 10 version 1803+ or Windows 11
- WebView2 Runtime (included in Windows 11, auto-installed on Windows 10)
- For game streaming: DirectX 11 compatible GPU

## Screenshots

<!-- TODO: Add screenshots -->
*Screenshots coming soon*

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cinny-Min                               │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                                  │
│  ├── Matrix SDK — Chat, encryption, sync                        │
│  ├── LiveKit SDK — Voice channel UI and state                   │
│  └── Tauri IPC — Native feature bridge                          │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Rust + Tauri)                                         │
│  ├── GStreamer — Video capture, encoding, WHIP streaming        │
│  ├── Windows APIs — Window enumeration, thumbnails              │
│  └── Native uploads — CORS-free file transfers                  │
└─────────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   ┌───────────┐                 ┌─────────────┐
   │  Matrix   │                 │   LiveKit   │
   │  Server   │                 │   Server    │
   └───────────┘                 └─────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | [Tauri](https://tauri.app) 1.x |
| Frontend | React 18, TypeScript, Vanilla Extract |
| Backend | Rust |
| Voice | [LiveKit](https://livekit.io), [livekit-client](https://github.com/livekit/client-sdk-js) |
| Streaming | [GStreamer](https://gstreamer.freedesktop.org) 1.24+, WHIP/WebRTC |
| Matrix | [matrix-js-sdk](https://github.com/matrix-org/matrix-js-sdk) |

## Development

### Prerequisites

1. **Rust** — Install via [rustup](https://rustup.rs)
2. **Node.js** — v18+ recommended
3. **GStreamer** — Windows: [Download](https://gstreamer.freedesktop.org/download/) (runtime + development)

### Setup

```bash
# Clone with submodules
git clone --recursive https://github.com/Endermoon21/cinny-min.git
cd cinny-min

# Install frontend dependencies
cd cinny && npm ci && cd ..

# Install Tauri CLI dependencies
npm ci

# Copy GStreamer DLLs (Windows)
./copy-gstreamer.bat
```

### Development Server

```bash
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

Build outputs are in `src-tauri/target/release/bundle/`.

## Configuration

The app connects to LiveKit and Matrix servers configured at runtime. Voice channel functionality requires a LiveKit server with the appropriate room configuration.

### Environment

| Variable | Description |
|----------|-------------|
| `TAURI_PRIVATE_KEY` | Signing key for update bundles |
| `TAURI_KEY_PASSWORD` | Password for the signing key |

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

- [Cinny](https://github.com/cinnyapp/cinny) — The original Matrix client this project is based on
- [Tauri](https://tauri.app) — Framework for building desktop apps
- [LiveKit](https://livekit.io) — Real-time voice/video infrastructure
- [GStreamer](https://gstreamer.freedesktop.org) — Multimedia framework
- [RNNoise](https://github.com/xiph/rnnoise) — Noise suppression

## License

This project is licensed under the [AGPL-3.0](LICENSE) license.

---

<p align="center">
  Made with Rust, React, and too much coffee
</p>
