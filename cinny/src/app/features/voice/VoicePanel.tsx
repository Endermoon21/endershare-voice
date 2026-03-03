import React, { useState } from 'react';
import { Box, Portal } from 'folds';
import { useLiveKitContext } from './LiveKitContext';
import { useRoomSettingsState } from '../../state/hooks/roomSettings';
import { useSpaceSettingsState } from '../../state/hooks/spaceSettings';
import { VoiceBanner } from './VoiceBanner';
import { UserBanner } from './UserBanner';
import * as css from './voicePanel.css';

export function VoicePanel() {
  const { isConnected } = useLiveKitContext();

  // Check if room/space settings panel is open (these overlap with the panel)
  const roomSettingsState = useRoomSettingsState();
  const spaceSettingsState = useSpaceSettingsState();
  const isSettingsPanelOpen = !!roomSettingsState || !!spaceSettingsState;

  // Hide entire panel when room/space settings are open to avoid z-index conflicts
  if (isSettingsPanelOpen) {
    return null;
  }

  // Render via Portal to ensure proper z-index stacking with folds modals
  return (
    <Portal>
      <Box className={css.VoicePanel} direction="Column">
        {/* VoiceBanner only shows when connected */}
        {isConnected && <VoiceBanner />}

        {/* UserBanner */}
        <UserBanner />
      </Box>
    </Portal>
  );
}
