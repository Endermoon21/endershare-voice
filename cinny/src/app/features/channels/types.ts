// Unified channel types for text and voice channels

export type ChannelType = 'text' | 'voice';

export interface UnifiedChannel {
  type: ChannelType;
  id: string; // roomId for text, room name for voice
  name: string;
  order: number;
}

export interface UnifiedCategory {
  id: string;
  name: string;
  collapsed: boolean;
  channels: UnifiedChannel[];
  order: number;
}

export interface ChannelLayout {
  spaceId: string;
  categories: UnifiedCategory[];
  version: number; // For conflict resolution
}

// Voice room info from token server
export interface VoiceRoom {
  name: string;
  displayName: string;
  icon: string;
  numParticipants: number;
  active: boolean;
  bitrate?: number;
  userLimit?: number;
  participants?: Array<{ identity: string; name: string }>;
  categoryId?: string; // Which category this voice room belongs to
}

// API request/response types
export interface ChannelLayoutResponse {
  success: boolean;
  layout: ChannelLayout | null;
}

export interface UpdateChannelLayoutRequest {
  spaceId: string;
  categories: UnifiedCategory[];
}

export interface MoveChannelRequest {
  spaceId: string;
  channelId: string;
  channelType: ChannelType;
  fromCategoryId: string;
  toCategoryId: string;
  newOrder: number;
}

export interface ReorderChannelRequest {
  spaceId: string;
  categoryId: string;
  channelId: string;
  channelType: ChannelType;
  newOrder: number;
}

// Drag-drop types
export type DragItemType = 'category' | 'channel';

export interface DragItem {
  type: DragItemType;
  id: string;
  categoryId?: string; // For channels, which category they belong to
  channelType?: ChannelType; // For channels
}

export type DropInstruction =
  | 'reorder-above'
  | 'reorder-below'
  | 'make-child' // Drop into category
  | 'move-to-category';

export interface DropTarget {
  item: DragItem;
  instruction: DropInstruction;
}
