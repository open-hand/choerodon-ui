import React, { Children, isValidElement, ReactNode } from 'react';
import { action, computed, observable, runInAction } from 'mobx';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import defer from 'lodash/defer';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import Column, { ColumnProps, columnWidth } from './Column';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import ObserverCheckBox from '../check-box';
import ObserverRadio from '../radio';
import { DataSetSelection, RecordStatus } from '../data-set/enum';
import {
  ColumnAlign,
  ColumnLock,
  SelectionMode,
  TableEditMode,
  TableMode,
  TableQueryBarType,
} from './enum';
import { stopPropagation } from '../_util/EventManager';
import { getColumnKey, getHeader } from './utils';
import getReactNodeText from '../_util/getReactNodeText';
import ColumnGroups from './ColumnGroups';
import autobind from '../_util/autobind';
import ColumnGroup from './ColumnGroup';
import { expandIconProps, TablePaginationConfig } from './Table';

const SELECTION_KEY = '__selection-column__';
export const EXPAND_KEY = '__expand-column__';

export type HeaderText = { name: string; label: string; };

export const getIdList = (startId: number, endId: number) => {
  const idList: any[] = [];
  const min = Math.min(startId, endId);
  const max = Math.max(startId, endId);
  for (let i = min; i <= max; i++) {
    idList.push(i);
  }
  return idList;
};

function renderSelectionBox({ record, store }: { record: any, store: TableStore; }) {
  const { dataSet } = record;
  if (dataSet) {
    const { selection } = dataSet;
    const handleChange = value => {
      if (store.props.selectionMode === SelectionMode.mousedown) {
        // 将处理逻辑交给 mousedown 的处理逻辑 不然会两次触发导致不被勾选上
        return;
      }
      if (value) {
        dataSet.select(record);
      } else {
        dataSet.unSelect(record);
      }
    };

    const handleClick = e => {
      stopPropagation(e);
      if (record.isSelected) {
        dataSet.unSelect(record);
      }
    };

    const handleMouseDown = () => {
      if (store.useMouseBatchChoose) {
        store.mouseBatchChooseStartId = record.id;
        store.mouseBatchChooseEndId = record.id;
        store.mouseBatchChooseState = true;
      }
    };

    const handleMouseEnter = () => {
      if (store.useMouseBatchChoose && store.mouseBatchChooseState) {
        store.mouseBatchChooseEndId = record.id;
        store.changeMouseBatchChooseIdList(getIdList(store.mouseBatchChooseStartId, store.mouseBatchChooseEndId));
      }
    };

    if (selection === DataSetSelection.multiple) {
      return (
        <ObserverCheckBox
          checked={record.isSelected}
          onChange={handleChange}
          onClick={stopPropagation}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          disabled={!record.selectable}
          value
        />
      );
    }
    if (selection === DataSetSelection.single) {
      return (
        <ObserverRadio
          checked={record.isSelected}
          onChange={handleChange}
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          disabled={!record.selectable}
          value
        />
      );
    }
  }
}

function mergeDefaultProps(columns: ColumnProps[], defaultKey: number[] = [0]): ColumnProps[] {
  const columnsNew: any[] = [];
  const leftFixedColumns: any[] = [];
  const rightFixedColumns: any[] = [];
  columns.forEach((column: ColumnProps) => {
    if (isPlainObject(column)) {
      const newColumn: ColumnProps = { ...Column.defaultProps, ...column };
      if (isNil(getColumnKey(newColumn))) {
        newColumn.key = `anonymous-${defaultKey[0]++}`;
      }
      const { children } = newColumn;
      if (children) {
        newColumn.children = mergeDefaultProps(children, defaultKey);
      }
      if (newColumn.lock === ColumnLock.left || newColumn.lock === true) {
        leftFixedColumns.push(newColumn);
      } else if (newColumn.lock === ColumnLock.right) {
        rightFixedColumns.push(newColumn);
      } else {
        columnsNew.push(newColumn);
      }
    }
  });
  return leftFixedColumns.concat(columnsNew, rightFixedColumns);
}

