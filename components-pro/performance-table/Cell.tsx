import * as React from 'react';
import { runInAction } from 'mobx';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import classNames from 'classnames';
import { LAYER_WIDTH } from './constants';
import { defaultClassPrefix, getUnhandledProps, isNullOrUndefined, prefix } from './utils';
import TableContext from './TableContext';
import { ColumnPropTypeKeys } from './Column';
import { RowDataType, StandardProps } from './common';
import isEmpty from '../_util/isEmpty';

export interface CellProps extends StandardProps {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  className?: string;
  classPrefix?: string;
  dataKey?: string;
  isHeaderCell?: boolean;

  width?: number;
  height?: number | ((rowData: object) => number);
  left?: number;
  headerHeight?: number;

  style?: React.CSSProperties;
  firstColumn?: boolean;
  lastColumn?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode | ((rowData: RowDataType, rowIndex: number) => React.ReactNode);

  rowKey?: string | number;
  rowIndex?: number;
  rowSpan?: number;
  rowData?: RowDataType;
  depth?: number; // change `Cell` width and depth prop to optional

  onTreeToggle?: (
    rowKey?: string | number,
    rowIndex?: number,
    rowData?: RowDataType,
    event?: React.MouseEvent,
  ) => void;

  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean,
  ) => React.ReactNode;
  renderCell?: (contentChildren: any) => React.ReactNode;
  wordWrap?: boolean;
  hidden?: boolean;
  treeCol?: boolean;
  expanded?: boolean;
  isDragging?: boolean;
}

export const propTypeKeys = [
  'align',
  'verticalAlign',
  'className',
  'classPrefix',
  'dataKey',
  'isHeaderCell',
  'width',
  'height',
  'left',
  'headerHeight',
  'style',
  'firstColumn',
  'lastColumn',
  'hasChildren',
  'children',
  'rowKey',
  'rowIndex',
  'rowData',
  'depth',
  'onTreeToggle',
  'renderTreeToggle',
  'renderCell',
  'wordWrap',
  'hidden',
  'treeCol',
  'expanded',
  'groupHeader',
  'groupCount',
  'isDragging',
];

