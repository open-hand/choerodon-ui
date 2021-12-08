import React, { Children, isValidElement, Key, ReactNode } from 'react';
import { action, computed, get, observable, ObservableMap, runInAction, set } from 'mobx';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { isCalcSize, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { Config, ConfigKeys, DefaultConfig } from 'choerodon-ui/lib/configure';
import { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import Icon from 'choerodon-ui/lib/icon';
import isFunction from 'lodash/isFunction';
import Column, { ColumnDefaultProps, ColumnProps } from './Column';
import CustomizationSettings from './customization-settings/CustomizationSettings';
import isFragment from '../_util/isFragment';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import ObserverCheckBox, { CheckBoxProps } from '../check-box/CheckBox';
import ObserverRadio from '../radio/Radio';
import { DataSetSelection } from '../data-set/enum';
import {
  ColumnAlign,
  ColumnLock,
  DragColumnAlign,
  RowBoxPlacement,
  ScrollPosition,
  SelectionMode,
  TableAutoHeightType,
  TableColumnTooltip,
  TableEditMode,
  TableHeightType,
  TableMode,
  TableQueryBarType,
} from './enum';
import { stopPropagation } from '../_util/EventManager';
import { getColumnKey, getHeader } from './utils';
import getReactNodeText from '../_util/getReactNodeText';
import ColumnGroups from './ColumnGroups';
import autobind from '../_util/autobind';
import Table, { expandIconProps, TableCustomized, TablePaginationConfig, TableProps, TableQueryBarHook } from './Table';
import { Size } from '../core/enum';
import { $l } from '../locale-context';
import CustomizationColumnHeader from './customization-settings/CustomizationColumnHeader';
import TableEditor from './TableEditor';
import Dropdown from '../dropdown/Dropdown';
import Menu from '../menu';
import { ModalProps } from '../modal/Modal';
import { treeSome } from '../_util/treeUtils';
import { HighlightRenderer } from '../field/FormField';

export const SELECTION_KEY = '__selection-column__'; // TODO:Symbol

export const ROW_NUMBER_KEY = '__row-number-column__'; // TODO:Symbol

export const DRAG_KEY = '__drag-column__'; // TODO:Symbol

export const EXPAND_KEY = '__expand-column__'; // TODO:Symbol

export const CUSTOMIZED_KEY = '__customized-column__'; // TODO:Symbol

export const AGGREGATION_EXPAND_CELL_KEY = '__aggregation-expand-cell__'; // TODO:Symbol

export type HeaderText = { name: string; label: string };

function columnFilter(column: ColumnProps | undefined): column is ColumnProps {
  return Boolean(column);
}

// function hasProperty<T>(target: T, property: string): (keyof T) is undefined {
//   return property in target;
// }

export function getIdList(store: TableStore) {
  const { mouseBatchChooseStartId, mouseBatchChooseEndId, node: { element }, prefixCls } = store;
  const rows = Array.from<HTMLTableRowElement>(element.querySelectorAll(`.${prefixCls}-row`));
  let endId;
  const idList: number[] = [];
  rows.some((row) => {
    const index = Number(row.dataset.index);
    if (!endId) {
      if (mouseBatchChooseStartId === index) {
        endId = mouseBatchChooseEndId;
      } else if (mouseBatchChooseEndId === index) {
        endId = mouseBatchChooseStartId;
      }
    }
    if (endId) {
      idList.push(index);
    }
    return endId === index;
  });
  return idList;
}

function getRowNumbers(record?: Record | null, dataSet?: DataSet | null, isTree?: boolean): number[] {
  if (record && dataSet) {
    if (record.isCached) {
      return [];
    }
    const { paging, currentPage, pageSize } = dataSet;
    const pageIndex = (isTree ? paging === 'server' : paging) ? (currentPage - 1) * pageSize : 0;
    if (isTree) {
      return record.path.map((r, index) => r.indexInParent + 1 + (index === 0 ? pageIndex : 0));
    }
    return [record.index + 1 + pageIndex];
  }
  return [0];
}

function hasCheckField({ editor, name, hidden }: ColumnProps, checkField: string): boolean {
  return !hidden && !!editor && checkField === name;
}

function renderSelectionBox({ record, store }: { record: any; store: TableStore }): ReactNode {
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
      if (selection === DataSetSelection.multiple) {
        const { lastSelected } = store;
        if (lastSelected) {
          const nativeEvent = e.nativeEvent;
          let startIndex = -1;
          let endIndex = -1;
          if (nativeEvent.shiftKey) {
            const pointKeys = new Set([lastSelected.key, record.key]);
            dataSet.some((pointRecord, index) => {
              if (pointKeys.has(pointRecord.key)) {
                if (startIndex === -1) {
                  startIndex = index;
                } else {
                  endIndex = index;
                  return true;
                }
              }
              return false;
            });
          }
          if (endIndex !== -1 && startIndex !== endIndex) {
            // Batch update selections
            const rangeRecords = dataSet.slice(startIndex, endIndex + 1);
            const changedRecords: Record[] = [];
            const selectedKeys = new Set(dataSet.selected.map(selected => selected.key));
            if (record.isSelected) {
              rangeRecords.forEach(rangeRecord => {
                if (selectedKeys.has(rangeRecord.key)) {
                  changedRecords.push(rangeRecord);
                }
              });
              dataSet.batchUnSelect(changedRecords);
            } else {
              rangeRecords.forEach(rangeRecord => {
                if (!selectedKeys.has(rangeRecord.key)) {
                  changedRecords.push(rangeRecord);
                }
              });
              dataSet.batchSelect(changedRecords);
            }

          }
        }
        store.lastSelected = record;

      } else if (record.isSelected) {
        dataSet.unSelect(record);
      }
    };

    if (selection === DataSetSelection.multiple) {
      const batchSelectProps: CheckBoxProps = {};
      const handleDragMouseUp = action(() => {
        const { mouseBatchChooseIdList } = store;
        if (store.mouseBatchChooseState) {
          store.mouseBatchChooseState = false;
          store.changeMouseBatchChooseIdList([]);
          const { mouseBatchChooseStartId, mouseBatchChooseEndId } = store;
          if (mouseBatchChooseStartId === mouseBatchChooseEndId) {
            return;
          }
          const startRecord = dataSet.findRecordById(mouseBatchChooseStartId);
          const { isSelected } = startRecord || {};
          if (isSelected) {
            dataSet.batchUnSelect(mouseBatchChooseIdList);
          } else {
            dataSet.batchSelect(mouseBatchChooseIdList);
          }
        }
        document.removeEventListener('pointerup', handleDragMouseUp);
      });
      if (store.useMouseBatchChoose) {
        batchSelectProps.onMouseDown = action(() => {
          store.mouseBatchChooseStartId = record.id;
          store.mouseBatchChooseEndId = record.id;
          store.mouseBatchChooseState = true;
          // 为什么使用 pointerup
          // 因为需要对disabled的元素进行特殊处理
          // 因为状态的改变依赖 mouseup 而在disabled的元素上 无法触发mouseup事件
          // 导致状态无法进行修正
          // 以下两种方案通过 pointer-events:none 进行处理
          // https://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
          // https://stackoverflow.com/questions/62081666/the-event-of-the-document-is-not-triggered-when-it-is-on-a-disabled-element
          // 而使用指针事件可以突破disabled的限制
          // https://stackoverflow.com/questions/62126515/how-to-get-the-state-of-the-mouse-through-javascript/62127845#62127845
          document.addEventListener('pointerup', handleDragMouseUp);
        });
        batchSelectProps.onMouseEnter = () => {
          if (store.mouseBatchChooseState) {
            store.mouseBatchChooseEndId = record.id;
            store.changeMouseBatchChooseIdList(getIdList(store));
          }
        };
      }
      return (
        <ObserverCheckBox
          {...batchSelectProps}
          checked={record.isSelected}
          onChange={handleChange}
          onClick={handleClick}
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
  tableAggregation?: boolean,
  customizedColumns?: { [key: string]: ColumnProps },
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
  columnSort = {
    left: 0,
    center: 0,
    right: 0,
  },
): [any[], any[], any[], boolean] {
  const columns: any[] = [];
  const leftColumns: any[] = [];
  const rightColumns: any[] = [];
  let hasAggregationColumn = false;
  originalColumns.forEach((column) => {
    if (isPlainObject(column)) {
      const newColumn: ColumnProps = { ...ColumnDefaultProps, ...column };
      if (isNil(getColumnKey(newColumn))) {
        newColumn.key = `anonymous-${defaultKey[0]++}`;
      }
      const { children, aggregation } = newColumn;
      if (!hasAggregationColumn && aggregation) {
        hasAggregationColumn = true;
      }
      if (tableAggregation || !aggregation) {
        if (customizedColumns) {
          Object.assign(newColumn, customizedColumns[getColumnKey(newColumn).toString()]);
        }
        if (parent) {
          newColumn.lock = parent.lock;
        }
        if (children) {
          const [, childrenColumns, , childrenHasAggregationColumn] = mergeDefaultProps(children, tableAggregation, customizedColumns, newColumn, defaultKey);
          newColumn.children = childrenColumns;
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = childrenHasAggregationColumn;
          }
        }
        if (parent || !newColumn.lock) {
          if (newColumn.sort === undefined) {
            newColumn.sort = columnSort.center;
          }
          columnSort.center++;
          columns.push(newColumn);
        } else if (newColumn.lock === true || newColumn.lock === ColumnLock.left) {
          if (newColumn.sort === undefined) {
            newColumn.sort = columnSort.left;
          }
          columnSort.left++;
          leftColumns.push(newColumn);
        } else {
          if (newColumn.sort === undefined) {
            newColumn.sort = columnSort.right;
          }
          columnSort.right++;
          rightColumns.push(newColumn);
        }
      } else if (children) {
        const [leftNodes, nodes, rightNodes, childrenHasAggregationColumn] = mergeDefaultProps(children, tableAggregation, customizedColumns, parent, defaultKey, parent ? undefined : columnSort);
        if (!hasAggregationColumn && childrenHasAggregationColumn) {
          hasAggregationColumn = childrenHasAggregationColumn;
        }
        if (parent) {
          parent.children = [...leftNodes, ...nodes, ...rightNodes];
        } else {
          leftColumns.push(...leftNodes);
          columns.push(...nodes);
          rightColumns.push(...rightNodes);
        }
      }
    }
  }, []);
  if (parent) {
    return [[], sortBy(columns, ({ sort }) => sort), [], hasAggregationColumn];
  }
  return [
    sortBy(leftColumns, ({ sort }) => sort),
    sortBy(columns, ({ sort }) => sort),
    sortBy(rightColumns, ({ sort }) => sort),
    hasAggregationColumn,
  ];
}

export function normalizeColumns(
  elements: ReactNode,
  tableAggregation?: boolean,
  customizedColumns?: { [key: string]: ColumnProps },
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
  columnSort = {
    left: 0,
    center: 0,
    right: 0,
  },
): [any[], any[], any[], boolean] {
  const columns: any[] = [];
  const leftColumns: any[] = [];
  const rightColumns: any[] = [];
  let hasAggregationColumn = false;
  const normalizeColumn = (element) => {
    if (isValidElement<any>(element)) {
      const { props, key, type } = element;
      if (isFragment(element)) {
        const { children } = props;
        if (children) {
          Children.forEach(children, normalizeColumn);
        }
      } else if ((type as typeof Column).__PRO_TABLE_COLUMN) {
        const column: any = {
          ...props,
        };
        if (key) {
          column.key = key;
        } else if (isNil(getColumnKey(column))) {
          column.key = `anonymous-${defaultKey[0]++}`;
        }
        const { children, aggregation } = column;
        if (!hasAggregationColumn && aggregation) {
          hasAggregationColumn = true;
        }
        if (tableAggregation || !aggregation) {
          if (customizedColumns) {
            Object.assign(column, customizedColumns[getColumnKey(column).toString()]);
          }
          if (parent) {
            column.lock = parent.lock;
          }
          const [, childrenColumns, , childrenHasAggregationColumn] = normalizeColumns(children, tableAggregation, customizedColumns, column, defaultKey);
          column.children = childrenColumns;
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = childrenHasAggregationColumn;
          }
          if (parent || !column.lock) {
            if (column.sort === undefined) {
              column.sort = columnSort.center;
            }
            columnSort.center++;
            columns.push(column);
          } else if (column.lock === true || column.lock === ColumnLock.left) {
            if (column.sort === undefined) {
              column.sort = columnSort.left;
            }
            columnSort.left++;
            leftColumns.push(column);
          } else {
            if (column.sort === undefined) {
              column.sort = columnSort.right;
            }
            columnSort.right++;
            rightColumns.push(column);
          }
        } else {
          const [leftNodes, nodes, rightNodes, childrenHasAggregationColumn] = normalizeColumns(children, tableAggregation, customizedColumns, parent, defaultKey, parent ? undefined : columnSort);
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = childrenHasAggregationColumn;
          }
          if (parent) {
            parent.children = [...leftNodes, ...nodes, ...rightNodes];
          } else {
            leftColumns.push(...leftNodes);
            columns.push(...nodes);
            rightColumns.push(...rightNodes);
          }
        }
      }
    }
  };
  Children.forEach(elements, normalizeColumn);
  if (parent) {
    return [[], sortBy(columns, ({ sort }) => sort), [], hasAggregationColumn];
  }
  return [
    sortBy(leftColumns, ({ sort }) => sort),
    sortBy(columns, ({ sort }) => sort),
    sortBy(rightColumns, ({ sort }) => sort),
    hasAggregationColumn,
  ];
}

