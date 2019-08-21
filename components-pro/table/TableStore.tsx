import React, { Children, isValidElement, ReactNode } from 'react';
import { action, computed, observable, runInAction } from 'mobx';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import defer from 'lodash/defer';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import Column, { ColumnProps, columnWidth } from './Column';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import CheckBox from '../check-box';
import Radio from '../radio';
import { DataSetSelection, RecordStatus } from '../data-set/enum';
import { ColumnAlign, ColumnLock, SelectionMode, TableEditMode, TableMode, TableQueryBar } from './enum';
import { stopPropagation } from '../_util/EventManager';
import { getColumnKey, getHeader } from './utils';
import getReactNodeText from '../_util/getReactNodeText';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import ColumnGroups, { ColumnGroup } from './ColumnGroups';
import { $l } from '../locale-context';

const SELECTION_KEY = '__selection-column__';
export const EXPAND_KEY = '__expand-column__';

export default class TableStore {

  node: any;

  @observable props: any;

  @observable bodyHeight: number;
  @observable width?: number;
  @observable height?: number;

  @observable lockColumnsBodyRowsHeight: any;
  @observable lockColumnsFootRowsHeight: any;
  @observable lockColumnsHeadRowsHeight: any;

  @observable expandedRows: Record[];

  @observable hoverRow?: Record;

  @observable currentEditorName?: string;

  @computed
  get dataSet(): DataSet {
    return this.props.dataSet;
  }

  @computed
  get columnResizable(): boolean {
    if ('columnResizable' in this.props) {
      return this.props.columnResizable;
    }
    if (getConfig('tableColumnResizable') === false) {
      return false;
    }
    return true;
  }

  @computed
  get rowHeight(): 'auto' | number {
    if ('rowHeight' in this.props) {
      return this.props.rowHeight;
    }
    const rowHeight = getConfig('tableRowHeight');
    if (typeof rowHeight !== 'undefined') {
      return rowHeight;
    }
    return 30;
  }

  @computed
  get emptyText(): ReactNode {
    const renderEmpty = getConfig('renderEmpty');
    if (typeof renderEmpty === 'function') {
      return renderEmpty('Table');
    }
    return $l('Table', 'empty_data');
  }

  @computed
  get highLightRow(): boolean {
    if ('highLightRow' in this.props) {
      return this.props.highLightRow;
    }
    if (getConfig('tableHighLightRow') === false) {
      return false;
    }
    return true;
  }

  @computed
  get border(): boolean {
    if ('border' in this.props) {
      return this.props.border;
    }
    if (getConfig('tableBorder') === false) {
      return false;
    }
    return true;
  }

  @computed
  get queryBar(): TableQueryBar {
    return this.props.queryBar || getConfig('queryBar');
  }

  get pristine(): boolean {
    return this.props.pristine;
  }

  @computed
  get currentEditRecord(): Record | undefined {
    return this.dataSet.find(record => record.editing === true);
  };

  set currentEditRecord(record: Record | undefined) {
    runInAction(() => {
      const { currentEditRecord, dataSet } = this;
      if (currentEditRecord) {
        if (currentEditRecord.status === RecordStatus.add) {
          dataSet.remove(currentEditRecord);
        } else {
          currentEditRecord.reset();
          currentEditRecord.editing = false;
        }
      }
      if (record) {
        defer(action(() => record.editing = true));
      }
    });
  };

  @observable showCachedSeletion?: boolean;

  get isTree(): boolean {
    return this.props.mode === TableMode.tree;
  }

  get editing(): boolean {
    return this.currentEditorName !== void 0 || this.currentEditRecord !== void 0;
  }

  @computed
  get hasRowBox(): boolean {
    const { dataSet, selectionMode } = this.props;
    if (dataSet) {
      const { selection } = dataSet;
      return selection && selectionMode === SelectionMode.rowbox;
    }
    return false;
  }

