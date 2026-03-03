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
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);

  // Check if any settings panel is open
  const roomSettingsState = useRoomSettingsState();
  const spaceSettingsState = useSpaceSettingsState();
  const isAnySettingsOpen = !!roomSettingsState || !!spaceSettingsState || isUserSettingsOpen;

  // Hide entire panel when any settings/modal is open to avoid z-index conflicts
  if (isAnySettingsOpen) {
    return null;
  }

  // Render via Portal to ensure proper z-index stacking with folds modals
  return (
    <Portal>
      <Box className={css.VoicePanel} direction="Column">
        {/* VoiceBanner only shows when connected */}
        {isConnected && <VoiceBanner />}

        {/* UserBanner */}
        <UserBanner onSettingsChange={setIsUserSettingsOpen} />
      </Box>
    </Portal>
  );
}