async function getHeaderTexts(
  dataSet: DataSet,
  columns: ColumnProps[],
  aggregation: boolean | undefined,
  headers: HeaderText[] = [],
): Promise<HeaderText[]> {
  const column = columns.shift();
  if (column) {
    headers.push({ name: column.name!, label: await getReactNodeText(getHeader(column, dataSet, aggregation)) });
  }
  if (columns.length) {
    await getHeaderTexts(dataSet, columns, aggregation, headers);
  }
  return headers;
}

export default class TableStore {
  configContext: ConfigContextValue;

  node: Table;

  editors: Map<string, TableEditor> = new Map();

  customizedLoaded?: boolean;

  @observable props: TableProps;

  @observable customized: TableCustomized;

  @observable tempCustomized: TableCustomized;

  @observable loading?: boolean;

  @observable leftOriginalColumns: ColumnProps[];

  @observable originalColumns: ColumnProps[];

  @observable rightOriginalColumns: ColumnProps[];

  @observable hasAggregationColumn?: boolean;

  @observable calcBodyHeight: number;

  @observable width?: number;

  @observable height?: number;

  @observable totalHeight?: number;

  @observable lastScrollTop: number;

  @observable lockColumnsBodyRowsHeight: any;

  @observable lockColumnsFootRowsHeight: any;

