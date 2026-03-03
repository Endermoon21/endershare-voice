import React, { MouseEventHandler, ReactNode, useCallback, useRef, useState } from 'react';
import { useLiveKitContext } from '../voice';
import {
  Box,
  Avatar,
  Text,
  Chip,
  Icon,
  Icons,
  as,
  Badge,
  toRem,
  Spinner,
  PopOut,
  Menu,
  MenuItem,
  RectCords,
  config,
  Modal,
  Overlay,
  OverlayBackdrop,
  OverlayCenter,
  IconButton,
  Input,
  Button,
  Scroll,
  color,
} from 'folds';
import FocusTrap from 'focus-trap-react';
import classNames from 'classnames';
import { MatrixError, Room } from 'matrix-js-sdk';
import { IHierarchyRoom } from 'matrix-js-sdk/lib/@types/spaces';
import { HierarchyItem } from '../../hooks/useSpaceHierarchy';
import { useMatrixClient } from '../../hooks/useMatrixClient';
import { RoomAvatar } from '../../components/room-avatar';
import { nameInitials } from '../../utils/common';
import { LocalRoomSummaryLoader } from '../../components/RoomSummaryLoader';
import { getRoomAvatarUrl } from '../../utils/room';
import { AsyncStatus, useAsyncCallback } from '../../hooks/useAsyncCallback';
import * as css from './SpaceItem.css';
import * as styleCss from './style.css';
import { useDraggableItem } from './DnD';
import { stopPropagation } from '../../utils/keyboard';
import { mxcUrlToHttp } from '../../utils/matrix';
import { useMediaAuthentication } from '../../hooks/useMediaAuthentication';
import { useOpenCreateRoomModal } from '../../state/hooks/createRoomModal';
import { useOpenCreateSpaceModal } from '../../state/hooks/createSpaceModal';
import { AddExistingModal } from '../add-existing';

function SpaceProfileLoading() {
  return (
    <Box gap="200" alignItems="Center">
      <Box grow="Yes" gap="200" alignItems="Center" className={css.HeaderChipPlaceholder}>
        <Avatar className={styleCss.AvatarPlaceholder} size="200" radii="300" />
        <Box
          className={styleCss.LinePlaceholder}
          shrink="No"
          style={{ width: '100vw', maxWidth: toRem(120) }}
        />
      </Box>
    </Box>
  );
}

type InaccessibleSpaceProfileProps = {
  roomId: string;
  suggested?: boolean;
};
function InaccessibleSpaceProfile({ roomId, suggested }: InaccessibleSpaceProfileProps) {
  return (
    <Chip
      as="span"
      className={css.HeaderChip}
      variant="Surface"
      size="500"
      before={
        <Avatar size="200" radii="300">
          <RoomAvatar
            roomId={roomId}
            renderFallback={() => (
              <Text as="span" size="H6">
                U
              </Text>
            )}
          />
        </Avatar>
      }
    >
      <Box alignItems="Center" gap="200">
        <Text size="H4" truncate>
          Unknown
        </Text>

        <Badge variant="Secondary" fill="Soft" radii="Pill" outlined>
          <Text size="L400">Inaccessible</Text>
        </Badge>
        {suggested && (
          <Badge variant="Success" fill="Soft" radii="Pill" outlined>
            <Text size="L400">Suggested</Text>
          </Badge>
        )}
      </Box>
    </Chip>
  );
}

