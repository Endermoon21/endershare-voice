/**
 * Game Stream Button - Opens the streaming modal
 */

import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { StreamingModal } from "./StreamingModal";
import {
  isNativeStreamingAvailable,
  getNativeStreamStatus,
} from "./nativeStreaming";
import * as css from "./voicePanel.css";

// Discord-style filled icons
const GamepadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5ZM9 13H7v-2H6v2H4v-2h2V9h2v2h2v2h-1Zm6 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
  </svg>
);

const LiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Z" opacity="0.4" />
  </svg>
);

interface GameStreamButtonProps {
  className?: string;
}

export function GameStreamButton({ className }: GameStreamButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Check if currently streaming
  useEffect(() => {
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
      <button
        className={classNames(css.MediaBtn, className, {
          [css.MediaBtnActive]: isStreaming,
        })}
        onClick={() => setShowModal(true)}
        title={isStreaming ? "Streaming" : "Start Game Stream"}
      >
        {isStreaming ? <LiveIcon /> : <GamepadIcon />}
      </button>

      {showModal && <StreamingModal onClose={() => setShowModal(false)} />}
    </>
  );
}
