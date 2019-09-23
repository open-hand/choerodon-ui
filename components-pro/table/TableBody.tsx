import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import { observer } from 'mobx-react';
import { action, computed } from 'mobx';
import classes from 'component-classes';
import debounce from 'lodash/debounce';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';

export interface TableBodyProps extends ElementProps {
  lock?: ColumnLock | boolean;
  indentSize: number;
}

@observer
export default class TableBody extends Component<TableBodyProps, any> {
  static displayName = 'TableBody';

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

  resizeObserver?: ResizeObserver;

  private handleResize = debounce(() => {
    this.syncBodyHeight();
  }, 30);

  saveRef = node => {
    this.tableBody = node;
  };

  render() {
    const { prefixCls, lock } = this.props;
    const { leafColumns } = this;
    const {
      tableStore: { data },
    } = this.context;
    const rows = data.length
      ? this.getRows(data, leafColumns, true, lock)
      : this.getEmptyRow(leafColumns, lock);
    return (
      <tbody ref={lock ? undefined : this.saveRef} className={`${prefixCls}-tbody`}>
        {rows}
      </tbody>
    );
  }

  componentDidMount() {
    if (this.tableBody) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.tableBody);
    }
  }

  componentWillUnmount() {
    this.handleResize.cancel();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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
  ) {
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

  renderExpandedRows = (
    columns: ColumnProps[],
    record: Record,
    isExpanded?: boolean,
    lock?: ColumnLock | boolean,
  ) => this.getRows(record.children || [], columns, isExpanded, lock);

  getRow(
    columns: ColumnProps[],
    record: Record,
    index: number,
    expanded?: boolean,
    lock?: ColumnLock | boolean,
  ) {
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

  @action
  syncBodyHeight() {
    const { tableStore } = this.context;
    if (this.tableBody) {
      tableStore.bodyHeight = this.tableBody.offsetHeight;
    }
  }
}
