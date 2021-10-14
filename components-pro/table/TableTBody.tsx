import React, { Component, CSSProperties, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import { Draggable, DraggableProvided, DraggableRubric, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { getConfig } from 'choerodon-ui/lib/configure';
import isFunction from 'lodash/isFunction';
import { ElementProps } from '../core/ViewComponent';
import TableContext, { TableContextValue } from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock, DragColumnAlign } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import autobind from '../_util/autobind';
import { DragTableRowProps, instance } from './Table';
import { isDraggingStyle, isStickySupport } from './utils';
import ColumnGroups from './ColumnGroups';
import TableRowGroup from './TableRowGroup';
import { $l } from '../locale-context';
import Button from '../button/Button';
import { Size } from '../core/enum';
import { ButtonColor, FuncType } from '../button/enum';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock;
  columnGroups: ColumnGroups;
}

@observer
export default class TableTBody extends Component<TableTBodyProps> {
  static displayName = 'TableTBody';

  static contextType = TableContext;

  declare context: TableContextValue;

  constructor(props, context) {
    super(props, context);
    const { tableStore, dataSet } = context;
    if (tableStore.performanceEnabled) {
      if (dataSet.status === DataSetStatus.ready && dataSet.length) {
        tableStore.performanceOn = true;
        tableStore.timing.renderStart = Date.now();
      }
    }
  }

  handlePerformance() {
    const { code, tableStore, dataSet } = this.context;
    if (tableStore.performanceEnabled && tableStore.performanceOn) {
      const { timing } = tableStore;
      const { performance } = dataSet;
      const onPerformance = getConfig('onPerformance');
      timing.renderEnd = Date.now();
      onPerformance('Table', {
        name: code,
        url: performance.url,
        size: dataSet.length,
        timing: {
          ...performance.timing,
          ...timing,
        },
      });
      tableStore.performanceOn = false;
    }
  }

  componentDidMount(): void {
    this.handlePerformance();
  }

  componentWillUpdate(): void {
    const { tableStore } = this.context;
    if (tableStore.performanceEnabled && tableStore.performanceOn) {
      tableStore.timing.renderStart = Date.now();
    }
  }

  componentDidUpdate() {
    this.handlePerformance();
    const { lock } = this.props;
    if (!lock) {
      const {
        tableStore: { node },
      } = this.context;
      if (
        node.isFocus &&
        !node.wrapper.contains(document.activeElement)
      ) {
        node.focus();
      }
    }
  }

  @autobind
  @action
  handleResize(_width: number, height: number) {
    const { tableStore } = this.context;
    if (!tableStore.hidden) {
      tableStore.calcBodyHeight = height;
    }
  }

  @autobind
  @action
  handleClearCache() {
    const { dataSet, tableStore } = this.context;
    dataSet.clearCachedRecords();
    tableStore.showCachedSelection = false;
  }

