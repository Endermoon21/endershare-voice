import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import FocusTrap from 'focus-trap-react';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import * as css from './voicePanel.css';

// Icons
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  </svg>
);

const SwitchAccountIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
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
        zIndex: 9999,
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
