import React, { useState, useEffect, useCallback } from 'react';
import { Box } from 'folds';
import { SidebarItem, SidebarItemTooltip } from '../../../components/sidebar';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

interface UpdateInfo {
  version: string;
  notes: string;
}

export function UpdateTab() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (!isTauri) return;
    try {
      const tauri = (window as any).__TAURI__;
      if (!tauri?.updater) return;
      const { shouldUpdate, manifest } = await tauri.updater.checkUpdate();
      if (shouldUpdate && manifest) {
        setUpdateAvailable(true);
        setUpdateInfo({ version: manifest.version, notes: manifest.body || 'New version' });
      }
    } catch (e) { 
      console.error('[Update] Check failed:', e); 
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!isTauri || isUpdating) return;
    setIsUpdating(true);
    try {
      const tauri = (window as any).__TAURI__;
      if (!tauri?.updater) return;
      await tauri.updater.installUpdate();
      if (tauri.process) {
        await tauri.process.relaunch();
      }
    } catch (e) {
      console.error('[Update] Install failed:', e);
      setIsUpdating(false);
    }
  }, [isUpdating]);

  useEffect(() => {
    checkForUpdate();
    const interval = setInterval(checkForUpdate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkForUpdate]);

  if (!isTauri || !updateAvailable) return null;

  const tooltipText = isUpdating ? 'Downloading...' : `Update to v${updateInfo?.version}`;

  return (
    <SidebarItem active={false}>
      <SidebarItemTooltip tooltip={tooltipText}>
        {(triggerRef) => (
          <Box
            as="button"
            ref={triggerRef}
            onClick={installUpdate}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isUpdating ? 'rgba(88, 101, 242, 0.15)' : 'rgba(35, 165, 90, 0.15)',
              cursor: isUpdating ? 'wait' : 'pointer',
              color: isUpdating ? '#5865f2' : '#23a55a',
            }}
          >
            {isUpdating ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"/>
                <path d="M12 2v4c3.31 0 6 2.69 6 6h4c0-5.52-4.48-10-10-10z">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                </path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
            )}
          </Box>
        )}
      </SidebarItemTooltip>
    </SidebarItem>
  );
}