  @observable lockColumnsHeadRowsHeight: any;

  @observable expandedRows: (string | number)[];

  @observable hoverRow?: Record;

  @observable rowClicked?: boolean;

  @observable currentEditorName?: string;

  @observable styledHidden?: boolean;

  @observable customizedActiveKey: string[];

  mouseBatchChooseStartId = 0;

  mouseBatchChooseEndId = 0;

  @observable mouseBatchChooseState: boolean;

  @observable mouseBatchChooseIdList: number[];

  @observable columnResizing?: boolean;

  @observable scrollPosition: ScrollPosition;

  inBatchExpansion = false;

  performanceOn = false;

  lastSelected?: Record;

  activeEmptyCell?: HTMLTableCellElement;

  timing: {
    renderStart: number;
    renderEnd: number;
  } = { renderStart: 0, renderEnd: 0 };

  get bodyHeight(): number {
    return this.virtual ? this.virtualHeight : this.calcBodyHeight;
  }

  get stickyLeft(): boolean {
    return [ScrollPosition.right, ScrollPosition.middle].includes(this.scrollPosition);
  }

  get stickyRight(): boolean {
    return [ScrollPosition.left, ScrollPosition.middle].includes(this.scrollPosition);
  }

  get performanceEnabled(): boolean {
    const performanceEnabled = this.getConfig('performanceEnabled');
    return performanceEnabled && performanceEnabled.Table;
  }

