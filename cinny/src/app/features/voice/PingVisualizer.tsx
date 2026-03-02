import React, { useState, useRef } from 'react';
import { useLiveKitContext } from './LiveKitContext';
import { usePingStats } from './usePingStats';
import { ConnectionStatsModal } from './ConnectionStatsModal';
import * as css from './voicePanel.css';

interface TooltipPosition {
  top: number;
  left: number;
}

// Signal strength icon with dynamic bars
function SignalIcon({ quality, color }: { quality: string; color: string }) {
  // Number of active bars based on quality
  const activeBars = {
    excellent: 4,
    good: 3,
    poor: 2,
    bad: 1,
    unknown: 0,
  }[quality] || 0;

  const barHeights = [4, 7, 10, 13]; // Heights for each bar
  const barWidth = 3;
  const gap = 2;
  const totalWidth = (barWidth * 4) + (gap * 3); // 4 bars + 3 gaps
  const totalHeight = 14;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      className={css.SignalIcon}
    >
      {barHeights.map((height, index) => {
        const isActive = index < activeBars;
        const x = index * (barWidth + gap);
        const y = totalHeight - height;

        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={height}
            rx={1}
            fill={isActive ? color : 'rgba(255, 251, 222, 0.15)'}
            style={{
              transition: 'fill 0.3s ease',
            }}
          />
        );
      })}
    </svg>
  );
}

export function PingVisualizer() {
  const { connectionQuality } = useLiveKitContext();
  const pingStats = usePingStats(connectionQuality);
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 36,
        left: rect.left + rect.width / 2,
      });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = () => {
    setShowModal(true);
    setShowTooltip(false);
  };

  return (
    <>
      <div
        ref={iconRef}
        className={css.SignalIconWrapper}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={`Connection: ${pingStats.label}, ${pingStats.ping}ms ping`}
      >
        <SignalIcon quality={pingStats.quality} color={pingStats.color} />
      </div>

      {showTooltip && (
        <div
          className={css.PingTooltip}
          style={{
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {pingStats.ping > 0 ? `${pingStats.ping}ms` : 'Connecting...'}
        </div>
      )}

      {showModal && (
        <ConnectionStatsModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
