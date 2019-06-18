import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';
import { observer } from 'mobx-react';
import { action, computed } from 'mobx';
import classes from 'component-classes';
import debounce from 'lodash/debounce';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';

export interface TableBodyProps extends ElementProps {
  lock?: ColumnLock | boolean;
  indentSize: number;
  rowHeight: number | 'auto';
  filter?: (record: Record) => boolean;
}

@observer
export default class TableBody extends Component<TableBodyProps, any> {
  static displayName = 'TableBody';

  static propTypes = {
    lock: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([ColumnLock.right, ColumnLock.left])]),
    prefixCls: PropTypes.string,
    indentSize: PropTypes.number.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]).isRequired,
    filter: PropTypes.func,
  };

  static contextType = TableContext;

  tableBody: HTMLTableSectionElement | null;

  resizeObserver?: ResizeObserver;

  private handleResize = debounce(() => {
    this.syncBodyHeight();
  }, 30);

  saveRef = (node) => {
    this.tableBody = node;
  };

  render() {
    const { prefixCls, lock } = this.props;
    const { leafColumns } = this;
    const { data } = this.context.tableStore;
    const rows = data.length ? this.getRows(data, leafColumns, true, lock) : this.getEmptyRow(leafColumns, lock);
    return (
      <tbody ref={lock ? void 0 : this.saveRef} className={`${prefixCls}-tbody`}>
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
    if (!this.props.lock) {
      const { node } = this.context.tableStore;
      if (classes(node.wrapper).has(`${this.props.prefixCls}-focused`)) {
        node.focus();
      }
    }
  }

  getRows(records: Record[], columns: ColumnProps[], expanded?: boolean, lock?: ColumnLock | boolean) {
    return records.map((record, index) => (
      this.getRow(columns, record, index, expanded, lock)
    ));
  }

  getEmptyRow(columns: ColumnProps[], lock?: ColumnLock | boolean): ReactNode | undefined {
    const { dataSet, emptyText, width } = this.context.tableStore;
    const { prefixCls } = this.props;
    const style: CSSProperties = { marginLeft: pxToRem(width / 2) };
    return (
      <tr className={`${prefixCls}-empty-row`}>
        <td colSpan={columns.length}>
          <div style={style}>
            {!lock && dataSet.status === DataSetStatus.ready && emptyText}
          </div>
        </td>
      </tr>
    );
  }

  renderExpandedRows = (columns: ColumnProps[], record: Record, isExpanded?: boolean, lock?: ColumnLock | boolean) =>
    this.getRows(record.children || [], columns, isExpanded, lock);

  getRow(columns: ColumnProps[], record: Record, index: number, expanded?: boolean, lock?: ColumnLock | boolean) {
    const { prefixCls, indentSize, rowHeight } = this.props;
    const { isTree } = this.context.tableStore;
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
        rowHeight={rowHeight}
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
      return tableStore.rightLeafColumns;
    } else if (lock) {
      return tableStore.leftLeafColumns;
    } else {
      return tableStore.leafColumns;
    }
  }

  @action
  syncBodyHeight() {
    const { tableStore } = this.context;
    if (this.tableBody) {
      tableStore.bodyHeight = this.tableBody.offsetHeight;
    }
  }
}
