import React, { Children, isValidElement, ReactNode } from 'react';
import { action, computed, get, observable, runInAction, set } from 'mobx';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import isNumber from 'lodash/isNumber';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import Icon from 'choerodon-ui/lib/icon';
import isFunction from 'lodash/isFunction';
import Column, { ColumnProps, columnWidth } from './Column';
import CustomizationSettings from './customization-settings/CustomizationSettings';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import ObserverCheckBox from '../check-box';
import ObserverRadio from '../radio';
import { DataSetSelection } from '../data-set/enum';
import { ColumnAlign, ColumnLock, DragColumnAlign, SelectionMode, TableColumnTooltip, TableEditMode, TableMode, TableQueryBarType } from './enum';
import { stopPropagation } from '../_util/EventManager';
import { getColumnKey, getColumnLock, getHeader } from './utils';
import getReactNodeText from '../_util/getReactNodeText';
import ColumnGroups from './ColumnGroups';
import autobind from '../_util/autobind';
import ColumnGroup from './ColumnGroup';
import { Customized, expandIconProps, TablePaginationConfig } from './Table';
import { Size } from '../core/enum';
import { $l } from '../locale-context';
import CustomizationColumnHeader from './customization-settings/CustomizationColumnHeader';
import TableEditor from './TableEditor';

export const SELECTION_KEY = '__selection-column__';

export const ROW_NUMBER_KEY = '__row-number-column__';

export const DRAG_KEY = '__drag-column__';

export const EXPAND_KEY = '__expand-column__';

export const CUSTOMIZED_KEY = '__customized-column__';

export const PENDING_KEY = '__pending__';

export const LOADED_KEY = '__loaded__';

export type HeaderText = { name: string; label: string; };

function columnFilter(column: ColumnProps | undefined): column is ColumnProps {
  return Boolean(column);
}

export const getIdList = (startId: number, endId: number) => {
  const idList: any[] = [];
  const min = Math.min(startId, endId);
  const max = Math.max(startId, endId);
  for (let i = min; i <= max; i++) {
    idList.push(i);
  }
  return idList;
};

function getRowNumbers(record?: Record | null, dataSet?: DataSet | null, isTree?: boolean): number[] {
  if (record && dataSet) {
    const { paging, currentPage, pageSize } = dataSet;
    const pageIndex = (isTree ? paging === 'server' : paging) ? (currentPage - 1) * pageSize : 0;
    if (isTree) {
      return record.path.map((r, index) => r.indexInParent + 1 + (index === 0 ? pageIndex : 0));
    }
    return [record.index + 1 + pageIndex];
  }
  return [0];
}

function renderSelectionBox({ record, store }: { record: any, store: TableStore; }): ReactNode {
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
          data-selection-key={SELECTION_KEY}
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
          data-selection-key={SELECTION_KEY}
          value
        />
      );
    }
  }
}

export function mergeDefaultProps(
  originalColumns: ColumnProps[],
  customizedColumns?: object,
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
): ColumnProps[] {
  const columns: any[] = [];
  const leftColumns: any[] = [];
  const rightColumns: any[] = [];
  const columnSort = {
    left: 0,
    center: 0,
    right: 0,
  };
  originalColumns.forEach((column, index) => {
    if (isPlainObject(column)) {
      const newColumn: ColumnProps = { ...Column.defaultProps, ...column };
      if (isNil(getColumnKey(newColumn))) {
        newColumn.key = `anonymous-${defaultKey[0]++}`;
      }
      if (customizedColumns) {
        Object.assign(newColumn, customizedColumns[getColumnKey(newColumn).toString()]);
      }
      if (parent) {
        newColumn.lock = parent.lock;
      }
      if (newColumn.sort === undefined) {
        if (parent) {
          newColumn.sort = index;
        } else {
          newColumn.sort = columnSort[getColumnLock(newColumn.lock) || 'center']++;
        }
      }
      const { children } = newColumn;
      if (children) {
        newColumn.children = mergeDefaultProps(children, customizedColumns, newColumn, defaultKey);
      }
      if (parent || !newColumn.lock) {
        columns.push(newColumn);
      } else if (newColumn.lock === true || newColumn.lock === ColumnLock.left) {
        leftColumns.push(newColumn);
      } else {
        rightColumns.push(newColumn);
      }
    }
  }, []);
  if (parent) {
    return sortBy(columns, ({ sort }) => sort);
  }
  return [
    ...sortBy(leftColumns, ({ sort }) => sort),
    ...sortBy(columns, ({ sort }) => sort),
    ...sortBy(rightColumns, ({ sort }) => sort),
  ];
}

