import React, { isValidElement, Key, ReactElement, ReactNode } from 'react';
import { DraggingStyle, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import { toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import isStickySupport from 'choerodon-ui/lib/_util/isStickySupport';
import { ColumnProps, HeaderHookOptions } from './Column';
import Record from '../data-set/Record';
import ObserverCheckBox from '../check-box/CheckBox';
import { FieldType, RecordCachedType, RecordStatus } from '../data-set/enum';
import Field from '../data-set/Field';
import ObserverSelect from '../select/Select';
import TreeSelect from '../tree-select/TreeSelect';
import Option from '../option/Option';
import Lov from '../lov/Lov';
import ObserverNumberField from '../number-field/NumberField';
import Currency from '../currency/Currency';
import DatePicker from '../date-picker/DatePicker';
import DateTimePicker from '../date-time-picker/DateTimePicker';
import TimePicker from '../time-picker/TimePicker';
import WeekPicker from '../week-picker/WeekPicker';
import MonthPicker from '../month-picker/MonthPicker';
import YearPicker from '../year-picker/YearPicker';
import ObserverTextField from '../text-field/TextField';
import { ColumnLock, TablePaginationPosition } from './enum';
import { FormFieldProps } from '../field/FormField';
import IntlField from '../intl-field/IntlField';
import UrlField from '../url-field/UrlField';
import EmailField from '../email-field/EmailField';
import ColorPicker from '../color-picker/ColorPicker';
import Output from '../output/Output';
import Attachment from '../attachment/Attachment';
import SecretField from '../secret-field/SecretField';
import DataSet, { Group } from '../data-set/DataSet';
import TableStore, { CUSTOMIZED_KEY } from './TableStore';
import { TablePaginationConfig } from './Table';
import { $l } from '../locale-context';
import measureTextWidth from '../_util/measureTextWidth';
import ColumnGroup from './ColumnGroup';
import { FuncType } from '../button/enum';
import { AggregationTreeProps } from './AggregationTree';
import { TriggerFieldProps } from '../trigger-field/TriggerField';

export {
  isStickySupport,
};

export function getEditorByField(field: Field, record?: Record, isQueryField?: boolean, isFlat?: boolean): ReactElement<FormFieldProps | TriggerFieldProps> {
  const type = field.get('type', record);
  const { name } = field;
  const flatProps = isFlat ? { isFlat, maxTagCount: 3 } : {};

  if (
    field.get('lookupCode', record) ||
    isString(field.get('lookupUrl', record)) ||
    (type !== FieldType.object && (field.get('lovCode', record) || field.getLookup(record) || field.get('options', record)))
  ) {
    if (field.get('parentField', record)) {
      return <TreeSelect {...flatProps} />;
    }
    return <ObserverSelect {...flatProps} />;
  }
  if (field.get('lovCode', record)) {
    return <Lov {...flatProps} />;
  }
  if (field.get('multiLine', record)) {
    return <Output />;
  }
  if (type === FieldType.bigNumber) {
    if (field.get('currency', record)) {
      return <Currency isFlat={isFlat} />;
    }
    return <ObserverNumberField {...flatProps} />;
  }
  switch (type) {
    case FieldType.boolean:
      return isQueryField ? (
        <ObserverSelect clearButton {...flatProps}>
          <Option value={field.get('trueValue', record)}>{$l('Table', 'query_option_yes')}</Option>
          <Option value={field.get('falseValue', record)}>{$l('Table', 'query_option_no')}</Option>
        </ObserverSelect>
      ) : (
        <ObserverCheckBox />
      );
    case FieldType.number:
      return <ObserverNumberField {...flatProps} />;
    case FieldType.currency:
      return <Currency isFlat={isFlat} />;
    case FieldType.date:
      return <DatePicker isFlat={isFlat} />;
    case FieldType.dateTime:
      return <DateTimePicker isFlat={isFlat} />;
    case FieldType.time:
      return <TimePicker isFlat={isFlat} />;
    case FieldType.week:
      return <WeekPicker isFlat={isFlat} />;
    case FieldType.month:
      return <MonthPicker isFlat={isFlat} />;
    case FieldType.year:
      return <YearPicker isFlat={isFlat} />;
    case FieldType.intl:
      return <IntlField isFlat={isFlat} />;
    case FieldType.email:
      return <EmailField isFlat={isFlat} />;
    case FieldType.url:
      return <UrlField isFlat={isFlat} />;
    case FieldType.color:
      return <ColorPicker isFlat={isFlat} />;
    case FieldType.attachment:
      return <Attachment viewMode="popup" funcType={FuncType.link} />;
    case FieldType.secret:
      return <SecretField isFlat={isFlat} />;
    case FieldType.string:
      return <ObserverTextField isFlat={isFlat} />;
    default:
      warning(
        false,
        `Table auto editor: No editor exists on the field<${name}>'s type<${type}>, so use the TextField as default editor`,
      );
      return <ObserverTextField isFlat={isFlat} />;
  }
}

export function getPlaceholderByField(field?: Field, record?: Record): string | undefined {
  if (field) {
    const type = field.get('type', record);
    if (
      field.get('lookupCode', record) ||
      isString(field.get('lookupUrl', record)) ||
      (type !== FieldType.object && (field.get('lovCode', record) || field.getLookup(record) || field.get('options', record)))
    ) {
      return undefined;
    }
    switch (type) {
      case FieldType.number:
      case FieldType.bigNumber:
      case FieldType.currency:
      case FieldType.string:
      case FieldType.intl:
      case FieldType.email:
      case FieldType.url:
        return $l('Table', 'please_enter') as string;
      default:
    }
  }
}

export function getEditorByColumnAndRecord(
  column: ColumnProps,
  record?: Record,
): ReactElement<FormFieldProps> | undefined {
  const { name, editor } = column;
  if (record) {
    let cellEditor = editor;
    if (typeof editor === 'function') {
      cellEditor = editor(record, name);
    }
    if (cellEditor === true) {
      const field = record.dataSet.getField(name);
      if (field) {
        if (
          !field.get('unique', record) ||
          field.get('multiple', record) ||
          field.get('range', record) ||
          record.status === RecordStatus.add
        ) {
          return getEditorByField(field, record);
        }
      } else {
        return <ObserverTextField />;
      }
    }
    if (isValidElement(cellEditor)) {
      return cellEditor;
    }
  }
  if (isValidElement(editor)) {
    return editor;
  }
}

export function isInCellEditor(element?: ReactElement<FormFieldProps>): boolean {
  if (element) {
    return !!(element.type as any).__IS_IN_CELL_EDITOR;
  }
  return false;
}

export function findRow(tableStore: TableStore, record: Record): HTMLTableRowElement | null {
  const { node } = tableStore;
  const selector = `tr[data-index="${record.id}"]`;
  return node.element.querySelector(selector);
}

export function findCell(
  tableStore: TableStore,
  name?: Key,
  lock?: ColumnLock | boolean,
  record?: Record,
  extra?: boolean,
): HTMLSpanElement | HTMLTableDataCellElement | undefined {
  const { node, dataSet, overflowX, currentEditRecord, prefixCls } = tableStore;
  const current = record || currentEditRecord || dataSet.current;
  if (name !== undefined && current && node.element) {
    const wrapperSelector =
      !isStickySupport() && overflowX && lock
        ? `.${prefixCls}-fixed-${lock === true ? ColumnLock.left : lock} `
        : '';
    const selector = `${wrapperSelector}tr[data-index="${current.id}"] td[data-index="${name}"]`;
    const td = node.element.querySelector(selector);
    if (td) {
      const cell = td.querySelector(`span.${prefixCls}-cell-inner`);
      if (cell) {
        return cell;
      }
      if (!extra && tableStore.virtualCell && !td.childElementCount) {
        return td;
      }
    }
    return undefined;
  }
}

export function isCanEdictingRow(element): boolean {
  const sibling: HTMLTableRowElement | null = element;
  if (
    !sibling ||
    ('index' in sibling.dataset &&
      !sibling.getAttributeNodeNS('', 'disabled') &&
      (!document.defaultView || document.defaultView.getComputedStyle(sibling).display !== 'none'))
  ) {
    return true;
  }
  return false;
}

export function findIndexedSibling(element, direction): HTMLTableRowElement | null {
  const sibling: HTMLTableRowElement | null =
    direction > 0 ? element.nextElementSibling : element.previousElementSibling;
  if (isCanEdictingRow(element)) {
    return sibling;
  }
  return findIndexedSibling(sibling, direction);
}

export function isDisabledRow(record: Record) {
  return record.status === RecordStatus.delete || record.disabled;
}

export function isSelectedRow(record: Record) {
  return record.isSelected;
}

function getLabel(dataSet, name) {
  const field = dataSet.getField(name);
  if (field) {
    return field.get('label');
  }
}

export interface HeaderOptions extends ColumnProps {
  dataSet: DataSet;
  group?: Group | undefined;
  groups?: Group[] | undefined;
  aggregationTree?: ReactElement<AggregationTreeProps>[];
}

export function getHeader(column: HeaderOptions): ReactNode {
  const { header, name, title, dataSet, aggregation, group, groups, aggregationTree } = column;
  if (typeof header === 'function') {
    const $title = title === undefined ? getLabel(dataSet, name) : title;
    const options: HeaderHookOptions = {
      dataSet,
      name,
      title: $title,
      aggregation,
      group,
      groups,
      aggregationTree,
    };
    try {
      return header(options, name, $title, aggregation);
    } catch (e) {
      return header(dataSet, name, $title, aggregation);
    }
  }
  if (title !== undefined) {
    return title;
  }
  if (header !== undefined) {
    return header;
  }
  return getLabel(dataSet, name);
}

export function getColumnKey({ name, key }: ColumnProps): Key {
  return key || name!;
}

export function getColumnLock(lock?: ColumnLock | boolean): ColumnLock | false {
  if (lock === true) {
    return ColumnLock.left;
  }
  if (lock) {
    return lock;
  }

  return false;
}

export function getPaginationPosition(pagination?: TablePaginationConfig): TablePaginationPosition {
  if (pagination) {
    const { position } = pagination;
    if (position) {
      return position;
    }
  }
  return TablePaginationPosition.bottom;
}

export function getHeight(el: HTMLElement): number {
  return Math.round(el.getBoundingClientRect().height);
}

export function getTableHeaderRows(
  columns: ColumnGroup[],
  currentRow = 0,
  rows: ColumnGroup[][] = [],
): ColumnGroup[][] {
  rows[currentRow] = rows[currentRow] || [];
  columns.forEach(column => {
    const { hidden, rowSpan, colSpan, children } = column;
    if (!hidden) {
      if (rowSpan && rows.length < rowSpan) {
        while (rows.length < rowSpan) {
          rows.push([]);
        }
      }
      if (children) {
        getTableHeaderRows(children.columns, currentRow + rowSpan, rows);
      }
      if (colSpan !== 0) {
        rows[currentRow].push(column);
      }
    }
  });
  return rows;
}

export function isDropresult(dropResult: any): dropResult is DropResult {
  if (dropResult && dropResult.destination) {
    return (
      typeof (dropResult as DropResult).source.index === 'number' &&
      typeof (dropResult as DropResult).destination === 'object' &&
      typeof (dropResult as DropResult).destination!.index === 'number'
    );
  }
  return false;
}

export function isDraggingStyle(style?: DraggingStyle | NotDraggingStyle): style is DraggingStyle {
  return style ? 'left' in style : false;
}

export function getMaxClientWidth(element: Element): number {
  const { textContent, ownerDocument, clientWidth } = element;
  if (textContent && ownerDocument) {
    const { scrollWidth } = element;
    if (scrollWidth > clientWidth) {
      return scrollWidth;
    }
    const { defaultView } = ownerDocument;
    if (defaultView) {
      const computedStyle = defaultView.getComputedStyle(element);
      const { paddingLeft, paddingRight } = computedStyle;
      const pl = paddingLeft ? parseFloat(paddingLeft) : 0;
      const pr = paddingRight ? parseFloat(paddingRight) : 0;
      if (pl || pr) {
        const textWidth = measureTextWidth(textContent, computedStyle) + pl + pr;
        if (textWidth > clientWidth) {
          return textWidth;
        }
      }
    }
  }
  return clientWidth;
}

export function onlyCustomizedColumn(tableStore: TableStore): boolean {
  const { rightLeafs } = tableStore.columnGroups;
  return rightLeafs.length === 0 || rightLeafs[0].key === CUSTOMIZED_KEY;
}

export function getCellVerticalSize(element: HTMLElement, prefixCls?: string) {
  const { ownerDocument } = element;
  if (ownerDocument) {
    const { defaultView } = ownerDocument;
    if (defaultView) {
      const cell = element.querySelector(`.${prefixCls}-cell`);
      if (cell) {
        const style = defaultView.getComputedStyle(cell);
        return (toPx(style.paddingTop) || 0)
          + (toPx(style.paddingBottom) || 0)
          + (toPx(style.borderTopWidth) || 0)
          + (toPx(style.borderBottomWidth) || 0);
      }
    }
  }
}

export function getCachedRecords(dataSet: DataSet, type?: RecordCachedType, showCachedTips?: boolean): Record[] {
  if (showCachedTips) {
    switch (type) {
      case RecordCachedType.selected:
        return dataSet.cachedSelected;
      case RecordCachedType.add:
        return dataSet.cachedCreated;
      case RecordCachedType.update:
        return dataSet.cachedUpdated;
      case RecordCachedType.delete:
        return dataSet.cachedDestroyed;
      default:
        return [];
    }
  }
  return dataSet.cachedRecords;
}

function isRecordSelectable(record: Record, filter?: (record: Record) => boolean): boolean {
  return record.selectable && (!filter || filter(record));
}

export function getCachedSelectableRecords(dataSet: DataSet, type?: RecordCachedType, showCachedTips?: boolean, filter?: (record: Record) => boolean): Record[] {
  return getCachedRecords(dataSet, type, showCachedTips).filter(r => isRecordSelectable(r, filter));
}

export function getCurrentSelectableCounts(dataSet: DataSet, filter?: (record: Record) => boolean): [number, number] {
  return dataSet.records.reduce<[number, number]>(([selectedLength, recordLength], r) => {
    if (isRecordSelectable(r, filter)) {
      recordLength += 1;
      if (r.isSelected) {
        selectedLength += 1;
      }
    }
    return [selectedLength, recordLength];
  }, [0, 0]);
}

export function getCachedSelectableCounts(dataSet: DataSet, type?: RecordCachedType, showCachedTips?: boolean, filter?: (record: Record) => boolean): [number, number] {
  const cachedRecords = getCachedRecords(dataSet, type, showCachedTips);
  return cachedRecords.reduce<[number, number]>(([selectedLength, recordLength], r) => {
    if (isRecordSelectable(r, filter)) {
      recordLength += 1;
      if (r.isSelected) {
        selectedLength += 1;
      }
    }
    return [selectedLength, recordLength];
  }, [0, 0]);
}

export function getCount(dataSet: DataSet, type?: RecordCachedType): number {
  switch (type) {
    case RecordCachedType.selected:
      return dataSet.isAllPageSelection ? dataSet.totalCount - dataSet.unSelected.length : dataSet.selected.length;
    case RecordCachedType.add:
      return dataSet.created.length;
    case RecordCachedType.update:
      return dataSet.updated.length;
    case RecordCachedType.delete:
      return dataSet.destroyed.length;
    default:
      return 0;
  }
}
