import * as React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import ColumnResizeHandler from './ColumnResizeHandler';
import { defaultClassPrefix, getUnhandledProps, isNullOrUndefined, prefix } from './utils';
import Cell, { CellProps } from './Cell';
import TableContext from './TableContext';

export interface HeaderCellProps extends CellProps {
  index?: number;
  minWidth?: number;
  sortColumn?: string;
  sortType?: 'desc' | 'asc';
  sortable?: boolean;
  style?: React.CSSProperties;
  resizable?: boolean;
  resizeLeft?: number;
  onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void;
  onColumnResizeEnd?: (
    columnWidth?: number,
    cursorDelta?: number,
    dataKey?: any,
    index?: number,
  ) => void;
  onResize?: (columnWidth?: number, dataKey?: string) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: boolean) => void;
  onSortColumn?: (dataKey?: string) => void;
  flexGrow?: number;
  fixed?: boolean | 'left' | 'right';
  dataIndex?: string;
  onMouseEnterHandler?: (columnWidth: number, left: number, fixed: string | boolean | undefined) => void;
  onMouseLeaveHandler?: () => void;
}

interface HeaderCelltate {
  columnWidth?: number;
  width?: number;
  flexGrow?: number;
}

const propTypeKeys = [
  'index',
  'sortColumn',
  'dataIndex',
  'sortType',
  'sortable',
  'resizable',
  'minWidth',
  'onColumnResizeStart',
  'onColumnResizeEnd',
  'onResize',
  'onColumnResizeMove',
  'onSortColumn',
  'flexGrow',
  'fixed',
  'children',
  'onMouseEnterHandler',
  'onMouseLeaveHandler',
];

class HeaderCell extends React.PureComponent<HeaderCellProps, HeaderCelltate> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table-cell-header'),
  };

  static getDerivedStateFromProps(nextProps: HeaderCellProps, prevState: HeaderCelltate) {
    if (nextProps.width !== prevState.width || nextProps.flexGrow !== prevState.flexGrow) {
      return {
        width: nextProps.width,
        flexGrow: nextProps.flexGrow,
        columnWidth: isNullOrUndefined(nextProps.flexGrow) ? nextProps.width : 0,
      };
    }

    return null;
  }

  constructor(props: HeaderCellProps) {
    super(props);
    this.state = {
      width: props.width,
      flexGrow: props.flexGrow,
      columnWidth: isNullOrUndefined(props.flexGrow) ? props.width : 0,
    };
  }

  handleColumnResizeStart = (columnWidth: number) => {
    const { left = 0, fixed, onColumnResizeStart, resizeLeft = 0 } = this.props;
    if (onColumnResizeStart) {
      onColumnResizeStart(columnWidth, left + resizeLeft, !!fixed);
    }
  };

  handleColumnResizeMove = (width, left = 0, fixed) => {
    const { onColumnResizeMove = noop, resizeLeft = 0 } = this.props;
    onColumnResizeMove(width, left + resizeLeft, fixed);
  };

  handleColumnResizeEnd = (columnWidth?: number, cursorDelta?: number) => {
    const { dataKey, index, onColumnResizeEnd, onResize } = this.props;
    this.setState({ columnWidth });
    if (onColumnResizeEnd) {
      onColumnResizeEnd(columnWidth, cursorDelta, dataKey, index);
    }
    if (onResize) {
      onResize(columnWidth, dataKey);
    }
  };

  handleClick = () => {
    const { sortable, onSortColumn, dataKey } = this.props;
    if (sortable && onSortColumn) {
      onSortColumn(dataKey);
    }
  };

  handleShowMouseArea = (columnWidth: number) => {
    const { onMouseEnterHandler = noop, fixed, left = 0, resizeLeft = 0  } = this.props;
    onMouseEnterHandler(columnWidth, left + resizeLeft, !!fixed);
  };

  // @ts-ignore
  addPrefix = (name: string) => prefix(this.props.classPrefix)(name);

  renderResizeSpanner() {
    const { resizable, left = 0, onMouseLeaveHandler, fixed, headerHeight, minWidth, groupCount, children, style } = this.props;
    const { columnWidth = 0 } = this.state;

    if (!resizable) {
      return null;
    }

    let defaultColumnWidth = columnWidth;

    // 处理组合列第一列拖拽柄定位问题
    if (groupCount && groupCount > 1) {
      defaultColumnWidth = children ? (children as React.ReactElement).props.children[0].props.width : undefined;
    }

    return (
      <ColumnResizeHandler
        defaultColumnWidth={defaultColumnWidth}
        key={columnWidth}
        columnLeft={left}
        columnFixed={fixed}
        height={headerHeight ? headerHeight - 1 : undefined}
        minWidth={minWidth}
        style={{ top: style ? style.top : 0 }}
        onColumnResizeMove={this.handleColumnResizeMove}
        onColumnResizeStart={() => this.handleColumnResizeStart(defaultColumnWidth)}
        onColumnResizeEnd={this.handleColumnResizeEnd}
        onMouseEnterHandler={() => this.handleShowMouseArea(defaultColumnWidth)}
        onMouseLeaveHandler={onMouseLeaveHandler}
      />
    );
  }

  renderSortColumn(): React.ReactNode {
    const { sortable, sortColumn, sortType = '', dataKey, groupHeader } = this.props;

    if (sortable && !groupHeader) {
      const iconClasses = classNames(this.addPrefix('icon-sort icon'), {
        [this.addPrefix(`icon-sort-${sortType}`)]: sortColumn === dataKey,
      });
      return (
        <span className={this.addPrefix('sort-wrapper')}>
          <i className={iconClasses} />
        </span>
      );
    }
    return null;
  }

  render() {
    const {
      className,
      width,
      dataKey,
      headerHeight,
      children,
      left,
      sortable,
      classPrefix,
      sortColumn,
      sortType,
      groupHeader,
      ...rest
    } = this.props;

    const classes = classNames(classPrefix, className, {
      [this.addPrefix('sortable')]: sortable,
    });
    const unhandledProps = getUnhandledProps(propTypeKeys, rest);

    let ariaSort;

    if (sortColumn === dataKey) {
      ariaSort = 'other';
      if (sortType === 'asc') {
        ariaSort = 'ascending';
      } else if (sortType === 'desc') {
        ariaSort = 'descending';
      }
    }

    return (
      <div className={classes}>
        <Cell
          aria-sort={ariaSort}
          {...unhandledProps}
          width={width}
          dataKey={dataKey}
          left={left}
          headerHeight={headerHeight}
          isHeaderCell={true}
          onClick={!groupHeader ? this.handleClick : null}
        >
          {children}
          {this.renderSortColumn()}
        </Cell>

        {this.renderResizeSpanner()}
      </div>
    );
  }
}

export default HeaderCell;
