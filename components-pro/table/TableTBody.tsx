import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed } from 'mobx';
import classes from 'component-classes';
import raf from 'raf';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import autobind from '../_util/autobind';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock | boolean;
  indentSize: number;
}

@observer
export default class TableTBody extends Component<TableTBodyProps, any> {
  static displayName = 'TableTBody';

  static propTypes = {
    lock: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf([ColumnLock.right, ColumnLock.left]),
    ]),
    prefixCls: PropTypes.string,
    indentSize: PropTypes.number.isRequired,
  };

  static contextType = TableContext;

  tableBody: HTMLTableSectionElement | null;

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
    const { prefixCls, lock } = this.props;
    const { leafColumns } = this;
    const {
      tableStore: { data, props: { virtual }, height },
    } = this.context;
    const rowData = virtual && height ? this.processData() : data;
    const rows = data.length
      ? this.getRows(rowData, leafColumns, true, lock)
      : this.getEmptyRow(leafColumns, lock);
    const body = (
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
    const { prefixCls, indentSize } = this.props;
    const {
      tableStore: { isTree },
    } = this.context;
    const children = isTree && (
      <ExpandedRow record={record} columns={columns} lock={lock}>
        {this.renderExpandedRows}
      </ExpandedRow>
    );
    return (
      <TableRow
        key={record.key}
        hidden={!expanded}
        lock={lock}
        indentSize={indentSize}
        prefixCls={prefixCls}
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
