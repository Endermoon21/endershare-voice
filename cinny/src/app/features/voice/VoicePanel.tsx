import React from 'react';
import { Box, Portal } from 'folds';
import { useLiveKitContext } from './LiveKitContext';
import { VoiceBanner } from './VoiceBanner';
import { UserBanner } from './UserBanner';
import * as css from './voicePanel.css';

export function VoicePanel() {
  const { isConnected } = useLiveKitContext();

  // Render via Portal with z-index: 0 to stay below modals
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
