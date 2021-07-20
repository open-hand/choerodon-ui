import React, { Component, CSSProperties, HTMLProps } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import classNames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import omit from 'lodash/omit';
import Tree, { TreeNodeProps } from 'choerodon-ui/lib/tree';
import { getConfig } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import Record from '../data-set/Record';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { getAlignByField, getColumnKey, getColumnLock, getEditorByColumnAndRecord, getHeader, isInCellEditor, isStickySupport } from './utils';
import { ColumnAlign, ColumnLock } from './enum';
import { Commands } from './Table';
import TableEditor from './TableEditor';
import TableCellInner from './TableCellInner';
import AggregationButton from './AggregationButton';

export interface TableCellProps extends ElementProps {
  column: ColumnProps;
  record: Record;
  colSpan?: number;
  isDragging: boolean;
  lock?: ColumnLock | boolean;
  provided?: DraggableProvided;
  disabled?: boolean;
}

@observer
export default class TableCell extends Component<TableCellProps> {
  static displayName = 'TableCell';

  static propTypes = {
    column: PropTypes.object.isRequired,
    record: PropTypes.instanceOf(Record).isRequired,
  };

  static contextType = TableContext;

  element?: HTMLSpanElement | null;

  @computed
  get cellEditor() {
    const { column, record } = this.props;
    return getEditorByColumnAndRecord(column, record);
  }

  @computed
  get cellEditorInCell() {
    return isInCellEditor(this.cellEditor);
  }

  @computed
  get currentEditor(): TableEditor | undefined {
    const { tableStore } = this.context;
    const { record, column } = this.props;
    if (tableStore.inlineEdit && record === tableStore.currentEditRecord) {
      return tableStore.editors.get(getColumnKey(column));
    }
    return undefined;
  }

  componentDidMount(): void {
    const { currentEditor } = this;
    if (currentEditor) {
      currentEditor.alignEditor();
    }
  }

  componentWillUnmount(): void {
    const { currentEditor } = this;
    if (currentEditor) {
      currentEditor.hideEditor();
    }
  }

  getCommand(): Commands[] | undefined {
    const {
      column: { command },
      record,
    } = this.props;
    const {
      tableStore: { dataSet },
    } = this.context;
    if (typeof command === 'function') {
      return command({ dataSet, record });
    }
    return command;
  }

  getInnerNode(column: ColumnProps, command?: Commands[], onCellStyle?: CSSProperties) {
    const { record, children, disabled } = this.props;
    return (
      <TableCellInner
        column={column}
        command={command}
        record={record}
        style={onCellStyle}
        disabled={disabled}
      >
        {children}
      </TableCellInner>
    );
  }

  getColumnsInnerNode(columns: ColumnProps[], prefixCls, command?: Commands[]) {
    const { tableStore } = this.context;
    const { dataSet } = tableStore;
    return columns.map((column) => {
      const { children, hidden } = column;
      if (!hidden) {
        const { record } = this.props;
        const { onCell } = column;
        const tableColumnOnCell = getConfig('tableColumnOnCell');
        const isBuiltInColumn = tableStore.isBuiltInColumn(column);
        const columnOnCell = !isBuiltInColumn && (onCell || tableColumnOnCell);
        const cellExternalProps: Partial<TreeNodeProps> =
          typeof columnOnCell === 'function'
            ? columnOnCell({
              dataSet: record.dataSet!,
              record,
              column,
            })
            : {};
        const columnKey = getColumnKey(column);
        const header = getHeader(column, dataSet, tableStore);
        // 只有全局属性时候的样式可以继承给下级满足对td的样式能够一致表现
        const onCellStyle = !isBuiltInColumn && tableColumnOnCell === columnOnCell && typeof tableColumnOnCell === 'function' ? omit(cellExternalProps.style, ['width', 'height']) : undefined;
        if (children && children.length) {
          return (
            <Tree.TreeNode
              {...cellExternalProps}
              key={columnKey}
              title={header}
            >
              {this.getColumnsInnerNode(children, prefixCls, command)}
            </Tree.TreeNode>
          );
        }
        const innerNode = this.getInnerNode(column, command, onCellStyle);
        return (
          <Tree.TreeNode
            {...cellExternalProps}
            key={columnKey}
            title={
              <>
                <span className={`${prefixCls}-label`}>{header}</span>
                {innerNode}
              </>
            }
          />
        );
      }
      return undefined;
    });
  }

