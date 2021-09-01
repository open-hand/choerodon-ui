import * as React from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { StandardProps } from './common';

export interface RowProps extends StandardProps {
  width?: number;
  height?: number;
  headerHeight?: number;
  top?: number;
  isHeaderRow?: boolean;
  rowDraggable?: boolean;
  rowRef?: React.Ref<any>;
  className?: string | undefined;
  classPrefix?: string;
  style?: React.CSSProperties;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
}

declare const Row: React.ComponentType<RowProps>;

export default Row;
