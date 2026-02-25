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

// Icons
const GamepadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <circle cx="15" cy="13" r="1" />
    <circle cx="18" cy="10" r="1" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
);

const LiveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
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
