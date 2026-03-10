import React, { useRef, useCallback, ReactNode, MouseEventHandler, Children, isValidElement, cloneElement } from 'react';
import { Box, Icon, Icons } from 'folds';
import classNames from 'classnames';
import { useDraggableChannel, useDropTarget, useDropTargetInstruction, ChannelDragData, wasDragOperation } from './useChannelDnD';
import * as css from './unifiedChannels.css';

interface DraggableCategoryProps {
  id: string;
  name: string;
  collapsed: boolean;
  onToggle: () => void;
  onDragging: (item?: ChannelDragData) => void;
  disabled?: boolean;
  children?: ReactNode;
  selectedChildId?: string; // If set, this child remains visible when collapsed
}

export function DraggableCategory({
  id,
  name,
  collapsed,
  onToggle,
  onDragging,
  disabled,
  children,
  selectedChildId,
}: DraggableCategoryProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const aboveTargetRef = useRef<HTMLDivElement>(null);
  const belowTargetRef = useRef<HTMLDivElement>(null);

  const dragItem: ChannelDragData = {
    type: 'category',
    id,
  };

  // Make entire category header draggable
  const dragging = useDraggableChannel(dragItem, headerRef, onDragging);
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

        <Icon
          src={Icons.ChevronBottom}
          size="50"
          className={classNames(css.CategoryChevron, {
            [css.CategoryChevronCollapsed]: collapsed,
          })}
        />

        <span className={css.CategoryName}>{name}</span>
      </div>

      {/* Category content (channels) - animated */}
      {(() => {
        // Separate selected child from others when collapsed
        let selectedChild: ReactNode = null;
        let otherChildren: ReactNode[] = [];

        if (collapsed && selectedChildId) {
          Children.forEach(children, (child) => {
            if (isValidElement(child)) {
              // Check if this child's key matches the selected ID
              const childKey = child.key?.toString() || '';
              if (childKey.includes(selectedChildId)) {
                selectedChild = child;
              } else {
                otherChildren.push(child);
              }
            } else {
              otherChildren.push(child);
            }
          });
        }

        return (
          <>
            {/* Selected channel stays visible outside animation */}
            {collapsed && selectedChild}

            {/* Other channels animate closed */}
            <div
              className={classNames(css.CategoryContent, {
                [css.CategoryContentCollapsed]: collapsed,
              })}
            >
              <div className={css.CategoryContentInner}>
                {collapsed && selectedChildId ? otherChildren : children}
              </div>
            </div>
          </>
        );
      })()}

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
