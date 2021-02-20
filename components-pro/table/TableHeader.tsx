import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { computed } from 'mobx';
import { Draggable, DraggableProvided, DraggableRubric, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import isFunction from 'lodash/isFunction';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { ColumnLock, DragColumnAlign } from './enum';
import DataSet from '../data-set/DataSet';
import { getColumnKey } from './utils';
import ColumnGroup from './ColumnGroup';
import autobind from '../_util/autobind';
import { instance } from './Table';
import { DRAG_KEY } from './TableStore';
import TableHeaderRow from './TableHeaderRow';

export interface TableHeaderProps extends ElementProps {
  dataSet: DataSet;
  lock?: ColumnLock | boolean;
  dragColumnAlign?: DragColumnAlign;
}

@observer
export default class TableHeader extends Component<TableHeaderProps, any> {
  static displayName = 'TableHeader';

  static propTypes = {
    prefixCls: PropTypes.string,
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
    dragColumnAlign: PropTypes.oneOf([DragColumnAlign.right, DragColumnAlign.left]),
  };

  static contextType = TableContext;

  node: HTMLTableSectionElement | null;

  columnDeep: number = 0;

  @autobind
  saveRef(node) {
    this.node = node;
  }

  @autobind
  getHeaderNode() {
    return this.node;
  }

  render() {
    const { prefixCls, lock, dataSet, dragColumnAlign } = this.props;
    const { groupedColumns } = this;
    const {
      tableStore: { overflowY, columnMaxDeep, columnResizable, dragColumn, props: { columnsDragRender = {} } },
    } = this.context;
    const { droppableProps, draggableProps, renderClone } = columnsDragRender;
    const { tableStore } = this.context;
    const rows = this.getTableHeaderRows(groupedColumns);
    const filterDrag = (columnItem: ColumnGroup): boolean => {
      if (columnItem && columnItem.column && dragColumnAlign) {
        return columnItem.column.key === DRAG_KEY;
      }
      return true;
    };
    tableStore.columnMaxDeep = (rows.length || 0);
    const trs = rows.map((row, rowIndex) => {
      if (row.length) {
        let prevColumn: ColumnProps | undefined;
        const tds = row.filter(filterDrag).map(({ hidden, column, rowSpan, colSpan, lastLeaf }, index) => {
          if (!hidden) {
            const isDragDisabled = getColumnKey(column) === DRAG_KEY || (!dragColumn || columnMaxDeep > 1);
            const props: TableHeaderCellProps = {
              key: getColumnKey(column),
              prefixCls,
              dataSet,
              prevColumn,
              column,
              resizeColumn: lastLeaf,
              getHeaderNode: this.getHeaderNode,
            };
            if (rowSpan > 1) {
              props.rowSpan = rowSpan;
            }
            if (colSpan > 1) {
              props.colSpan = colSpan;
            }
            prevColumn = lastLeaf;
            return isDragDisabled ? (
              <TableHeaderCell {...props} />
            ) : (
              <Draggable
                draggableId={getColumnKey(column).toString()}
                index={index}
                key={getColumnKey(column)}
                isDragDisabled={isDragDisabled}
                {...draggableProps}
              >
                {(
                  provided: DraggableProvided,
                  snapshot: DraggableStateSnapshot,
                ) => {
                  props.provided = provided;
                  props.snapshot = snapshot;
                  return (
                    <TableHeaderCell {...props} />
                  );
                }}
              </Draggable>
            );
          }
          return undefined;
        });
        if (overflowY && lock !== ColumnLock.left && rowIndex === 0) {
          tds.push(
            <th key="fixed-column" className={`${prefixCls}-cell`} rowSpan={rows.length}>
              &nbsp;
            </th>,
          );
        }
        const isDropDisabled = (!dragColumn || columnMaxDeep > 1);
        if (isDropDisabled) {
          return (
            <TableHeaderRow
              key={String(rowIndex)}
              rowIndex={rowIndex}
              tds={tds}
              rows={rows}
            />
          );
        }
        return (
          <Droppable
            droppableId="tableHeader"
            key={row.length > 1 ? `tableHeader${rowIndex}` : 'tableHeader'}
            direction="horizontal"
            isDropDisabled={isDropDisabled}
            renderClone={(
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
              rubric: DraggableRubric,
            ) => {
              const rowProps = row[rubric.source.index];
              const { column, rowSpan, colSpan, lastLeaf } = rowProps;
              const props: TableHeaderCellProps = {
                key: getColumnKey(column),
                prefixCls,
                dataSet,
                prevColumn,
                column,
                resizeColumn: lastLeaf,
                getHeaderNode: this.getHeaderNode,
                provided,
                snapshot,
              };
              if (rowSpan > 1) {
                props.rowSpan = rowSpan;
              }
              if (colSpan > 1) {
                props.colSpan = colSpan;
              }
              if (renderClone && isFunction(renderClone)) {
                return renderClone(props);
              }
              return (
                <TableHeaderCell  {...props} />
              );
            }}
            getContainerForClone={() => instance().headtr}
            {...droppableProps}
          >
            {(droppableProvided: DroppableProvided) =>  (
              <TableHeaderRow
                key={String(rowIndex)}
                rowIndex={rowIndex}
                tds={tds}
                rows={rows}
                droppableProvided={droppableProvided}
              />
            )}
          </Droppable>
        );
      }
      return undefined;
    });
    const classString = classNames(`${prefixCls}-thead`, {
      [`${prefixCls}-column-resizable`]: columnResizable,
      [`${prefixCls}-column-group`]: rows && rows.length > 1,
    });
    return (
      <thead ref={this.saveRef} className={classString}>
        {trs}
      </thead>
    );
  }

  getTableHeaderRows(
    columns: ColumnGroup[],
    currentRow: number = 0,
    rows: ColumnGroup[][] = [],
  ): ColumnGroup[][] {
    rows[currentRow] = rows[currentRow] || [];
    columns.forEach(column => {
      const { hidden, rowSpan, colSpan, children } = column;
      if (!hidden) {
        if (rowSpan && rows.length < rowSpan) {
          while (rows.length < rowSpan) {
            rows.push([]);
          }
        }
        if (children) {
          this.getTableHeaderRows(children.columns, currentRow + rowSpan, rows);
        }
        if (colSpan !== 0) {
          rows[currentRow].push(column);
        }
      }
    });
    return rows;
  }

  @computed
  get groupedColumns(): ColumnGroup[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    switch (lock) {
      case ColumnLock.left:
      case true:
        return tableStore.leftGroupedColumns;
      case ColumnLock.right:
        return tableStore.rightGroupedColumns;
      default:
        return tableStore.groupedColumns;
    }
  }
}
