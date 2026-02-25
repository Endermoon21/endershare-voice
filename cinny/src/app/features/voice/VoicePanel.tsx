import React, { useState } from 'react';
import { Box } from 'folds';
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

  return (
    <Box className={css.VoicePanel} direction="Column">
      {/* VoiceBanner only shows when connected and no settings are open */}
      {isConnected && !isAnySettingsOpen && <VoiceBanner />}
      
      {/* UserBanner is always visible */}
      <UserBanner onSettingsChange={setIsUserSettingsOpen} />
    </Box>
  );
}
