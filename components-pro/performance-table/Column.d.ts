import React, { ReactNode } from 'react';

export interface ColumnProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  width?: number;
  fixed?: boolean | 'left' | 'right';
  resizable?: boolean;
  sortable?: boolean;
  flexGrow?: number;
  minWidth?: number;
  colSpan?: number;
  treeCol?: boolean;
  hidden?: boolean;
  titleEditable?: boolean;
  /**
   * 是否可隐藏，设为false时不会出现在列过滤选项中
   * @default true
   */
  hideable?: boolean;
  onResize?: (columnWidth?: number, dataIndex?: string) => void;
  render?: (props: { rowData: any, rowIndex: number, dataIndex?: string | undefined }) => React.ReactNode;
  dataIndex?: string;
  key?: string;
  sort?: number;
  title?: React.ReactNode | (() => React.ReactNode);
  /**
   * column group header
   */
  header?: ReactNode;
  children?: React.ReactElement<ColumnProps>[] | ColumnProps[];
  type?: 'ColumnGroup';
}

declare const Column: React.ComponentType<ColumnProps>;

export default Column;
