import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed } from 'mobx';
import raf from 'raf';
import { Draggable, DraggableProvided, DraggableRubric, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { getConfig } from 'choerodon-ui/lib/configure';
import isFunction from 'lodash/isFunction';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock, DragColumnAlign } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import autobind from '../_util/autobind';
import { instance } from './Table';
import { isDraggingStyle, isStickySupport } from './utils';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock | boolean;
}

@observer
export default class TableTBody extends Component<TableTBodyProps, any> {
  static displayName = 'TableTBody';

  static propTypes = {
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
  };

  static contextType = TableContext;

  tableBody: HTMLElement | null;

  nextFrameActionId?: number;

  @computed
  get leafColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    if (lock === ColumnLock.right) {
      return tableStore.rightLeafColumns.filter(({ hidden }) => !hidden);
    }
    if (lock) {
      return tableStore.leftLeafColumns.filter(({ hidden }) => !hidden);
    }
    return this.leafColumnsBody;
  }

  @computed
  get leafColumnsBody(): ColumnProps[] {
    const { tableStore } = this.context;
    return tableStore.leafColumns.filter(({ hidden }) => !hidden);
  }

  constructor(props, context) {
    super(props, context);
    const { tableStore } = context;
    if (tableStore.performanceEnabled) {
      const { dataSet } = tableStore;
      if (dataSet.status === DataSetStatus.ready && dataSet.length) {
        tableStore.performanceOn = true;
        tableStore.timing.renderStart = Date.now();
      }
    }
  }

  handlePerformance() {
    const { tableStore } = this.context;
    if (tableStore.performanceEnabled && tableStore.performanceOn) {
      const { dataSet, node, customizedCode, timing } = tableStore;
      const { performance } = dataSet;
      const onPerformance = getConfig('onPerformance');
      timing.renderEnd = Date.now();
      onPerformance('Table', {
        name: customizedCode || node.code,
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

  @autobind
  handleResize() {
    if (this.nextFrameActionId !== undefined) {
      raf.cancel(this.nextFrameActionId);
    }
    this.nextFrameActionId = raf(this.syncBodyHeight);
  }

  @autobind
  saveRef(node) {
    this.tableBody = node;
    this.handleResize();
  }

  /**
   * 虚拟滚动计算可视化数据
   */
  @autobind
  processData() {
    const {
      tableStore: { data, lastScrollTop = 0, height, rowHeight },
    } = this.context;
    const startIndex = Math.max(Math.round((lastScrollTop / rowHeight) - 3), 0);
    const endIndex = Math.min(Math.round((lastScrollTop + height) / rowHeight + 2), data.length);
    return data.slice(startIndex, endIndex);
  }

  render() {
    const { lock } = this.props;
    const { leafColumns, leafColumnsBody } = this;
    const {
      tableStore,
    } = this.context;
    const {
      prefixCls, node, virtual, virtualData, dataSet, rowDraggable, dragColumnAlign, totalLeafColumnsWidth,
      props: { rowDragRender = {} },
    } = tableStore;
    const { droppableProps, renderClone } = rowDragRender;
    const rows = virtualData.length
      ? this.getRows(virtualData, leafColumns, true, lock, virtual)
      : this.getEmptyRow(leafColumns, lock);
    const body = rowDraggable ? (
      <Droppable
        droppableId="table"
        key="table"
        renderClone={(
          provided: DraggableProvided,
          snapshot: DraggableStateSnapshot,
          rubric: DraggableRubric,
        ) => {
          if (tableStore.overflowX && dragColumnAlign === DragColumnAlign.right && snapshot.isDragging) {
            const { style } = provided.draggableProps;
            if (isDraggingStyle(style)) {
              const { left, width } = style;
              style.left = left - Math.max(totalLeafColumnsWidth - 50, width);
            }
          }
          const record = dataSet.get(rubric.source.index);
          if (renderClone && isFunction(renderClone)) {
            return renderClone({
              provided,
              snapshot,
              key: record.id,
              hidden: false,
              lock: false,
              prefixCls,
              columns: leafColumnsBody,
              record,
              index: record.id,
              rubric,
            });
          }
          return (
            <TableRow
              provided={provided}
              snapshot={snapshot}
              key={record.id}
              hidden={false}
              lock={false}
              columns={leafColumnsBody}
              record={record}
              index={record.id}
            />
          );
        }}
        getContainerForClone={() => instance(node.getClassName(), prefixCls).tbody}
        {...droppableProps}
      >
        {(droppableProvided: DroppableProvided) => (
          <tbody
            ref={(ref: HTMLTableSectionElement | null) => {
              if (ref) {
                this.saveRef(ref);
                droppableProvided.innerRef(ref);
              }
            }}
            {...droppableProvided.droppableProps}
            className={`${prefixCls}-tbody`}>
            {rows}
            {droppableProvided.placeholder}
          </tbody>
        )}
      </Droppable>
    ) : (
      <tbody ref={lock ? undefined : this.saveRef} className={`${prefixCls}-tbody`}>
        {rows}
      </tbody>
    );
    return lock ? (
      body
    ) : (
      <ReactResizeObserver onResize={this.handleResize} resizeProp="height">
        {body}
      </ReactResizeObserver>
    );
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

  getRows(
    records: Record[],
    columns: ColumnProps[],
    expanded?: boolean,
    lock?: ColumnLock | boolean,
    virtual?: boolean,
  ): ReactNode {
    return records.map((record, index) => this.getRow(columns, record, virtual ? record.index : index, expanded, lock));
  }

  getEmptyRow(columns: ColumnProps[], lock?: ColumnLock | boolean): ReactNode | undefined {
    const {
      tableStore: { prefixCls, dataSet, emptyText, width, style },
    } = this.context;
    let tableWidth = width;
    if (style && style.width) {
      tableWidth = toPx(style?.width) || width;
    }
    const styles: CSSProperties = tableWidth
      ? {
        position: isStickySupport() ? 'sticky' : 'absolute',
        left: pxToRem(tableWidth / 2),
      }
      : {
        transform: 'none',
        display: 'inline-block',
      };
    const tdStyle: CSSProperties = tableWidth ? {} : { textAlign: 'center' };
    return (
      <tr className={`${prefixCls}-empty-row`}>
        <td colSpan={columns.length} style={tdStyle}>
          <div style={styles}>{!lock && dataSet.status === DataSetStatus.ready && emptyText}</div>
        </td>
      </tr>
    );
  }

  @autobind
  renderExpandedRows(
    columns: ColumnProps[],
    record: Record,
    isExpanded?: boolean,
    lock?: ColumnLock | boolean,
  ): ReactNode {
    return this.getRows(record.children || [], columns, isExpanded, lock);
  }

  getRow(
    columns: ColumnProps[],
    record: Record,
    index: number,
    expanded?: boolean,
    lock?: ColumnLock | boolean,
  ): ReactNode {
    const {
      tableStore: { isTree, props: { rowDragRender = {} }, rowDraggable, dragColumnAlign },
    } = this.context;
    const { draggableProps } = rowDragRender;
    const children = isTree && (
      <ExpandedRow record={record} columns={columns} lock={lock}>
        {this.renderExpandedRows}
      </ExpandedRow>
    );
    return rowDraggable && (!dragColumnAlign || (dragColumnAlign === DragColumnAlign.right && lock !== ColumnLock.left) || (dragColumnAlign === DragColumnAlign.left && lock !== ColumnLock.right)) ? (
      <Draggable
        draggableId={String(record.key)}
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
            columns={columns}
            record={record}
            index={index}
            {...draggableProps}
          >
            {children}
          </TableRow>
        )}
      </Draggable>
    ) : (
      <TableRow
        key={record.key}
        hidden={!expanded}
        lock={lock}
        columns={columns}
        record={record}
        index={index}
      >
        {children}
      </TableRow>
    );
  }

  @autobind
  @action
  syncBodyHeight() {
    const { tableStore } = this.context;
    if (this.tableBody && !tableStore.hidden) {
      tableStore.bodyHeight = this.tableBody.offsetHeight;
    }
  }
}
