/**
 * Webpack has bug for import loop, which is not the same behavior as ES module.
 * When util.js imports the TreeNode for tree generate will cause treeContextTypes be empty.
 */
import React from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { DataEntity, DataNode, Direction, EventDataNode, IconType, Key, NodeInstance } from './interface';

export type NodeMouseEventParams<T = HTMLSpanElement> = {
  event: React.MouseEvent<T>;
  node: EventDataNode;
};
export type NodeDragEventParams<T = HTMLDivElement> = {
  event: React.MouseEvent<T>;
  node: EventDataNode;
};

export type NodeMouseEventHandler<T = HTMLSpanElement> = (
  e: React.MouseEvent<T>,
  node: EventDataNode,
) => void;
export type NodeDragEventHandler<T = HTMLDivElement> = (
  e: React.MouseEvent<T>,
  node: NodeInstance | null,
  outsideTree?: boolean,
) => void;

export interface DraggableProps{
  nodeDraggable: ((node?: DataNode) => boolean) | boolean;
  icon: boolean | React.ReactNode;
}

export interface TreeContextProps {
  prefixCls: string;
  selectable?: boolean;
  showIcon?: boolean;
  icon: IconType;
  switcherIcon: IconType;
  draggable?: ((node?: DataNode) => boolean) | boolean | DraggableProps;
  checkable: boolean | React.ReactNode;
  checkStrictly?: boolean;
  checkboxPosition?: 'default' | 'left';
  disabled?: boolean;
  keyEntities: Record<Key, DataEntity>;
  // for details see comment in Tree.state (Tree.tsx)
  dropLevelOffset?: number | null;
  dropContainerKey: Key | null;
  dropTargetKey: Key | null;
  dropPosition: -1 | 0 | 1 | null;
  indent: number | null;
  dropIndicatorRender?: (props: {
    dropPosition: -1 | 0 | 1 | null;
    dropLevelOffset: number | undefined | null;
    indent: number | null;
    prefixCls: string;
    direction: Direction;
  }) => React.ReactNode;
  dragOverNodeKey: Key | null;
  direction: Direction;

  loadData?: (treeNode: EventDataNode) => Promise<void>;
  filterTreeNode?: (treeNode: EventDataNode) => boolean;
  titleRender?: (node?: DataNode) => React.ReactNode;
  ripple?: boolean;

  onNodeClick: NodeMouseEventHandler;
  onNodeDoubleClick: NodeMouseEventHandler;
  onNodeExpand: NodeMouseEventHandler;
  onNodeSelect: NodeMouseEventHandler;
  onNodeCheck: (
    e: React.MouseEvent<HTMLSpanElement>,
    treeNode: EventDataNode,
    checked: boolean,
  ) => void;
  onNodeLoad: (treeNode: EventDataNode) => void;
  onNodeMouseEnter: NodeMouseEventHandler;
  onNodeMouseLeave: NodeMouseEventHandler;
  onNodeContextMenu: NodeMouseEventHandler;
  onNodeDragStart: NodeDragEventHandler;
  onNodeDragEnter: NodeDragEventHandler;
  onNodeDragOver: NodeDragEventHandler;
  onNodeDragLeave: NodeDragEventHandler;
  onNodeDragEnd: NodeDragEventHandler;
  onNodeDrop: NodeDragEventHandler;
}

export const TreeContext: React.Context<TreeContextProps> = getContext<TreeContextProps>(Symbols.TreeContext, {} as TreeContextProps);