  render() {
    const { lock, columnGroups } = this.props;
    const {
      prefixCls, tableStore, rowDragRender, dataSet,
    } = this.context;
    const {
      cachedData, currentData, virtual, rowDraggable,
    } = tableStore;
    const virtualData = virtual ? currentData.slice(tableStore.virtualStartIndex, tableStore.virtualEndIndex) : currentData;
    const cachedRows = cachedData.length ? this.getRows(cachedData, columnGroups, true, virtual) : undefined;
    const rows = virtualData.length
      ? this.getRows(virtualData, columnGroups, true, virtual)
      : this.getEmptyRow(columnGroups);
    const body = rowDraggable ? (
      <Droppable
        droppableId="table"
        key="table"
        renderClone={(
          provided: DraggableProvided,
          snapshot: DraggableStateSnapshot,
          rubric: DraggableRubric,
        ) => {
          if (!isStickySupport() && snapshot.isDragging && tableStore.overflowX && tableStore.dragColumnAlign === DragColumnAlign.right) {
            const { style } = provided.draggableProps;
            if (isDraggingStyle(style)) {
              const { left, width } = style;
              style.left = left - Math.max(tableStore.columnGroups.leafColumnsWidth - tableStore.columnGroups.rightLeafColumnsWidth, width);
            }
          }
          const record = dataSet.get(rubric.source.index);
          if (record) {
            const leafColumnsBody = lock ? tableStore.columnGroups : columnGroups;
            const renderClone = rowDragRender && rowDragRender.renderClone;
            const { id } = record;
            if (renderClone && isFunction(renderClone)) {
              return renderClone({
                provided,
                snapshot,
                rubric,
                key: id,
                hidden: false,
                lock: false,
                prefixCls,
                columns: leafColumnsBody.leafs.map(({ column }) => column),
                columnGroups: leafColumnsBody,
                record,
                index: id,
              } as DragTableRowProps);
            }
            return (
              <TableRow
                provided={provided}
                snapshot={snapshot}
                key={id}
                hidden={false}
                lock={false}
                columnGroups={leafColumnsBody}
                record={record}
                index={id}
              />
            );
          }
          return <span />;
        }}
        getContainerForClone={() => instance(tableStore.node.getClassName(), prefixCls).tbody as React.ReactElement<HTMLElement>}
        {...(rowDragRender && rowDragRender.droppableProps)}
      >
        {(droppableProvided: DroppableProvided) => (
          <tbody
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`${prefixCls}-tbody`}>
            {rows}
            {droppableProvided.placeholder}
          </tbody>
        )}
      </Droppable>
    ) : (
      <tbody className={`${prefixCls}-tbody`}>
        {
          cachedRows && (
            <TableRowGroup columnGroups={columnGroups} lock={lock}>
              <span>{$l('Table', 'cached_records')}</span>
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                icon="delete"
                size={Size.small}
                onClick={this.handleClearCache}
              />
            </TableRowGroup>
          )
        }
        {cachedRows}
        {
          cachedRows && (
            <TableRowGroup columnGroups={columnGroups} lock={lock}>
              {$l('Table', 'current_page_records')}
            </TableRowGroup>
          )
        }
        {rows}
      </tbody>
    );
    return lock || virtual ? (
      body
    ) : (
      <ReactResizeObserver onResize={this.handleResize} resizeProp="height" immediately>
        {body}
      </ReactResizeObserver>
    );
  }

  getRows(
    records: Record[],
    columnGroups: ColumnGroups,
    expanded?: boolean,
    virtual?: boolean,
  ): ReactNode {
    return records.map((record, index) => this.getRow(columnGroups, record, virtual ? record.index : index, expanded));
  }

  getEmptyRow(columnGroups: ColumnGroups): ReactNode | undefined {
    const {
      prefixCls, dataSet, tableStore: { emptyText, width },
    } = this.context;
    const { lock } = this.props;
    const styles: CSSProperties = width ? {
      position: isStickySupport() ? 'sticky' : 'relative',
      left: pxToRem(width / 2),
    } : {
      transform: 'none',
      display: 'inline-block',
    };
    const tdStyle: CSSProperties | undefined = width ? undefined : { textAlign: 'center' };
    return (
      <tr className={`${prefixCls}-empty-row`}>
        <td colSpan={columnGroups.leafs.length} style={tdStyle}>
          <div style={styles}>{!lock && dataSet.status === DataSetStatus.ready && emptyText}</div>
        </td>
      </tr>
    );
  }

  @autobind
  renderExpandedRows(
    columnGroups: ColumnGroups,
    record: Record,
    isExpanded?: boolean,
  ): ReactNode {
    return this.getRows(record.children || [], columnGroups, isExpanded);
  }

  getRow(
    columnGroups: ColumnGroups,
    record: Record,
    index: number,
    expanded?: boolean,
  ): ReactNode {
    const { lock } = this.props;
    const { tableStore, rowDragRender } = this.context;
    const { key } = record;
    const children = tableStore.isTree && (
      <ExpandedRow record={record} columnGroups={columnGroups}>
        {this.renderExpandedRows}
      </ExpandedRow>
    );
    if (tableStore.rowDraggable) {
      const { dragColumnAlign } = tableStore;
      if (!dragColumnAlign || (dragColumnAlign === DragColumnAlign.right && lock !== ColumnLock.left) || (dragColumnAlign === DragColumnAlign.left && lock !== ColumnLock.right)) {
        return (
          <Draggable
            draggableId={String(key)}
            index={index}
            key={record.key}
          >
            {(
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
            ) => (
              <TableRow
                provided={provided}
                snapshot={snapshot}
                key={record.key}
                hidden={!expanded}
                lock={lock}
                columnGroups={columnGroups}
                record={record}
                index={index}
                {...(rowDragRender && rowDragRender.draggableProps)}
              >
                {children}
              </TableRow>
            )}
          </Draggable>
        );
      }
    }
    return (
      <TableRow
        key={key}
        hidden={!expanded}
        lock={lock}
        columnGroups={columnGroups}
        record={record}
        index={index}
      >
        {children}
      </TableRow>
    );
  }
}