  renderInnerNode(prefixCls, command?: Commands[], onCellStyle?: CSSProperties) {
    const {
      context: { tableStore },
      props,
    } = this;
    if (tableStore.expandIconAsCell && props.children) {
      return props.children;
    }
    const { column, record } = props;
    if (column.aggregation) {
      const { children, renderer = defaultAggregationRenderer, aggregationLimit, aggregationDefaultExpandedKeys, aggregationDefaultExpandAll } = column;
      if (children) {
        const visibleChildren = children.filter(child => !child.hidden);
        const { length } = visibleChildren;
        if (length > 0) {
          const expanded = tableStore.isAggregationCellExpanded(record, column);
          const hasExpand = length > aggregationLimit!;
          const nodes = hasExpand && !expanded ? visibleChildren.slice(0, aggregationLimit! - 1) : visibleChildren;

          const text = (
            <Tree
              prefixCls={`${prefixCls}-tree`}
              virtual={false}
              focusable={false}
              defaultExpandedKeys={aggregationDefaultExpandedKeys}
              defaultExpandAll={aggregationDefaultExpandAll}
            >
              {
                this.getColumnsInnerNode(nodes, prefixCls, command)
              }
              {
                hasExpand && (
                  <Tree.TreeNode title={<AggregationButton expanded={expanded} record={record} column={column} />} />
                )
              }
            </Tree>
          );
          return (
            <div className={`${prefixCls}-inner`}>
              {renderer({ text, record, dataSet: tableStore.dataSet, aggregation: tableStore.aggregation })}
            </div>
          );
        }
      }
    }
    return this.getInnerNode(column, command, onCellStyle);
  }

  render() {
    const { column, record, isDragging, provided, colSpan, className: propsClassName } = this.props;
    const {
      tableStore,
    } = this.context;
    const { prefixCls, node } = tableStore;
    const tableColumnOnCell = getConfig('tableColumnOnCell');
    const { className, style, align, name, onCell, lock, aggregation } = column;
    const command = this.getCommand();
    const field = record.getField(name);
    const cellPrefix = `${prefixCls}-cell`;
    const isBuiltInColumn = tableStore.isBuiltInColumn(column);
    const columnOnCell = !isBuiltInColumn && (onCell || tableColumnOnCell);
    const cellExternalProps: HTMLProps<HTMLTableCellElement> =
      typeof columnOnCell === 'function'
        ? columnOnCell({
          dataSet: record.dataSet!,
          record,
          column,
        })
        : {};
    const cellStyle: CSSProperties = {
      textAlign: align || (command ? ColumnAlign.center : getAlignByField(field)),
      ...style,
      ...cellExternalProps.style,
      ...(provided && { cursor: 'move' }),
    };
    const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
    const classString = classNames(
      cellPrefix,
      {
        [`${cellPrefix}-aggregation`]: aggregation,
        [`${cellPrefix}-fix-${columnLock}`]: columnLock,
      },
      className,
      propsClassName,
      cellExternalProps.className,
    );

    if (columnLock) {
      const { _group } = column;
      if (_group) {
        if (columnLock === ColumnLock.left) {
          cellStyle.left = pxToRem(_group.left)!;
        } else if (columnLock === ColumnLock.right) {
          cellStyle.right = pxToRem(colSpan && colSpan > 1 ? 0 : _group.right)!;
        }
      }
    }
    const widthDraggingStyle = (): React.CSSProperties => {
      const draggingStyle: React.CSSProperties = {};
      if (isDragging) {
        const dom = node.element.querySelector(`.${prefixCls}-tbody .${prefixCls}-cell[data-index=${getColumnKey(column)}]`);
        if (dom) {
          draggingStyle.width = dom.clientWidth;
          draggingStyle.whiteSpace = 'nowrap';
        }
      }
      return draggingStyle;
    };
    // 只有全局属性时候的样式可以继承给下级满足对td的样式能够一致表现
    const onCellStyle = !isBuiltInColumn && tableColumnOnCell === columnOnCell && typeof tableColumnOnCell === 'function' ? omit(cellExternalProps.style, ['width', 'height']) : undefined;
    return (
      <td
        colSpan={colSpan}
        {...cellExternalProps}
        className={classString}
        data-index={getColumnKey(column)}
        {...(provided && provided.dragHandleProps)}
        style={{ ...omit(cellStyle, ['width', 'height']), ...widthDraggingStyle() }}
      >
        {this.renderInnerNode(cellPrefix, command, onCellStyle)}
      </td>
    );
  }
}
