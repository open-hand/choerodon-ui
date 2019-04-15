import React, { cloneElement, Component, CSSProperties, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { action, set } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isString from 'lodash/isString';
import classes from 'component-classes';
import { getPrefixCls } from 'choerodon-ui/lib/configure';
import { ColumnProps, minColumnWidth } from './Column';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import Icon from '../icon';
import DataSet from '../data-set/DataSet';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import EventManager from '../_util/EventManager';
import { getAlignByField, getColumnKey, getHeader } from './utils';
import { ColumnAlign } from './enum';
import { ShowHelp } from '../field/enum';
import Tooltip from '../tooltip';
import { FIELD_SUFFIX } from '../form/utils';

export interface TableHeaderCellProps extends ElementProps {
  dataSet: DataSet;
  prevColumn?: ColumnProps;
  column: ColumnProps;
  resizeColumn: ColumnProps;
  rowHeight: number | 'auto';
  rowSpan?: number;
  colSpan?: number;
  getHeaderNode: () => HTMLTableSectionElement | null;
}

@observer
export default class TableHeaderCell extends Component<TableHeaderCellProps, any> {
  static displayName = 'TableHeaderCell';

  static propTypes = {
    column: PropTypes.object.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
  };

  static contextType = TableContext;

  resizeEvent: EventManager = new EventManager(typeof window !== 'undefined' && document);

  resizeBoundary: number = 0;

  resizePosition?: number;

  resizeColumn?: ColumnProps;

  handleClick = () => {
    const { column, dataSet } = this.props;
    const { name } = column;
    if (name) {
      dataSet.sort(name);
    }
  };

  getNode(column) {
    const headerDom: Element | null = this.props.getHeaderNode();
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

  handleLeftResize = (e) => {
    this.setResizeColumn(this.props.prevColumn);
    this.resizeStart(e);
  };

  handleRightResize = (e) => {
    this.setResizeColumn(this.props.resizeColumn);
    this.resizeStart(e);
  };

  @action
  resizeStart(e): void {
    classes(this.context.tableStore.node.element).add(`${this.props.prefixCls}-resizing`);
    delete this.resizePosition;
    this.setSplitLinePosition(e.pageX);
    this.resizeEvent
      .addEventListener('mousemove', this.resize)
      .addEventListener('mouseup', this.resizeEnd);
  }

  resize = (e): void => {
    const column = this.resizeColumn;
    const limit = this.resizeBoundary + minColumnWidth(column);
    let left = e.pageX;
    if (left < limit) {
      left = limit;
    }
    this.resizePosition = this.setSplitLinePosition(left);
  };

  @action
  resizeEnd = (): void => {
    this.resizeEvent
      .removeEventListener('mousemove')
      .removeEventListener('mouseup');
    const column = this.resizeColumn;
    if (this.resizePosition && column) {
      const newWidth = Math.max(this.resizePosition - this.resizeBoundary, minColumnWidth(column));
      if (newWidth !== column.width) {
        set(column, 'width', newWidth);
        return;
      }
    }
    classes(this.context.tableStore.node.element).remove(`${this.props.prefixCls}-resizing`);
  };

  @action
  setSplitLinePosition(left: number): number | undefined {
    const { resizeLine } = this.context.tableStore.node;
    const { left: rectLeft, width } = resizeLine.offsetParent.getBoundingClientRect();
    left -= rectLeft;
    if (left < 0) {
      left = 0;
    } else if (left >= width) {
      left = width - 1;
    }
    resizeLine.style.left = pxToRem(left) || null;
    return left + rectLeft;
  }

  renderResizer() {
    const { prevColumn, column, prefixCls } = this.props;
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const pre = prevColumn && prevColumn.resizable && (
      <div key="pre" className={`${resizerPrefixCls} ${resizerPrefixCls}-left`} onMouseDown={this.handleLeftResize} />
    );
    const next = column.resizable && (
      <div key="next" className={`${resizerPrefixCls} ${resizerPrefixCls}-right`} onMouseDown={this.handleRightResize} />
    );

    return [pre, next];
  }

  render() {
    const { column, prefixCls, dataSet, rowHeight, rowSpan, colSpan } = this.props;
    const sortPrefixCls = `${prefixCls}-sort`;
    const { headerClassName, headerStyle = {}, sortable, name, align, help, showHelp, children } = column;
    const classList: string[] = [`${prefixCls}-cell`];
    if (headerClassName) {
      classList.push(headerClassName);
    }
    const headerNode = getHeader(column, dataSet);
    const innerProps: any = {
      className: `${prefixCls}-cell-inner`,
      children: [
        isValidElement(headerNode) ? cloneElement(headerNode, { key: 'text' })
          : isString(headerNode) ? <span key="text">{headerNode}</span> : headerNode,
      ],
    };
    const style: CSSProperties = headerStyle ? omit(headerStyle, ['width', 'height']) : {};
    if (rowHeight !== 'auto') {
      innerProps.style = {
        height: pxToRem(rowHeight),
      };
    }
    if (!style.textAlign) {
      const textAlign = align || (children && children.length ? ColumnAlign.center : name && getAlignByField(dataSet.getField(name)) );
      if (textAlign) {
        style.textAlign = textAlign;
      }
    }
    const field = dataSet.getField(column.name);
    if (showHelp !== ShowHelp.none) {
      // dataset field配置中的help优先级较低，以jsx为主
      const fieldHelp = help || (field ? field.get('help') : null);
      if (fieldHelp && showHelp === ShowHelp.tooltip) {
        const helpIcon = (
          <Tooltip
            title={fieldHelp}
            placement="bottom"
            key="help"
          >
            <Icon type="help_outline" className={`${prefixCls}-help-icon`} />
          </Tooltip>
        );
        // TODO: 提示和排序按钮的渲染逻辑整合在一处
        if (style.textAlign === ColumnAlign.right) {
          innerProps.children.unshift(helpIcon);
        } else {
          innerProps.children.push(helpIcon);
        }
      }
      if (fieldHelp && showHelp === ShowHelp.newLine) {
        const helpMessage = (
          <div className={getPrefixCls(`${FIELD_SUFFIX}-help`)}>{fieldHelp}</div>
        );
        innerProps.children.push(helpMessage);
      }
    }
    if (sortable && name) {
      if (field) {
        const { order } = field;
        if (order) {
          classList.push(`${sortPrefixCls}-${order}`);
        }
      }
      innerProps.onClick = this.handleClick;
      const icon = <Icon key="sort" type="arrow_upward" className={`${sortPrefixCls}-icon`} />;
      if (style.textAlign === ColumnAlign.right) {
        innerProps.children.unshift(icon);
      } else {
        innerProps.children.push(icon);
      }
    }
    return (
      <th
        className={classList.join(' ')}
        style={style}
        rowSpan={rowSpan}
        colSpan={colSpan}
        data-index={getColumnKey(column)}
      >
        <div {...innerProps} />
        {this.renderResizer()}
      </th>
    );
  }

  componentWillUnmount() {
    this.resizeEvent.clear();
  }

}