type UnjoinedSpaceProfileProps = {
  roomId: string;
  via?: string[];
  name?: string;
  avatarUrl?: string;
  suggested?: boolean;
};
function UnjoinedSpaceProfile({
  roomId,
  via,
  name,
  avatarUrl,
  suggested,
}: UnjoinedSpaceProfileProps) {
  const mx = useMatrixClient();

  const [joinState, join] = useAsyncCallback<Room, MatrixError, []>(
    useCallback(() => mx.joinRoom(roomId, { viaServers: via }), [mx, roomId, via])
  );

  const canJoin = joinState.status === AsyncStatus.Idle || joinState.status === AsyncStatus.Error;
  return (
    <Chip
      className={css.HeaderChip}
      variant="Surface"
      size="500"
      onClick={join}
      disabled={!canJoin}
      before={
        <Avatar size="200" radii="300">
          <RoomAvatar
            roomId={roomId}
            src={avatarUrl}
            alt={name}
            renderFallback={() => (
              <Text as="span" size="H6">
                {nameInitials(name)}
              </Text>
            )}
          />
        </Avatar>
      }
      after={
        canJoin ? <Icon src={Icons.Plus} size="50" /> : <Spinner variant="Secondary" size="200" />
      }
    >
      <Box alignItems="Center" gap="200">
        <Text size="H4" truncate>
          {name || 'Unknown'}
        </Text>
        {suggested && (
          <Badge variant="Success" fill="Soft" radii="Pill" outlined>
            <Text size="L400">Suggested</Text>
          </Badge>
        )}
        {joinState.status === AsyncStatus.Error && (
          <Badge variant="Critical" fill="Soft" radii="Pill" outlined>
            <Text size="L400" truncate>
              {joinState.error.name}
            </Text>
          </Badge>
        )}
      </Box>
    </Chip>
  );
}

type SpaceProfileProps = {
  roomId: string;
  name: string;
  avatarUrl?: string;
  suggested?: boolean;
  closed: boolean;
  categoryId: string;
  handleClose?: MouseEventHandler<HTMLButtonElement>;
};
function SpaceProfile({
  roomId,
  name,
  avatarUrl,
  suggested,
  closed,
  categoryId,
  handleClose,
}: SpaceProfileProps) {
  return (
    <Chip
      data-category-id={categoryId}
      onClick={handleClose}
      className={css.HeaderChip}
      variant="Surface"
      size="500"
      before={
        <Avatar size="200" radii="300">
          <RoomAvatar
            roomId={roomId}
            src={avatarUrl}
            alt={name}
            renderFallback={() => (
              <Text as="span" size="H6">
                {nameInitials(name)}
              </Text>
            )}
          />
        </Avatar>
      }
      after={<Icon src={closed ? Icons.ChevronRight : Icons.ChevronBottom} size="50" />}
    >
      <Box alignItems="Center" gap="200">
        <Text size="H4" truncate>
          {name}
        </Text>
        {suggested && (
          <Badge variant="Success" fill="Soft" radii="Pill" outlined>
            <Text size="L400">Suggested</Text>
          </Badge>
        )}
      </Box>
    </Chip>
  );
}

type RootSpaceProfileProps = {
  closed: boolean;
  categoryId: string;
  handleClose?: MouseEventHandler<HTMLButtonElement>;
};
function RootSpaceProfile({ closed, categoryId, handleClose }: RootSpaceProfileProps) {
  return (
    <Chip
      data-category-id={categoryId}
      onClick={handleClose}
      className={css.HeaderChip}
      variant="Surface"
      size="500"
      after={<Icon src={closed ? Icons.ChevronRight : Icons.ChevronBottom} size="50" />}
    >
      <Box alignItems="Center" gap="200">
        <Text size="H4" truncate>
          Rooms
        </Text>
      </Box>
    </Chip>
  );
}

function AddRoomButton({ item }: { item: HierarchyItem }) {
  const [cords, setCords] = useState<RectCords>();
  const openCreateRoomModal = useOpenCreateRoomModal();
  const [addExisting, setAddExisting] = useState(false);

  const handleAddRoom: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleCreateRoom = () => {
    openCreateRoomModal(item.roomId);
    setCords(undefined);
  };

  const handleAddExisting = () => {
    setAddExisting(true);
    setCords(undefined);
  };

  return (
    <PopOut
      anchor={cords}
      position="Bottom"
      align="End"
      content={
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            onDeactivate: () => setCords(undefined),
            clickOutsideDeactivates: true,
            isKeyForward: (evt: KeyboardEvent) => evt.key === 'ArrowDown',
            isKeyBackward: (evt: KeyboardEvent) => evt.key === 'ArrowUp',
            escapeDeactivates: stopPropagation,
          }}
        >
          <Menu style={{ padding: config.space.S100 }}>
            <MenuItem
              size="300"
              radii="300"
              variant="Primary"
              fill="None"
              onClick={handleCreateRoom}
            >
              <Text size="T300">New Room</Text>
            </MenuItem>
            <MenuItem size="300" radii="300" fill="None" onClick={handleAddExisting}>
              <Text size="T300">Existing Room</Text>
            </MenuItem>
          </Menu>
        </FocusTrap>
      }
    >
      <Chip
        variant="Primary"
        radii="Pill"
        before={<Icon src={Icons.Plus} size="50" />}
        onClick={handleAddRoom}
        aria-pressed={!!cords}
      >
        <Text size="B300">Add Room</Text>
      </Chip>
      {addExisting && (
        <AddExistingModal parentId={item.roomId} requestClose={() => setAddExisting(false)} />
      )}
    </PopOut>
  );
}

