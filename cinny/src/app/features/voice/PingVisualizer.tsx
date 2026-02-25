import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import { useLiveKitContext } from './LiveKitContext';
import { usePingStats } from './usePingStats';
import { ConnectionStatsModal } from './ConnectionStatsModal';
import * as css from './voicePanel.css';

interface TooltipPosition {
  top: number;
  left: number;
}

export function PingVisualizer() {
  const { connectionQuality } = useLiveKitContext();
  const pingStats = usePingStats(connectionQuality);
  const [showModal, setShowModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const dotRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (dotRef.current) {
      const rect = dotRef.current.getBoundingClientRect();
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
        ref={dotRef}
        className={classNames(css.PingDot, {
          [css.PingDotPulsing]: pingStats.quality === 'excellent',
        })}
        style={{ backgroundColor: pingStats.color }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={`Connection: ${pingStats.label}, ${pingStats.ping}ms ping`}
      />
      
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