  @computed
  get overflowX(): boolean {
    if (this.width) {
      return this.totalLeafColumnsWidth > this.width;
    }
    return false;
  }

  @computed
  get overflowY(): boolean {
    const { bodyHeight, height } = this;
    return bodyHeight !== void 0 && height !== void 0 && height < bodyHeight + (this.overflowX ? measureScrollbar() : 0);
  }

  @computed
  get columns(): ColumnProps[] {
    const { columns, children } = this.props;
    return observable.array(
      this._addExpandColumn(this._addSelectionColumn(columns ? mergeDefaultProps(columns) : normalizeColumns(children))),
    );
  }

  @computed
  get leftColumns(): ColumnProps[] {
    return this.columns.filter(column => column.lock === ColumnLock.left || column.lock === true);
  }

  @computed
  get rightColumns(): ColumnProps[] {
    return this.columns.filter(column => column.lock === ColumnLock.right);
  }

  @computed
  get columnGroups(): ColumnGroups {
    return new ColumnGroups(this.columns);
  }

  @computed
  get groupedColumns(): ColumnGroup[] {
    return this.columnGroups.columns;
  }

  @computed
  get leftGroupedColumns(): ColumnGroup[] {
    return this.groupedColumns.filter(({ column: { lock } }) => lock === ColumnLock.left || lock === true);
  }

  @computed
  get rightGroupedColumns(): ColumnGroup[] {
    return this.groupedColumns.filter(({ column: { lock } }) => lock === ColumnLock.right);
  }

  @computed
  get leafColumns(): ColumnProps[] {
    return this._leafColumns(this.columns);
  }

  @computed
  get leftLeafColumns(): ColumnProps[] {
    return this._leafColumns(this.leftColumns);
  }

  @computed
  get rightLeafColumns(): ColumnProps[] {
    return this._leafColumns(this.rightColumns);
  }

  @computed
  get leafNamedColumns(): ColumnProps[] {
    return this.leafColumns.filter(column => !!column.name);
  }

  @computed
  get totalLeafColumnsWidth(): number {
    return this.leafColumns.reduce((total, column) => total + columnWidth(column), 0);
  }

  @computed
  get leftLeafColumnsWidth(): number {
    return this.leftLeafColumns.reduce((total, column) => total + columnWidth(column), 0);
  }

  @computed
  get rightLeafColumnsWidth(): number {
    return this.rightLeafColumns.reduce((total, column) => total + columnWidth(column), 0);
  }

  @computed
  get hasCheckFieldColumn(): boolean {
    const { checkField } = this.dataSet.props;
    return this.leafColumns.some(({ name, editor }) => !!editor && checkField === name);
  }

  @computed
  get hasFooter(): boolean {
    return this.leafColumns.some(column => !!column.footer && column.key !== SELECTION_KEY);
  }

  @computed
  get isAnyColumnsResizable(): boolean {
    return this.leafColumns.some(column => column.resizable === true);
  }

  @computed
  get isAnyColumnsLock(): boolean {
    return this.columns.some(column => !!column.lock);
  }

  @computed
  get isAnyColumnsLeftLock(): boolean {
    return this.columns.some(column => column.lock === ColumnLock.left || column.lock === true);
  }

  @computed
  get isAnyColumnsRightLock(): boolean {
    return this.columns.some(column => column.lock === ColumnLock.right);
  }

  @computed
  get data(): Record[] {
    const { filter, pristine } = this.props;
    const { dataSet, isTree, showCachedSeletion } = this;
    let data = isTree ? dataSet.treeData : dataSet.data;
    if (typeof filter === 'function') {
      data = data.filter(filter);
    }
    if (pristine) {
      data = data.filter(record => record.status !== RecordStatus.add);
    }
    if (showCachedSeletion) {
      return [...dataSet.cachedSelected, ...data];
    } else {
      return data;
    }
  }

