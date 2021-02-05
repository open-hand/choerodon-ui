import React, { isValidElement, Key, ReactElement, ReactNode } from 'react';
import isString from 'lodash/isString';
import warning from 'choerodon-ui/lib/_util/warning';
import { ColumnProps } from './Column';
import Record from '../data-set/Record';
import ObserverCheckBox from '../check-box/CheckBox';
import { FieldType, RecordStatus } from '../data-set/enum';
import Field from '../data-set/Field';
import ObserverSelect from '../select/Select';
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
import { ColumnAlign, ColumnLock, TablePaginationPosition } from './enum';
import { FormFieldProps } from '../field/FormField';
import IntlField from '../intl-field/IntlField';
import UrlField from '../url-field/UrlField';
import EmailField from '../email-field/EmailField';
import ColorPicker from '../color-picker/ColorPicker';
import Output from '../output/Output';
import DataSet from '../data-set/DataSet';
import TableStore from './TableStore';
import { TablePaginationConfig } from './Table';
import { $l } from '../locale-context';

export function getEditorByField(field: Field, isQueryField?: boolean, isFlat?: boolean): ReactElement<FormFieldProps> {
  const lookupCode = field.get('lookupCode');
  const lookupUrl = field.get('lookupUrl');
  const lovCode = field.get('lovCode');
  const multiLine = field.get('multiLine');
  const { type, name } = field;
  const flatProps = isFlat ? { isFlat, maxTagCount: 2, maxTagTextLength: 4 } : {};

  if (
    lookupCode ||
    isString(lookupUrl) ||
    (type !== FieldType.object && (lovCode || field.options))
  ) {
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
        <ObserverSelect clearButton>
          <Option value>{$l('Table', 'query_option_yes')}</Option>
          <Option value={false}>{$l('Table', 'query_option_no')}</Option>
        </ObserverSelect>
      ) : <ObserverCheckBox />;
    case FieldType.number:
      return <ObserverNumberField  {...flatProps} />;
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
    return !!(element.type as any).__IS_IN_CELL_EDITOR;
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
      if (child.tabIndex > -1 && child.getAttribute('type') !== 'checkbox' && child.getAttribute('type') !== 'radio') {
        found = child;
      } else {
        found = findFirstFocusableElement(child);
      }
      return !!found;
    });
    return found;
  }
}

// 用于校验定位 focus 第一个非法单元格
export function findFirstFocusableInvalidElement(node: HTMLElement): HTMLElement | undefined {
  if (node.children) {
    let found: HTMLElement | undefined;
    [...(node.children as HTMLCollectionOf<HTMLElement>)].some(child => {
      if (child.tabIndex > -1 && child.className.includes('invalid')) {
        found = child;
      } else {
        found = findFirstFocusableInvalidElement(child);
      }
      return !!found;
    });
    return found;
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

/**
 * 合并指定的对象参数
 * @param keys 需要合并的关键字
 * @param newObj 传入的新对象
 * @param oldObj 返回的旧对象
 */
export function mergeObject(keys: string[], newObj: object, oldObj: object) {
  let mergedObj = oldObj;
  if (keys.length > 0) {
    keys.forEach(key => {
      if (key in newObj) {
        oldObj[key] = newObj[key];
        mergedObj = { ...oldObj };
      }
    });
  }
  return mergedObj;
}

/**
 * 更具是否是react节点生成对象返回不同值
 * @param key 返回的属性
 * @param column 可能是reactnode 也可能是columprops 对象
 */
function getColumnChildrenValue(key: string, column: ColumnProps | ReactElement): string {
  if (React.isValidElement(column)) {
    return column.props[key];
  }
  return column[key];
}

/**
 * 如果找不到给js最大值9007199254740991
 */
export function changeIndexOf(array: string[], value: string): number {
  if (array.indexOf(value) === -1) {
    return 9007199254740991;
  }
  return array.indexOf(value);
}

/**
 * 实现首次进入就开始排序
 * @param newColumns 需要这样排序以及合并参数的列表
 * @param originalColumns 原始列表
 */
export function reorderingColumns(newColumns: ColumnProps[], originalColumns: ColumnProps[]) {
  if (newColumns && newColumns.length > 0 && originalColumns.length > 0) {
    // 暂时定性为对存在name的进行排序
    const nameColumns = originalColumns.filter(columnItem => getColumnChildrenValue('name', columnItem));
    const noNameColumns = originalColumns.filter(columnItem => !getColumnChildrenValue('name', columnItem));
    if (nameColumns && newColumns && nameColumns.length > 0 && newColumns.length > 0) {
      const newColumnsStr = newColumns.map(function (obj) {
        return getColumnChildrenValue('name', obj);
      }).join(',');
      const newColumnsNameArray = newColumnsStr.split(',');
      if (newColumnsNameArray.length > 0) {
        nameColumns.sort((prev, next) => {
          if (getColumnChildrenValue('name', prev) && getColumnChildrenValue('name', next)) {
            return changeIndexOf(newColumnsNameArray, getColumnChildrenValue('name', prev)) - changeIndexOf(newColumnsNameArray, getColumnChildrenValue('name', next));
          }
          return 1;
        });
        return [...nameColumns, ...noNameColumns];
      }
    }
  }
  return originalColumns;
}


