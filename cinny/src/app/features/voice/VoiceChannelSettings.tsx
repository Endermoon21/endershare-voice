import React, { useState, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import {
  Box,
  Button,
  config,
  Icon,
  IconButton,
  Icons,
  Input,
  Modal,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  Scroll,
  Spinner,
  Text,
  color,
} from 'folds';
import { stopPropagation } from '../../utils/keyboard';
import { useLiveKitContext } from './LiveKitContext';

const TOKEN_SERVER_URL = 'https://token.endershare.org';

interface VoiceRoom {
  name: string;
  displayName: string;
  icon: string;
  bitrate?: number;
  userLimit?: number;
}

const BITRATE_OPTIONS = [
  { value: 8000, label: '8 kbps' },
  { value: 16000, label: '16 kbps' },
  { value: 32000, label: '32 kbps' },
  { value: 64000, label: '64 kbps (Default)' },
  { value: 96000, label: '96 kbps' },
  { value: 128000, label: '128 kbps' },
  { value: 256000, label: '256 kbps' },
  { value: 384000, label: '384 kbps' },
  { value: 510000, label: '510 kbps' },
];

type VoiceChannelSettingsProps = {
  room: VoiceRoom;
  requestClose: () => void;
  onRoomUpdated: () => void;
};

export function VoiceChannelSettings({ room, requestClose, onRoomUpdated }: VoiceChannelSettingsProps) {
  const { currentRoom, disconnect } = useLiveKitContext();
  const [displayName, setDisplayName] = useState(room.displayName);
  const [bitrate, setBitrate] = useState(room.bitrate || 64000);
  const [userLimit, setUserLimit] = useState(room.userLimit || 0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = displayName !== room.displayName ||
                     bitrate !== (room.bitrate || 64000) ||
                     userLimit !== (room.userLimit || 0);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${TOKEN_SERVER_URL}/rooms/${encodeURIComponent(room.name)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bitrate, userLimit }),
      });
      if (!response.ok) throw new Error('Failed to save');
      onRoomUpdated();
      requestClose();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }, [room.name, displayName, bitrate, userLimit, onRoomUpdated, requestClose]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${room.displayName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      if (currentRoom === room.name) disconnect();
      const response = await fetch(`${TOKEN_SERVER_URL}/rooms/${encodeURIComponent(room.name)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      onRoomUpdated();
      requestClose();
    } catch (e) {
      setError((e as Error).message);
      setDeleting(false);
    }
  }, [room.name, room.displayName, currentRoom, disconnect, onRoomUpdated, requestClose]);

  const selectStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: config.radii.R300,
    border: 'none',
    backgroundColor: color.Background.Container,
    color: color.Surface.OnContainer,
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    color: color.Secondary.Main,
    marginBottom: '8px',
  };

  return (
    <Overlay open backdrop={<OverlayBackdrop />}>
      <OverlayCenter>
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            clickOutsideDeactivates: true,
            onDeactivate: requestClose,
            escapeDeactivates: stopPropagation,
          }}
        >
          <Modal
            variant="Surface"
            style={{
              width: '420px',
              maxWidth: '90vw',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box
              shrink="No"
              alignItems="Center"
              justifyContent="SpaceBetween"
              style={{
                padding: config.space.S400,
                borderBottom: `1px solid ${color.Surface.ContainerLine}`,
              }}
            >
              <Text size="H4">Edit Channel</Text>
              <IconButton onClick={requestClose} size="300" variant="Surface">
                <Icon src={Icons.Cross} size="100" />
              </IconButton>
            </Box>

            {/* Content */}
            <Scroll hideTrack visibility="Hover" style={{ flexGrow: 1 }}>
              <Box direction="Column" gap="500" style={{ padding: config.space.S400 }}>
                {/* Channel Name */}
                <Box direction="Column">
                  <Text style={labelStyle}>Channel Name</Text>
                  <Input
                    variant="Background"
                    size="400"
                    radii="300"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter channel name"
                  />
                </Box>

                {/* Bitrate */}
                <Box direction="Column">
                  <Text style={labelStyle}>Bitrate</Text>
                  <Box
                    as="select"
                    value={bitrate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBitrate(parseInt(e.target.value))}
                    style={selectStyle}
                  >
                    {BITRATE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Box>
                  <Text size="T200" style={{ color: color.Secondary.Main, marginTop: '4px' }}>
                    Higher bitrate = better quality, more bandwidth
                  </Text>
                </Box>

                {/* User Limit */}
                <Box direction="Column">
                  <Text style={labelStyle}>User Limit</Text>
                  <Box alignItems="Center" gap="300">
                    <input
                      type="range"
                      min="0"
                      max="99"
                      value={userLimit}
                      onChange={(e) => setUserLimit(parseInt(e.target.value))}
                      style={{
                        flex: 1,
                        accentColor: color.Primary.Main,
                        height: '6px',
                      }}
                    />
                    <Text
                      size="T300"
                      style={{
                        minWidth: '80px',
                        textAlign: 'center',
                        padding: '6px 12px',
                        backgroundColor: color.Background.Container,
                        borderRadius: config.radii.R300,
                      }}
                    >
                      {userLimit === 0 ? 'No limit' : userLimit}
                    </Text>
                  </Box>
                </Box>

                {error && (
                  <Text style={{ color: color.Critical.Main }} size="T200">
                    {error}
                  </Text>
                )}

                {/* Delete Section */}
                <Box
                  direction="Column"
                  gap="200"
                  style={{
                    marginTop: config.space.S200,
                    padding: config.space.S300,
                    backgroundColor: 'rgba(242, 63, 67, 0.08)',
                    borderRadius: config.radii.R300,
                  }}
                >
                  <Box alignItems="Center" justifyContent="SpaceBetween">
                    <Box direction="Column" gap="100">
                      <Text size="T300" style={{ fontWeight: 600 }}>Delete Channel</Text>
                      <Text size="T200" style={{ color: color.Secondary.Main }}>
                        This action cannot be undone
                      </Text>
                    </Box>
                    <Button
                      variant="Critical"
                      size="300"
                      onClick={handleDelete}
                      disabled={deleting}
                      before={deleting ? <Spinner size="100" variant="Critical" fill="Solid" /> : undefined}
                    >
                      <Text size="B300">{deleting ? 'Deleting...' : 'Delete'}</Text>
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Scroll>

            {/* Footer */}
            <Box
              shrink="No"
              alignItems="Center"
              justifyContent="End"
              gap="200"
              style={{
                padding: config.space.S400,
                borderTop: `1px solid ${color.Surface.ContainerLine}`,
              }}
            >
              <Button variant="Secondary" size="400" onClick={requestClose}>
                <Text size="B400">Cancel</Text>
              </Button>
              <Button
                variant="Primary"
                size="400"
                onClick={handleSave}
                disabled={saving || !hasChanges || !displayName.trim()}
                before={saving ? <Spinner size="100" variant="Primary" fill="Solid" /> : undefined}
              >
                <Text size="B400">{saving ? 'Saving...' : 'Save'}</Text>
              </Button>
            </Box>
          </Modal>
        </FocusTrap>
      </OverlayCenter>
    </Overlay>
  );
}