  get dataSet(): DataSet {
    return this.props.dataSet;
  }

  get prefixCls() {
    const { suffixCls, prefixCls } = this.props;
    return this.node.getContextProPrefixCls(suffixCls!, prefixCls);
  }

  get customizable(): boolean | undefined {
    const { customizedCode } = this.props;
    if (customizedCode && (this.columnTitleEditable || this.columnDraggable || this.columnHideable)) {
      if ('customizable' in this.props) {
        return this.props.customizable;
      }
      return this.getConfig('tableCustomizable') || this.node.context.getCustomizable('Table');
    }
    return false;
  }

  get aggregation(): boolean | undefined {
    const { aggregation } = this.customized;
    if (aggregation !== undefined) {
      return aggregation;
    }
    const { aggregation: propAggregation } = this.props;
    return propAggregation;
  }

  get aggregationExpandType(): 'cell' | 'row' | 'column' {
    return this.customized.aggregationExpandType || 'cell';
  }

  @computed
  get autoHeight(): { type: TableAutoHeightType; diff: number } | undefined {
    const { autoHeight } = this.props;
    if (autoHeight) {
      const defaultAutoHeight = {
        type: TableAutoHeightType.minHeight,
        diff: this.getConfig('tableAutoHeightDiff') || 80,
      };
      if (isObject(autoHeight)) {
        return {
          ...defaultAutoHeight,
          ...autoHeight,
        };
      }
      return defaultAutoHeight;
    }
    return undefined;
  }

  get heightType(): TableHeightType {
    const tempHeightType = get(this.tempCustomized, 'heightType');
    if (tempHeightType !== undefined) {
      return tempHeightType;
    }
    const { heightType } = this.customized;
    if (heightType !== undefined) {
      return heightType;
    }
    return this.originalHeightType;
  }

  get originalHeightType(): TableHeightType {
    const { style, autoHeight } = this.props;
    if (autoHeight) {
      return TableHeightType.flex;
    }
    if (style) {
      const { height } = style;
      if (isString(height) && isCalcSize(height)) {
        return TableHeightType.flex;
      }
      if (isNumber(toPx(height))) {
        return TableHeightType.fixed;
      }
    }
    return TableHeightType.auto;
  }

  get virtualCell(): boolean | undefined {
    if ('virtualCell' in this.props) {
      return this.props.virtualCell!;
    }
    return this.getConfig('tableVirtualCell');
  }

  /**
   * number 矫正虚拟滚动由于样式问题导致的高度不符问题
   */
  get virtualRowHeight(): number {
    const { virtualRowHeight } = this.props;
    if (virtualRowHeight) {
      return virtualRowHeight;
    }
    return isNumber(this.rowHeight) ? this.rowHeight + 3 : 33;
  }

  get virtual(): boolean | undefined {
    if (this.height !== undefined && isNumber(this.virtualRowHeight)) {
      if ('virtual' in this.props) {
        return this.props.virtual;
      }
      return this.getConfig('tableVirtual');
    }
    return false;
  }

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
  get virtualEndIndex(): number {
    const { virtualRowHeight, lastScrollTop, height, data } = this;
    return Math.min(height !== undefined ? Math.round((lastScrollTop + height) / virtualRowHeight) + 3 : Infinity, data.length);
  }

  get virtualTop(): number {
    const { virtualRowHeight, virtualStartIndex } = this;
    return virtualStartIndex * virtualRowHeight;
  }

  @computed
  get virtualCachedData(): Record[] {
    const { cachedData, virtual } = this;
    if (virtual) {
      return cachedData.slice(this.virtualStartIndex, this.virtualEndIndex);
    }
    return cachedData;
  }

  @computed
  get virtualCurrentData(): Record[] {
    const { currentData, virtual } = this;
    if (virtual) {
      const { cachedData: { length } } = this;
      const currentStartIndex = Math.max(this.virtualStartIndex - length, 0);
      const currentEndIndex = Math.max(this.virtualEndIndex - length, 0);
      return currentData.slice(currentStartIndex, currentEndIndex);
    }
    return currentData;
  }

  @computed
  get virtualData(): Record[] {
    const { data, virtual } = this;
    if (virtual) {
      return [...this.virtualCachedData, ...this.virtualCurrentData];
    }
    return data;
  }

  get hidden(): boolean | undefined {
    return this.styledHidden || this.props.hidden;
  }

  get alwaysShowRowBox(): boolean {
    if ('alwaysShowRowBox' in this.props) {
      return this.props.alwaysShowRowBox!;
    }
    const alwaysShowRowBox = this.getConfig('tableAlwaysShowRowBox');
    if (typeof alwaysShowRowBox !== 'undefined') {
      return alwaysShowRowBox;
    }
    return false;
  }