  @computed
  get indeterminate(): boolean {
    const { dataSet, showCachedSeletion } = this;
    if (dataSet) {
      const { length } = (showCachedSeletion ? this.data : dataSet.data).filter(record => record.selectable);
      const selectedLength = showCachedSeletion ? dataSet.selected.length : dataSet.currentSelected.length;
      return !!selectedLength && selectedLength !== length;
    }
    return false;
  }

  @computed
  get allChecked(): boolean {
    const { dataSet, showCachedSeletion } = this;
    if (dataSet) {
      const { length } = (showCachedSeletion ? this.data : dataSet.data).filter(record => record.selectable);
      const selectedLength = showCachedSeletion ? dataSet.selected.length : dataSet.currentSelected.length;
      return !!selectedLength && selectedLength === length;
    }
    return false;
  }

  @computed
  get expandIconAsCell(): boolean {
    const { expandedRowRenderer } = this.props;
    return !!expandedRowRenderer && !this.isTree;
  }

  @computed
  get expandIconColumnIndex(): number {
    const { expandIconAsCell, props: { expandIconColumnIndex = 0 } } = this;
    if (expandIconAsCell) {
      return 0;
    }
    if (this.hasRowBox) {
      return expandIconColumnIndex + 1;
    }
    return expandIconColumnIndex;
  }

  @computed
  get inlineEdit() {
    return this.props.editMode === TableEditMode.inline;
  }

  private handleSelectAllChange = action((value) => {
    const { dataSet, filter } = this.props;
    if (value) {
      dataSet.selectAll(filter);
    } else {
      dataSet.unSelectAll();
      if (this.showCachedSeletion) {
        dataSet.clearCachedSelected();
      }
    }
  });

  constructor(node) {
    runInAction(() => {
      this.showCachedSeletion = false;
      this.lockColumnsHeadRowsHeight = {};
      this.lockColumnsBodyRowsHeight = {};
      this.lockColumnsFootRowsHeight = {};
      this.node = node;
      this.expandedRows = [];
    });
    this.setProps(node.props);
  }

  async getColumnHeaders(): Promise<{ name: string, label: string }[]> {
    const { leafNamedColumns, dataSet } = this;
    const headers: { name: string, label: string }[] = [];
    for (let column of leafNamedColumns) {
      headers.push({ name: column.name!, label: await getReactNodeText(getHeader(column, dataSet)) });
    }
    return headers;
  }

  @action
  showEditor(name: string) {
    this.currentEditorName = name;
  }

  @action
  hideEditor() {
    this.currentEditorName = void 0;
  }

  showNextEditor(name: string, reserve: boolean) {
    if (reserve) {
      this.dataSet.pre();
    } else {
      this.dataSet.next();
    }
    this.showEditor(name);
  }

  @action
  setProps(props) {
    this.props = props;
  }

  isRowExpanded(record: Record): boolean {
    const { parent } = record;
    const expanded = this.dataSet.props.expandField ? record.isExpanded : this.expandedRows.indexOf(record) !== -1;
    return expanded && (!this.isTree || !parent || this.isRowExpanded(parent));
  }

  @action
  setRowExpanded(record: Record, expanded: boolean) {
    if (this.dataSet.props.expandField) {
      record.isExpanded = expanded;
    } else {
      if (expanded) {
        this.expandedRows.push(record);
      } else {
        const index = this.expandedRows.indexOf(record);
        if (index !== -1) {
          this.expandedRows.splice(index, 1);
        }
      }
    }
  }

  isRowHover(record: Record): boolean {
    return this.hoverRow === record;
  }

  @action
  setRowHover(record: Record, hover: boolean) {
    this.hoverRow = hover ? record : void 0;
  }

  expandAll() {
    this.dataSet.data.forEach(record => this.setRowExpanded(record, true));
  }

  collapseAll() {
    this.dataSet.data.forEach(record => this.setRowExpanded(record, false));
  }

