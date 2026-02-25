/**
 * UpdateBanner - Clean, non-blocking update notification
 */
import React, { useState, useEffect, useCallback } from 'react';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

type UpdateStatus = 'checking' | 'available' | 'downloading' | 'ready' | 'none' | 'error';

interface UpdateState {
  status: UpdateStatus;
  version?: string;
  progress?: number;
  error?: string;
}

export function UpdateBanner() {
  const [state, setState] = useState<UpdateState>({ status: 'checking' });
  const [dismissed, setDismissed] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (!isTauri) {
      setState({ status: 'none' });
      return;
    }

    try {
      const tauri = (window as any).__TAURI__;
      if (!tauri?.updater) {
        setState({ status: 'none' });
        return;
      }

      const { shouldUpdate, manifest } = await tauri.updater.checkUpdate();
      
      if (shouldUpdate && manifest) {
        setState({ status: 'available', version: manifest.version });
      } else {
        setState({ status: 'none' });
      }
    } catch (e: any) {
      console.error('[Update] Check failed:', e);
      setState({ status: 'none' });
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!isTauri) return;

    setState(s => ({ ...s, status: 'downloading', progress: 0 }));

    try {
      const tauri = (window as any).__TAURI__;
      
      let unlisten: (() => void) | undefined;
      if (tauri.event?.listen) {
        unlisten = await tauri.event.listen('tauri://update-download-progress', (event: any) => {
          const { chunkLength, contentLength } = event.payload;
          if (contentLength > 0) {
            setState(s => ({ ...s, progress: Math.round((chunkLength / contentLength) * 100) }));
          }
        });
      }

      await tauri.updater.installUpdate();
      if (unlisten) unlisten();
      
      setState(s => ({ ...s, status: 'ready' }));
      
      setTimeout(async () => {
        if (tauri.process?.relaunch) {
          await tauri.process.relaunch();
        }
      }, 1500);
    } catch (e: any) {
      console.error('[Update] Install failed:', e);
      setState({ status: 'error', error: e.message || 'Update failed' });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkForUpdate, 500);
    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  if (dismissed || state.status === 'none' || state.status === 'checking') {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes updateSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes updateSpin {
          to { transform: rotate(360deg); }
        }
        .update-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          animation: updateSlideDown 0.3s ease-out;
        }
        .update-banner.available { background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%); }
        .update-banner.downloading { background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%); }
        .update-banner.ready { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
        .update-banner.error { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); }
        .update-btn {
          padding: 6px 14px;
          border-radius: 4px;
          border: none;
          background: rgba(255,255,255,0.2);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .update-btn:hover { background: rgba(255,255,255,0.3); }
        .update-close {
          padding: 4px 8px;
          background: transparent;
          opacity: 0.7;
        }
        .update-spinner {
          animation: updateSpin 1s linear infinite;
        }
      `}</style>
      <div className={`update-banner ${state.status}`}>
        {state.status === 'available' && (
          <>
            <span>Update v{state.version} available</span>
            <button className="update-btn" onClick={installUpdate}>Update Now</button>
            <button className="update-btn update-close" onClick={() => setDismissed(true)}>✕</button>
          </>
        )}
        
        {state.status === 'downloading' && (
          <>
            <svg className="update-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
            <span>Downloading... {state.progress ? `${state.progress}%` : ''}</span>
          </>
        )}
        
        {state.status === 'ready' && <span>✓ Installed! Restarting...</span>}
        
        {state.status === 'error' && (
          <>
            <span>Update failed: {state.error}</span>
            <button className="update-btn" onClick={checkForUpdate}>Retry</button>
            <button className="update-btn update-close" onClick={() => setDismissed(true)}>✕</button>
          </>
        )}
      </div>
    </>
  );
}

export default UpdateBanner;
