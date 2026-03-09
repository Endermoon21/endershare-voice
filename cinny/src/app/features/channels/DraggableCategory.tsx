import React, { useRef, useCallback, ReactNode, MouseEventHandler } from 'react';
import { Box, Icon, Icons } from 'folds';
import classNames from 'classnames';
import { useDraggableChannel, useDropTarget, useDropTargetInstruction, ChannelDragData, wasDragOperation } from './useChannelDnD';
import * as css from './unifiedChannels.css';

// Drag handle grip icon (6 dots like Discord)
function DragGrip() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="6" cy="2" r="1.5" />
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="6" cy="7" r="1.5" />
      <circle cx="2" cy="12" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
    </svg>
  );
}

interface DraggableCategoryProps {
  id: string;
  name: string;
  collapsed: boolean;
  onToggle: () => void;
  onDragging: (item?: ChannelDragData) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function DraggableCategory({
  id,
  name,
  collapsed,
  onToggle,
  onDragging,
  disabled,
  children,
}: DraggableCategoryProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const aboveTargetRef = useRef<HTMLDivElement>(null);
  const belowTargetRef = useRef<HTMLDivElement>(null);

  const dragItem: ChannelDragData = {
    type: 'category',
    id,
  };

  // Use drag handle for dragging (Discord-style)
  const dragging = useDraggableChannel(dragItem, headerRef, onDragging, dragHandleRef);
  const dropState = useDropTarget(dragItem, headerRef, (dragItem) => {
    // Only allow channels to be dropped into categories
    return dragItem.type === 'channel';
  });
  const dropType = dropState?.type;

  // Separate drop targets for above/below (for category reordering)
  const orderAbove = useDropTargetInstruction(dragItem, aboveTargetRef, 'reorder-above');
  const orderBelow = useDropTargetInstruction(dragItem, belowTargetRef, 'reorder-below');

  // Handle click - but not if we just finished dragging
  const handleClick: MouseEventHandler = useCallback((e) => {
    if (wasDragOperation()) {
      e.preventDefault();
      return;
    }
    onToggle();
  }, [onToggle]);

  return (
    <Box direction="Column" style={{ position: 'relative' }}>
      {/* Drop target above category */}
      <div
        ref={aboveTargetRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          zIndex: 5,
        }}
      />

      <div
        ref={headerRef}
        className={classNames(css.CategoryHeader, {
          [css.CategoryHeaderDragging]: dragging,
          [css.DropIndicatorInto]: dropType === 'make-child',
        })}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-disabled={disabled}
      >
        {orderAbove === 'reorder-above' && <div className={css.DropIndicatorAbove} />}
        {orderBelow === 'reorder-below' && <div className={css.DropIndicatorBelow} />}

        {/* Drag handle (grip icon) */}
        <div ref={dragHandleRef} className={css.DragHandle}>
          <DragGrip />
        </div>

        <Icon
          src={Icons.ChevronBottom}
          size="50"
          className={classNames(css.CategoryChevron, {
            [css.CategoryChevronCollapsed]: collapsed,
          })}
        />

        <span className={css.CategoryName}>{name}</span>
      </div>

      {/* Category content (channels) */}
      {!collapsed && children}

      {/* Drop target below category */}
      <div
        ref={belowTargetRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '6px',
          zIndex: 5,
        }}
      />
    </Box>
  );
}