function AddSpaceButton({ item }: { item: HierarchyItem }) {
  const [cords, setCords] = useState<RectCords>();
  const openCreateSpaceModal = useOpenCreateSpaceModal();
  const [addExisting, setAddExisting] = useState(false);

  const handleAddSpace: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleCreateSpace = () => {
    openCreateSpaceModal(item.roomId as any);
    setCords(undefined);
  };

  const handleAddExisting = () => {
    setAddExisting(true);
    setCords(undefined);
  };
  return (
    <PopOut
      anchor={cords}
      position="Bottom"
      align="End"
      content={
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            onDeactivate: () => setCords(undefined),
            clickOutsideDeactivates: true,
            isKeyForward: (evt: KeyboardEvent) => evt.key === 'ArrowDown',
            isKeyBackward: (evt: KeyboardEvent) => evt.key === 'ArrowUp',
            escapeDeactivates: stopPropagation,
          }}
        >
          <Menu style={{ padding: config.space.S100 }}>
            <MenuItem
              size="300"
              radii="300"
              variant="Primary"
              fill="None"
              onClick={handleCreateSpace}
            >
              <Text size="T300">New Space</Text>
            </MenuItem>
            <MenuItem size="300" radii="300" fill="None" onClick={handleAddExisting}>
              <Text size="T300">Existing Space</Text>
            </MenuItem>
          </Menu>
        </FocusTrap>
      }
    >
      <Chip
        variant="SurfaceVariant"
        radii="Pill"
        before={<Icon src={Icons.Plus} size="50" />}
        onClick={handleAddSpace}
        aria-pressed={!!cords}
      >
        <Text size="B300">Add Space</Text>
      </Chip>
      {addExisting && (
        <AddExistingModal space parentId={item.roomId} requestClose={() => setAddExisting(false)} />
      )}
    </PopOut>
  );
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

function AddVoiceChannelButton() {
  const mx = useMatrixClient();
  const { connect, setShowVoiceView } = useLiveKitContext();
  const [showModal, setShowModal] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [bitrate, setBitrate] = useState(64000);
  const [userLimit, setUserLimit] = useState(0);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = mx.getUserId() || '';

  const handleClose = () => {
    setShowModal(false);
    setChannelName('');
    setBitrate(64000);
    setUserLimit(0);
    setError(null);
  };

  const handleCreate = async () => {
    if (!channelName.trim()) return;
    setCreating(true);
    setError(null);
    const name = channelName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const displayName = channelName.trim();
    try {
      const response = await fetch('https://token.endershare.org/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, displayName, bitrate, userLimit }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create channel');
      }
      await connect(name, userId);
      setShowVoiceView(true);
      handleClose();
    } catch (e) {
      setError((e as Error).message);
      setCreating(false);
    }
  };

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
    <>
      <Chip
        variant="SurfaceVariant"
        radii="Pill"
        before={<Icon src={Icons.Plus} size="50" />}
        onClick={() => setShowModal(true)}
      >
        <Text size="B300">Add Voice Channel</Text>
      </Chip>
      {showModal && (
        <Overlay open backdrop={<OverlayBackdrop />}>
          <OverlayCenter>
            <FocusTrap
              focusTrapOptions={{
                initialFocus: false,
                clickOutsideDeactivates: true,
                onDeactivate: handleClose,
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
                  <Text size="H4">Create Voice Channel</Text>
                  <IconButton onClick={handleClose} size="300" variant="Surface">
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
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !creating && channelName.trim() && handleCreate()}
                        placeholder="Enter channel name"
                        autoFocus
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
                  <Button variant="Secondary" size="400" onClick={handleClose}>
                    <Text size="B400">Cancel</Text>
                  </Button>
                  <Button
                    variant="Primary"
                    size="400"
                    onClick={handleCreate}
                    disabled={creating || !channelName.trim()}
                    before={creating ? <Spinner size="100" variant="Primary" fill="Solid" /> : undefined}
                  >
                    <Text size="B400">{creating ? 'Creating...' : 'Create'}</Text>
                  </Button>
                </Box>
              </Modal>
            </FocusTrap>
          </OverlayCenter>
        </Overlay>
      )}
    </>
  );
}

