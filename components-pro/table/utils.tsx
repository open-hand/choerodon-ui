import React, { isValidElement, Key, ReactElement, ReactNode } from 'react';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import ObserverCheckBox from '../check-box/CheckBox';
import Switch from '../switch/Switch';
import ObserverRadio from '../radio/Radio';
import { FieldType, RecordStatus } from '../data-set/enum';
import Field from '../data-set/Field';
import ObserverSelect from '../select/Select';
import SelectBox from '../select-box/SelectBox';
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
import { ColumnAlign, ColumnLock, TablePaginationPosition } from './enum';
import { FormFieldProps } from '../field/FormField';
import IntlField from '../intl-field/IntlField';
import UrlField from '../url-field/UrlField';
import EmailField from '../email-field/EmailField';
import ColorPicker from '../color-picker/ColorPicker';
import DataSet from '../data-set/DataSet';
import TableStore from './TableStore';
import { TablePaginationConfig } from './Table';

export function getEditorByField(field: Field): ReactElement<FormFieldProps> {
  const lookupCode = field.get('lookupCode');
  const lookupUrl = field.get('lookupUrl');
  const lovCode = field.get('lovCode');
  const { type, name } = field;
  if (
    lookupCode ||
    isString(lookupUrl) ||
    (type !== FieldType.object && (lovCode || field.options))
  ) {
    return <ObserverSelect />;
  }
  if (lovCode) {
    return <Lov />;
  }
  switch (type) {
    case FieldType.boolean:
      return <ObserverCheckBox />;
    case FieldType.number:
      return <ObserverNumberField />;
    case FieldType.currency:
      return <Currency />;
    case FieldType.date:
      return <DatePicker />;
    case FieldType.dateTime:
      return <DateTimePicker />;
    case FieldType.time:
      return <TimePicker />;
    case FieldType.week:
      return <WeekPicker />;
    case FieldType.month:
      return <MonthPicker />;
    case FieldType.year:
      return <YearPicker />;
    case FieldType.intl:
      return <IntlField />;
    case FieldType.email:
      return <EmailField />;
    case FieldType.url:
      return <UrlField />;
    case FieldType.color:
      return <ColorPicker />;
    case FieldType.string:
      return <ObserverTextField />;
    default:
      warning(
        false,
        `Table auto editor: No editor exists on the field<${name}>'s type<${type}>, so use the TextField as default editor`,
      );
      return <ObserverTextField />;
  }
}

export function getAlignByField(field?: Field): ColumnAlign | undefined {
  if (field) {
    const { type } = field;
    switch (type) {
      case FieldType.number:
        return ColumnAlign.right;
      case FieldType.boolean:
        return ColumnAlign.center;
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
}

export function isRadio(element?: ReactElement<FormFieldProps>): boolean {
  if (element) {
    switch (element.type as any) {
      case ObserverCheckBox:
      case ObserverRadio:
      case Switch:
      case SelectBox:
        return true;
      default:
    }
  }
  return false;
}

export function findCell(
  tableStore: TableStore,
  prefixCls?: string,
  name?: Key,
  lock?: ColumnLock | boolean,
): HTMLTableCellElement | undefined {
  const { node, dataSet, overflowX, currentEditRecord } = tableStore;
  const current = currentEditRecord || dataSet.current;
  const tableCellPrefixCls = `${prefixCls}-cell`;
  if (name !== undefined && current && node.element) {
    const wrapperSelector =
      overflowX && lock ? `.${prefixCls}-fixed-${lock === true ? ColumnLock.left : lock} ` : '';
    const selector = `${wrapperSelector}tr[data-index="${current.id}"] td[data-index="${name}"] span.${tableCellPrefixCls}-inner`;
    return node.element.querySelector(selector);
  }
}

export function findFirstFocusableElement(node: HTMLElement): HTMLElement | undefined {
  if (node.children) {
    let found: HTMLElement | undefined;
    [...(node.children as HTMLCollectionOf<HTMLElement>)].some(child => {
      if (child.tabIndex > -1) {
        found = child;
      } else {
        found = findFirstFocusableElement(child);
      }
      return !!found;
    });
    return found;
  }
}

export function findIndexedSibling(element, direction): HTMLTableRowElement | null {
  const sibling: HTMLTableRowElement | null =
    direction > 0 ? element.nextElementSibling : element.previousElementSibling;
  if (
    !sibling ||
    ('index' in sibling.dataset &&
      !sibling.getAttributeNodeNS('', 'disabled') &&
      (!document.defaultView || document.defaultView.getComputedStyle(sibling).display !== 'none'))
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

export function getHeader(column: ColumnProps, dataSet: DataSet): ReactNode {
  const { header, name } = column;
  if (typeof header === 'function') {
    return header(dataSet, name);
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

export function getPaginationPosition(pagination?: TablePaginationConfig): TablePaginationPosition {
  if (pagination) {
    const { position } = pagination;
    if (position) {
      return position;
    }
  }
  return TablePaginationPosition.bottom;
}

export function getHeight(el: HTMLElement) {
  return el.getBoundingClientRect().height;
}
