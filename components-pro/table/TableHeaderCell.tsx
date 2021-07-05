import React, { cloneElement, Component, CSSProperties, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isString from 'lodash/isString';
import debounce from 'lodash/debounce';
import defaultTo from 'lodash/defaultTo';
import classes from 'component-classes';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { IconProps } from 'choerodon-ui/lib/icon';
import { ColumnProps, minColumnWidth } from './Column';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import Icon from '../icon';
import DataSet from '../data-set/DataSet';
import Field from '../data-set/Field';
import EventManager from '../_util/EventManager';
import { getAlignByField, getColumnKey, getColumnLock, getHeader, getMaxClientWidth, isStickySupport } from './utils';
import { ColumnAlign, TableColumnTooltip } from './enum';
import { ShowHelp } from '../field/enum';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';
import autobind from '../_util/autobind';
import transform from '../_util/transform';
import { hide, show } from '../tooltip/singleton';
import isOverflow from '../overflow-tip/util';

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

  resizeEvent: EventManager = new EventManager(typeof window === 'undefined' ? undefined : document);

  resizeBoundary: number = 0;

  resizePosition?: number;

  resizeColumn?: ColumnProps;

  nextFrameActionId?: number;

  @autobind
  handleClick() {
    const { column, dataSet } = this.props;
    const { name } = column;
    if (name) {
      dataSet.sort(name);
    }
  }

  @autobind
  handleMouseEnter(e) {
    const { column } = this.props;
    const { tableStore } = this.context;
    const tooltip = tableStore.getColumnTooltip(column);
    const { currentTarget } = e;
    if (tooltip === TableColumnTooltip.always || (tooltip === TableColumnTooltip.overflow && isOverflow(currentTarget))) {
      show(currentTarget, {
        title: this.getHeader(),
        placement: 'right',
      });
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
      this.resizeBoundary = Math.round(node.getBoundingClientRect().left);
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
          ...element.querySelectorAll(`[data-index=${getColumnKey(column)}] > .${prefixCls}-cell-inner`),
        ].map((node) => node.parentNode.offsetWidth + getMaxClientWidth(node) - node.clientWidth + 1),
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
    const { resizeColumn, resizePosition } = this;
    if (resizePosition && resizeColumn) {
      const newWidth = Math.round(Math.max(resizePosition - this.resizeBoundary, minColumnWidth(resizeColumn)));
      if (newWidth !== resizeColumn.width) {
        tableStore.changeCustomizedColumnValue(resizeColumn, {
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
    const { offsetParent, ownerDocument } = resizeLine;
    let { left: rectLeft } = offsetParent.getBoundingClientRect();
    if (ownerDocument) {
      const { defaultView } = ownerDocument;
      if (defaultView) {
        const { borderLeftWidth } = defaultView.getComputedStyle(offsetParent);
        rectLeft += parseFloat(borderLeftWidth);
      }
    }
    left -= rectLeft;
    if (left < 0) {
      left = 0;
    }
    transform(`translateX(${pxToRem(left) || 0})`, resizeLine.style);
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
      aggregation,
      sortable,
      name,
    } = column;
    if (!aggregation && sortable && name) {
      return <Icon key="sort" type="arrow_upward" className={`${prefixCls}-sort-icon`} />;
    }
  }

  @autobind
  getHeader() {
    const { column, dataSet } = this.props;
    const { tableStore } = this.context;
    return getHeader(column, dataSet, tableStore);
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

    const header = this.getHeader();

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
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: hide,
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

    const thProps: any = {
      className: classList.join(' '),
      rowSpan,
      colSpan,
      'data-index': columnKey,
      style: omit(cellStyle, ['width', 'height']),
    };

    return (
      <th {...thProps}>
        <div
          {...innerProps}
        />
        {columnResizable && this.renderResizer()}
      </th>
    );
  }

  componentWillUnmount() {
    this.resizeEvent.clear();
    this.delayResizeStart.cancel();
  }
}
