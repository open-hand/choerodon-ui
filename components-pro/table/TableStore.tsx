import React, { Children, CSSProperties, isValidElement, Key, ReactNode } from 'react';
import { action, computed, get, IReactionDisposer, observable, ObservableMap, reaction, runInAction, set } from 'mobx';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { warning } from 'choerodon-ui/dataset/utils';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import { isCalcSize, scaleSize, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { Config, ConfigKeys, DefaultConfig } from 'choerodon-ui/lib/configure';
import { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import Icon from 'choerodon-ui/lib/icon';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import noop from 'lodash/noop';
import Column, { ColumnDefaultProps, ColumnProps, defaultAggregationRenderer } from './Column';
import CustomizationSettings from './customization-settings/CustomizationSettings';
import isFragment from '../_util/isFragment';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import ObserverCheckBox, { CheckBoxProps } from '../check-box/CheckBox';
import ObserverRadio from '../radio/Radio';
import { DataSetSelection, FieldType, RecordCachedType } from '../data-set/enum';
import {
  ColumnAlign,
  ColumnLock,
  DragColumnAlign,
  GroupType,
  RowBoxPlacement,
  ScrollPosition,
  SelectionMode,
  TableAutoHeightType,
  TableBoxSizing,
  TableColumnResizeTriggerType,
  TableColumnTooltip,
  TableEditMode,
  TableHeightType,
  TableMode,
  TableQueryBarType,
} from './enum';
import { stopPropagation } from '../_util/EventManager';
import { getCachedSelectableCounts, getCachedSelectableRecords, getColumnKey, getCurrentSelectableCounts, getHeader, isDisabledRow } from './utils';
import getReactNodeText from '../_util/getReactNodeText';
import ColumnGroups from './ColumnGroups';
import autobind from '../_util/autobind';
import Table, {
  expandIconProps,
  TableCustomized,
  TableGroup,
  TablePaginationConfig,
  TableProps,
  TableQueryBarHook,
} from './Table';
import { Size } from '../core/enum';
import { $l } from '../locale-context';
import CustomizationColumnHeader from './customization-settings/CustomizationColumnHeader';
import ComboCustomizationSettings from './combo-customization-settings';
import TableEditor from './TableEditor';
import Dropdown from '../dropdown/Dropdown';
import Menu from '../menu';
import Modal, { ModalProps } from '../modal/Modal';
import { treeMap, treeSome } from '../_util/treeUtils';
import { HighlightRenderer, TagRendererProps } from '../field/FormField';
import { getIf, mergeGroupStates, normalizeGroups } from '../data-set/utils';
import VirtualRowMetaData from './VirtualRowMetaData';
import BatchRunner from '../_util/BatchRunner';
import { LabelLayout } from '../form/enum';
import ColumnGroup from './ColumnGroup';

export const SELECTION_KEY = '__selection-column__'; // TODO:Symbol

export const COMBOBAR_KEY = '__combo-column__'; // TODO:Symbol

export const ROW_NUMBER_KEY = '__row-number-column__'; // TODO:Symbol

export const DRAG_KEY = '__drag-column__'; // TODO:Symbol

export const EXPAND_KEY = '__expand-column__'; // TODO:Symbol

export const CUSTOMIZED_KEY = '__customized-column__'; // TODO:Symbol

export const AGGREGATION_EXPAND_CELL_KEY = '__aggregation-expand-cell__'; // TODO:Symbol

export const BODY_EXPANDED = '__body_expanded__'; // TODO:Symbol

export const VIRTUAL_ROOT_MARGIN = 50;

export type HeaderText = { name: string; label: string };

function columnFilter(column: ColumnProps | undefined): column is ColumnProps {
  return Boolean(column);
}

function getOverScanCount(tableStore: TableStore, index: number, next?: boolean) {
  const { rowMetaData } = tableStore;
  if (rowMetaData) {
    let count = 0;
    let height = 0;
    while (height < VIRTUAL_ROOT_MARGIN) {
      index += next ? 1 : -1;
      const metaData = rowMetaData[index];
      if (!metaData) {
        return count;
      }
      height += metaData.height;
      count++;
    }
    return count;
  }
  return Math.ceil(VIRTUAL_ROOT_MARGIN / tableStore.virtualRowHeight);
}

function getItemMetadata(
  rowMetaData: VirtualRowMetaData[],
  index: number,
  tableStore: TableStore,
): VirtualRowMetaData {
  const { lastMeasuredIndex } = tableStore;

  if (index > lastMeasuredIndex) {
    tableStore.lastMeasuredIndex = index;
  }
  return rowMetaData[index];
}

function findNearestItemBinarySearch(
  rowMetaData: VirtualRowMetaData[],
  tableStore: TableStore,
  high: number,
  low: number,
  offset: number,
): number {
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const item = getItemMetadata(rowMetaData, middle, tableStore);
    if (!item) {
      return 0;
    }
    const currentOffset = item.offset;

    if (currentOffset === offset) {
      return middle;
    }
    if (currentOffset < offset) {
      low = middle + 1;
    }
    if (currentOffset > offset) {
      high = middle - 1;
    }
  }

  if (low > 0) {
    return low - 1;
  }
  return 0;
}

function overOffset(
  rowMetaData: VirtualRowMetaData[],
  tableStore: TableStore,
  index: number,
  offset: number,
): boolean {
  const item = getItemMetadata(rowMetaData, index, tableStore);
  if (item) {
    return item.offset < offset;
  }
  return false;
}

function findNearestItemExponentialSearch(
  rowMetaData: VirtualRowMetaData[],
  tableStore: TableStore,
  index: number,
  offset: number,
): number {
  const { virtualEstimatedRows } = tableStore;
  let interval = 1;

  while (index < virtualEstimatedRows && overOffset(rowMetaData, tableStore, index, offset)) {
    index += interval;
    interval *= 2;
  }

  return findNearestItemBinarySearch(
    rowMetaData,
    tableStore,
    Math.min(index, virtualEstimatedRows - 1),
    Math.floor(index / 2),
    offset,
  );
}

function getVisibleStartIndex(tableStore: TableStore, getLastScrollTop = () => tableStore.lastScrollTop): number {
  const { height, virtualEstimatedRows } = tableStore;
  if (height === undefined || !virtualEstimatedRows) {
    return 0;
  }
  const lastScrollTop = getLastScrollTop();
  const { virtualRowHeight, rowMetaData } = tableStore;
  if (rowMetaData) {
    if (!rowMetaData.length) {
      return 0;
    }
    const { lastMeasuredIndex } = tableStore;
    const lastRowMetaData = lastMeasuredIndex > 0 ? rowMetaData[lastMeasuredIndex] : undefined;
    const lastMeasuredItemOffset = lastRowMetaData ? lastRowMetaData.offset : 0;
    if (lastMeasuredItemOffset >= lastScrollTop) {
      return findNearestItemBinarySearch(
        rowMetaData,
        tableStore,
        lastMeasuredIndex,
        0,
        lastScrollTop,
      );
    }
    return findNearestItemExponentialSearch(
      rowMetaData,
      tableStore,
      Math.max(0, lastMeasuredIndex),
      lastScrollTop,
    );
  }
  return Math.max(
    0,
    Math.min(
      virtualEstimatedRows, Math.floor(lastScrollTop / virtualRowHeight),
    ),
  );
}

function getVisibleEndIndex(tableStore: TableStore, getVirtualVisibleStartIndex = () => tableStore.virtualVisibleStartIndex, getLastScrollTop = () => tableStore.lastScrollTop) {
  const { height, virtualEstimatedRows } = tableStore;
  if (height === undefined) {
    return virtualEstimatedRows;
  }
  const virtualVisibleStartIndex = getVirtualVisibleStartIndex();
  const { virtualRowHeight, rowMetaData } = tableStore;
  if (rowMetaData) {
    if (!rowMetaData.length) {
      return 0;
    }
    const itemMetadata = getItemMetadata(rowMetaData, virtualVisibleStartIndex, tableStore);
    if (!itemMetadata) {
      return 0;
    }
    const maxOffset = getLastScrollTop() + height;

    let offset = itemMetadata.offset + itemMetadata.height;
    let stopIndex = virtualVisibleStartIndex;

    while (stopIndex < virtualEstimatedRows - 1 && offset < maxOffset) {
      stopIndex++;
      const item = getItemMetadata(rowMetaData, stopIndex, tableStore);
      if (item) {
        offset += item.height;
      }
    }

    return Math.max(0, Math.min(virtualEstimatedRows, stopIndex + 1));
  }
  const numVisibleItems = Math.ceil(
    height / virtualRowHeight,
  );
  return Math.max(
    0,
    Math.min(
      virtualEstimatedRows,
      virtualVisibleStartIndex + numVisibleItems,
    ),
  );
}

function getStartIndex(tableStore: TableStore, getVirtualVisibleStartIndex = () => tableStore.virtualVisibleStartIndex): number {
  const virtualVisibleStartIndex = getVirtualVisibleStartIndex();
  return Math.max(0, virtualVisibleStartIndex - getOverScanCount(tableStore, virtualVisibleStartIndex));
}

function getEndIndex(tableStore: TableStore, getVirtualVisibleEndIndex = () => tableStore.virtualVisibleEndIndex): number {
  const virtualVisibleEndIndex = getVirtualVisibleEndIndex();
  const { virtualEstimatedRows } = tableStore;
  return Math.min(virtualEstimatedRows, virtualVisibleEndIndex + getOverScanCount(tableStore, virtualVisibleEndIndex, true));
}

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
          labelLayout={LabelLayout.none}
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

function getCustomizedColumnByKey(key: string, customizedColumns): ColumnProps | undefined {
  if (customizedColumns) {
    return customizedColumns[key];
  }
}

function getCustomizedColumn(column: ColumnProps, customizedColumns?: { [key: string]: ColumnProps }): ColumnProps | undefined {
  if (customizedColumns) {
    return getCustomizedColumnByKey(getColumnKey(column).toString(), customizedColumns);
  }
}

function mergeColumnLock(column: ColumnProps, parent?: ColumnProps | null, customizedColumn?: ColumnProps) {
  if (parent) {
    column.lock = parent.lock;
  } else if (customizedColumn && 'lock' in customizedColumn) {
    column.lock = customizedColumn.lock;
  }
}

function mergeCustomizedColumn(column: ColumnProps, tableStore: TableStore, customizedColumn?: ColumnProps, isChildrenHideDisabled?: boolean) {
  if (isChildrenHideDisabled) {
    column.hideable = false;
  } else {
    const field = tableStore.dataSet.getField(column.name);
    if (field) {
      const dynamicProps = field.get('dynamicProps');
      const computedProps = field.get('computedProps');
      if ((dynamicProps && dynamicProps.required) || (computedProps && computedProps.required) || field.get('required')) {
        column.hideable = false;
      }
    }
  }
  if (customizedColumn) {
    if (column.hideable === false || !tableStore.columnHideable) {
      delete customizedColumn.hidden;
    }
    if (column.resizable === false || !tableStore.columnResizable) {
      delete customizedColumn.width;
    }
    if (column.titleEditable === false || !tableStore.columnTitleEditable) {
      delete customizedColumn.title;
    }
    if (!tableStore.columnDraggable) {
      delete customizedColumn.sort;
    }
    Object.assign(column, customizedColumn);
  }
}

function findAndMergeCustomizedColumn(column: ColumnProps, tableStore: TableStore, customizedColumns?: { [key: string]: ColumnProps }, isChildrenHideDisabled?: boolean): void {
  const customizedColumn = getCustomizedColumn(column, customizedColumns);
  mergeCustomizedColumn(column, tableStore, customizedColumn, isChildrenHideDisabled);
}

type ChildrenInfo = {
  hasAggregationColumn: boolean;
  isHideDisabled: boolean;
}

function mergeDefaultProps(
  tableStore: TableStore,
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
): [ColumnProps[], ColumnProps[], ColumnProps[], ChildrenInfo] {
  const columns: ColumnProps[] = [];
  const leftColumns: ColumnProps[] = [];
  const rightColumns: ColumnProps[] = [];
  let hasAggregationColumn = false;
  let isHideDisabled = false;
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
        const customizedColumn = getCustomizedColumn(newColumn, customizedColumns);
        mergeColumnLock(newColumn, parent, customizedColumn);
        if (children) {
          const [, childrenColumns, , {
            hasAggregationColumn: childrenHasAggregationColumn, isHideDisabled: childrenIsHideDisabled,
          }] = mergeDefaultProps(tableStore, children, tableAggregation, customizedColumns, newColumn, defaultKey);
          newColumn.children = childrenColumns;
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = true;
          }
          if (!isHideDisabled && childrenIsHideDisabled) {
            isHideDisabled = true;
          }
          mergeCustomizedColumn(newColumn, tableStore, customizedColumn, childrenIsHideDisabled);
        } else {
          mergeCustomizedColumn(newColumn, tableStore, customizedColumn);
        }
        if (!isHideDisabled && newColumn.hideable === false) {
          isHideDisabled = true;
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
        const [leftNodes, nodes, rightNodes, {
          hasAggregationColumn: childrenHasAggregationColumn, isHideDisabled: childrenIsHideDisabled,
        }] = mergeDefaultProps(tableStore, children, tableAggregation, customizedColumns, parent, defaultKey, parent ? undefined : columnSort);
        if (!hasAggregationColumn && childrenHasAggregationColumn) {
          hasAggregationColumn = true;
        }
        if (!isHideDisabled && childrenIsHideDisabled) {
          newColumn.hideable = false;
          isHideDisabled = true;
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
    return [[], sortBy(columns, ({ sort }) => sort), [], { hasAggregationColumn, isHideDisabled }];
  }
  return [
    sortBy(leftColumns, ({ sort }) => sort),
    sortBy(columns, ({ sort }) => sort),
    sortBy(rightColumns, ({ sort }) => sort),
    { hasAggregationColumn, isHideDisabled },
  ];
}

function normalizeColumns(
  tableStore: TableStore,
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
): [ColumnProps[], ColumnProps[], ColumnProps[], ChildrenInfo] {
  const columns: ColumnProps[] = [];
  const leftColumns: ColumnProps[] = [];
  const rightColumns: ColumnProps[] = [];
  let hasAggregationColumn = false;
  let isHideDisabled = false;
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
          const customizedColumn = getCustomizedColumn(column, customizedColumns);
          mergeColumnLock(column, parent, customizedColumn);
          const [, childrenColumns, , {
            hasAggregationColumn: childrenHasAggregationColumn, isHideDisabled: childrenIsHideDisabled,
          }] = normalizeColumns(tableStore, children, tableAggregation, customizedColumns, column, defaultKey);
          column.children = childrenColumns;
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = childrenHasAggregationColumn;
          }
          if (!isHideDisabled && childrenIsHideDisabled) {
            isHideDisabled = true;
          }
          mergeCustomizedColumn(column, tableStore, customizedColumn, childrenIsHideDisabled);
          if (!isHideDisabled && column.hideable === false) {
            isHideDisabled = true;
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
          const [leftNodes, nodes, rightNodes, {
            hasAggregationColumn: childrenHasAggregationColumn, isHideDisabled: childrenIsHideDisabled,
          }] = normalizeColumns(tableStore, children, tableAggregation, customizedColumns, parent, defaultKey, parent ? undefined : columnSort);
          if (!hasAggregationColumn && childrenHasAggregationColumn) {
            hasAggregationColumn = childrenHasAggregationColumn;
          }
          if (!isHideDisabled && childrenIsHideDisabled) {
            column.hideable = false;
            isHideDisabled = true;
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
    return [[], sortBy(columns, ({ sort }) => sort), [], { hasAggregationColumn, isHideDisabled }];
  }
  return [
    sortBy(leftColumns, ({ sort }) => sort),
    sortBy(columns, ({ sort }) => sort),
    sortBy(rightColumns, ({ sort }) => sort),
    { hasAggregationColumn, isHideDisabled },
  ];
}


function getColumnGroupedColumns(tableStore: TableStore, groups: TableGroup[], customizedColumns?: { [key: string]: ColumnProps }): [ColumnProps[], ColumnProps[], ColumnProps[], boolean] {
  const leftGroupedColumns: ColumnProps[] = [];
  const groupedColumns: ColumnProps[] = [];
  const rightGroupedColumns: ColumnProps[] = [];
  let hasAggregation = false;
  groups.forEach((group) => {
    const { name, type, columnProps } = group;
    if (type === GroupType.column) {
      const column: ColumnProps = {
        ...ColumnDefaultProps,
        lock: ColumnLock.left,
        ...columnProps,
        draggable: false,
        hideable: false,
        key: `__group-${name}`,
        name,
        __tableGroup: group,
      };
      column.children = columnProps && columnProps.children ? treeMap(columnProps.children, ((col, index, parentNode) => {
        const newCol = { ...col, __tableGroup: group, lock: column.lock };
        if (!getColumnKey(col)) {
          newCol.key = parentNode ? `${parentNode.key}-${index}` : `__group-${name}-${index}`;
        }
        findAndMergeCustomizedColumn(newCol, tableStore, customizedColumns);
        return newCol;
      }), ({ sort = Infinity }, { sort: sort2 = Infinity }) => sort - sort2) : undefined;
      findAndMergeCustomizedColumn(column, tableStore, customizedColumns);
      if (!column.lock) {
        groupedColumns.push(column);
      } else if (column.lock === true || column.lock === ColumnLock.left) {
        leftGroupedColumns.push(column);
      } else {
        rightGroupedColumns.push(column);
      }
      if (columnProps && !hasAggregation && columnProps.aggregation) {
        hasAggregation = true;
      }
    }
  });
  return [leftGroupedColumns, groupedColumns, rightGroupedColumns, hasAggregation];
}

function getHeaderGroupedColumns(tableStore: TableStore, groups: Group[], tableGroups: TableGroup[], columns: ColumnProps[], dataSet: DataSet, groupedColumns: ColumnProps[], customizedColumns?: { [key: string]: ColumnProps }, parentKey?: any): ColumnProps[] {
  const generatedColumns: Set<ColumnProps> = new Set();
  let headerUsed = false;
  groups.forEach((group) => {
    const { name, subGroups, value } = group;
    const key = parentKey ? `${parentKey}-${value}` : value;
    const subColumns = subGroups.length ? getHeaderGroupedColumns(tableStore, subGroups, tableGroups, columns, dataSet, groupedColumns, customizedColumns, key) : columns;
    const tableGroup = tableGroups.find(($tableGroup) => name === $tableGroup.name);
    if (tableGroup) {
      const { columnProps, name: groupName, hidden } = tableGroup;
      if (hidden) {
        subColumns.forEach(col => {
          const __originalKey = getColumnKey(col);
          const colKey = `${key}-${__originalKey}`;
          const newCol = {
            ...col,
            key: colKey,
            __tableGroup: tableGroup,
            __group: group,
            __groups: groups,
            __originalKey,
          };
          findAndMergeCustomizedColumn(newCol, tableStore, customizedColumns);
          newCol.lock = false;
          generatedColumns.add(newCol);
        });
      } else {
        const { length } = groupedColumns;
        if (length && !headerUsed) {
          headerUsed = true;
          const header = getHeader({
            ...columnProps,
            name: groupName,
            dataSet,
            group,
            groups,
          });
          if (header) {
            const oldColumn: ColumnProps = groupedColumns[length - 1];
            const newKey = `${key}-${getColumnKey(oldColumn)}`;
            const newColumn: ColumnProps = {
              ...columnProps,
              lock: oldColumn.lock,
              titleEditable: false,
              draggable: false,
              hideable: false,
              key: newKey,
              header,
              children: [oldColumn],
              __tableGroup: tableGroup,
            };
            const customizedColumn = getCustomizedColumnByKey(newKey, customizedColumns);
            mergeCustomizedColumn(newColumn, tableStore, customizedColumn);
            groupedColumns[length - 1] = newColumn;
          }
        }
        const renderer = columnProps && columnProps.renderer || defaultAggregationRenderer;
        const column = {
          ...columnProps,
          titleEditable: false,
          key,
          headerStyle: columnProps && columnProps.style,
          header: () => renderer({ dataSet, record: group.totalRecords[0], name: groupName, text: value, value, headerGroup: group }),
          children: treeMap(subColumns, (col => {
            const __originalKey = getColumnKey(col);
            const colKey = `${key}-${__originalKey}`;
            const newCol = { ...col, key: colKey, __originalKey };
            if (customizedColumns) {
              Object.assign(newCol, customizedColumns[__originalKey], customizedColumns[colKey]);
            }
            newCol.lock = false;
            return newCol;
          }), ({ sort = Infinity }, { sort: sort2 = Infinity }) => sort - sort2),
          __tableGroup: tableGroup,
          __group: group,
          __groups: groups,
        };
        findAndMergeCustomizedColumn(column, tableStore, customizedColumns);
        generatedColumns.add(column);
      }
    } else if (subColumns.length) {
      subColumns.forEach(column => generatedColumns.add(column));
    }
  });
  return [...generatedColumns];
}

export function normalizeGroupColumns(
  tableStore: TableStore,
  columns: ColumnProps[] | undefined,
  children: ReactNode,
  aggregation?: boolean,
  customizedColumns?: { [key: string]: ColumnProps },
): [ColumnProps[], ColumnProps[], ColumnProps[], boolean] {
  const { headerTableGroups, groups, dataSet } = tableStore;
  const hasHeaderGroup = headerTableGroups.length > 0;
  const generatedColumns = columns
    ? mergeDefaultProps(tableStore, columns, aggregation, customizedColumns)
    : normalizeColumns(tableStore, children, aggregation, customizedColumns);
  const [leftOriginalColumns, originalColumns, rightOriginalColumns, { hasAggregationColumn }] = generatedColumns;
  const [leftColumnGroupedColumns, columnGroupedColumns, rightColumnGroupedColumns, hasAggregationColumnGroup] = groups.length ?
    getColumnGroupedColumns(tableStore, groups, customizedColumns) :
    [[], [], [], false];
  if (hasHeaderGroup) {
    const groupedColumns = [...leftColumnGroupedColumns, ...columnGroupedColumns];
    return [
      groupedColumns,
      getHeaderGroupedColumns(tableStore, tableStore.groupedDataWithHeader, headerTableGroups!, [...leftOriginalColumns, ...originalColumns, ...rightOriginalColumns], dataSet, groupedColumns, customizedColumns),
      rightColumnGroupedColumns,
      hasAggregationColumnGroup || hasAggregationColumn,
    ];
  }
  return [
    [...leftColumnGroupedColumns, ...leftOriginalColumns],
    [...columnGroupedColumns, ...originalColumns],
    [...rightOriginalColumns, ...rightColumnGroupedColumns],
    hasAggregationColumnGroup || hasAggregationColumn,
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
    headers.push({ name: column.name!, label: await getReactNodeText(getHeader({ ...column, dataSet, aggregation })) });
  }
  if (columns.length) {
    await getHeaderTexts(dataSet, columns, aggregation, headers);
  }
  return headers;
}

function autoHeightToStyle(autoHeight: { type: TableAutoHeightType, diff: number }, parentPaddingTop = 0): CSSProperties {
  const { type, diff } = autoHeight;
  const height = `calc(100% - ${diff + parentPaddingTop}px)`;
  if (type === TableAutoHeightType.minHeight) {
    return {
      height,
    };
  }
  return {
    maxHeight: height,
  };
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

  @observable calcBodyHeight: number | undefined;

  @observable width?: number;

  @observable lastScrollTop: number;

  @observable lastScrollLeft: number;

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

  @observable comboBarStatus: boolean;

  lastSelected?: Record;

  activeEmptyCell?: HTMLTableCellElement;

  timing: {
    renderStart: number;
    renderEnd: number;
  } = { renderStart: 0, renderEnd: 0 };

  @observable siblingHeihgt?: { before?: number; after?: number };

  @observable parentHeight?: number | undefined;

  @observable parentPaddingTop?: number | undefined;

  @observable screenHeight: number;

  @observable headerHeight: number;

  @observable footerHeight: number;

  @observable headerFilter?: { fieldName?: string; filterText?: any; filter?: boolean | ((props: { record: Record; filterText?: string }) => boolean) };

  nextRenderColIndex?: [number, number];

  prevRenderColIndex?: [number, number];

  get styleHeight(): string | number | undefined {
    const { autoHeight, props: { style }, parentPaddingTop } = this;
    return autoHeight ? autoHeightToStyle(autoHeight, parentPaddingTop).height : style && style.height;
  }

  get styleMaxHeight(): string | number | undefined {
    const { autoHeight, props: { style }, parentPaddingTop } = this;
    return autoHeight ? autoHeightToStyle(autoHeight, parentPaddingTop).maxHeight : style && style.maxHeight;
  }

  get styleMinHeight(): string | number | undefined {
    const { props: { style } } = this;
    return style && toPx(style.minHeight, this.getRelationSize);
  }

  @computed
  get computedHeight(): number | undefined {
    if (this.heightChangeable) {
      const {
        customized: { heightType, height, heightDiff },
        tempCustomized,
      } = this;
      const tempHeightType = get(tempCustomized, 'heightType');
      if (tempHeightType) {
        if (tempHeightType === TableHeightType.fixed) {
          return get(tempCustomized, 'height');
        }
        if (tempHeightType === TableHeightType.flex) {
          return this.screenHeight - (get(tempCustomized, 'heightDiff') || 0);
        }
        return undefined;
      }
      if (heightType) {
        if (heightType === TableHeightType.fixed) {
          return height;
        }
        if (heightType === TableHeightType.flex) {
          return this.screenHeight - (heightDiff || 0);
        }
        return undefined;
      }
    }
    return toPx(this.styleHeight, this.getRelationSize);
  }

  get otherHeight() {
    const { footerHeight, props: { boxSizing } } = this;
    const footerTotalHeight = footerHeight && this.overflowX ? measureScrollbar() + footerHeight : footerHeight;
    const otherHeight = this.headerHeight + footerTotalHeight;
    if (boxSizing === TableBoxSizing.wrapper) {
      const { before = 0, after = 0 } = this.siblingHeihgt || {};
      return otherHeight + before + after;
    }
    return otherHeight;
  }

  @computed
  get height(): number | undefined {
    if (!this.isBodyExpanded) {
      return undefined;
    }
    const { computedHeight } = this;
    const maxHeight = toPx(this.styleMaxHeight, this.getRelationSize);
    const minHeight = toPx(this.styleMinHeight, this.getRelationSize);
    const isComputedHeight = isNumber(computedHeight);
    if (isComputedHeight || isNumber(minHeight) || isNumber(maxHeight)) {
      const { rowHeight, otherHeight } = this;
      const rowMinHeight = (isNumber(rowHeight) ? rowHeight : 30) + otherHeight;
      const minTotalHeight = minHeight ? Math.max(
        rowMinHeight,
        minHeight,
      ) : rowMinHeight;
      const height = defaultTo(computedHeight, this.bodyHeight + otherHeight);
      const totalHeight = Math.max(minTotalHeight, maxHeight ? Math.min(maxHeight, height) : height);
      return isComputedHeight || totalHeight !== height ? totalHeight - otherHeight : undefined;
    }
  }

  get totalHeight(): number {
    const { height, bodyHeight, otherHeight } = this;
    return defaultTo(height, bodyHeight) + otherHeight;
  }

  get bodyHeight(): number {
    if (this.propVirtual) {
      const { virtualHeight } = this;
      if (virtualHeight > 0) {
        return virtualHeight;
      }
    }
    return this.calcBodyHeight || 0;
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
    return this.node.prefixCls;
  }

  get customizable(): boolean | undefined {
    const { customizedCode } = this.props;
    const { props: { queryBarProps } } = this;
    const isSimpleMode = queryBarProps && queryBarProps.simpleMode;
    if (customizedCode || (this.queryBar === TableQueryBarType.comboBar && !isSimpleMode)) {
      if ('customizable' in this.props) {
        return this.props.customizable;
      }
      return this.getConfig('tableCustomizable') || this.node.context.getCustomizable('Table');
    }
    return false;
  }

  /**
   * board 组件个性化按钮 in buttons
   */
  get customizedBtn(): boolean | undefined {
    const { customizedCode, boardCustomized } = this.props;
    if (customizedCode && boardCustomized) {
      return boardCustomized.customizedBtn;
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
    if (this.heightChangeable) {
      const tempHeightType = get(this.tempCustomized, 'heightType');
      if (tempHeightType !== undefined) {
        return tempHeightType;
      }
      const { heightType } = this.customized;
      if (heightType !== undefined) {
        return heightType;
      }
    }
    return this.originalHeightType;
  }

  get originalHeightType(): TableHeightType {
    const { styleHeight } = this;
    if (styleHeight) {
      if (isString(styleHeight) && isCalcSize(styleHeight)) {
        return TableHeightType.flex;
      }
      if (isNumber(toPx(styleHeight))) {
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

  get isFixedRowHeight(): boolean {
    if (!this.aggregation || !this.hasAggregationColumn) {
      return isNumber(this.rowHeight);
    }
    return false;
  }

  get propVirtual(): boolean | undefined {
    if (this.isTree && this.rowDraggable) {
      return true;
    }
    if ('virtual' in this.props) {
      return this.props.virtual;
    }
    const configTableVirtual: boolean | Function | undefined = this.getConfig('tableVirtual');
    if (typeof configTableVirtual === 'function') {
      return configTableVirtual(this.currentData.length, this.columnGroups.leafs.length);
    }
    
    return configTableVirtual;
  }

  get virtual(): boolean | undefined {
    if (this.height !== undefined) {
      return this.propVirtual;
    }
    return false;
  }

  get columnBuffer(): number {
    const { columnBuffer } = this.props;
    if ('columnBuffer' in this.props && typeof columnBuffer === 'number' && columnBuffer >= 0) {
      return columnBuffer!;
    }
    const bufferConfig = this.getConfig('tableVirtualBuffer');
    if (bufferConfig && 'columnBuffer' in bufferConfig && typeof bufferConfig.columnBuffer === 'number' && bufferConfig.columnBuffer >= 0) {
      return bufferConfig.columnBuffer;
    }
    return 3;
  }

  get columnThreshold(): number {
    const { columnThreshold } = this.props;
    if ('columnThreshold' in this.props && typeof columnThreshold === 'number' && columnThreshold >= 0) {
      return columnThreshold!;
    }
    const bufferConfig = this.getConfig('tableVirtualBuffer');
    if (bufferConfig && 'columnThreshold' in bufferConfig && typeof bufferConfig.columnThreshold === 'number' && bufferConfig.columnThreshold >= 0) {
      return bufferConfig.columnThreshold;
    }
    return 3;
  }


  updateRenderZonePosition(): [number, number] {
    // 获取表格坐标显示范围
    if (!this.width) {
      return [0, 0];
    }
    const { columnGroups: { leafs, leftLeafs, rightLeafs, leftLeafColumnsWidth, rightLeafColumnsWidth }, columnThreshold, nextRenderColIndex } = this;
    const scrollLeft = this.lastScrollLeft || 0;

    let visibleColumnWidth = 0;
    let firstIndex = -1;
    let lastIndex = -1;
    const centerLeafsLength = leafs.length - rightLeafs.length;
    for (let i = leftLeafs.length; i < centerLeafsLength; i++) {
      const { width } = leafs[i];
      visibleColumnWidth += width;
      if (firstIndex === -1 && visibleColumnWidth > scrollLeft) {
        firstIndex = i;
      }
      if (lastIndex === -1 && i === centerLeafsLength - 1 || this.width && visibleColumnWidth >= scrollLeft + this.width - leftLeafColumnsWidth - rightLeafColumnsWidth - (this.overflowY ? measureScrollbar() : 0)) {
        lastIndex = i;
      }
      if (lastIndex !== -1 && firstIndex !== -1) {
        break;
      }
    }

    if (!nextRenderColIndex || (nextRenderColIndex && nextRenderColIndex.includes(lastIndex)) || (lastIndex < nextRenderColIndex[0] || lastIndex > nextRenderColIndex[1])) {
      this.nextRenderColIndex = [lastIndex - columnThreshold, Math.min(lastIndex + columnThreshold, leafs.length)]; 
      this.prevRenderColIndex = [firstIndex, lastIndex]; 
      return [firstIndex, lastIndex];
    }

    return this.prevRenderColIndex || [0, 0];

  }


  @computed
  get virtualColumnRange(): {
    left?: [number, number];
    center: [number, number];
    right?: [number, number];
    } {
    const { columnGroups: { leafs, leftLeafs, rightLeafs }, columnBuffer } = this;
    if (!this.propVirtual || !this.overflowX) {
      return { center: [0, leafs.length] };
    }
    const rangeThreshold: {
      left?: [number, number];
      center: [number, number];
      right?: [number, number];
    } = { center: [0, 0] }

    // 左右固定列的坐标范围
    const leftColLength = leftLeafs.length;
    const rightColLength = rightLeafs.length;

    if (leftColLength) {
      rangeThreshold.left = [0, leftColLength];
    }
    if (rightColLength) {
      rangeThreshold.right = [leafs.length - rightColLength, leafs.length];
    }

    const [start, end] = this.updateRenderZonePosition();

    const first = Math.max(leftColLength, start - columnBuffer);
    const last = Math.min(leafs.length - rightColLength, end + columnBuffer + 1);

    rangeThreshold.center = [first, last];
    return rangeThreshold;
  }

  @autobind
  isRenderRange(index: number, isGroup?: boolean): boolean {
    const { virtualColumnRange, propVirtual } = this;
    if (!propVirtual || isGroup) {
      return true;
    }
    if (virtualColumnRange.left && (index >= virtualColumnRange.left[0] && index < virtualColumnRange.left[1])) {
      return true;
    }
    if (index >= virtualColumnRange.center[0] && index < virtualColumnRange.center[1]) {
      return true;
    }
    if (virtualColumnRange.right && index >= virtualColumnRange.right[0] && index <= virtualColumnRange.right[1]) {
      return true;
    }

    return false;
  }

  get blankVirtualCell() {
    const { virtualColumnRange } = this; 
    const { left, center, right } = virtualColumnRange;
    return {
      left: left ? [...Array(center[0] - left[1]).keys()].map((key) => <td key={`empty-left-${key}`} />) : [],
      right: right ? [...Array(right[0] - center[1]).keys()].map((key) => <td key={`empty-right-${key}`}/>) : [],
    }
  }

  get tableColumnResizeTransition(): boolean | undefined {
    return this.getConfig('tableColumnResizeTransition');
  }

  @observable actualRows: number | undefined;

  @observable rowMetaData?: VirtualRowMetaData[] | undefined;

  lastMeasuredIndex = 0;

  @observable scrolling: boolean | undefined;

  @observable cellVerticalSize: number | undefined;

  @computed
  get virtualRowHeight(): number {
    const { rowHeight, cellVerticalSize = 3 } = this;
    const normalRowHeight = scaleSize(isNumber(rowHeight) ? rowHeight + cellVerticalSize : 30 + cellVerticalSize);
    return this.aggregation && this.hasAggregationColumn ? normalRowHeight * 4 : normalRowHeight;
  }

  get virtualEstimatedRows() {
    const { rowMetaData } = this;
    if (rowMetaData) {
      return rowMetaData.length;
    }
    const { actualRows } = this;
    if (actualRows !== undefined) {
      return actualRows;
    }
    return this.data.length;
  }

  get virtualHeight(): number {
    const { virtualRowHeight, virtualEstimatedRows } = this;
    if (!virtualEstimatedRows) {
      return 0;
    }
    const { rowMetaData } = this;
    if (rowMetaData) {
      let { lastMeasuredIndex } = this;
      let totalSizeOfMeasuredItems = 0;

      if (lastMeasuredIndex >= virtualEstimatedRows) {
        lastMeasuredIndex = virtualEstimatedRows - 1;
      }

      if (lastMeasuredIndex >= 0) {
        const itemMetadata = rowMetaData[lastMeasuredIndex];
        if (itemMetadata) {
          totalSizeOfMeasuredItems = itemMetadata.offset + itemMetadata.height;
        }
      }

      const numUnmeasuredItems = virtualEstimatedRows - lastMeasuredIndex - 1;
      const totalSizeOfUnmeasuredItems = numUnmeasuredItems * virtualRowHeight;

      return totalSizeOfMeasuredItems + totalSizeOfUnmeasuredItems;
    }
    return Math.round(virtualEstimatedRows * virtualRowHeight);
  }

  @computed
  get virtualVisibleStartIndex(): number {
    return getVisibleStartIndex(this);
  }

  @computed
  get virtualVisibleEndIndex(): number {
    return getVisibleEndIndex(this);
  }

  @computed
  get virtualStartIndex(): number {
    return getStartIndex(this);
  }

  @computed
  get virtualEndIndex(): number {
    return getEndIndex(this);
  }

  get virtualTop(): number {
    const { virtualRowHeight, virtualStartIndex } = this;
    const { rowMetaData } = this;
    if (rowMetaData && rowMetaData.length) {
      return rowMetaData[virtualStartIndex].offset;
    }
    return virtualStartIndex * virtualRowHeight;
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

  get heightChangeable(): boolean {
    if ('heightChangeable' in this.props) {
      return this.props.heightChangeable!;
    }
    return this.getConfig('tableHeightChangeable') === true;
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
    if (this.groups.length) {
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
    const { rowHeight = defaultTo(this.getConfig('tableRowHeight'), 30) } = this.props;
    const { size } = this;
    if (typeof rowHeight === 'function') {
      return rowHeight({ size });
    }
    if (isNumber(rowHeight)) {
      switch (size) {
        case Size.large:
          return rowHeight + 2;
        case Size.small:
          return rowHeight - 2;
        default:
      }
    }
    return rowHeight;
  }

  get headerRowHeight(): 'auto' | number {
    const { headerRowHeight = this.getConfig('tableHeaderRowHeight') } = this.props;
    if (headerRowHeight === undefined) {
      return this.rowHeight;
    }
    const { size } = this;
    if (typeof headerRowHeight === 'function') {
      return headerRowHeight({ size });
    }
    if (isNumber(headerRowHeight)) {
      switch (size) {
        case Size.large:
          return headerRowHeight + 2;
        case Size.small:
          return headerRowHeight - 2;
        default:
      }
    }
    return headerRowHeight;
  }

  get footerRowHeight(): 'auto' | number {
    const { footerRowHeight = this.getConfig('tableFooterRowHeight') } = this.props;
    if (footerRowHeight === undefined) {
      return this.rowHeight;
    }
    const { size } = this;
    if (typeof footerRowHeight === 'function') {
      return footerRowHeight({ size });
    }
    if (isNumber(footerRowHeight)) {
      switch (size) {
        case Size.large:
          return footerRowHeight + 2;
        case Size.small:
          return footerRowHeight - 2;
        default:
      }
    }
    return footerRowHeight;
  }

  get autoFootHeight(): boolean {
    if ('autoFootHeight' in this.props) {
      return this.props.autoFootHeight!;
    }
    return false;
  }

  get emptyText(): ReactNode {
    const { renderEmpty } = this.props;
    if (renderEmpty) {
      return renderEmpty();
    }
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

  get tableColumnResizeTrigger(): TableColumnResizeTriggerType {
    return this.getConfig('tableColumnResizeTrigger');
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

  @observable defaultRecordCachedType?: RecordCachedType;

  @observable recordCachedType?: RecordCachedType;

  get computedRecordCachedType(): RecordCachedType | undefined {
    return this.recordCachedType || this.defaultRecordCachedType;
  }

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

  get showCachedTips(): boolean {
    const { showCachedTips } = this.props;
    if (showCachedTips !== undefined) {
      return showCachedTips;
    }
    const tableShowCachedTips = this.getConfig('tableShowCachedTips');
    if (tableShowCachedTips !== undefined) {
      return tableShowCachedTips;
    }
    return false;
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
      height < bodyHeight + (!this.hasFooter && this.overflowX ? measureScrollbar() : 0)
    );
  }

  @computed
  get hasRowGroups(): boolean {
    if (this.cachedData.length) {
      return true;
    }
    const { groups } = this;
    if (groups) {
      return groups.some(({ type }) => type === GroupType.row);
    }
    return false;
  }

  @computed
  get headerTableGroups(): TableGroup[] {
    const { groups } = this;
    return groups ? groups.filter(({ type }) => type === GroupType.header) : [];
  }

  @autobind
  customizedColumnHeader() {
    if (this.queryBar === TableQueryBarType.comboBar) {
      return <ComboCustomizationSettings />;
    }
    return <CustomizationColumnHeader customizedBtn={this.customizedBtn} onHeaderClick={this.openCustomizationModal} />;
  }

  @computed
  get customizedColumn(): ColumnProps | undefined {
    if (this.customizable && !this.customizedBtn && (!this.rowDraggable || this.dragColumnAlign !== DragColumnAlign.right)) {
      return {
        key: CUSTOMIZED_KEY,
        resizable: false,
        titleEditable: false,
        align: ColumnAlign.center,
        width: scaleSize(30),
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
        width: scaleSize(50),
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
        resizable: true,
        titleEditable: false,
        headerClassName: `${this.prefixCls}-row-number-column`,
        renderer: this.renderRowNumber,
        tooltip: TableColumnTooltip.overflow,
        align: ColumnAlign.center,
        width: scaleSize(50),
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
        width: scaleSize(50),
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
  get comboQueryColumn(): ColumnProps | undefined {
    if (this.queryBar === TableQueryBarType.comboBar) {
      const { prefixCls, props: { queryBarProps } } = this;
      const showInlineSearch = queryBarProps && queryBarProps.inlineSearch;
      const showInlineSearchRender = queryBarProps && queryBarProps.inlineSearchRender;
      const className = `${prefixCls}-inline-query`;

      const lock: ColumnLock | boolean = ColumnLock.left;

      const queryColumn: ColumnProps = {
        key: COMBOBAR_KEY,
        header: (
          showInlineSearch && (
            <Icon
              type="manage_search"
              className={className}
              onClick={action(
                () => {
                  this.comboBarStatus = !this.comboBarStatus;
                  this.node.handleHeightTypeChange();
                })}
            />
          )
        ),
        resizable: false,
        titleEditable: false,
        headerClassName: className,
        className,
        footerClassName: className,
        renderer: () => queryBarProps && queryBarProps.inlineSearchRender,
        align: ColumnAlign.center,
        width: scaleSize(50),
        lock,
      };
      return showInlineSearch === true || showInlineSearchRender ? queryColumn : undefined;
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
        width: scaleSize(50),
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
    const { dragColumnAlign, leftOriginalColumns, expandColumn, expandIconColumnIndex, draggableColumn, rowNumberColumn, selectionColumn, comboQueryColumn } = this;
    return observable.array([
      expandIconColumnIndex ? undefined : expandColumn,
      dragColumnAlign === DragColumnAlign.left ? draggableColumn : undefined,
      rowNumberColumn,
      selectionColumn && selectionColumn.lock === ColumnLock.left ? selectionColumn : undefined,
      comboQueryColumn,
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
    const { leftColumns, rightColumns, selectionColumn, expandColumn, expandIconColumnIndex, props: { rowBoxPlacement } } = this;
    const originalColumns = this.originalColumns.slice();
    if (isNumber(rowBoxPlacement) && selectionColumn) {
      originalColumns.splice(rowBoxPlacement as number, 0, selectionColumn);
    }
    const allColumns = Array.from([
      ...leftColumns,
      ...originalColumns,
      ...rightColumns,
    ]);
    if (expandIconColumnIndex && expandColumn) {
      let lock: boolean | ColumnLock = true;
      if (expandIconColumnIndex > leftColumns.length && expandIconColumnIndex <= leftColumns.length + originalColumns.length) {
        lock = false;
      } else if (expandIconColumnIndex > leftColumns.length + originalColumns.length) {
        lock = ColumnLock.right;
      }
      allColumns.splice(expandIconColumnIndex, 0, { ...expandColumn, lock });
    }
    return observable.array([
      ...allColumns,
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
  get getLastEmptyWidthColumn(): ColumnProps | undefined {
    const emptyWidthColumns = this.columnGroups.leafs.filter(({ column }) => isNil(get(column, 'width')));
    return emptyWidthColumns.length ? emptyWidthColumns[emptyWidthColumns.length - 1].column : undefined;
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

  @computed
  get isCombinedColumn(): boolean {
    const columns = this.columns;
    const combinedColumn = columns.find(column => !column.aggregation && column.children && column.children.length > 0);
    return !isNil(combinedColumn);
  }

  @observable groups: TableGroup[];

  @observable groupedData: Group[];

  @observable groupedDataWithHeader: Group[];

  get cachedDataInType(): Record[] {
    const { dataSet, showCachedSelection, computedRecordCachedType = RecordCachedType.selected } = this;
    if (showCachedSelection) {
      switch (computedRecordCachedType) {
        case RecordCachedType.selected:
          return dataSet.cachedSelected;
        case RecordCachedType.add:
          return dataSet.cachedCreated;
        case RecordCachedType.update:
          return dataSet.cachedUpdated;
        case RecordCachedType.delete:
          return dataSet.cachedDestroyed;
        default:
      }
    }
    return [];
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
    const { pristine, filter: recordFilter, treeFilter } = this.props;
    const { dataSet, isTree, headerFilter } = this;
    const filter = (
      isTree
        ? typeof treeFilter === 'function' ? treeFilter : recordFilter
        : recordFilter
    );
    let data = isTree ? dataSet.treeRecords : dataSet.records;
    if (typeof filter === 'function') {
      data = data.filter(filter);
    }
    if (pristine) {
      data = data.filter(record => !record.isNew);
    }
    if (headerFilter) {
      const { filter, filterText } = headerFilter;
      if (typeof filter === 'function') {
        data = data.filter(record => filter({ record, filterText }));
      } else {
        const field = dataSet.getField(headerFilter.fieldName);
        const type = field && field.get('type');
        const multiple = field && field.get('multiple');
        let isLookUp = false;
        if (field &&
          (
            field.get('lookupCode') ||
            isString(field.get('lookupUrl')) ||
            (type !== FieldType.object && (field.get('lovCode') || field.getLookup() || field.get('options'))) ||
            field.get('lovCode')
          )
        ) {
          isLookUp = true;
        }
        data = data.filter(record => {
          let recordText: string;
          if (multiple) {
            if (isLookUp) {
              recordText = record.get(headerFilter.fieldName).map(value => field!.getText(value)).join('');
            } else {
              recordText = record.get(headerFilter.fieldName).join('');
            }
          } else {
            recordText = isLookUp ? String(field!.getText(record.get(headerFilter.fieldName))) : String(record.get(headerFilter.fieldName));
          }
          return recordText.toLocaleLowerCase().includes(String(headerFilter.filterText).toLocaleLowerCase())
        });
      }
    }
    return data;
  }

  get treeFilter(): ((record: Record) => boolean) | undefined {
    const { props: { treeFilter } } = this;
    return treeFilter;
  }

  @computed
  get data(): Record[] {
    return [...this.cachedData, ...this.currentData];
  }

  @computed
  get cachedIndeterminate(): boolean {
    const { dataSet, showCachedSelection } = this;
    if (dataSet) {
      const [cachedSelectedLength, cachedRecordsLength] = showCachedSelection ?
        getCachedSelectableCounts(dataSet, this.computedRecordCachedType, this.showCachedTips) : [0, 0];
      if (cachedSelectedLength) {
        return cachedSelectedLength !== cachedRecordsLength;
      }
    }
    return false;
  }

  @computed
  get allCachedChecked(): boolean {
    const { dataSet, showCachedSelection } = this;
    if (dataSet) {
      const [cachedSelectedLength, cachedRecordsLength] = showCachedSelection ?
        getCachedSelectableCounts(dataSet, this.computedRecordCachedType, this.showCachedTips) : [0, 0];
      if (cachedSelectedLength) {
        return cachedSelectedLength === cachedRecordsLength;
      }
    }
    return false;
  }

  @computed
  get currentIndeterminate(): boolean {
    const { dataSet, filter } = this.props;
    if (dataSet) {
      const [selectedLength, currentLength] = getCurrentSelectableCounts(dataSet, filter);
      if (selectedLength) {
        return selectedLength !== currentLength;
      }
    }
    return false;
  }


  @computed
  get allCurrentChecked(): boolean {
    const { dataSet, filter } = this.props;
    if (dataSet) {
      const [selectedLength, currentLength] = getCurrentSelectableCounts(dataSet, filter);
      if (selectedLength) {
        return selectedLength === currentLength;
      }
    }
    return false;
  }

  @computed
  get indeterminate(): boolean {
    const { showCachedSelection } = this;
    if (showCachedSelection) {
      const { dataSet } = this;
      const [cachedSelectedLength, cachedRecordsLength] =
        getCachedSelectableCounts(dataSet, this.computedRecordCachedType, this.showCachedTips);
      const allLength = cachedSelectedLength + dataSet.currentSelected.length;
      return !!allLength && allLength !== (cachedRecordsLength + dataSet.records.length);
    }
    return this.currentIndeterminate;
  }

  @computed
  get allChecked(): boolean {
    const { showCachedSelection } = this;
    if (showCachedSelection) {
      const { dataSet } = this;
      const [cachedSelectedLength, cachedRecordsLength] =
        getCachedSelectableCounts(dataSet, this.computedRecordCachedType, this.showCachedTips);
      const allLength = cachedSelectedLength + dataSet.currentSelected.length;
      return !!allLength && allLength === (cachedRecordsLength + dataSet.records.length);
    }
    return this.allCurrentChecked;
  }

  get expandIconAsCell(): boolean {
    const { expandedRowRenderer, expandIconAsCell } = this.props;
    if (expandIconAsCell !== undefined) {
      return expandIconAsCell;
    }
    return !!expandedRowRenderer && !this.isTree;
  }

  get expandIconColumnIndex(): number {
    const {
      dragColumnAlign,
      rowDraggable,
      props: { expandIconColumnIndex = 0, rowNumber },
    } = this;
    if ((!expandIconColumnIndex || typeof expandIconColumnIndex !== 'number') && !this.isTree) {
      return 0;
    }
    return expandIconColumnIndex + [this.hasRowBox, rowNumber, dragColumnAlign && rowDraggable, !!this.comboQueryColumn].filter(Boolean).length;
  }

  get inlineEdit() {
    return this.props.editMode === TableEditMode.inline;
  }

  checkAllCurrent() {
    const { dataSet, filter } = this.props;
    dataSet.selectAll(filter);
  }

  unCheckAllCurrent() {
    const { dataSet } = this.props;
    dataSet.unSelectAll();
  }

  checkAllCached() {
    if (this.showCachedSelection) {
      const { dataSet, filter } = this.props;
      dataSet.batchSelect(
        getCachedSelectableRecords(dataSet, this.computedRecordCachedType, this.showCachedTips, filter),
      );
    }
  }

  unCheckAllCached() {
    if (this.showCachedSelection) {
      const { dataSet, filter } = this.props;
      dataSet.batchUnSelect(
        getCachedSelectableRecords(dataSet, this.computedRecordCachedType, this.showCachedTips, filter),
      );
    }
  }

  private handleSelectAllChange = action(() => {
    if (this.allChecked) {
      this.unCheckAllCurrent();
      this.unCheckAllCached();
    } else {
      this.checkAllCurrent();
      this.checkAllCached();
    }
  });

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
      this.screenHeight = typeof window === 'undefined' ? 0 : document.documentElement.clientHeight;
      this.headerHeight = 0;
      this.footerHeight = 0;
      this.lastScrollTop = 0;
      this.customizedActiveKey = ['columns'];
      this.leftOriginalColumns = [];
      this.originalColumns = [];
      this.rightOriginalColumns = [];
      this.tempCustomized = { columns: {} };
      this.customized = { columns: {} };
      this.setProps(node.props);
      if (this.customizable) {
        this.loadCustomized();
      } else {
        this.initColumns();
      }
    });
  }

  isBuiltInColumn({ key }: ColumnProps) {
    if (isString(key)) {
      return [DRAG_KEY, SELECTION_KEY, ROW_NUMBER_KEY, CUSTOMIZED_KEY, EXPAND_KEY, COMBOBAR_KEY].includes(key);
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

  getColumnTagRenderer(column: ColumnProps): ((props: TagRendererProps) => ReactNode) | undefined {
    const { tagRenderer } = column;
    return tagRenderer;
  }

  @action
  showEditor(name: string) {
    this.currentEditorName = name;
  }

  @action
  setLastScrollTop(lastScrollTop: number) {
    if (this.virtual) {
      this.lastScrollTop = lastScrollTop;
      this.startScroll();
    }
  }

  @action
  setLastScrollLeft(lastScrollLeft: number) {
    if (this.propVirtual) {
      this.lastScrollLeft = lastScrollLeft;
      this.startScroll();
    }
  }

  @action
  hideEditor() {
    this.currentEditorName = undefined;
  }

  @action
  changeMouseBatchChooseIdList(idList: number[]) {
    this.mouseBatchChooseIdList = idList;
  }

  showNextEditor(name: string, reserve: boolean): boolean {
    const { dataSet } = this;
    const { currentIndex } = dataSet;
    const record = dataSet.get(reserve ? currentIndex - 1 : currentIndex + 1);
    if (record && !isDisabledRow(record)) {
      dataSet.current = record;
      this.showEditor(name);
      return true;
    }
    return false;
  }

  @action
  setProps(props) {
    this.props = props;
    this.initGroups();
    const { showCachedSelection } = props;
    if (showCachedSelection !== undefined) {
      this.showCachedSelection = showCachedSelection;
    }
  }

  @action
  updateProps(props) {
    const { customizedCode, aggregation: oldAggregation } = this.props;
    this.setProps(props);
    if (this.customizable) {
      if (customizedCode !== props.customizedCode) {
        this.loadCustomized();
        return;
      }
      const { aggregation } = props;
      if (oldAggregation !== aggregation) {
        const { customized } = this;
        if (!isNil(aggregation) && aggregation !== customized.aggregation) {
          customized.aggregation = aggregation;
          this.saveCustomized();
        }
      }
    }
    this.initColumns();
  }

  groupReaction?: IReactionDisposer;

  disposeGroupReaction() {
    const { groupReaction } = this;
    if (groupReaction) {
      groupReaction();
    }
  }

  dispose() {
    this.disposeGroupReaction();
  }

  @action
  initGroups() {
    this.disposeGroupReaction();
    const { groups = [] } = this.props;
    if (groups.length) {
      this.groupReaction = reaction(() => dataSet.records, () => this.initGroups());
      const headerGroupNames: string[] = [];
      const rowGroupNames: string[] = [];
      const groupNames: string[] = [];
      const parentFields: Map<string | symbol, string> = new Map();
      const { dataSet } = this;
      const header: TableGroup[] = [];
      const row: TableGroup[] = [];
      const column: TableGroup[] = [];
      groups.forEach((group) => {
        const { type, name, parentField } = group;
        switch (type) {
          case GroupType.header:
            header.push(group);
            headerGroupNames.push(name);
            break;
          case GroupType.row:
            row.push(group);
            rowGroupNames.push(name);
            break;
          case GroupType.none:
            break;
          default: {
            column.push(group);
            groupNames.push(name);
          }
        }
        if (parentField) {
          parentFields.set(name, parentField);
        }
      });

      this.groupedData = mergeGroupStates(normalizeGroups(rowGroupNames.concat(groupNames), headerGroupNames, dataSet.records, parentFields), this.groupedData);
      this.groupedDataWithHeader = mergeGroupStates(normalizeGroups(headerGroupNames.concat(rowGroupNames, groupNames), [], dataSet.records), this.groupedDataWithHeader);
      this.groups = [...header, ...row, ...column];
    } else {
      this.groups = [];
      this.groupedData = [];
      this.groupedDataWithHeader = [];
    }
  }

  @action
  initColumns() {
    const { customized, customizable, aggregation } = this;
    const { columns, children } = this.props;
    const customizedColumns = customizable ? customized.columns : undefined;
    const [leftOriginalColumns, originalColumns, rightOriginalColumns, hasAggregationColumn] =
      normalizeGroupColumns(this, columns, children, aggregation, customizedColumns);
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

  get isBodyExpanded(): boolean {
    if (!this.props.bodyExpandable) {
      return true;
    }
    const { bodyExpanded } = this.props;
    if (bodyExpanded !== undefined) {
      return bodyExpanded;
    }
    const isBodyExpanded = this.dataSet.getState(BODY_EXPANDED);
    if (isBodyExpanded !== undefined) {
      return isBodyExpanded;
    }
    return defaultTo(this.props.defaultBodyExpanded, true);
  }

  setBodyExpanded(isBodyExpanded: boolean) {
    const { bodyExpanded, onBodyExpand = noop } = this.props;
    if (bodyExpanded === undefined) {
      this.dataSet.setState(BODY_EXPANDED, isBodyExpanded);
    }
    onBodyExpand(isBodyExpanded);
  }

  isGroupExpanded(group: Group): boolean {
    return group.isExpanded && (!group.parent || this.isGroupExpanded(group.parent));
  }

  setGroupExpanded(group: Group, isExpanded: boolean) {
    group.isExpanded = isExpanded;
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
    const { dataSet, treeLoadData, treeAsync, selectionMode } = this.props;
    const promises: Promise<any>[] = [];
    this.setRowPending(record, true);
    if (treeAsync && dataSet) {
      promises.push(dataSet.queryMoreChild(record, dataSet.currentPage));
    }
    if (treeLoadData) {
      promises.push(treeLoadData({ record, dataSet }));
    }
    // 由子选父
    const parentSelect = (parent: Record) => {
      if (!parent.isSelected &&
        parent.children &&
        parent.children.length > 0 &&
        parent.children.every(child => child.isSelected)) {
        dataSet.select(parent);
        if (parent.parent) {
          parentSelect(parent.parent);
        }
      }
    }
    try {
      await Promise.all(promises);
      if (selectionMode === SelectionMode.treebox) {
        // 由父选子
        if (record.isSelected) {
          defaultTo(record.children, []).forEach(child => {
            if (!child.isSelected) {
              dataSet.select(child);
            }
          });
        }
        else {
          parentSelect(record);
        }
      }
      this.setRowLoaded(record, true);
    } finally {
      this.setRowPending(record, false);
    }
  }

  @autobind
  renderSelectionBox({ record }): ReactNode {
    const { selectionBoxRenderer } = this.props;
    if (selectionBoxRenderer && isFunction(selectionBoxRenderer)) {
      const element = renderSelectionBox({ record, store: this });
      return selectionBoxRenderer({ record, element });
    }
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

  findColumnGroup(indexOrKeyOrName: number | string): ColumnGroup | undefined {
    const { allLeafs } = this.columnGroups;
    return isNumber(indexOrKeyOrName) ? allLeafs[indexOrKeyOrName] : allLeafs.find(({ key }) => String(key) === indexOrKeyOrName);
  }

  setColumnWidth(columnGroup: ColumnGroup, width: number, saveToCustomization = true) {
    const { column } = columnGroup;
    if (width !== column.width) {
      this.changeCustomizedColumnValue(column, {
        width,
      }, saveToCustomization);
      const { onColumnResize } = this.props;
      if (onColumnResize) {
        const index = this.columnGroups.allLeafs.indexOf(columnGroup);
        /**
         * onColumnResize 事件回调
         * 回调参数：
         * @param column
         * @param width
         */
        onColumnResize({ column, width, index });
      }
    }
  }

  @action
  changeCustomizedColumnValue(column: ColumnProps, value: object, saveToCustomization = true) {
    const { customized: { columns } } = this;
    set(column, value);
    const columnKey = getColumnKey(column).toString();
    const oldCustomized = get(columns, columnKey);
    set(columns, columnKey, {
      ...oldCustomized,
      ...value,
    });
    if (saveToCustomization) {
      this.saveCustomizedDebounce();
    }
  }

  @action
  async saveCustomized(customized?: TableCustomized | null) {
    if (this.customizable && this.customizedLoaded) {
      const { customizedCode, boardCustomized } = this.props;
      if (customized) {
        this.customized = customized;
      }
      if (customizedCode) {
        const tableCustomizedSave = this.getConfig('tableCustomizedSave') || this.getConfig('customizedSave');
        const tableCustomizedLoad = this.getConfig('tableCustomizedLoad') || this.getConfig('customizedLoad');
        // board 组件列表视图配置保存
        if (this.customizedBtn && boardCustomized && boardCustomized.customizedDS) {
          const currentRecord = boardCustomized.customizedDS.current;
          // @ts-ignore
          await tableCustomizedSave(customizedCode,
            {
              dataJson: JSON.stringify(omit(this.customized, ['dataJson', 'creationDate', 'createdBy', 'lastUpdateDate', 'lastUpdatedBy', '_token', 'userId', 'tenantId', 'id'])),
              ...omit(this.customized, ['dataJson']), defaultFlag: 1, viewType: 'table', id: currentRecord.get('id'), objectVersionNumber: currentRecord.get('objectVersionNumber'),
            },
            this.customizedBtn ? 'Board' : 'Table');

          if (customizedCode) {
            const res = await tableCustomizedLoad(customizedCode, 'Board', {
              type: 'detail',
              id: currentRecord.get('id'),
            });
            try {
              const dataJson = res.dataJson ? pick(JSON.parse(res.dataJson), ['columns', 'combineSort', 'defaultFlag', 'height', 'heightDiff', 'viewName']) : {};
              // @ts-ignore
              this.customized = {columns: {}, ...omit(res, 'dataJson'), ...dataJson};
              currentRecord.set({objectVersionNumber: res.objectVersionNumber, dataJson, viewName: res.viewName });
            } catch (error) {
              warning(false, error.message);
            }
          }
        } else {
          tableCustomizedSave(customizedCode, this.customized, 'Table');
        }
      }
    }
  }

  saveCustomizedDebounce = debounce(this.saveCustomized, 1000);

  @autobind
  @action
  openCustomizationModal(context) {
    const { customizedCode } = this.props;
    const modalProps: ModalProps = {
      key: 'TABLE_CUSTOMIZATION_MODAL',
      drawer: true,
      size: Size.small,
      title: this.customizedBtn ? '表格视图配置' : $l('Table', 'customization_settings'),
      children: <CustomizationSettings context={context} />,
      bodyStyle: {
        overflow: 'hidden auto',
        padding: 0,
      },
    };
    if (customizedCode) {
      modalProps.okText = $l('Table', 'save_button');
    }
    Modal.open(modalProps);
  }

  async loadCustomized() {
    const { customizedCode, boardCustomized } = this.props;
    const { props: { queryBarProps } } = this;
    const showSimpleMode = queryBarProps && queryBarProps.simpleMode;
    if ((this.customizable && customizedCode) || (this.queryBar === TableQueryBarType.comboBar && !showSimpleMode)) {
      const tableCustomizedLoad = this.getConfig('tableCustomizedLoad') || this.getConfig('customizedLoad');
      runInAction(() => {
        delete this.customizedLoaded;
        this.loading = true;
      });
      try {
        let customized: TableCustomized | undefined | null;
        if (customizedCode && !boardCustomized) {
          customized = await tableCustomizedLoad(customizedCode, 'Table');
        }
        if (customizedCode && boardCustomized && boardCustomized.customizedDS) {
          const res = await tableCustomizedLoad(customizedCode, 'Board', {
            type: 'detail',
            id: boardCustomized.customizedDS.current.get('id'),
          });
          try {
            const dataJson = res.dataJson ? pick(JSON.parse(res.dataJson), ['columns', 'combineSort', 'defaultFlag', 'height', 'heightDiff', 'viewName']) : {};
            boardCustomized.customizedDS.current.set({objectVersionNumber: res.objectVersionNumber, dataJson, viewName: res.viewName });
            // @ts-ignore
            customized = {...omit(res, 'dataJson'), ...dataJson};
          } catch (error) {
            warning(false, error.message);
          }
        }
        runInAction(() => {
          const newCustomized: TableCustomized = { columns: {}, ...customized };
          this.customized = newCustomized;
          this.initColumns();
          const { aggregation: customAggregation } = newCustomized;
          if (customAggregation !== undefined) {
            const { onAggregationChange, aggregation } = this.props;
            if (onAggregationChange && customAggregation !== aggregation) {
              onAggregationChange(customAggregation);
            }
          }
        });
      } finally {
        this.customizedLoaded = true;
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
          this.unCheckAllCurrent();
          this.unCheckAllCached();
        } else {
          this.checkAllCurrent();
          this.checkAllCached();
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

  @autobind
  getConfig<T extends ConfigKeys>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T] {
    return this.node.getContextConfig(key);
  }

  @autobind
  getProPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
    return this.node.getContextProPrefixCls(suffixCls, customizePrefixCls);
  }

  @autobind
  private multipleSelectionRenderer() {
    const buttons = [
      <ObserverCheckBox
        key="selectAll"
        checked={this.allChecked}
        indeterminate={this.indeterminate}
        onChange={this.handleSelectAllChange}
        labelLayout={LabelLayout.none}
        value
      />,
    ];
    if (this.props.showAllPageSelectionButton) {
      buttons.push(
        <Dropdown key="selectAllPage" overlay={this.renderAllPageSelectionMenu}>
          <Icon type="baseline-arrow_drop_down" className={`${this.prefixCls}-page-all-select`} />
        </Dropdown>,
      );
    }
    return buttons;
  }

  @autobind
  private getRelationSize(type: 'vh' | 'vw' | '%' | 'em'): number | undefined {
    if (type === '%') {
      return this.parentHeight;
    }
    return this.screenHeight;
  }

  @action
  startScroll() {
    this.scrolling = true;
    this.stopScroll();
  }

  stopScroll = debounce(action(() => {
    this.scrolling = false;
  }), 300);

  batchRunner?: BatchRunner;

  batchSetRowHeight(key: Key, callback: Function) {
    const batchRunner = getIf(this, 'batchRunner', () => new BatchRunner());
    batchRunner.addTask(key, callback);
  }

  isRowInView(index: number): boolean {
    const { propVirtual } = this;
    if (propVirtual) {
      return true;
    }
    if (this.height === undefined) {
      return index <= 10;
    }
    const { node: { tableBodyWrap } } = this;
    const scrollTop = tableBodyWrap ? tableBodyWrap.scrollTop : 0;
    const visibleStartIndex = getVisibleStartIndex(this, () => scrollTop);
    return index >= getStartIndex(this, () => visibleStartIndex) &&
      index <= getEndIndex(this, () => getVisibleEndIndex(this, () => visibleStartIndex, () => scrollTop));
  }

  alignEditor() {
    const { currentEditorName } = this;
    if (currentEditorName) {
      const currentEditor = this.editors.get(currentEditorName);
      if (currentEditor) {
        currentEditor.alignEditor();
      }
    }
  }

  blurEditor() {
    const { currentEditorName } = this;
    if (currentEditorName) {
      const currentEditor = this.editors.get(currentEditorName);
      if (currentEditor) {
        currentEditor.blur();
      }
    }
  }
}
