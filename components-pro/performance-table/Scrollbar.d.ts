import * as React from 'react';
import { TableScrollLength } from './Table.d';

export interface ScrollbarProps {
  vertical?: boolean;
  length: number;
  scrollLength: number;
  scrollBarOffset: number;
  className?: string;
  classPrefix?: string;
  tableId?: string;
  onScroll?: (delta: number, event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  [key: string]: any;
  clickScrollLength: TableScrollLength,
  showScrollArrow?: boolean;
}

declare const Scrollbar: React.ComponentType<ScrollbarProps>;

export default Scrollbar;
