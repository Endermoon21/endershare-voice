import React, { useState } from "react";
import classNames from "classnames";
import { StreamingModal } from "./StreamingModal";
import { isNativeStreamingAvailable, getNativeStreamStatus } from "./nativeStreaming";
import * as css from "./voicePanel.css";

// Discord-style icons (20px for panel buttons)
const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L17 9.882V8C17 6.897 16.103 6 15 6H4C2.897 6 2 6.897 2 8V16C2 17.103 2.897 18 4 18H15C16.103 18 17 17.103 17 16V14.118L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z" />
  </svg>
);

// Screen share - simple monitor with arrow
const ScreenShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v2h10v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 13H4V5h16v11Z" />
    <path d="M12 15l4-4h-3V7h-2v4H8l4 4Z" />
  </svg>
);

// Active state - just uses green color via CSS, no overlay needed
const ScreenShareActiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3v2h10v-2h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm0 13H4V5h16v11Z" />
    <path d="M12 15l4-4h-3V7h-2v4H8l4 4Z" />
  </svg>
);

const SoundboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 2V4.07A8 8 0 0 0 4.07 11H2V13H4.07A8 8 0 0 0 11 19.93V22H13V19.93A8 8 0 0 0 19.93 13H22V11H19.93A8 8 0 0 0 13 4.07V2H11ZM12 6A6 6 0 1 1 6 12A6 6 0 0 1 12 6ZM12 8A4 4 0 1 0 16 12A4 4 0 0 0 12 8ZM12 10A2 2 0 1 1 10 12A2 2 0 0 1 12 10Z" />
  </svg>
);

const ActivitiesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.5 2C4.12 2 3 3.12 3 4.5V19.5C3 20.88 4.12 22 5.5 22H14.07L12.59 20.5H5.5C4.95 20.5 4.5 20.05 4.5 19.5V4.5C4.5 3.95 4.95 3.5 5.5 3.5H18.5C19.05 3.5 19.5 3.95 19.5 4.5V11.59L21 13.07V4.5C21 3.12 19.88 2 18.5 2H5.5Z" />
    <path d="M7.5 7H16.5V8.5H7.5V7ZM7.5 11H14V12.5H7.5V11ZM7.5 15H12V16.5H7.5V15Z" />
    <path d="M19.5 13.939L20.94 15.379L15.82 20.5H14.38V19.06L19.5 13.939Z" />
  </svg>
);

export function MediaControlsRow() {
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Check streaming status periodically
  React.useEffect(() => {
    if (!isNativeStreamingAvailable()) return;

    const checkStatus = async () => {
      try {
        const status = await getNativeStreamStatus();
        setIsStreaming(status.active);
      } catch (e) {
        // Ignore errors
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={css.MediaControlsRow}>
        <button
          className={css.MediaBtn}
          disabled
          title="Video (Coming Soon)"
        >
          <VideoIcon />
        </button>
        
        <button
          className={classNames(css.MediaBtn, { [css.MediaBtnActive]: isStreaming })}
          onClick={() => setShowStreamModal(true)}
          title={isStreaming ? "Streaming" : "Share Screen"}
        >
          {isStreaming ? <ScreenShareActiveIcon /> : <ScreenShareIcon />}
        </button>
        
        <button
          className={css.MediaBtn}
          disabled
          title="Soundboard (Coming Soon)"
        >
          <SoundboardIcon />
        </button>
        
        <button
          className={css.MediaBtn}
          disabled
          title="Activities (Coming Soon)"
        >
          <ActivitiesIcon />
        </button>
      </div>

      {showStreamModal && <StreamingModal onClose={() => setShowStreamModal(false)} />}
    </>
  );
}
