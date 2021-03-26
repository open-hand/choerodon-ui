import React, { cloneElement, Component, CSSProperties, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { action, observable } from 'mobx';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isString from 'lodash/isString';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import classes from 'component-classes';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { IconProps } from 'choerodon-ui/lib/icon';
import raf from 'raf';
import { ColumnProps, minColumnWidth } from './Column';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import Icon from '../icon';
import DataSet from '../data-set/DataSet';
import Field from '../data-set/Field';
import EventManager from '../_util/EventManager';
import { getAlignByField, getColumnKey, getColumnLock, getHeader, getPlacementByAlign, isStickySupport } from './utils';
import { ColumnAlign, TableColumnTooltip } from './enum';
import { ShowHelp } from '../field/enum';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';
import autobind from '../_util/autobind';

export interface TableHeaderCellProps extends ElementProps {
  dataSet: DataSet;
  prevColumn?: ColumnProps;
  column: ColumnProps;
  resizeColumn?: ColumnProps;
  rowSpan?: number;
  colSpan?: number;
  getHeaderNode: () => HTMLTableSectionElement | null;
}

@observer
export default class TableHeaderCell extends Component<TableHeaderCellProps, any> {
  static displayName = 'TableHeaderCell';

  static propTypes = {
    column: PropTypes.object.isRequired,
  };

  static contextType = TableContext;

  resizeEvent: EventManager = new EventManager(typeof window !== 'undefined' && document);

  resizeBoundary: number = 0;

  resizePosition?: number;

  resizeColumn?: ColumnProps;

  element?: HTMLDivElement | null;

  nextFrameActionId?: number;

  @observable overflow?: boolean;

  @autobind
  saveElement(element) {
    this.element = element;
  }

  @autobind
  handleClick() {
    const { column, dataSet } = this.props;
    const { name } = column;
    if (name) {
      dataSet.sort(name);
    }
  }

  getNode(column) {
    const { getHeaderNode } = this.props;
    const headerDom: Element | null = getHeaderNode();
    if (headerDom) {
      return headerDom.querySelector(`[data-index="${getColumnKey(column)}"]`);
    }
  }

  setResizeColumn(column) {
    this.resizeColumn = column;
    const node = this.getNode(column);
    if (node) {
      this.resizeBoundary = node.getBoundingClientRect().left;
    }
  }

  @autobind
  handleLeftResize(e) {
    const { prevColumn } = this.props;
    const { tableStore: { props: { autoMaxWidth } } } = this.context;
    this.setResizeColumn(prevColumn);
    if (autoMaxWidth) {
      e.persist();
      this.delayResizeStart(e);
    } else {
      this.resizeStart(e);
    }
  }

  @autobind
  handleStopResize() {
    if (this.delayResizeStart) {
      this.delayResizeStart.cancel();
    }
  }

  @autobind
  handleRightResize(e) {
    const { resizeColumn } = this.props;
    const { tableStore: { props: { autoMaxWidth } } } = this.context;
    this.setResizeColumn(resizeColumn);
    if (autoMaxWidth) {
      e.persist();
      this.delayResizeStart(e);
    } else {
      this.resizeStart(e);
    }
  }

  private delayResizeStart = debounce(
    (e) => {
      this.resizeStart(e);
    },
    300,
  );

  @autobind
  handleLeftDoubleClick(_e) {
    if (this.delayResizeStart) {
      this.delayResizeStart.cancel();
      this.resizeDoubleClick();
    }
  }

  @autobind
  handleRightDoubleClick(_e) {
    if (this.delayResizeStart) {
      this.delayResizeStart.cancel();
      this.resizeDoubleClick();
    }
  }

  @autobind
  @action
  resizeDoubleClick(): void {
    const column = this.resizeColumn;
    const { tableStore } = this.context;
    const { prefixCls, node: { element } } = tableStore;
    if (column) {
      const maxWidth = Math.max(
        ...[
          ...element.querySelectorAll(`td[data-index=${getColumnKey(column)}] > .${prefixCls}-cell-inner`),
        ].map(({ clientWidth, scrollWidth, parentNode: { offsetWidth } }) => offsetWidth + scrollWidth - clientWidth + 1),
        minColumnWidth(column),
        column.width ? column.width : 0,
      );
      if (maxWidth !== column.width) {
        tableStore.changeCustomizedColumnValue(column, {
          width: maxWidth,
        });
      } else if (column.minWidth) {
        tableStore.changeCustomizedColumnValue(column, {
          width: column.minWidth,
        });
      }
    }
  }

  @action
  resizeStart(e): void {
    const {
      tableStore,
    } = this.context;
    const { prefixCls, node: { element } } = tableStore;
    tableStore.columnResizing = true;
    classes(element).add(`${prefixCls}-resizing`);
    delete this.resizePosition;
    this.setSplitLinePosition(e.pageX);
    this.resizeEvent
      .addEventListener('mousemove', this.resize)
      .addEventListener('mouseup', this.resizeEnd);
  }

  @autobind
  resize(e): void {
    const column = this.resizeColumn;
    const limit = this.resizeBoundary + minColumnWidth(column);
    let left = e.pageX;
    if (left < limit) {
      left = limit;
    }
    this.resizePosition = this.setSplitLinePosition(left);
  }

  @autobind
  @action
  resizeEnd(): void {
    const {
      tableStore,
    } = this.context;
    const {
      prefixCls, node: { element },
    } = tableStore;
    tableStore.columnResizing = false;
    classes(element).remove(`${prefixCls}-resizing`);
    this.resizeEvent.removeEventListener('mousemove').removeEventListener('mouseup');
    const column = this.resizeColumn;
    if (this.resizePosition && column) {
      const newWidth = Math.round(Math.max(this.resizePosition - this.resizeBoundary, minColumnWidth(column)));
      if (newWidth !== column.width) {
        tableStore.changeCustomizedColumnValue(column, {
          width: newWidth,
        });
      }
    }
  }

  @action
  setSplitLinePosition(left: number): number | undefined {
    const {
      tableStore: {
        node: { resizeLine },
      },
    } = this.context;
    const { left: rectLeft } = resizeLine.offsetParent.getBoundingClientRect();
    left -= rectLeft;
    if (left < 0) {
      left = 0;
    }
    resizeLine.style.left = pxToRem(left) || null;
    return left + rectLeft;
  }

  renderResizer() {
    const { prevColumn, column } = this.props;
    const { tableStore: { prefixCls, props: { autoMaxWidth } } } = this.context;
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const pre = prevColumn && prevColumn.resizable && (
      <div
        key="pre"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-left`}
        onDoubleClick={autoMaxWidth ? this.handleLeftDoubleClick : undefined}
        onMouseDown={this.handleLeftResize}
        onMouseUp={autoMaxWidth ? this.handleStopResize : undefined}
      />
    );
    const next = column.resizable && (
      <div
        key="next"
        className={`${resizerPrefixCls} ${resizerPrefixCls}-right`}
        onDoubleClick={autoMaxWidth ? this.handleRightDoubleClick : undefined}
        onMouseDown={this.handleRightResize}
        onMouseUp={autoMaxWidth ? this.handleStopResize : undefined}
      />
    );

    return [pre, next];
  }

  @autobind
  handleResize() {
    const { element } = this;
    const { tableStore } = this.context;
    if (element && !tableStore.hidden) {
      if (this.nextFrameActionId !== undefined) {
        raf.cancel(this.nextFrameActionId);
      }
      this.nextFrameActionId = raf(this.syncSize);
    }
  }

  @autobind
  @action
  syncSize() {
    this.overflow = this.computeOverFlow();
  }

  computeOverFlow(): boolean {
    const { element } = this;
    if (element && element.textContent) {
      const { column } = this.props;
      const { tableStore } = this.context;
      if (tableStore.getColumnTooltip(column) === TableColumnTooltip.overflow) {
        const { clientWidth, scrollWidth } = element;
        return scrollWidth > clientWidth;
      }
    }
    return false;
  }

  getHelpIcon(field?: Field) {
    const { column } = this.props;
    const { tableStore: { prefixCls } } = this.context;
    const {
      help,
      showHelp,
    } = column;
    if (showHelp !== ShowHelp.none) {
      const fieldHelp = defaultTo(field && field.get('help'), help);
      if (fieldHelp) {
        return (
          <Tooltip title={fieldHelp} placement="bottom" key="help">
            <Icon type="help_outline" className={`${prefixCls}-help-icon`} />
          </Tooltip>
        );
      }
    }
  }

  getSortIcon() {
    const { column } = this.props;
    const { tableStore: { prefixCls } } = this.context;
    const {
      sortable,
      name,
    } = column;
    if (sortable && name) {
      return <Icon key="sort" type="arrow_upward" className={`${prefixCls}-sort-icon`} />;
    }
  }

  render() {
    const { column, dataSet, rowSpan, colSpan, style, className } = this.props;
    const { tableStore } = this.context;
    const {
      prefixCls,
      rowHeight,
      columnResizable,
    } = tableStore;
    const {
      headerClassName,
      headerStyle = {},
      name,
      align,
      children,
      command,
      lock,
    } = column;
    const tooltip = tableStore.getColumnTooltip(column);
    const columnKey = getColumnKey(column);
    const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
    const classList: string[] = [`${prefixCls}-cell`];
    if (columnLock) {
      classList.push(`${prefixCls}-cell-fix-${columnLock}`);
    }
    if (className) {
      classList.push(className);
    }
    const field = dataSet.getField(name);
    if (headerClassName) {
      classList.push(headerClassName);
    }

    const cellStyle: CSSProperties = {
      textAlign: align ||
        (command || (children && children.length) ? ColumnAlign.center : getAlignByField(field)),
      ...headerStyle,
      ...style,
    };

    const header = getHeader(column, dataSet);

    const headerNode = isValidElement(header) ? (
      cloneElement(header, { key: 'text' })
    ) : isString(header) ? (
      <span key="text">{header}</span>
    ) : (
      header
    );

    // 帮助按钮
    const helpIcon: ReactElement<TooltipProps> | undefined = this.getHelpIcon(field);
    // 排序按钮
    const sortIcon: ReactElement<IconProps> | undefined = this.getSortIcon();
    const childNodes = [
      headerNode,
    ];
    const innerProps: any = {
      className: classNames(`${prefixCls}-cell-inner`),
      children: childNodes,
      style: {},
    };

    if (helpIcon) {
      if (cellStyle.textAlign === ColumnAlign.right) {
        childNodes.unshift(helpIcon);
      } else {
        childNodes.push(helpIcon);
      }
    }
    if (sortIcon) {
      if (field && field.order) {
        classList.push(`${prefixCls}-sort-${field.order}`);
      }
      innerProps.onClick = this.handleClick;
      if (cellStyle.textAlign === ColumnAlign.right) {
        childNodes.unshift(sortIcon);
      } else {
        childNodes.push(sortIcon);
      }
    }
    if (rowHeight !== 'auto') {
      const height: number = Number(cellStyle.height) || (rowHeight * (rowSpan || 1));
      innerProps.style = {
        height: pxToRem(height),
        lineHeight: pxToRem(height - 2),
      };
    }

    if (tooltip === TableColumnTooltip.overflow) {
      innerProps.ref = this.saveElement;
    }

    const thProps: any = {
      className: classList.join(' '),
      rowSpan,
      colSpan,
      'data-index': columnKey,
      style: omit(cellStyle, ['width', 'height']),
    };

    const inner = (
      <div
        {...innerProps}
      />
    );

    const th = (
      <th {...thProps}>
        {
          this.overflow || tooltip === TableColumnTooltip.always ?
            <Tooltip key="tooltip" title={header} placement={getPlacementByAlign(cellStyle.textAlign as ColumnAlign)}>{inner}</Tooltip> :
            inner
        }
        {columnResizable && this.renderResizer()}
      </th>
    );

    return tooltip === TableColumnTooltip.overflow ? (
      <ReactResizeObserver onResize={this.handleResize} resizeProp="width">
        {th}
      </ReactResizeObserver>
    ) : (
      th
    );
  }

  componentWillUnmount() {
    this.resizeEvent.clear();
    this.delayResizeStart.cancel();
  }
}
