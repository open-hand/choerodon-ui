import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column(_props: ColumnProps) {
  return null;
}

Column.defaultProps = {
  width: 100,
  hideable: true,
  hidden: false,
  fixed: false,
  sortable: false,
};

Column.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  width: PropTypes.number,
  fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
  resizable: PropTypes.bool,
  sortable: PropTypes.bool,
  flexGrow: PropTypes.number,
  minWidth: PropTypes.number,
  colSpan: PropTypes.number,
  sort: PropTypes.number,
  treeCol: PropTypes.bool,
  hidden: PropTypes.bool,
  hideable: PropTypes.bool,
  titleEditable: PropTypes.bool,
  onResize: PropTypes.func,
  render: PropTypes.func,
  dataIndex: PropTypes.string,
};

Column.__PFM_TABLE_COLUMN = true;

export default Column;
