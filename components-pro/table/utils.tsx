import React, { isValidElement, Key, ReactElement, ReactNode } from 'react';
import { DraggingStyle, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import ObserverCheckBox from '../check-box/CheckBox';
import { FieldType, RecordStatus } from '../data-set/enum';
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
import DataSet from '../data-set/DataSet';
import TableStore, { CUSTOMIZED_KEY } from './TableStore';
import { TablePaginationConfig } from './Table';
import { $l } from '../locale-context';
import measureTextWidth from '../_util/measureTextWidth';
import ColumnGroup from './ColumnGroup';
import { FuncType } from '../button/enum';

export function getEditorByField(field: Field, isQueryField?: boolean, isFlat?: boolean): ReactElement<FormFieldProps> {
  const lookupCode = field.get('lookupCode');
  const lookupUrl = field.get('lookupUrl');
  const lovCode = field.get('lovCode');
  const multiLine = field.get('multiLine');
  const { type, name } = field;
  const flatProps = isFlat ? { isFlat, maxTagCount: 4, maxTagTextLength: 4 } : {};

  if (
    lookupCode ||
    isString(lookupUrl) ||
    (type !== FieldType.object && (lovCode || field.lookup || field.get('options')))
  ) {
    if (field.get('parentField')) {
      return <TreeSelect {...flatProps} />;
    }
    return <ObserverSelect {...flatProps} />;
  }
  if (lovCode) {
    return <Lov {...flatProps} />;
  }
  if (multiLine) {
    return <Output />;
  }
  switch (type) {
  case FieldType.boolean:
    return isQueryField ? (
      <ObserverSelect clearButton {...flatProps}>
        <Option value>{$l('Table', 'query_option_yes')}</Option>
        <Option value={false}>{$l('Table', 'query_option_no')}</Option>
      </ObserverSelect>
    ) : <ObserverCheckBox />;
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

export function getPlaceholderByField(field?: Field): string | undefined {
  if (field) {
    const { type } = field;
    const lookupCode = field.get('lookupCode');
    const lookupUrl = field.get('lookupUrl');
    const lovCode = field.get('lovCode');
    if (
      lookupCode ||
      isString(lookupUrl) ||
      (type !== FieldType.object && (lovCode || field.lookup || field.get('options')))
    ) {
      return undefined;
    }
    switch (type) {
    case FieldType.number:
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
      const field = record.getField(name);
      if (field) {
        if (
          !field.get('unique') ||
          field.get('multiple') ||
          field.get('range') ||
          record.status === RecordStatus.add
        ) {
          return getEditorByField(field);
        }
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

let STICKY_SUPPORT;

export function isStickySupport(): boolean {
  if (STICKY_SUPPORT !== undefined) {
    return STICKY_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    const vendorList = ['', '-webkit-', '-ms-', '-moz-', '-o-'];
    const stickyElement = document.createElement('div');
    STICKY_SUPPORT = vendorList.some((vendor) => {
      stickyElement.style.position = `${vendor}sticky`;
      if (stickyElement.style.position !== '') {
        return true;
      }
      return false;
    });
    return STICKY_SUPPORT;
  }
  return true;
}

export function findCell(
  tableStore: TableStore,
  name?: Key,
  lock?: ColumnLock | boolean,
  record?: Record,
): HTMLSpanElement | undefined {
  const { node, dataSet, overflowX, currentEditRecord, prefixCls } = tableStore;
  const current = record || currentEditRecord || dataSet.current;
  if (name !== undefined && current && node.element) {
    const wrapperSelector =
      !isStickySupport() && overflowX && lock ? `.${prefixCls}-fixed-${lock === true ? ColumnLock.left : lock} ` : '';
    const selector = `${wrapperSelector}tr[data-index="${current.id}"] td[data-index="${name}"] span.${prefixCls}-cell-inner`;
    return node.element.querySelector(selector);
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
  if (
    isCanEdictingRow(element)
  ) {
    return sibling;
  }
  return findIndexedSibling(sibling, direction);
}

export function isDisabledRow(record: Record) {
  return record.isCached || record.status === RecordStatus.delete;
}

export function isSelectedRow(record: Record) {
  return record.isSelected;
}

export function getHeader(column: ColumnProps, dataSet: DataSet, aggregation?: boolean): ReactNode {
  const { header, name, title } = column;
  if (typeof header === 'function') {
    return header(dataSet, name, title, aggregation);
  }
  if (title !== undefined) {
    return title;
  }
  if (header !== undefined) {
    return header;
  }
  const field = dataSet.getField(name);
  if (field) {
    return field.get('label');
  }
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
  return el.getBoundingClientRect().height;
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
    return ((typeof (dropResult as DropResult).source.index === 'number')
      && (typeof (dropResult as DropResult).destination === 'object')
      && (typeof (dropResult as DropResult).destination!.index === 'number'));
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