type SpaceItemCardProps = {
  summary: IHierarchyRoom | undefined;
  loading?: boolean;
  item: HierarchyItem;
  joined?: boolean;
  categoryId: string;
  closed: boolean;
  handleClose?: MouseEventHandler<HTMLButtonElement>;
  options?: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  canEditChild: boolean;
  canReorder: boolean;
  onDragging: (item?: HierarchyItem) => void;
  getRoom: (roomId: string) => Room | undefined;
};
export const SpaceItemCard = as<'div', SpaceItemCardProps>(
  (
    {
      className,
      summary,
      loading,
      joined,
      closed,
      categoryId,
      item,
      handleClose,
      options,
      before,
      after,
      canEditChild,
      canReorder,
      onDragging,
      getRoom,
      ...props
    },
    ref
  ) => {
    const mx = useMatrixClient();
    const useAuthentication = useMediaAuthentication();
    const { roomId, content } = item;
    const space = getRoom(roomId);
    const targetRef = useRef<HTMLDivElement>(null);
    useDraggableItem(item, targetRef, onDragging);

    return (
      <Box
        shrink="No"
        alignItems="Center"
        gap="200"
        className={classNames(css.SpaceItemCard({ outlined: !joined || closed }), className)}
        {...props}
        ref={ref}
      >
        {before}
        <Box grow="Yes" gap="100" alignItems="Inherit" justifyContent="SpaceBetween">
          <Box ref={canReorder ? targetRef : null}>
            {space ? (
              <LocalRoomSummaryLoader room={space}>
                {(localSummary) =>
                  item.parentId ? (
                    <SpaceProfile
                      roomId={roomId}
                      name={localSummary.name}
                      avatarUrl={getRoomAvatarUrl(mx, space, 96, useAuthentication)}
                      suggested={content.suggested}
                      closed={closed}
                      categoryId={categoryId}
                      handleClose={handleClose}
                    />
                  ) : (
                    <RootSpaceProfile
                      closed={closed}
                      categoryId={categoryId}
                      handleClose={handleClose}
                    />
                  )
                }
              </LocalRoomSummaryLoader>
            ) : (
              <>
                {!summary &&
                  (loading ? (
                    <SpaceProfileLoading />
                  ) : (
                    <InaccessibleSpaceProfile
                      roomId={item.roomId}
                      suggested={item.content.suggested}
                    />
                  ))}
                {summary && (
                  <UnjoinedSpaceProfile
                    roomId={roomId}
                    via={item.content.via}
                    name={summary.name || summary.canonical_alias || roomId}
                    avatarUrl={
                      summary?.avatar_url
                        ? mxcUrlToHttp(mx, summary.avatar_url, useAuthentication, 96, 96, 'crop') ??
                          undefined
                        : undefined
                    }
                    suggested={content.suggested}
                  />
                )}
              </>
            )}
          </Box>
          {space && canEditChild && (
            <Box shrink="No" alignItems="Inherit" gap="200">
              <AddRoomButton item={item} />
              {item.parentId === undefined && <AddSpaceButton item={item} />}
              {item.parentId === undefined && <AddVoiceChannelButton />}
            </Box>
          )}
        </Box>
        {options}
        {after}
      </Box>
    );
  }
);
