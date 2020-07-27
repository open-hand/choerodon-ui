import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed } from 'mobx';
import classes from 'component-classes';
import raf from 'raf';
import {
  Droppable,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
  DraggableRubric,
} from 'react-beautiful-dnd';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { isFunction } from 'lodash';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock , DragColumnAlign} from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import autobind from '../_util/autobind';
import { instance } from './Table';
import { findFirstFocusableInvalidElement } from './utils';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock | boolean;
  indentSize: number;
  dragColumnAlign?:DragColumnAlign;
}

@observer
export default class TableTBody extends Component<TableTBodyProps, any> {
  static displayName = 'TableTBody';

  static propTypes = {
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
    dragColumnAlign: PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    prefixCls: PropTypes.string,
    indentSize: PropTypes.number.isRequired,
  };

  static contextType = TableContext;

  tableBody: HTMLElement | null;

  nextFrameActionId?: number;

  @computed
  get leafColumns(): ColumnProps[] {
    const { tableStore } = this.context;
    const { lock } = this.props;
    if (lock === 'right') {
      return tableStore.rightLeafColumns.filter(({ hidden }) => !hidden);
    }
    if (lock) {
      return tableStore.leftLeafColumns.filter(({ hidden }) => !hidden);
    }
    return tableStore.leafColumns.filter(({ hidden }) => !hidden);
  }

  @computed
  get leafColumnsBody(): ColumnProps[] {
    const { tableStore } = this.context;
    return tableStore.leafColumns.filter(({ hidden }) => !hidden);
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
    const { prefixCls, lock , indentSize, dragColumnAlign} = this.props;
    const { leafColumns, leafColumnsBody } = this;
    const {
      tableStore: { data, dragColumnAlign: propsDragColumnAlign, props: { virtual,rowDragRender={}},dataSet, height, dragRow },
    } = this.context;
    const {droppableProps,renderClone} = rowDragRender
    const rowData = virtual && height ? this.processData() : data;
    const rows = data.length
      ? this.getRows(rowData, leafColumns, true, lock)
      : this.getEmptyRow(leafColumns, lock);
    const body = (
      <Droppable
        droppableId="table"
        key="table"
        isDropDisabled={(dragColumnAlign || propsDragColumnAlign) ? !(dragColumnAlign && propsDragColumnAlign) : !dragRow}
        renderClone={(
          provided: DraggableProvided,
          snapshot: DraggableStateSnapshot,
          rubric: DraggableRubric,
        ) => {
          const record = dataSet.get(rubric.source.index)
          if(renderClone && isFunction(renderClone)){
            return renderClone({
              provided,
              snapshot,
              key:record.id,
              hidden:false,
              lock:false,
              indentSize,
              prefixCls,
              column:leafColumnsBody,
              record,
              index:record.id,
              dragColumnAlign,
              rubric,
            })
          }
          return (
            <TableRow
              provided={provided}
              snapshot={snapshot}
              key={record.id}
              hidden={false}
              lock={false}
              indentSize={indentSize}
              prefixCls={prefixCls}
              columns={leafColumnsBody}
              record={record}
              index={record.id}
              dragColumnAlign = {dragColumnAlign}
            />
          );
        }}
        getContainerForClone={() => instance().tbody}
        {...droppableProps}
      >
      {(droppableProvided: DroppableProvided) => (
        <tbody
          ref={(ref: HTMLTableSectionElement | null) => {
          if(ref){
            this.saveRef(ref)
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
    );
    return lock ? (
      body
    ) : (
        <ReactResizeObserver onResize={this.handleResize} resizeProp="height">
          {body}
        </ReactResizeObserver>
      );
  }

  componentWillMount() {
    this.processDataSetListener(true);
  }


  componentWillUnmount() {
    this.processDataSetListener(false);
  }

  processDataSetListener(flag: boolean) {
    const { tableStore: { dataSet } } = this.context;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, 'validate', this.handleDataSetValidate);
    }
  }

  @autobind
  async handleDataSetValidate({ result }) {
    if (!await result) {
      const cell = this.tableBody ? findFirstFocusableInvalidElement(this.tableBody) : null;
      if (cell) {
        cell.focus();
      }
    }
  }

  componentDidUpdate() {
    const { lock, prefixCls } = this.props;
    if (!lock) {
      const {
        tableStore: { node },
      } = this.context;
      if (
        classes(node.wrapper).has(`${prefixCls}-focused`) &&
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
  ): ReactNode {
    return records.map((record, index) => this.getRow(columns, record, index, expanded, lock));
  }

  getEmptyRow(columns: ColumnProps[], lock?: ColumnLock | boolean): ReactNode | undefined {
    const {
      tableStore: { dataSet, emptyText, width },
    } = this.context;
    const { prefixCls } = this.props;
    const style: CSSProperties = width
      ? {
        marginLeft: pxToRem(width / 2),
      }
      : {
        transform: 'none',
        display: 'inline-block',
      };
    const tdStyle: CSSProperties = width ? {} : { textAlign: 'center' };
    return (
      <tr className={`${prefixCls}-empty-row`}>
        <td colSpan={columns.length} style={tdStyle}>
          <div style={style}>{!lock && dataSet.status === DataSetStatus.ready && emptyText}</div>
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
    const { prefixCls, indentSize, dragColumnAlign } = this.props;
    const {
      tableStore: { isTree, dragColumnAlign:propsDragColumnAlign, props:{ rowDragRender = {}},dragRow },
    } = this.context;
    const {draggableProps} = rowDragRender
    const children = isTree && (
      <ExpandedRow record={record} columns={columns} lock={lock}>
        {this.renderExpandedRows}
      </ExpandedRow>
    );
    return (
      <Draggable
        draggableId={record.key.toString()}
        index={index}
        isDragDisabled={(dragColumnAlign || propsDragColumnAlign) ? !(dragColumnAlign && propsDragColumnAlign) : !dragRow}
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
              indentSize={indentSize}
              prefixCls={prefixCls}
              columns={columns}
              record={record}
              index={index}
              dragColumnAlign={dragColumnAlign}
              {...draggableProps}
            >
              {children}
            </TableRow>
          )}
      </Draggable>
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