  _leafColumns(columns: ColumnProps[]): ColumnProps[] {
    const leafColumns: ColumnProps[] = [];
    columns.forEach((column) => {
      if (!column.children || column.children.length === 0) {
        leafColumns.push(column);
      } else {
        leafColumns.push(...this._leafColumns(column.children));
      }
    });
    return leafColumns;
  }

  _addExpandColumn(columns: ColumnProps[]): ColumnProps[] {
    if (this.expandIconAsCell) {
      columns.unshift({
        key: EXPAND_KEY,
        resizable: false,
        align: ColumnAlign.center,
        width: 50,
        lock: true,
      });
    }
    return columns;
  }

  _addSelectionColumn(columns: ColumnProps[]): ColumnProps[] {
    if (this.hasRowBox) {
      const { dataSet } = this;
      const { suffixCls, prefixCls } = this.props;
      const selectionColumn: ColumnProps = {
        key: SELECTION_KEY,
        resizable: false,
        className: `${getProPrefixCls(suffixCls!, prefixCls)}-selection-column`,
        renderer: renderSelectionBox,
        align: ColumnAlign.center,
        width: 50,
        lock: true,
      };
      if (dataSet) {
        const { selection } = dataSet;
        if (selection === DataSetSelection.multiple) {
          selectionColumn.header = selectionColumn.footer = () => (
            <CheckBox
              checked={this.allChecked}
              indeterminate={this.indeterminate}
              onChange={this.handleSelectAllChange}
              value
            />
          );
        }
      }
      columns.unshift(selectionColumn);
    }
    return columns;
  }
}

function renderSelectionBox({ record }) {
  const { dataSet } = record;
  if (dataSet) {
    const { selection } = dataSet;
    const handleChange = (value) => {
      if (value) {
        dataSet.select(record);
      } else {
        dataSet.unSelect(record);
      }
    };
    if (selection === DataSetSelection.multiple) {
      return (
        <CheckBox
          checked={record.isSelected}
          onChange={handleChange}
          onClick={stopPropagation}
          disabled={!record.selectable}
          value
        />
      );
    } else if (selection === DataSetSelection.single) {
      return (
        <Radio
          checked={record.isSelected}
          onChange={handleChange}
          onClick={stopPropagation}
          disabled={!record.selectable}
          value
        />
      );
    }
  }
}

function mergeDefaultProps(columns: ColumnProps[], defaultKey: number[] = [0]): ColumnProps[] {
  return columns.reduce<ColumnProps[]>((newColumns, column) => {
    if (isPlainObject(column)) {
      const newColumn: ColumnProps = { ...Column.defaultProps, ...column };
      if (isNil(getColumnKey(newColumn))) {
        newColumn.key = `anonymous-${defaultKey[0]++}`;
      }
      const { children } = newColumn;
      if (children) {
        newColumn.children = mergeDefaultProps(children, defaultKey);
      }
      newColumns.push(newColumn);
    }
    return newColumns;
  }, []);
}

function normalizeColumns(elements: ReactNode, parent: ColumnProps | null = null, defaultKey: number[] = [0]) {
  const columns: any[] = [];
  const leftFixedColumns: any[] = [];
  const rightFixedColumns: any[] = [];
  Children.forEach(elements, (element) => {
    if (!isValidElement(element) || element.type !== Column) {
      return;
    }
    const { props, key } = element;
    const column: any = {
      ...props,
    };
    if (isNil(getColumnKey(column))) {
      column.key = `anonymous-${defaultKey[0]++}`;
    }
    if (parent) {
      column.lock = parent.lock;
    }
    column.children = normalizeColumns(column.children, column, defaultKey);
    if (key) {
      column.key = key;
    }
    if (column.lock === ColumnLock.left || column.lock === true) {
      leftFixedColumns.push(column);
    } else if (column.lock === ColumnLock.right) {
      rightFixedColumns.push(column);
    } else {
      columns.push(column);
    }
  });
  return leftFixedColumns.concat(columns, rightFixedColumns);
}