  get keyboard(): boolean {
    if ('keyboard' in this.props) {
      return this.props.keyboard!;
    }
    const keyboard = this.getConfig('tableKeyboard');
    if (typeof keyboard !== 'undefined') {
      return keyboard;
    }
    return false;
  }

  get columnResizable(): boolean {
    if (this.currentEditRecord) {
      return false;
    }
    if ('columnResizable' in this.props) {
      return this.props.columnResizable!;
    }
    return this.getConfig('tableColumnResizable') !== false;
  }

  get columnHideable(): boolean {
    if ('columnHideable' in this.props) {
      return this.props.columnHideable!;
    }
    return this.getConfig('tableColumnHideable') !== false;
  }

  /**
   * 表头支持编辑
   */
  get columnTitleEditable(): boolean {
    if ('columnTitleEditable' in this.props) {
      return this.props.columnTitleEditable!;
    }
    return this.getConfig('tableColumnTitleEditable') === true;
  }

  get pagination(): TablePaginationConfig | false | undefined {
    if ('pagination' in this.props) {
      return this.props.pagination;
    }
    return this.getConfig('pagination');
  }

  get dragColumnAlign(): DragColumnAlign | undefined {
    if ('dragColumnAlign' in this.props) {
      return this.props.dragColumnAlign;
    }
    return this.getConfig('tableDragColumnAlign');
  }

  get columnDraggable(): boolean {
    if ('columnDraggable' in this.props) {
      return this.props.columnDraggable!;
    }
    if ('dragColumn' in this.props) {
      return this.props.dragColumn!;
    }
    if (this.getConfig('tableColumnDraggable') === true) {
      return true;
    }
    return this.getConfig('tableDragColumn') === true;
  }

  get rowDraggable(): boolean {
    if (this.isTree) {
      return false;
    }
    if ('rowDraggable' in this.props) {
      return this.props.rowDraggable!;
    }
    if ('dragRow' in this.props) {
      return this.props.dragRow!;
    }
    if (this.getConfig('tableRowDraggable') === true) {
      return true;
    }
    return this.getConfig('tableDragRow') === true;
  }

  get size(): Size {
    const { size } = this.customized;
    if (size !== undefined) {
      return size;
    }
    return this.props.size || Size.default;
  }

  get rowHeight(): 'auto' | number {
    let rowHeight: 'auto' | number = 30;
    if ('rowHeight' in this.props) {
      rowHeight = this.props.rowHeight!;
    } else {
      const tableRowHeight = this.getConfig('tableRowHeight');
      if (typeof tableRowHeight !== 'undefined') {
        rowHeight = tableRowHeight;
      }
    }
    if (isNumber(rowHeight)) {
      switch (this.size) {
        case Size.large:
          return rowHeight + 2;
        case Size.small:
          return rowHeight - 2;
        default:
      }
    }
    return rowHeight;
  }

  get autoFootHeight(): boolean {
    if ('autoFootHeight' in this.props) {
      return this.props.autoFootHeight!;
    }
    return false;
  }

  get emptyText(): ReactNode {
    return this.getConfig('renderEmpty')('Table');
  }

  get highLightRow(): boolean | string {
    if ('highLightRow' in this.props) {
      return this.props.highLightRow!;
    }
    return this.getConfig('tableHighLightRow');
  }

  get parityRow(): boolean {
    const { parityRow } = this.customized;
    if (parityRow !== undefined) {
      return parityRow;
    }
    if ('parityRow' in this.props) {
      return this.props.parityRow!;
    }
    return this.getConfig('tableParityRow') === true;
  }

  get showRemovedRow(): boolean {
    if ('showRemovedRow' in this.props) {
      return this.props.showRemovedRow!;
    }
    return this.getConfig('tableShowRemovedRow') === true;
  }

  get autoFocus(): boolean {
    if ('autoFocus' in this.props) {
      return this.props.autoFocus!;
    }
    return this.getConfig('tableAutoFocus') !== false;
  }

  get selectedHighLightRow(): boolean {
    if ('selectedHighLightRow' in this.props) {
      return this.props.selectedHighLightRow!;
    }
    return this.getConfig('tableSelectedHighLightRow') !== false;
  }

  get editorNextKeyEnterDown(): boolean {
    if ('editorNextKeyEnterDown' in this.props) {
      return this.props.editorNextKeyEnterDown!;
    }
    return this.getConfig('tableEditorNextKeyEnterDown') !== false;
  }

  get border(): boolean {
    if ('border' in this.props) {
      return this.props.border!;
    }
    return this.getConfig('tableBorder') !== false;
  }

  get columnEditorBorder(): boolean {
    if ('columnEditorBorder' in this.props) {
      return this.props.columnEditorBorder!;
    }
    const tableColumnEditorBorder = this.getConfig('tableColumnEditorBorder');
    if (tableColumnEditorBorder !== undefined) {
      return tableColumnEditorBorder;
    }
    return this.border;
  }

  get queryBar(): TableQueryBarType | TableQueryBarHook | undefined {
    return this.props.queryBar || this.getConfig('queryBar');
  }

  get expandIcon(): ((props: expandIconProps) => ReactNode) | undefined {
    return this.props.expandIcon || this.getConfig('tableExpandIcon');
  }

  // get pristine(): boolean | undefined {
  //   return this.props.pristine;
  // }

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