class Cell extends React.PureComponent<CellProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table-cell'),
    headerHeight: 36,
    depth: 0,
    height: 36,
    width: 0,
    left: 0,
  };

  // @ts-ignore
  addPrefix = (name: string): string => prefix(this.props.classPrefix)(name);

  isTreeCol() {
    const { treeCol, firstColumn } = this.props;
    const { hasCustomTreeCol, isTree } = this.context;

    if (treeCol) {
      return true;
    }

    if (!hasCustomTreeCol && firstColumn && isTree) {
      return true;
    }

    return false;
  }

  getHeight() {
    const { height, rowData } = this.props;
    // @ts-ignore
    return typeof height === 'function' ? height(rowData) : height;
  }

  handleExpandClick = (event: React.MouseEvent) => {
    const { rowKey, rowIndex, rowData, onTreeToggle } = this.props;
    if (onTreeToggle) {
      onTreeToggle(rowKey, rowIndex, rowData, event);
    }
  };

  renderTreeNodeExpandIcon() {
    const { rowData, renderTreeToggle, hasChildren, expanded } = this.props;
    const expandButton = <i className={this.addPrefix('expand-icon icon')} />;

    if (this.isTreeCol() && hasChildren) {
      return (
        <span
          role="button"
          tabIndex={-1}
          className={this.addPrefix('expand-wrapper')}
          onClick={this.handleExpandClick}
        >
          {renderTreeToggle ? renderTreeToggle(expandButton, rowData, expanded) : expandButton}
        </span>
      );
    }

    return null;
  }

  render() {
    const {
      width,
      left,
      style,
      className,
      firstColumn,
      lastColumn,
      isHeaderCell,
      headerHeight,
      align,
      children,
      rowData,
      dataKey,
      rowIndex,
      renderCell,
      hidden,
      wordWrap,
      classPrefix,
      depth,
      verticalAlign,
      expanded,
      onClick, // Fix sortColumn not getting fired in Gatsby production build
      onCell,
      rowSpan,
      fixed,
      hasChildren,
      ...rest
    } = this.props;
    const { tableStore, tableWidth } = this.context;

    const cellExternalProps = (
      typeof onCell === 'function'
        ? onCell({
          rowData,
          dataKey,
          rowIndex,
        })
        : {}
    ) || {};

    const cellHidden = hidden || cellExternalProps.hidden;
    const cellRowSpan = rowSpan || cellExternalProps.rowSpan;

    if (cellHidden || cellRowSpan === 0) {
      if (!isHeaderCell && rowData && cellRowSpan === 0 && fixed) {
        runInAction(() => {
          tableStore.rowZIndex.push(rowIndex);
        });
      }
      return null;
    }

    const classes = classNames(
      classPrefix,
      className,
      cellExternalProps.className,
      {
        [this.addPrefix('expanded')]: expanded && this.isTreeCol(),
        [this.addPrefix('first')]: firstColumn,
        [this.addPrefix('last')]: lastColumn && ((left || 0) + (width || 0) >= tableWidth),
      },
    );
    const { rtl } = this.context;

    let nextHeight = isHeaderCell ? headerHeight : this.getHeight();
    if (cellExternalProps.rowSpan) {
      nextHeight = cellExternalProps.rowSpan * (nextHeight || 1);
    }
    const styles = {
      ...style,
      ...cellExternalProps.style,
      width,
      height: nextHeight,
      zIndex: depth,
      [rtl ? 'right' : 'left']: left,
    };

    //By moving style from cell content to Cell, it breaks UI behaviours.
    // for example, check box are not showing in the middle of the cell anymore.
    const contentStyles: React.CSSProperties = {
      width,
      height: nextHeight,
      textAlign: align,
      [rtl ? 'paddingRight' : 'paddingLeft']: this.isTreeCol() ? depth! * LAYER_WIDTH + (hasChildren ? 8 : 36) : null,
    };

    if (verticalAlign) {
      contentStyles.display = 'table-cell';
      contentStyles.verticalAlign = verticalAlign;
    }

    // @ts-ignore
    let cellContent = isNullOrUndefined(children) && rowData ? rowData[dataKey] : children;

    if (typeof children === 'function') {
      const getChildren = children as Function;
      cellContent = getChildren(rowData, rowIndex);
    }

    // fix unable to get propTypes after gatsby is compiled
    const unhandledProps = getUnhandledProps(propTypeKeys, getUnhandledProps(ColumnPropTypeKeys, rest));
    let cell = renderCell ? renderCell(cellContent) : cellContent;
    const { searchText, highlightRowIndexs } = tableStore;
    if (isEmpty(cell)) {
      cell = tableStore.getConfig('renderEmpty')('Output');
    }
    if (isNumber(cell)) cell = String(cell);
    if (isString(cell) && searchText) {
      const index = cell.indexOf(searchText);
      const beforeStr = cell.substr(0, index);
      const afterStr = cell.substr(index + searchText.length);
      if (index > -1) {
        highlightRowIndexs.push(rowIndex);
      }
      cell = index > -1 ? (
        <span>
          {beforeStr}
          <span className={this.addPrefix('letter-highlight')}>{searchText}</span>
          {afterStr}
        </span>
      ) : <span>{cell}</span>;
    }
    const content = wordWrap ? (
      <div className={this.addPrefix('wrap')}>
        {this.renderTreeNodeExpandIcon()}
        {cell}
      </div>
    ) : (
      <React.Fragment>
        {this.renderTreeNodeExpandIcon()}
        {cell}
      </React.Fragment>
    );

    return (
      <div
        role={isHeaderCell ? 'columnheader' : 'gridcell'}
        {...unhandledProps}
        onClick={onClick}
        className={classes}
        style={styles}
      >
        <div className={this.addPrefix('content')} style={contentStyles}>
          {content}
        </div>
      </div>
    );
  }
}

export default Cell;
