import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import * as css from './voicePanel.css';

// Discord-style filled icons
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6876L10.3085 18.8104L18.0192 11.0996L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.0469 4.11851 20.9704Z" />
  </svg>
);

const SwitchAccountIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
    <path d="M19 8L21 10L16 15L14 13L19 8Z" opacity="0.6" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.29 6.71a.996.996 0 0 0 0 1.41L13.17 12l-3.88 3.88a.996.996 0 1 0 1.41 1.41l4.59-4.59a.996.996 0 0 0 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01Z" />
  </svg>
);

interface UserProfilePopupProps {
  anchorRect: DOMRect | null;
  onClose: () => void;
}

type PresenceStatus = 'online' | 'away' | 'dnd' | 'offline';

const STATUS_COLORS: Record<PresenceStatus, string> = {
  online: '#23a55a',
  away: '#f0b232',
  dnd: '#f23f43',
  offline: '#949ba4',
};

const STATUS_LABELS: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do Not Disturb',
  offline: 'Invisible',
};

export function UserProfilePopup({ anchorRect, onClose }: UserProfilePopupProps) {
  const mx = useMatrixClient();
  const userId = mx.getUserId() || '';
  const [currentStatus, setCurrentStatus] = useState<PresenceStatus>('online');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHoveringCopy, setIsHoveringCopy] = useState(false);

  const style: React.CSSProperties = anchorRect
    ? {
        position: 'fixed',
        bottom: window.innerHeight - anchorRect.top + 8,
        left: anchorRect.left,
        zIndex: 50,
      }
    : {};

  const handleEditProfile = useCallback(() => {
    // This would open the profile editor
    // For now, just close the popup
    onClose();
    // TODO: Navigate to profile settings
  }, [onClose]);

  const handleSwitchAccounts = useCallback(() => {
    // This would open the account switcher
    onClose();
    // TODO: Implement account switching
  }, [onClose]);

  const handleCopyMatrixId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [userId]);

  const handleStatusChange = useCallback((status: PresenceStatus) => {
    setCurrentStatus(status);
    setShowStatusMenu(false);
    // TODO: Actually update Matrix presence
  }, []);

  return (
    <FocusTrap
      focusTrapOptions={{
        initialFocus: false,
        clickOutsideDeactivates: true,
        onDeactivate: onClose,
        escapeDeactivates: true,
      }}
    >
      <div className={css.ProfilePopup} style={style}>
        {/* Edit Profile */}
        <div
          className={css.ProfileItem}
          onClick={handleEditProfile}
          role="menuitem"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleEditProfile()}
        >
          <span className={css.ProfileItemIcon}>
            <EditIcon />
          </span>
          <span className={css.ProfileItemLabel}>Edit Profile</span>
        </div>

        {/* Status Selector */}
        <div
          className={css.ProfileStatusSelector}
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          role="menuitem"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setShowStatusMenu(!showStatusMenu)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              className={css.ProfileStatusDot}
              style={{ backgroundColor: STATUS_COLORS[currentStatus] }}
            />
            <span className={css.ProfileItemLabel}>{STATUS_LABELS[currentStatus]}</span>
          </div>
          <ChevronRightIcon />
        </div>

        {/* Status submenu */}
        {showStatusMenu && (
          <div style={{ paddingLeft: '28px' }}>
            {(Object.keys(STATUS_COLORS) as PresenceStatus[]).map((status) => (
              <div
                key={status}
                className={css.ProfileItem}
                onClick={() => handleStatusChange(status)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleStatusChange(status)}
                style={{ padding: '6px 10px' }}
              >
                <span
                  className={css.ProfileStatusDot}
                  style={{
                    backgroundColor: STATUS_COLORS[status],
                    width: '8px',
                    height: '8px',
                    marginRight: '8px',
                  }}
                />
                <span className={css.ProfileItemLabel} style={{ fontSize: '13px' }}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Switch Accounts */}
        <div
          className={css.ProfileItem}
          onClick={handleSwitchAccounts}
          role="menuitem"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSwitchAccounts()}
        >
          <span className={css.ProfileItemIcon}>
            <SwitchAccountIcon />
          </span>
          <span className={css.ProfileItemLabel}>Switch Accounts</span>
        </div>

        {/* Copy Matrix ID */}
        <div
          className={classNames(css.ProfileItem, css.ProfileItemWithCopy)}
          onClick={handleCopyMatrixId}
          onMouseEnter={() => setIsHoveringCopy(true)}
          onMouseLeave={() => setIsHoveringCopy(false)}
          role="menuitem"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCopyMatrixId()}
        >
          <span className={css.ProfileItemLabel} style={{ flex: 1 }}>
            {copied ? 'Copied!' : userId}
          </span>
          <span
            className={css.ProfileCopyIcon}
            style={{ opacity: isHoveringCopy ? 1 : 0 }}
          >
            <CopyIcon />
          </span>
        </div>
      </div>
    </FocusTrap>
  );
}