  get editing(): boolean {
    return this.currentEditorName !== undefined || this.currentEditRecord !== undefined;
  }

  get hasRowBox(): boolean {
    const { dataSet, selectionMode } = this.props;
    const { alwaysShowRowBox } = this;
    if (dataSet) {
      const { selection } = dataSet;
      return selection && (selectionMode === SelectionMode.rowbox || alwaysShowRowBox);
    }
    return false;
  }

  get useMouseBatchChoose(): boolean {
    const { useMouseBatchChoose } = this.props;
    if (useMouseBatchChoose !== undefined) {
      return useMouseBatchChoose;
    }
    return this.getConfig('tableUseMouseBatchChoose');
  }

  get showSelectionTips(): boolean {
    const { showSelectionTips } = this.props;
    if (showSelectionTips !== undefined) {
      return showSelectionTips;
    }
    const tableShowSelectionTips = this.getConfig('tableShowSelectionTips');
    if (tableShowSelectionTips !== undefined) {
      return tableShowSelectionTips;
    }
    return false;
  }

  @computed
  get overflowX(): boolean {
    const { width } = this;
    if (width !== undefined) {
      return this.columnGroups.width > width;
    }
    return false;
  }

  @computed
  get overflowY(): boolean {
    const { bodyHeight, height } = this;
    return (
      bodyHeight !== undefined &&
      height !== undefined &&
      height < bodyHeight + (this.overflowX && !this.hasFooter ? measureScrollbar() : 0)
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
      const { rowBoxPlacement } = this.props;
      const className = `${prefixCls}-selection-column`;

      let lock: ColumnLock | boolean = ColumnLock.left;
      if (rowBoxPlacement === RowBoxPlacement.start) {
        lock = ColumnLock.left;
      } else if (rowBoxPlacement === RowBoxPlacement.end) {
        lock = ColumnLock.right;
      } else {
        lock = false;
      }

      const selectionColumn: ColumnProps = {
        key: SELECTION_KEY,
        resizable: false,
        titleEditable: false,
        headerClassName: className,
        className,
        footerClassName: className,
        renderer: this.renderSelectionBox,
        align: ColumnAlign.center,
        width: 50,
        lock,
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
  get leftColumns(): ColumnProps[] {
    const { dragColumnAlign, leftOriginalColumns, expandColumn, draggableColumn, rowNumberColumn, selectionColumn } = this;
    return observable.array([
      expandColumn,
      dragColumnAlign === DragColumnAlign.left ? draggableColumn : undefined,
      rowNumberColumn,
      selectionColumn && selectionColumn.lock === ColumnLock.left ? selectionColumn : undefined,
      ...leftOriginalColumns,
    ].filter<ColumnProps>(columnFilter));
  }

  @computed
  get rightColumns(): ColumnProps[] {
    const { dragColumnAlign, rightOriginalColumns, draggableColumn, customizedColumn, selectionColumn } = this;
    return observable.array([
      ...rightOriginalColumns,
      dragColumnAlign === DragColumnAlign.right ? draggableColumn : undefined,
      selectionColumn && selectionColumn.lock === ColumnLock.right ? selectionColumn : undefined,
      customizedColumn,
    ].filter<ColumnProps>(columnFilter));
  }

  @computed
  get columns(): ColumnProps[] {
    const { leftColumns, originalColumns, rightColumns } = this;
    return observable.array([
      ...leftColumns,
      ...originalColumns,
      ...rightColumns,
    ]);
  }

  @computed
  get columnGroups(): ColumnGroups {
    return new ColumnGroups(this.columns, this);
  }

  @computed
  get leftColumnGroups(): ColumnGroups {
    return new ColumnGroups(this.leftColumns, this);
  }

  @computed
  get rightColumnGroups(): ColumnGroups {
    return new ColumnGroups(this.rightColumns, this);
  }

  @computed
  get leafNamedColumns(): ColumnProps[] {
    return this.columnGroups.allLeafs.reduce<ColumnProps[]>((list, { column }) => column.name ? list.concat(column) : list, []);
  }

  @computed
  get hasEmptyWidthColumn(): boolean {
    return this.columnGroups.leafs.some(({ column }) => isNil(get(column, 'width')));
  }

  @computed
  get hasCheckFieldColumn(): boolean {
    const { checkField } = this.dataSet.props;
    if (checkField) {
      const { aggregation } = this;
      return this.columnGroups.leafs.some(({ column }) => aggregation
        ? treeSome<ColumnProps>([column], (c) => hasCheckField(c, checkField))
        : hasCheckField(column, checkField),
      );
    }
    return false;
  }

  get hasFooter(): boolean {
    return this.columnGroups.leafs.some(({ column }) => !!column.footer && column.key !== SELECTION_KEY);
  }

  get isAnyColumnsLeftLock(): boolean {
    return this.leftColumns.length > 0;
  }

  get isAnyColumnsRightLock(): boolean {
    return this.rightColumns.length > 0;
  }

  get isAnyColumnsLock(): boolean {
    return this.isAnyColumnsLeftLock || this.isAnyColumnsRightLock;
  }

  get cachedData(): Record[] {
    const { dataSet, showCachedSelection } = this;
    if (showCachedSelection) {
      return dataSet.cachedRecords;
    }
    return [];
  }

  @computed
  get currentData(): Record[] {
    const { filter, pristine } = this.props;
    const { dataSet, isTree } = this;
    let data = isTree ? dataSet.treeRecords : dataSet.records;
    if (typeof filter === 'function') {
      data = data.filter(filter);
    }
    if (pristine) {
      data = data.filter(record => !record.isNew);
    }
    return data;
  }

  @computed
  get data(): Record[] {
    return [...this.cachedData, ...this.currentData];
  }

  @computed
  get indeterminate(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      const selectedLength = dataSet.currentSelected.length;
      return !!selectedLength && selectedLength !== dataSet.records.length;
    }
    return false;
  }

  @computed
  get allChecked(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      const selectedLength = dataSet.currentSelected.length;
      return !!selectedLength && selectedLength === dataSet.records.length;
    }
    return false;
  }

  get expandIconAsCell(): boolean {
    const { expandedRowRenderer, expandIconAsCell } = this.props;
    if (expandIconAsCell !== undefined) {
      return expandIconAsCell;
    }
    return !!expandedRowRenderer && !this.isTree;
  }

  get expandIconColumnIndex(): number {
    if (this.expandIconAsCell) {
      return 0;
    }
    const {
      dragColumnAlign,
      rowDraggable,
      props: { expandIconColumnIndex = 0, rowNumber },
    } = this;
    return expandIconColumnIndex + [this.hasRowBox, rowNumber, dragColumnAlign && rowDraggable].filter(Boolean).length;
  }

  get inlineEdit() {
    return this.props.editMode === TableEditMode.inline;
  }

  private handleSelectAllChange = action(value => {
    const { dataSet, filter } = this.props;
    const isSelectAll = value ? dataSet.currentSelected.length === dataSet.records.filter(record => record.selectable).length : !value;
    if (!isSelectAll) {
      dataSet.selectAll(filter);
    } else {
      dataSet.unSelectAll();
      if (this.showCachedSelection) {
        dataSet.clearCachedSelected();
      }
    }
  });

  @autobind
  @action
  handleLoadCustomized() {
    this.initColumns();
    const { onAggregationChange, aggregation } = this.props;
    const { aggregation: customAggregation } = this.customized;
    if (onAggregationChange && customAggregation !== undefined && customAggregation !== aggregation) {
      onAggregationChange(customAggregation);
    }
  }

  constructor(node: Table) {
    runInAction(() => {
      this.scrollPosition = ScrollPosition.left;
      this.mouseBatchChooseIdList = [];
      this.mouseBatchChooseState = false;
      this.showCachedSelection = false;
      this.lockColumnsHeadRowsHeight = {};
      this.lockColumnsBodyRowsHeight = {};
      this.lockColumnsFootRowsHeight = {};
      this.node = node;
      this.expandedRows = [];
      this.lastScrollTop = 0;
      this.customizedActiveKey = ['columns'];
      this.leftOriginalColumns = [];
      this.originalColumns = [];
      this.rightOriginalColumns = [];
      this.tempCustomized = { columns: {} };
      this.customized = { columns: {} };
      this.setProps(node.props);
      if (this.customizable) {
        this.loadCustomized().then(this.handleLoadCustomized);
      } else {
        this.initColumns();
      }
    });
  }

  isBuiltInColumn({ key }: ColumnProps) {
    if (isString(key)) {
      return [DRAG_KEY, SELECTION_KEY, ROW_NUMBER_KEY, CUSTOMIZED_KEY, EXPAND_KEY].includes(key);
    }
  }

  getColumnTooltip(column: ColumnProps): TableColumnTooltip | undefined {
    const { tooltip } = column;
    if (tooltip) {
      return tooltip;
    }
    return this.node.context.getTooltip('table-cell');
  }

  getColumnHeaders(): Promise<HeaderText[]> {
    const { leafNamedColumns, dataSet } = this;
    return getHeaderTexts(dataSet, leafNamedColumns.slice(), this.aggregation);
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
    const { showCachedSelection } = props;
    if (showCachedSelection !== undefined) {
      this.showCachedSelection = showCachedSelection;
    }
  }

  @action
  updateProps(props) {
    const { customizedCode } = this.props;
    this.setProps(props);
    if (this.customizable) {
      if (customizedCode !== props.customizedCode) {
        this.loadCustomized().then(this.handleLoadCustomized);
        return;
      }
      const { aggregation } = props;
      const { customized } = this;
      if (!isNil(aggregation) && aggregation !== customized.aggregation) {
        customized.aggregation = aggregation;
        this.saveCustomized();
      }
    }
    this.initColumns();
  }

  @action
  initColumns() {
    const { customized, customizable, aggregation, selectionColumn } = this;
    const { columns, children, rowBoxPlacement } = this.props;
    const customizedColumns = customizable ? customized.columns : undefined;
    const [leftOriginalColumns, originalColumns, rightOriginalColumns, hasAggregationColumn] = columns
      ? mergeDefaultProps(columns, aggregation, customizedColumns)
      : normalizeColumns(children, aggregation, customizedColumns);
    if (isNumber(rowBoxPlacement) && this.hasRowBox) {
      originalColumns.splice(rowBoxPlacement as number, 0, selectionColumn);
    }
    this.leftOriginalColumns = leftOriginalColumns;
    this.originalColumns = originalColumns;
    this.rightOriginalColumns = rightOriginalColumns;
    this.hasAggregationColumn = hasAggregationColumn;
  }

  isAggregationCellExpanded(record: Record, key: Key): boolean | undefined {
    const expandedKeys: ObservableMap<Key, boolean> | undefined = record.getState(AGGREGATION_EXPAND_CELL_KEY) as ObservableMap<Key, boolean>;
    if (expandedKeys) {
      return expandedKeys.get(key);
    }
  }

  @action
  setAggregationCellExpanded(record: Record, key: Key, expanded: boolean) {
    const expandedKeys: ObservableMap<Key, boolean> = record.getState(AGGREGATION_EXPAND_CELL_KEY) || observable.map();
    expandedKeys.set(key, expanded);
    record.setState(AGGREGATION_EXPAND_CELL_KEY, expandedKeys);
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
    return record.pending === true;
  }

  @action
  setRowPending(record: Record, pending: boolean) {
    record.pending = pending;
  }

  isRowLoaded(record: Record): boolean {
    return record.childrenLoaded === true;
  }

  @action
  setRowLoaded(record: Record, loaded: boolean) {
    record.childrenLoaded = loaded;
  }

  isRowHover(record: Record): boolean {
    return this.hoverRow === record;
  }

  get canTreeLoadData(): boolean {
    const { treeLoadData, treeAsync } = this.props;
    return treeAsync || !!treeLoadData;
  }

  @computed
  get cellHighlightRenderer(): HighlightRenderer {
    const { cellHighlightRenderer = this.getConfig('highlightRenderer') } = this.props;
    return cellHighlightRenderer;
  }

  @action
  setRowHover(record: Record, hover: boolean) {
    this.hoverRow = hover ? record : undefined;
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
      promises.push(dataSet.queryMoreChild(record));
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
  saveCustomized(customized?: TableCustomized | null) {
    if (this.customizable && this.customizedLoaded) {
      const { customizedCode } = this.props;
      if (customized) {
        this.customized = customized;
      }
      if (customizedCode) {
        const tableCustomizedSave = this.getConfig('tableCustomizedSave') || this.getConfig('customizedSave');
        tableCustomizedSave(customizedCode, this.customized, 'Table');
      }
    }
  }

  saveCustomizedDebounce = debounce(this.saveCustomized, 1000);

  @autobind
  @action
  openCustomizationModal(modal) {
    const { node: { element }, height } = this;
    if (height === undefined) {
      this.totalHeight = element.offsetHeight;
    }
    const { customizedCode } = this.props;
    const modalProps: ModalProps = {
      drawer: true,
      size: Size.small,
      title: $l('Table', 'customization_settings'),
      children: <CustomizationSettings />,
      bodyStyle: {
        overflow: 'hidden auto',
        padding: 0,
      },
    };
    if (customizedCode) {
      modalProps.okText = $l('Table', 'save_button');
    }
    modal.open(modalProps);
  }

  async loadCustomized() {
    const { customizedCode } = this.props;
    if (this.customizable && customizedCode) {
      const tableCustomizedLoad = this.getConfig('tableCustomizedLoad') || this.getConfig('customizedLoad');
      runInAction(() => {
        delete this.customizedLoaded;
        this.loading = true;
      });
      try {
        const customized: TableCustomized | undefined | null = await tableCustomizedLoad(customizedCode, 'Table');
        runInAction(() => {
          this.customized = { columns: {}, ...customized };
        });
        this.customizedLoaded = true;
      } finally {
        runInAction(() => {
          this.loading = false;
        });
      }
    }
  }

  @autobind
  @action
  handleAllPageSelectionMenuClick({ key }) {
    const { dataSet } = this;
    const { isAllPageSelection } = dataSet;
    switch (key) {
      case 'current': {
        if (this.allChecked) {
          dataSet.unSelectAll();
        } else {
          const { filter } = this.props;
          dataSet.selectAll(filter);
        }
        break;
      }
      case 'all':
        dataSet.setAllPageSelection(!isAllPageSelection);
        break;
      default:
    }
  }

  @autobind
  renderAllPageSelectionMenu() {
    const { dataSet: { isAllPageSelection }, allChecked, prefixCls } = this;
    return (
      <Menu prefixCls={`${prefixCls}-dropdown-menu`} onClick={this.handleAllPageSelectionMenuClick}>
        <Menu.Item key="current">
          {$l('Table', allChecked ? 'unselect_current_page' : 'select_current_page')}
        </Menu.Item>
        <Menu.Item key="all">
          {$l('Table', isAllPageSelection ? 'unselect_all_page' : 'select_all_page')}
        </Menu.Item>
      </Menu>
    );
  }

  getConfig<T extends ConfigKeys>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T] {
    return this.node.getContextConfig(key);
  }

  @autobind
  private multipleSelectionRenderer() {
    const buttons = [
      <ObserverCheckBox
        key="selectAll"
        checked={this.allChecked}
        indeterminate={this.indeterminate}
        onChange={this.handleSelectAllChange}
        value
      />,
    ];
    if (this.props.showAllPageSelectionButton) {
      buttons.push(
        <Dropdown key="selectAllPage" overlay={this.renderAllPageSelectionMenu}>
          <Icon type="baseline-arrow_drop_down" />
        </Dropdown>,
      );
    }
    return buttons;
  }
}
