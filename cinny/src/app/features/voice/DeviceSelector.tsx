import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { AudioDevice } from './useDeviceSelection';
import * as css from './voicePanel.css';

// Icons
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface DeviceSelectorProps {
  type: 'input' | 'output';
  devices: AudioDevice[];
  activeDeviceId: string | null;
  onSelect: (deviceId: string) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export function DeviceSelector({
  type,
  devices,
  activeDeviceId,
  onSelect,
  onClose,
  anchorRect,
}: DeviceSelectorProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate position above the anchor
  const style: React.CSSProperties = anchorRect ? {
    position: 'fixed',
    bottom: window.innerHeight - anchorRect.top + 8,
    left: anchorRect.left,
    zIndex: 9999,
  } : {};

  const handleSelect = (deviceId: string) => {
    onSelect(deviceId);
    onClose();
  };

  return (
    <FocusTrap
      focusTrapOptions={{
        initialFocus: false,
        clickOutsideDeactivates: true,
        onDeactivate: onClose,
        escapeDeactivates: true,
      }}
    >
      <div ref={menuRef} className={css.DeviceMenu} style={style}>
        <div className={css.DeviceMenuHeader}>
          {type === 'input' ? 'Input Devices' : 'Output Devices'}
        </div>
        
        {devices.length === 0 ? (
          <div className={css.DeviceItem}>
            <span className={css.DeviceItemLabel}>No devices found</span>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.deviceId}
              className={classNames(css.DeviceItem, {
                [css.DeviceItemActive]: device.deviceId === activeDeviceId,
              })}
              onClick={() => handleSelect(device.deviceId)}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(device.deviceId)}
            >
              <span className={css.DeviceItemCheck}>
                {device.deviceId === activeDeviceId && <CheckIcon />}
              </span>
              <span className={css.DeviceItemLabel}>{device.label}</span>
            </div>
          ))
        )}
      </div>
    </FocusTrap>
  );
}