function normalizeColumns(
  elements: ReactNode,
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
) {
  const columns: any[] = [];
  const leftFixedColumns: any[] = [];
  const rightFixedColumns: any[] = [];
  Children.forEach(elements, element => {
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

async function getHeaderTexts(
  dataSet: DataSet,
  columns: ColumnProps[],
  headers: HeaderText[] = [],
): Promise<HeaderText[]> {
  const column = columns.shift();
  if (column) {
    headers.push({ name: column.name!, label: await getReactNodeText(getHeader(column, dataSet)) });
  }
  if (columns.length) {
    await getHeaderTexts(dataSet, columns, headers);
  }
  return headers;
}

export default class TableStore {
  node: any;

  @observable props: any;

  @observable bodyHeight: number;

  @observable width?: number;

  @observable height?: number;

  @observable lastScrollTop?: number;

  @observable lockColumnsBodyRowsHeight: any;

  @observable lockColumnsFootRowsHeight: any;

  @observable lockColumnsHeadRowsHeight: any;

  @observable expandedRows: (string | number)[];

  @observable hoverRow?: Record;

  @observable currentEditorName?: string;

  @observable styledHidden?: boolean;

  mouseBatchChooseStartId: number = 0;

  mouseBatchChooseEndId: number = 0;

  mouseBatchChooseState: boolean = false;

  @observable mouseBatchChooseIdList?: number[];

  @computed
  get dataSet(): DataSet {
    return this.props.dataSet;
  }

  get hidden(): boolean {
    return !!this.styledHidden || this.props.hidden;
  }

  @computed
  get alwaysShowRowBox(): boolean {
    if ('alwaysShowRowBox' in this.props) {
      return this.props.alwaysShowRowBox;
    }
    const alwaysShowRowBox = getConfig('TableAlwaysShowRowBox');
    if (typeof alwaysShowRowBox !== 'undefined') {
      return alwaysShowRowBox;
    }
    return false;
  }

  @computed
  get columnResizable(): boolean {
    if (this.currentEditRecord) {
      return false;
    }
    if ('columnResizable' in this.props) {
      return this.props.columnResizable;
    }
    if (getConfig('tableColumnResizable') === false) {
      return false;
    }
    return true;
  }

  @computed
  get pagination(): TablePaginationConfig | false | undefined {
    if ('pagination' in this.props) {
      return this.props.pagination;
    }
    return getConfig('pagination');
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
    return getConfig('renderEmpty')('Table');
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
  get selectedHighLightRow(): boolean {
    if ('selectedHighLightRow' in this.props) {
      return this.props.selectedHighLightRow;
    }
    if (getConfig('tableSelectedHighLightRow') === false) {
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
  get queryBar(): TableQueryBarType {
    return this.props.queryBar || getConfig('queryBar');
  }

  @computed
  get expandIcon(): (props: expandIconProps) => ReactNode {
    return this.props.expandIcon || getConfig('tableExpandIcon');
  }

  get pristine(): boolean {
    return this.props.pristine;
  }

  @computed
  get currentEditRecord(): Record | undefined {
    return this.dataSet.find(record => record.editing === true);
  }

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
        defer(action(() => (record.editing = true)));
      }
    });
  }

  @observable showCachedSeletion?: boolean;

  get isTree(): boolean {
    return this.props.mode === TableMode.tree;
  }

  get editing(): boolean {
    return this.currentEditorName !== undefined || this.currentEditRecord !== undefined;
  }

  @computed
  get hasRowBox(): boolean {
    const { dataSet, selectionMode } = this.props;
    const { alwaysShowRowBox } = this;
    if (dataSet) {
      const { selection } = dataSet;
      return selection && (selectionMode === SelectionMode.rowbox || alwaysShowRowBox);
    }
    return false;
  }

  @computed
  get useMouseBatchChoose(): boolean {
    const { useMouseBatchChoose } = this.props;
    return useMouseBatchChoose || getConfig('tableUseMouseBatchChoose') || false;
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
    return (
      bodyHeight !== undefined &&
      height !== undefined &&
      height < bodyHeight + (this.overflowX ? measureScrollbar() : 0)
    );
  }

  @computed
  get columns(): ColumnProps[] {
    const { columns, children } = this.props;
    return observable.array(
      this.addExpandColumn(
        this.addSelectionColumn(columns ? mergeDefaultProps(columns) : normalizeColumns(children)),
      ),
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
    return this.groupedColumns.filter(
      ({ column: { lock } }) => lock === ColumnLock.left || lock === true,
    );
  }

  @computed
  get rightGroupedColumns(): ColumnGroup[] {
    return this.groupedColumns.filter(({ column: { lock } }) => lock === ColumnLock.right);
  }

  @computed
  get leafColumns(): ColumnProps[] {
    return this.getLeafColumns(this.columns);
  }

  @computed
  get leftLeafColumns(): ColumnProps[] {
    return this.getLeafColumns(this.leftColumns);
  }

  @computed
  get rightLeafColumns(): ColumnProps[] {
    return this.getLeafColumns(this.rightColumns);
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
    let data = isTree ? dataSet.treeRecords : dataSet.records;
    if (typeof filter === 'function') {
      data = data.filter(filter);
    }
    if (pristine) {
      data = data.filter(record => record.status !== RecordStatus.add);
    }
    if (showCachedSeletion) {
      return [...dataSet.cachedSelected, ...data];
    }
    return data;
  }

  @computed
  get indeterminate(): boolean {
    const { dataSet, showCachedSeletion } = this;
    if (dataSet) {
      const { length } = dataSet.records.filter(record => record.selectable);
      const selectedLength = showCachedSeletion
        ? dataSet.selected.length
        : dataSet.currentSelected.length;
      return !!selectedLength && selectedLength !== length;
    }
    return false;
  }

  @computed
  get allChecked(): boolean {
    const { dataSet, showCachedSeletion } = this;
    if (dataSet) {
      const { length } = dataSet.records.filter(record => record.selectable);
      const selectedLength = showCachedSeletion
        ? dataSet.selected.length
        : dataSet.currentSelected.length;
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
    const {
      expandIconAsCell,
      props: { expandIconColumnIndex = 0 },
    } = this;
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

  private handleSelectAllChange = action(value => {
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

  async getColumnHeaders(): Promise<HeaderText[]> {
    const { leafNamedColumns, dataSet } = this;
    return getHeaderTexts(dataSet, leafNamedColumns.slice());
  }

  @action
  showEditor(name: string) {
    this.currentEditorName = name;
  }

  @action
  setLastScrollTop(lastScrollTop: number) {
    this.lastScrollTop = lastScrollTop;
  }

  @action
  hideEditor() {
    this.currentEditorName = undefined;
  }

  @action
  changeMouseBatchChooseIdList(idList: number[]) {
    this.mouseBatchChooseIdList = idList;
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
    const expanded =
      (this.dataSet.props.expandField && record.isExpanded) ||
      this.expandedRows.indexOf(record.key) !== -1;
    return expanded && (!this.isTree || !parent || this.isRowExpanded(parent));
  }

  @action
  setRowExpanded(record: Record, expanded: boolean) {
    if (this.dataSet.props.expandField) {
      record.isExpanded = expanded;
    }
    const index = this.expandedRows.indexOf(record.key);
    if (expanded) {
      if (index === -1) {
        this.expandedRows.push(record.key);
      }
    } else if (index !== -1) {
      this.expandedRows.splice(index, 1);
    }
    const { onExpand } = this.props;
    if (onExpand) {
      onExpand(expanded, record);
    }
  }

  isRowHover(record: Record): boolean {
    return this.hoverRow === record;
  }

  @action
  setRowHover(record: Record, hover: boolean) {
    this.hoverRow = hover ? record : undefined;
  }

  @action
  expandAll() {
    this.dataSet.records.forEach(record => this.setRowExpanded(record, true));
  }

  @action
  collapseAll() {
    this.dataSet.records.forEach(record => this.setRowExpanded(record, false));
  }

  private getLeafColumns(columns: ColumnProps[]): ColumnProps[] {
    const leafColumns: ColumnProps[] = [];
    columns.forEach(column => {
      if (!column.children || column.children.length === 0) {
        leafColumns.push(column);
      } else {
        leafColumns.push(...this.getLeafColumns(column.children));
      }
    });
    return leafColumns;
  }

  private addExpandColumn(columns: ColumnProps[]): ColumnProps[] {
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

  @autobind
  private multipleSelectionRenderer() {
    return (
      <ObserverCheckBox
        checked={this.allChecked}
        indeterminate={this.indeterminate}
        onChange={this.handleSelectAllChange}
        value
      />
    );
  }

  private addSelectionColumn(columns: ColumnProps[]): ColumnProps[] {
    if (this.hasRowBox) {
      const { dataSet } = this;
      const { suffixCls, prefixCls } = this.props;
      const selectionColumn: ColumnProps = {
        key: SELECTION_KEY,
        resizable: false,
        className: `${getProPrefixCls(suffixCls!, prefixCls)}-selection-column`,
        renderer: ({ record }) => renderSelectionBox({ record, store: this }),
        align: ColumnAlign.center,
        width: 50,
        lock: true,
      };
      if (dataSet && dataSet.selection === DataSetSelection.multiple) {
        selectionColumn.header = this.multipleSelectionRenderer;
        selectionColumn.footer = this.multipleSelectionRenderer;
      }
      columns.unshift(selectionColumn);
    }
    return columns;
  }
}