export function normalizeColumns(
  elements: ReactNode,
  customizedColumns?: object,
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
) {
  const columns: any[] = [];
  const leftColumns: any[] = [];
  const rightColumns: any[] = [];
  const columnSort = {
    left: 0,
    center: 0,
    right: 0,
  };
  Children.forEach(elements, (element, index) => {
    if (!isValidElement(element) || !(element.type as typeof Column).__PRO_TABLE_COLUMN) {
      return;
    }
    const { props, key } = element;
    const column: any = {
      ...props,
    };
    if (key) {
      column.key = key;
    } else if (isNil(getColumnKey(column))) {
      column.key = `anonymous-${defaultKey[0]++}`;
    }
    if (customizedColumns) {
      Object.assign(column, customizedColumns[getColumnKey(column).toString()]);
    }
    if (parent) {
      column.lock = parent.lock;
    }
    if (column.sort === undefined) {
      if (parent) {
        column.sort = index;
      } else {
        column.sort = columnSort[getColumnLock(column.lock) || 'center']++;
      }
    }
    column.children = normalizeColumns(column.children, customizedColumns, column, defaultKey);
    if (parent || !column.lock) {
      columns.push(column);
    } else if (column.lock === true || column.lock === ColumnLock.left) {
      leftColumns.push(column);
    } else {
      rightColumns.push(column);
    }
  });
  if (parent) {
    return sortBy(columns, ({ sort }) => sort);
  }
  return [
    ...sortBy(leftColumns, ({ sort }) => sort),
    ...sortBy(columns, ({ sort }) => sort),
    ...sortBy(rightColumns, ({ sort }) => sort),
  ];
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

  editors: Map<string, TableEditor> = new Map();

  @observable props: any;

  @observable customized: Customized;

  @observable loading?: boolean;

  @observable originalColumns: ColumnProps[];

  @observable bodyHeight: number;

  @observable width?: number;

  @observable height?: number;

  @observable lastScrollTop: number;

  @observable lockColumnsBodyRowsHeight: any;

  @observable lockColumnsFootRowsHeight: any;

  @observable lockColumnsHeadRowsHeight: any;

  @observable expandedRows: (string | number)[];

  @observable isHeaderHover?: boolean;

  @observable hoverRow?: Record;

  @observable clickRow?: Record;

  @observable currentEditorName?: string;

  @observable styledHidden?: boolean;

  @observable rowHighLight: boolean;

  mouseBatchChooseStartId: number = 0;

  mouseBatchChooseEndId: number = 0;

  mouseBatchChooseState: boolean = false;

  @observable mouseBatchChooseIdList?: number[];

  @observable multiLineHeight: number[];

  @observable columnResizing?: boolean;

  inBatchExpansion: boolean = false;

  @computed
  get dataSet(): DataSet {
    return this.props.dataSet;
  }

  @computed
  get prefixCls() {
    const { suffixCls, prefixCls } = this.props;
    return getProPrefixCls(suffixCls!, prefixCls);
  }

  @computed
  get customizable(): boolean {
    if (this.columnTitleEditable || this.columnDraggable || this.columnHideable) {
      if ('customizable' in this.props) {
        return this.props.customizable;
      }
      return getConfig('tableCustomizable');
    }
    return false;
  }

  /**
   * number 矫正虚拟滚动由于样式问题导致的高度不符问题
   */
  @computed
  get virtualRowHeight(): number {
    const { virtualRowHeight } = this.props;
    if (virtualRowHeight) {
      return virtualRowHeight;
    }
    return isNumber(this.rowHeight) ? this.rowHeight + 3 : 33;
  }    

  @computed
  get virtual(): boolean {
    return this.props.virtual && this.height !== undefined && isNumber(this.virtualRowHeight);
  }

  @computed
  get virtualHeight(): number {
    const { virtualRowHeight, data } = this;
    return Math.round(data.length * virtualRowHeight);
  }

  @computed
  get virtualStartIndex(): number {
    const { virtualRowHeight, lastScrollTop } = this;
    return Math.max(Math.round((lastScrollTop / virtualRowHeight) - 3), 0);
  }

  @computed
  get virtualTop(): number {
    const { virtualRowHeight, virtualStartIndex } = this;
    return virtualStartIndex * virtualRowHeight;
  }

  @computed
  get virtualData(): Record[] {
    const { data, height, virtualRowHeight, props: { virtual } } = this;
    if (virtual && height !== undefined && isNumber(virtualRowHeight)) {
      const { lastScrollTop = 0 } = this;
      const startIndex = Math.max(Math.round((lastScrollTop / virtualRowHeight) - 3), 0);
      const endIndex = Math.min(Math.round((lastScrollTop + height) / virtualRowHeight ), data.length);
      return data.slice(startIndex, endIndex);
    }
    return data;
  }

  get hidden(): boolean {
    return !!this.styledHidden || this.props.hidden;
  }

  @computed
  get alwaysShowRowBox(): boolean {
    if ('alwaysShowRowBox' in this.props) {
      return this.props.alwaysShowRowBox;
    }
    const alwaysShowRowBox = getConfig('tableAlwaysShowRowBox');
    if (typeof alwaysShowRowBox !== 'undefined') {
      return alwaysShowRowBox;
    }
    return false;
  }

  @computed
  get keyboard(): boolean {
    if ('keyboard' in this.props) {
      return this.props.keyboard;
    }
    const keyboard = getConfig('tableKeyboard');
    if (typeof keyboard !== 'undefined') {
      return keyboard;
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
    return getConfig('tableColumnResizable') !== false;
  }

  @computed
  get columnHideable(): boolean {
    if ('columnHideable' in this.props) {
      return this.props.columnHideable;
    }
    return getConfig('tableColumnHideable') !== false;
  }

  /**
   * 表头支持编辑
   */
  @computed
  get columnTitleEditable(): boolean {
    if ('columnTitleEditable' in this.props) {
      return this.props.columnTitleEditable;
    }
    return getConfig('tableColumnTitleEditable') === true;
  }

  @computed
  get pagination(): TablePaginationConfig | false | undefined {
    if ('pagination' in this.props) {
      return this.props.pagination;
    }
    return getConfig('pagination');
  }

  @computed
  get dragColumnAlign(): DragColumnAlign | undefined {
    if ('dragColumnAlign' in this.props) {
      return this.props.dragColumnAlign;
    }
    return getConfig('tableDragColumnAlign');
  }

  @computed
  get columnDraggable(): boolean {
    if ('columnDraggable' in this.props) {
      return this.props.columnDraggable;
    }
    if ('dragColumn' in this.props) {
      return this.props.dragColumn;
    }
    if (getConfig('tableColumnDraggable') === true) {
      return true;
    }
    return getConfig('tableDragColumn') === true;
  }

  @computed
  get rowDraggable(): boolean {
    if (this.isTree) {
      return false;
    }
    if ('rowDraggable' in this.props) {
      return this.props.rowDraggable;
    }
    if ('dragRow' in this.props) {
      return this.props.dragRow;
    }
    if (getConfig('tableRowDraggable') === true) {
      return true;
    }
    return getConfig('tableDragRow') === true;
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
  get autoFootHeight(): boolean {
    if ('autoFootHeight' in this.props) {
      return this.props.autoFootHeight;
    }
    return false;
  }

  @computed
  get emptyText(): ReactNode {
    return getConfig('renderEmpty')('Table');
  }

  @computed
  get highLightRow(): boolean | string {
    if ('highLightRow' in this.props) {
      return this.props.highLightRow;
    }
    const tableHighLightRow = getConfig('tableHighLightRow');
    if (tableHighLightRow === false) {
      return false;
    }
    return tableHighLightRow;
  }

  @computed
  get parityRow(): boolean {
    if ('parityRow' in this.props) {
      return this.props.parityRow;
    }
    return getConfig('tableParityRow') === true;
  }

  @computed
  get autoFocus(): boolean {
    if ('autoFocus' in this.props) {
      return this.props.autoFocus;
    }
    return getConfig('tableAutoFocus') !== false;
  }

  @computed
  get selectedHighLightRow(): boolean {
    if ('selectedHighLightRow' in this.props) {
      return this.props.selectedHighLightRow;
    }
    return getConfig('tableSelectedHighLightRow') !== false;
  }

  @computed
  get editorNextKeyEnterDown(): boolean {
    if ('editorNextKeyEnterDown' in this.props) {
      return this.props.editorNextKeyEnterDown;
    }
    return getConfig('tableEditorNextKeyEnterDown') !== false;
  }

  @computed
  get border(): boolean {
    if ('border' in this.props) {
      return this.props.border;
    }
    return getConfig('tableBorder') !== false;
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
        if (currentEditRecord.isNew) {
          dataSet.remove(currentEditRecord);
        } else {
          currentEditRecord.reset();
          currentEditRecord.editing = false;
        }
      }
      if (record) {
        record.editing = true;
      }
    });
  }

  @observable showCachedSelection?: boolean;

  get isTree(): boolean {
    return this.props.mode === TableMode.tree;
  }

  @computed
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
    if (useMouseBatchChoose !== undefined) {
      return useMouseBatchChoose;
    }
    if (getConfig('tableUseMouseBatchChoose') !== undefined) {
      return getConfig('tableUseMouseBatchChoose');
    }
    return false;
  }

  @computed
  get showSelectionTips(): boolean {
    const { showSelectionTips } = this.props;
    if (showSelectionTips !== undefined) {
      return showSelectionTips;
    }
    if (getConfig('tableShowSelectionTips') !== undefined) {
      return getConfig('tableShowSelectionTips');
    }
    return false;
  }

  @computed
  get overflowX(): boolean {
    if (isNumber(this.width)) {
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

  @autobind
  customizedColumnHeader() {
    return <CustomizationColumnHeader onHeaderClick={this.openCustomizationModal} />;
  }

  @computed
  get customizedColumn(): ColumnProps | undefined {
    if (this.customizable && (!this.rowDraggable || this.dragColumnAlign !== DragColumnAlign.right)) {
      return {
        key: CUSTOMIZED_KEY,
        resizable: false,
        titleEditable: false,
        align: ColumnAlign.center,
        width: 30,
        lock: ColumnLock.right,
        header: this.customizedColumnHeader,
        headerClassName: `${this.prefixCls}-customized-column`,
      };
    }
    return undefined;
  }

  @computed
  get expandColumn(): ColumnProps | undefined {
    if (this.expandIconAsCell) {
      return {
        key: EXPAND_KEY,
        resizable: false,
        titleEditable: false,
        align: ColumnAlign.center,
        width: 50,
        lock: true,
      };
    }
    return undefined;
  }

  @computed
  get rowNumberColumn(): ColumnProps | undefined {
    const { rowNumber } = this.props;
    if (rowNumber) {
      return {
        key: ROW_NUMBER_KEY,
        resizable: false,
        titleEditable: false,
        headerClassName: `${this.prefixCls}-row-number-column`,
        renderer: this.renderRowNumber,
        tooltip: TableColumnTooltip.overflow,
        align: ColumnAlign.center,
        width: 50,
        lock: true,
      };
    }
    return undefined;
  }

  @computed
  get selectionColumn(): ColumnProps | undefined {
    if (this.hasRowBox) {
      const { dataSet, prefixCls } = this;
      const selectionColumn: ColumnProps = {
        key: SELECTION_KEY,
        resizable: false,
        titleEditable: false,
        className: `${prefixCls}-selection-column`,
        renderer: this.renderSelectionBox,
        align: ColumnAlign.center,
        width: 50,
        lock: true,
      };
      if (dataSet && dataSet.selection === DataSetSelection.multiple) {
        selectionColumn.header = this.multipleSelectionRenderer;
        selectionColumn.footer = this.multipleSelectionRenderer;
      }
      return selectionColumn;
    }
    return undefined;
  }

  @computed
  get draggableColumn(): ColumnProps | undefined {
    const { dragColumnAlign, rowDraggable, prefixCls } = this;
    if (dragColumnAlign && rowDraggable) {
      const draggableColumn: ColumnProps = {
        key: DRAG_KEY,
        resizable: false,
        titleEditable: false,
        className: `${prefixCls}-drag-column`,
        renderer: this.renderDragBox,
        align: ColumnAlign.center,
        width: 50,
      };
      if (dragColumnAlign === DragColumnAlign.left) {
        draggableColumn.lock = ColumnLock.left;
      }

      if (dragColumnAlign === DragColumnAlign.right) {
        draggableColumn.lock = ColumnLock.right;
        draggableColumn.header = this.customizable && this.customizedColumnHeader;
      }
      return draggableColumn;
    }
    return undefined;
  }

  @computed
  get columns(): ColumnProps[] {
    const { dragColumnAlign, originalColumns, expandColumn, draggableColumn, rowNumberColumn, selectionColumn, customizedColumn } = this;
    return observable.array([
      expandColumn,
      dragColumnAlign === DragColumnAlign.left ? draggableColumn : undefined,
      rowNumberColumn,
      selectionColumn,
      ...originalColumns,
      customizedColumn,
      dragColumnAlign === DragColumnAlign.right ? draggableColumn : undefined,
    ]).filter<ColumnProps>(columnFilter);
  }

  @computed
  get leftColumns(): ColumnProps[] {
    return this.columns.filter(column => column.lock === ColumnLock.left || column.lock === true);
  }

  @computed
  get centerColumns(): ColumnProps[] {
    return this.columns.filter(column => !column.lock);
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
  get centerGroupedColumns(): ColumnGroup[] {
    return this.groupedColumns.filter(
      ({ column: { lock } }) => !lock,
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
  get centerLeafColumns(): ColumnProps[] {
    return this.getLeafColumns(this.centerColumns);
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
    const { dataSet, isTree, showCachedSelection } = this;
    let data = isTree ? dataSet.treeRecords : dataSet.records;
    if (typeof filter === 'function') {
      data = data.filter(filter);
    }
    if (pristine) {
      data = data.filter(record => !record.isNew);
    }
    if (showCachedSelection) {
      return [...dataSet.cachedSelected, ...data];
    }
    return data;
  }

  @computed
  get indeterminate(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      const selectedLength = dataSet.currentSelected.length;
      return !!selectedLength && selectedLength !== dataSet.records.filter(record => record.selectable).length;
    }
    return false;
  }

  @computed
  get allChecked(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      const selectedLength = dataSet.currentSelected.length;
      return !!selectedLength && selectedLength === dataSet.records.filter(record => record.selectable).length;
    }
    return false;
  }

  @computed
  get expandIconAsCell(): boolean {
    const { expandedRowRenderer, expandIconAsCell } = this.props;
    if (expandIconAsCell !== undefined) {
      return expandIconAsCell;
    }
    return !!expandedRowRenderer && !this.isTree;
  }

  @computed
  get expandIconColumnIndex(): number {
    const {
      expandIconAsCell,
      dragColumnAlign,
      rowDraggable,
      props: { expandIconColumnIndex = 0, rowNumber },
    } = this;
    if (expandIconAsCell) {
      return 0;
    }
    return expandIconColumnIndex + [this.hasRowBox, rowNumber, dragColumnAlign && rowDraggable].filter(Boolean).length;
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
      if (this.showCachedSelection) {
        dataSet.clearCachedSelected();
      }
    }
  });

  constructor(node) {
    runInAction(() => {
      this.showCachedSelection = false;
      this.lockColumnsHeadRowsHeight = {};
      this.lockColumnsBodyRowsHeight = {};
      this.lockColumnsFootRowsHeight = {};
      this.node = node;
      this.expandedRows = [];
      this.lastScrollTop = 0;
      this.multiLineHeight = [];
      this.rowHighLight = false;
      this.originalColumns = [];
      this.customized = { columns: {} };
      this.setProps(node.props);
      if (this.customizable) {
        this.loadCustomized().then(() => {
          this.initColumns();
        });
      } else {
        this.initColumns();
      }
    });
  }

  getColumnTooltip(column: ColumnProps): TableColumnTooltip {
    const { tooltip } = column;
    if (tooltip) {
      return tooltip;
    }
    return getConfig('tableColumnTooltip');
  }

  getColumnHeaders(): Promise<HeaderText[]> {
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

  @action
  updateProps(props) {
    this.setProps(props);
    const { customizedCode } = this.props;
    if (this.customizable && customizedCode !== props.customizedCode) {
      this.loadCustomized().then(() => this.initColumns());
    } else {
      this.initColumns();
    }
  }

  @action
  initColumns() {
    const { customized, customizable } = this;
    const { columns, children } = this.props;
    const customizedColumns = customizable ? customized.columns : undefined;
    this.originalColumns = columns
      ? mergeDefaultProps(columns, customizedColumns)
      : normalizeColumns(children, customizedColumns);
  }

  isRowExpanded(record: Record): boolean {
    const { isExpanded = this.expandedRows.indexOf(record.key) !== -1 } = record;
    return isExpanded && (!this.isTree || !record.parent || this.isRowExpanded(record.parent));
  }

  /**
   *
   * @param record 想修改的record
   * @param expanded 设置是否展开
   * @param disHandler 设置是否需要触发展开事件
   */
  @action
  setRowExpanded(record: Record, expanded: boolean, disHandler?: boolean) {
    record.isExpanded = expanded;
    if (!this.inBatchExpansion) {
      const index = this.expandedRows.indexOf(record.key);
      if (expanded) {
        if (index === -1) {
          this.expandedRows.push(record.key);
        }
      } else if (index !== -1) {
        this.expandedRows.splice(index, 1);
      }
    }
    const { onExpand } = this.props;
    if (onExpand && !disHandler) {
      onExpand(expanded, record);
    }
    if (expanded && this.canTreeLoadData) {
      this.onTreeNodeLoad({ record });
    }
  }

  isRowPending(record: Record): boolean {
    return record.getState(PENDING_KEY) === true;
  }

  setRowPending(record: Record, pending: boolean) {
    record.setState(PENDING_KEY, pending);
  }

  isRowLoaded(record: Record): boolean {
    return record.getState(LOADED_KEY) === true;
  }

  setRowLoaded(record: Record, pending: boolean) {
    record.setState(LOADED_KEY, pending);
  }

  isRowHover(record: Record): boolean {
    return this.hoverRow === record;
  }

  isRowClick(record: Record): boolean {
    return this.clickRow === record;
  }

  @action
  setRowClicked(record: Record, click: boolean) {
    this.clickRow = click ? record : undefined;
  }

  @computed
  get canTreeLoadData(): boolean {
    const { treeLoadData, treeAsync } = this.props;
    return treeAsync || !!treeLoadData;
  }

  @computed
  get isRowHighLight() {
    return this.rowHighLight || this.highLightRow === true;
  }

  @action
  setRowHighLight(highLight: boolean) {
    this.rowHighLight = highLight;
  }

  @action
  setRowHover(record: Record, hover: boolean) {
    this.hoverRow = hover ? record : undefined;
  }

  @action
  setMultiLineHeight(multiLineHeight: number) {
    this.multiLineHeight.push(multiLineHeight);
  }

  @action
  expandAll() {
    this.inBatchExpansion = true;
    this.expandedRows = this.dataSet.records.map(record => {
      this.setRowExpanded(record, true);
      return record.key;
    });
    this.inBatchExpansion = false;
  }

  @action
  collapseAll() {
    this.inBatchExpansion = true;
    this.dataSet.records.forEach(record => this.setRowExpanded(record, false));
    this.expandedRows = [];
    this.inBatchExpansion = false;
  }

  @autobind
  async onTreeNodeLoad({ record }: { record: Record }): Promise<any> {
    const { dataSet, treeLoadData, treeAsync } = this.props;
    const promises: Promise<any>[] = [];
    this.setRowPending(record, true);
    if (treeAsync && dataSet) {
      const { idField, parentField } = dataSet.props;
      if (idField && parentField && record && !record.children) {
        const id = record.get(idField);
        promises.push(dataSet.queryMore(-1, { [parentField]: id }));
      }
    }
    if (treeLoadData) {
      promises.push(treeLoadData({ record, dataSet }));
    }
    try {
      await Promise.all(promises);
      this.setRowLoaded(record, true);
    } finally {
      this.setRowPending(record, false);
    }
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

  @autobind
  renderSelectionBox({ record }): ReactNode {
    return renderSelectionBox({ record, store: this });
  }

  @autobind
  renderRowNumber({ record, dataSet }): ReactNode {
    const { isTree, props: { rowNumber } } = this;
    const numbers = getRowNumbers(record, dataSet, isTree);
    const number = numbers.join('-');
    if (typeof rowNumber === 'function') {
      return rowNumber({ record, dataSet, text: number, pathNumbers: numbers });
    }
    return number;
  }

  @autobind
  renderDragBox({ record }) {
    const { rowDragRender } = this.props;
    if (rowDragRender && isFunction(rowDragRender.renderIcon)) {
      return rowDragRender.renderIcon({ record });
    }
    return <Icon type="baseline-drag_indicator" />;
  }

  @action
  changeCustomizedColumnValue(column: ColumnProps, value: object) {
    const { customized: { columns } } = this;
    set(column, value);
    const columnKey = getColumnKey(column).toString();
    const oldCustomized = get(columns, columnKey);
    set(columns, columnKey, {
      ...oldCustomized,
      ...value,
    });
    this.saveCustomizedDebounce();
  }

  @action
  saveCustomized(customized?: Customized | null) {
    if (this.customizable) {
      const { customizedCode } = this.props;
      if (customized) {
        this.customized = customized;
      }
      if (customizedCode) {
        const tableCustomizedSave = getConfig('tableCustomizedSave');
        tableCustomizedSave(customizedCode, this.customized);
      }
    }
  };

  saveCustomizedDebounce = debounce(this.saveCustomized, 1000);

  @autobind
  openCustomizationModal(modal) {
    modal.open({
      drawer: true,
      size: Size.small,
      title: $l('Table', 'customization_settings'),
      children: <CustomizationSettings />,
      okText: $l('Table', 'save_button'),
      bodyStyle: {
        overflow: 'hidden auto',
      },
    });
  }

  async loadCustomized() {
    const { customizedCode } = this.props;
    if (this.customizable && customizedCode) {
      const tableCustomizedLoad = getConfig('tableCustomizedLoad');
      runInAction(() => {
        this.loading = true;
      });
      try {
        const customized = await tableCustomizedLoad(customizedCode);
        if (customized) {
          runInAction(() => {
            this.customized = { columns: {}, ...customized };
          });
        }
      } finally {
        runInAction(() => {
          this.loading = false;
        });
      }
    }
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

}
