import queryString from 'querystringify';
import moment, { isDate, isMoment } from 'moment';
import { isArrayLike, ObservableMap } from 'mobx';
import { AxiosRequestConfig } from 'axios';
import isPromise from 'is-promise';
import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import _isEmpty from 'lodash/isEmpty';
import { isEmpty, parseBigNumber, parseNumber, warning } from '../utils';
import Field, { FieldProps, Fields } from './Field';
import { BooleanValue, DataToJSON, FieldType, RecordStatus, SortOrder } from './enum';
import DataSet, { DataSetProps } from './DataSet';
import Record, { RecordDynamicProps } from './Record';
import Group from './Group';
import * as ObjectChainValue from '../object-chain-value';
import localeContext, { $l } from '../locale-context';
import { SubmitTypes, TransportType, TransportTypes } from './Transport';
import { formatString } from '../formatter';
import { treeReduce } from '../tree-helper';
import { iteratorFilterToArray, iteratorFind, iteratorSliceToArray, iteratorSome } from '../iterator-helper';
import math from '../math';
import { colorHexReg, colorRgbaReg } from '../validator/rules/typeMismatch';

export {
  /**
   * 请直接引用 constant 文件下常量
   */
  defaultTextField,
  /**
   * 请直接引用 constant 文件下常量
   */
  defaultValueField,
} from './constant';

export function useNormal(dataToJSON: DataToJSON): boolean {
  return [DataToJSON.normal, DataToJSON['normal-self']].includes(dataToJSON);
}

export function useAll(dataToJSON: DataToJSON): boolean {
  return [DataToJSON.all, DataToJSON['all-self']].includes(dataToJSON);
}

export function useSelected(dataToJSON: DataToJSON): boolean {
  return [DataToJSON.selected, DataToJSON['selected-self']].includes(dataToJSON);
}

export function useCascade(dataToJSON: DataToJSON): boolean {
  return [DataToJSON.dirty, DataToJSON['dirty-field'], DataToJSON.selected, DataToJSON.all, DataToJSON.normal].includes(
    dataToJSON,
  );
}

export function useDirty(dataToJSON: DataToJSON): boolean {
  return [DataToJSON.dirty, DataToJSON['dirty-self']].includes(dataToJSON);
}

export function useDirtyField(dataToJSON: DataToJSON): boolean {
  return [DataToJSON['dirty-field'], DataToJSON['dirty-field-self']].includes(dataToJSON);
}

export function append(url: string, suffix?: object) {
  if (suffix) {
    return url + queryString.stringify(suffix, url.indexOf('?') === -1);
  }
  return url;
}

export function getOrderFields(dataSet: DataSet): Field[] {
  const { fields, combineSort, combineSortFieldNames } = dataSet;
  if (combineSort) {
    let sortFields: Map<string, Field> = new Map();
    if (combineSortFieldNames && combineSortFieldNames.size > 0) {
      combineSortFieldNames.forEach((_, fieldName) => {
        const field = dataSet.getField(fieldName);
        if (field && field.order) {
          sortFields.set(fieldName, field);
        }
      });
    } else {
      sortFields = fields;
    }
    return iteratorFilterToArray(sortFields.values(), (field) => field.order);
  }
  const found = iteratorFind(fields.values(), (field) => field.order);
  if (found) {
    return [found];
  }
  return [];
}

function processOneToJSON(value, field: Field, record?: Record, checkRange = true) {
  if (!isEmpty(value)) {
    const range = field.get('range', record);
    if (range && checkRange) {
      if (isArrayLike(range)) {
        if (isObject(value)) {
          const [start, end] = range;
          value = {
            [start]: processOneToJSON(value[start], field, record, false),
            [end]: processOneToJSON(value[end], field, record, false),
          };
        }
      } else if (isArrayLike(value)) {
        value = [
          processOneToJSON(value[0], field, record, false),
          processOneToJSON(value[1], field, record, false),
        ];
      }
    } else if (isArrayLike(value)) {
      // Cascacer 值集
      value = value.map(v => processOneToJSON(v, field, record, false));
    } else {
      if (isDate(value)) {
        value = moment(value);
      }
      if (isMoment(value)) {
        const { jsonDate } = field.dataSet.getConfig('formatter');
        value = jsonDate ? value.format(jsonDate) : +value;
      }
      if (field.get('type', record) === FieldType.json) {
        value = JSON.stringify(value);
      }
    }
  }
  return value;
}

export function processToJSON(value, field: Field, record?: Record) {
  if (!isEmpty(value)) {
    const multiple = field.get('multiple', record);
    const range = field.get('range', record);
    if (isArrayLike(value) && (multiple || !range)) {
      value = value.map(v => processOneToJSON(v, field, record));
      if (isString(multiple) && field.get('type', record) !== FieldType.object) {
        return value.join(multiple);
      }
      return value;
    }
    return processOneToJSON(value, field, record);
  }
  return value;
}

export function arrayMove<T = Record>(array: T[], from: number, to: number): void {
  const startIndex = to < 0 ? array.length + to : to;
  const item = array.splice(from, 1)[0];
  array.splice(startIndex, 0, item);
}

function processOne(value: any, field: Field, record?: Record, checkRange = true) {
  if (!isEmpty(value)) {
    const range = field.get('range', record);
    if (range && checkRange) {
      if (isArrayLike(range)) {
        if (isObject(value)) {
          const [start, end] = range;
          value[start] = processOne(value[start], field, record, false);
          value[end] = processOne(value[end], field, record, false);
        }
      } else if (isArrayLike(value)) {
        value[0] = processOne(value[0], field, record, false);
        value[1] = processOne(value[1], field, record, false);
      }
    } else if (value instanceof Date) {
      value = moment(value);
    } else if (!isObject(value)) {
      value = formatString(value, {
        trim: field.get('trim', record),
        format: field.get('format', record),
      });
      switch (field.get('type', record)) {
        case FieldType.boolean: {
          const trueValue = field.get(BooleanValue.trueValue, record);
          const falseValue = field.get(BooleanValue.falseValue, record);
          if (!equalTrueValue(trueValue, value)) {
            value = getFirstValue(falseValue);
          }
          break;
        }
        case FieldType.number:
        case FieldType.currency:
          if (!isNaN(value)) {
            value = parseNumber(value, field.get('precision', record), undefined, field.get('numberRoundMode', record));
          } else {
            value = undefined;
          }
          break;
        case FieldType.bigNumber:
          value = parseBigNumber(value, field.get('precision', record), field.get('numberRoundMode', record));
          break;
        case FieldType.string:
        case FieldType.intl:
        case FieldType.email:
        case FieldType.url:
          value = String(value);
          break;
        case FieldType.date:
        case FieldType.dateTime:
        case FieldType.time:
        case FieldType.week:
        case FieldType.month:
        case FieldType.quarter:
        case FieldType.year: {
          const { jsonDate } = field.dataSet.getConfig('formatter');
          value = jsonDate ? moment(value, jsonDate) : moment(value);
          break;
        }
        case FieldType.json:
          value = JSON.parse(value);
          break;
        default:
      }
    }
  }
  return value;
}

export function processValue(value: any, field?: Field, record?: Record, isCreated?: boolean): any {
  if (field) {
    const multiple = field.get('multiple', record);
    const range = field.get('range', record);
    if (multiple && ![FieldType.attachment, FieldType.color].includes(field.get('type', record))) {
      if (isEmpty(value)) {
        if (isCreated) {
          // for defaultValue
          value = undefined;
        } else {
          value = [];
        }
      } else if (!isArray(value)) {
        if (isString(multiple) && isString(value)) {
          value = value.split(multiple);
        } else {
          value = [value];
        }
      }
    }
    if (isArray(value) && (multiple || !range)) {
      return value.map(item => processOne(item, field, record));
    }
    return processOne(value, field, record);
  }
  return value;
}

// 处理单个range
const processRangeToText = (resultValue: any[], field: Field, record?: Record | undefined): string => {
  return resultValue.map((item) => {
    const valueRange = isMoment(item)
      ? item.format()
      : isObject(item)
        ? item[field.get('textField', record)]
        : item.toString();
    return valueRange;
  }).join(`~`);
};

export function processExportValue(value: any, field?: Field, record?: Record | undefined): any {
  if (field) {
    const multiple = field.get('multiple', record);
    const range = field.get('range', record);
    const textField = field.get('textField', record);
    if (multiple) {
      if (isEmpty(value)) {
        value = [];
      } else if (!isArray(value)) {
        if (isString(multiple) && isString(value)) {
          value = value.split(multiple);
        } else {
          value = [value];
        }
      }
    }
    if (isArray(value) && (multiple || !range)) {
      if (!_isEmpty(field.getLookup(record))) {
        return value.map(item => field.getText(processOne(item, field, record), undefined, record)).join(',');
      }
      return value.map(item => {
        const itemValue = processOne(item, field, record);
        if (textField && itemValue && isObject(itemValue)) {
          return itemValue[textField];
        }
        return itemValue;
      }).join(',');
    }
    if (isArray(value) && multiple && range) {
      if (!_isEmpty(field.getLookup(record))) {
        return value.map(item => field.getText(processRangeToText(processOne(item, field, record), field, record))).join(',');
      }
      return value.map(item => {
        return processRangeToText(processOne(item, field, record), field, record);
      }).join(',');
    }
    if (!_isEmpty(field.getLookup(record))) {
      return field.getText(processOne(value, field, record), undefined, record);
    }
    const resultValue = processOne(value, field, record);
    if (isMoment(resultValue)) {
      return resultValue.format();
    }
    if (textField && resultValue && isObject(resultValue)) {
      if (range && isArrayLike(resultValue)) {
        return processRangeToText(resultValue, field, record);
      }
      return resultValue[textField];
    }
    return resultValue;
  }
  return value;
}

/**
 * 实现如果名字是带有属性含义`.`找到能够导出的值
 * @param dataItem 一行数据
 * @param name 对应的fieldname
 * @param isBind 是否是从绑定获取值
 */
export function getSplitValue(dataItem: any, name: string, isBind = true): any {
  const nameArray = name.split('.');
  if (nameArray.length > 1) {
    let levelValue = dataItem;
    for (let i = 0; i < nameArray.length; i++) {
      if (!isObject(levelValue)) {
        break;
      }
      if (isBind || i !== 0) {
        levelValue = levelValue[nameArray[i]];
      }
    }
    return levelValue;
  }
  if (isBind) {
    return dataItem ? dataItem[name] : undefined;
  }
  return dataItem;
}

export function childrenInfoForDelete(json: {}, children: { [key: string]: DataSet }): {} {
  return Object.keys(children).reduce((data, name) => {
    const child = children[name];
    if (child) {
      data[name] = [childrenInfoForDelete({}, child.children)];
    }
    return data;
  }, json);
}

function dataSorter<T>(fields: Field[], getter: (item: T, key: string) => any): (a: T, b: T) => number {
  const m = Number.MIN_SAFE_INTEGER;
  return (record1, record2) => {
    let result = 0;
    fields.some(field => {
      const { name, order } = field;
      const a = getter(record1, name) || m;
      const b = getter(record2, name) || m;
      if (isString(a) || isString(b)) {
        result = order === SortOrder.asc
          ? String(a).localeCompare(String(b))
          : String(b).localeCompare(String(a));
      } else {
        result = order === SortOrder.asc ? a - b : b - a;
      }
      return result !== 0;
    });
    return result;
  };
}

export function sortData(data: object[], dataSet: DataSet): object[] {
  if (data.length > 1 && !dataSet.paging) {
    const orderFields = getOrderFields(dataSet);
    if (orderFields.length > 0) {
      data.sort(dataSorter<object>(orderFields, (item, key) => item[key]));
      const { childrenField } = dataSet.props;
      if (childrenField) {
        data.forEach(item => {
          const childData = item[childrenField];
          if (childData) {
            sortData(childData, dataSet);
          }
        });
      }
    }
  }
  return data;
}

export function appendRecords(dataSet: DataSet, appendData: Record[], parent?: Record, dataIndex?: number) {
  if (appendData.length) {
    const { originalData, records, props: { childrenField, parentField, idField } } = dataSet;
    let appended = false;
    if (childrenField) {
      if (parent) {
        appendData.forEach((record, index) => {
          const { key } = record;
          const { children } = parent;
          if (children) {
            if (!children.find(child => child.key === key)) {
              if (isNumber(dataIndex)) {
                children.splice(dataIndex + index, 0, record);
              } else {
                children.push(record);
              }
            }
          } else {
            parent.children = [record];
          }
          if (!records.find(r => r.key === key)) {
            if (isNumber(dataIndex)) {
              originalData.splice(parent.index + 1 + dataIndex + index, 0, record);
              records.splice(parent.index + 1 + dataIndex + index, 0, record);
            } else {
              originalData.push(record);
              records.push(record);
            }
          }
        });
        appended = true;
      }
    } else if (parentField && idField) {
      appendData.forEach((record, index) => {
        const parentId = record.get(parentField);
        const { key } = record;
        let found;
        let foundParent;
        records.some(r => {
          if (r.get(idField) === parentId) {
            record.parent = r;
            const { children } = r;
            if (children) {
              if (!children.find(child => child.key === key)) {
                if (isNumber(dataIndex)) {
                  children.splice(dataIndex + index, 0, record);
                } else {
                  children.push(record);
                }
              }
            } else {
              r.children = [record];
            }
            foundParent = r;
          }
          if (r.key === key) {
            found = r;
          }
          return found && foundParent;
        });
        if (!found) {
          if (isNumber(dataIndex) && foundParent) {
            originalData.splice(foundParent.index + 1 + dataIndex + index, 0, record);
            records.splice(foundParent.index + 1 + dataIndex + index, 0, record);
          } else if (isNumber(dataIndex)) {
            originalData.splice(dataIndex + index, 0, record);
            records.splice(dataIndex + index, 0, record);
          } else {
            originalData.push(record);
            records.push(record);
          }
        }
      });
      appended = true;
    }
    if (!appended) {
      appendData.forEach((record, index) => {
        const { key } = record;
        if (!records.find(r => r.key === key)) {
          if (isNumber(dataIndex)) {
            originalData.splice(dataIndex + index, 0, record);
            records.splice(dataIndex + index, 0, record);
          } else {
            originalData.push(record);
            records.push(record);
          }
        }
      });
    }
  }
}

export function sortTree(records: Record[], orderFields: Field[], deep?: boolean): Record[] {
  if (records.length > 1 && orderFields.length > 0) {
    if (deep) {
      records.forEach(child => {
        const { children } = child;
        if (children) {
          child.children = sortTree(children, orderFields, true);
        }
      });
    }
    return records.sort(dataSorter<Record>(orderFields, (item, key) => item.get(key)));
  }
  return records;
}

interface Node {
  item: object;
  children: Node[];
}

// 获取单个页面能够展示的数据
export function sliceTree(idField: string, parentField: string, allData: object[], pageSize: number): object[] {
  if (allData.length) {
    const rootMap: Map<string, Node> = new Map<string, Node>();
    const itemMap: Map<string, Node> = new Map<string, Node>();
    allData.forEach((item) => {
      const id = item[idField];
      if (!isNil(id)) {
        const node: Node = {
          item,
          children: [],
        };
        itemMap.set(id, node);
        rootMap.set(id, node);
      }
    });
    itemMap.forEach((node, key) => {
      const parent = itemMap.get(node.item[parentField]);
      if (parent) {
        parent.children.push(node);
        rootMap.delete(key);
      }
    });
    return treeReduce<object[], Node>(iteratorSliceToArray(rootMap.values(), 0, pageSize), (previousValue, node) => previousValue.concat(node.item), []);
  }
  return [];
}

export function checkParentByInsert({ parent }: DataSet) {
  if (parent && !parent.current) {
    throw new Error($l('DataSet', 'cannot_add_record_when_head_no_current'));
  }
}

function getValueType(value: any): FieldType {
  if (isBoolean(value)) {
    return FieldType.boolean;
  }
  if (isNumber(value)) {
    return FieldType.number;
  }
  if (colorRgbaReg.test(value) || colorHexReg.test(value)) {
    return FieldType.color;
  }
  if (isString(value)) {
    return FieldType.string;
  }
  if (isMoment(value)) {
    return FieldType.date;
  }
  if (math.isBigNumber(value)) {
    return FieldType.bigNumber;
  }
  if (isObject(value)) {
    return FieldType.object;
  }
  return FieldType.auto;
}

export function getBaseType(type: FieldType): FieldType {
  switch (type) {
    case FieldType.number:
    case FieldType.currency:
      return FieldType.number;
    case FieldType.dateTime:
    case FieldType.time:
    case FieldType.week:
    case FieldType.month:
    case FieldType.quarter:
    case FieldType.year:
      return FieldType.date;
    case FieldType.intl:
    case FieldType.url:
    case FieldType.email:
      return FieldType.string;
    default:
      return type;
  }
}

export function checkFieldType(value: any, field: Field, record?: Record): boolean {
  if (process.env.NODE_ENV !== 'production' && !isEmpty(value)) {
    const fieldType = getBaseType(field.get('type', record));
    if (fieldType !== FieldType.auto) {
      if (isArrayLike(value)) {
        return value.every(item => checkFieldType(item, field, record));
      }
      const trueValue = field.get(BooleanValue.trueValue, record);
      const falseValue = field.get(BooleanValue.falseValue, record);
      const valueType =
        field.get('type', record) === FieldType.boolean &&
        [...(isArrayLike(trueValue) ? trueValue : [trueValue]), ...(isArrayLike(falseValue) ? falseValue: [falseValue])].includes(value)
          ? FieldType.boolean
          : getValueType(value);
      if (
        fieldType !== FieldType.reactNode && (
          fieldType === FieldType.number ? ![FieldType.number, FieldType.bigNumber].includes(valueType)
            : fieldType !== valueType
        )
      ) {
        warning(
          false,
          `Value type error: The value<${value}>'s type is ${valueType}, but the field<${field.name}>'s type is ${fieldType}.`,
        );
        return false;
      }
    }
  }
  return true;
}

let iframe;

/**
 * 目前定义为服务端请求的方法
 * @param url 导出地址
 * @param data 导出传递参数
 * @param method 默认post请求
 */
export function doExport(url, data, method = 'post') {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = '_export_window';
    iframe.name = '_export_window';
    iframe.style.cssText =
      'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;display:none';
    document.body.appendChild(iframe);
  }

  const form = document.createElement('form');
  form.target = '_export_window';
  form.method = method;
  form.action = url;
  const s = document.createElement('input');
  s.id = '_request_data';
  s.type = 'hidden';
  s.name = '_request_data';
  s.value = JSON.stringify(data);
  form.appendChild(s);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function throwCycleBindingFields(map: Map<string, Field> = new Map()) {
  const keys = Array.from(map.keys());
  throw new Error(`DataSet: Cycle binding fields[${[...keys].join(' -> ')} -> ${keys[0]}].`);
}

function getChainFieldNamePrivate(record: Record, fieldName: string, linkedMap: Map<string, Field> = new Map(), init = true): string {
  const field = record.dataSet.getField(fieldName);
  if (field) {
    const bind = field.get('bind', record);
    if (bind) {
      if (linkedMap.has(fieldName)) {
        throwCycleBindingFields(linkedMap);
      }
      linkedMap.set(fieldName, field);
      const names = bind.split('.');
      if (names.length > 0) {
        if (names.length === 1) {
          return getChainFieldNamePrivate(record, bind, linkedMap);
        }
        return names.reduce((chainFieldName, name) => [getChainFieldNamePrivate(record, chainFieldName, linkedMap, false), name].join('.'));
      }
    }
  } else if (init && fieldName.indexOf('.') > -1) {
    return fieldName.split('.').reduce((chainFieldName, name) => [getChainFieldNamePrivate(record, chainFieldName, linkedMap, false), name].join('.'));
  }

  return fieldName;
}

export function getChainFieldName(record: Record, fieldName: string): string {
  return getChainFieldNamePrivate(record, fieldName);
}

export function findBindTargetFields(myField: Field, fields: Fields, deep?: boolean, record?: Record, bindFields: Map<string, Field> = new Map()): Field[] {
  const bind = myField.get('bind', record);
  if (bind) {
    iteratorSome(fields.entries(), ([fieldName, field]) => {
      if (field !== myField) {
        if ((bind === fieldName || bind.startsWith(`${fieldName}.`))) {
          if (bindFields.has(fieldName)) {
            throwCycleBindingFields(bindFields);
          }
          bindFields.set(fieldName, field);
          if (deep) {
            findBindTargetFields(field, fields, deep, record, bindFields);
          }
          return true;
        }
      }
      return false;
    });
  }
  return Array.from(bindFields.values());
}

export function findBindFields(myField: Field, fields: Fields, deep?: boolean, record?: Record | undefined, bindFields: Map<string, Field> = new Map()): Field[] {
  const { name } = myField;
  fields.forEach((field, fieldName) => {
    if (field !== myField) {
      const bind = field.get('bind', record);
      if (bind && (bind === name || bind.startsWith(`${name}.`))) {
        if (bindFields.has(fieldName)) {
          throwCycleBindingFields(bindFields);
        }
        bindFields.set(fieldName, field);
        if (deep) {
          findBindFields(field, fields, deep, record, bindFields);
        }
      }
    }
  });
  return Array.from(bindFields.values());
}

export function findBindField(
  myField: string,
  chainFieldName: string,
  record: Record,
): Field | undefined {
  return iteratorFind(record.dataSet.fields.values(), (field) => {
    const fieldName = field.name;
    if (fieldName !== myField) {
      const bind = field.get('bind', record);
      if (bind) {
        return chainFieldName === getChainFieldName(record, fieldName);
      }
    }
    return false;
  });
}

export function findMinOrMaxFields(myField: Field, fields: Fields, record: Record): Field[] {
  const fieldName = myField.name;
  const minOrMaxFields: Field[] = [];
  fields.forEach((field) => {
    const { name } = field;
    if (fieldName !== name && !isNil(record.get(name)) && (field.get('min', record) === fieldName || field.get('max', record) === fieldName || field.get('minExcl', record) === fieldName || field.get('maxExcl', record) === fieldName)) {
      minOrMaxFields.push(field);
    }
  });
  return minOrMaxFields;
}

export function generateRecordJSONData(array: object[], record: Record, dataToJSON: DataToJSON) {
  const normal = useNormal(dataToJSON);
  const json = normal
    ? !record.isRemoved && record.toData()
    : record.toJSONData();
  if (json && (normal || useAll(dataToJSON) || (!useDirty(dataToJSON) && !useDirtyField(dataToJSON)) || json.__dirty)) {
    delete json.__dirty;
    array.push(json);
  }
}

export function prepareSubmitData(
  records: Record[],
  dataToJSON: DataToJSON,
): [object[], object[], object[]] {
  const created: object[] = [];
  const updated: object[] = [];
  const destroyed: object[] = [];

  function storeWith(status) {
    switch (status) {
      case RecordStatus.add:
        return created;
      case RecordStatus.delete:
        return destroyed;
      default:
        return updated;
    }
  }

  records.forEach(record => generateRecordJSONData(storeWith(record.status), record, dataToJSON));
  return [created, updated, destroyed];
}

function defaultAxiosConfigAdapter(config: AxiosRequestConfig): AxiosRequestConfig {
  return config;
}

function generateConfig(
  config: TransportType,
  dataSet: DataSet,
  data?: any,
  params?: any,
  options?: object,
): AxiosRequestConfig {
  if (isString(config)) {
    return {
      url: config,
    };
  }
  if (typeof config === 'function') {
    return config({ ...options, data, dataSet, params });
  }
  return config;
}

export function axiosConfigAdapter(
  type: TransportTypes,
  dataSet: DataSet,
  data?: any,
  params?: any,
  options?: object,
): AxiosRequestConfig {
  const newConfig: AxiosRequestConfig = {
    data,
    params,
    method: 'post',
  };

  const { [type]: globalConfig, adapter: globalAdapter = defaultAxiosConfigAdapter } =
  dataSet.getConfig('transport') || {};
  const { [type]: config, adapter } = dataSet.transport;
  if (globalConfig) {
    Object.assign(newConfig, generateConfig(globalConfig, dataSet, data, params, options));
  }
  if (config) {
    Object.assign(newConfig, generateConfig(config, dataSet, data, params, options));
  }
  if (newConfig.data && newConfig.method && newConfig.method.toLowerCase() === 'get') {
    newConfig.params = {
      ...newConfig.params,
      ...newConfig.data,
    };
  }
  return (adapter || globalAdapter)(newConfig, type) || newConfig;
}

// 查询顶层父亲节点
export function findRootParent(children: Record) {
  if (children.parent) {
    return findRootParent(children.parent);
  }
  return children;
}

export function prepareForSubmit(
  type: SubmitTypes,
  data: object[],
  configs: AxiosRequestConfig[],
  dataSet: DataSet,
): object[] {
  if (data.length) {
    const newConfig = axiosConfigAdapter(type, dataSet, data);
    if (newConfig.url) {
      configs.push(newConfig);
    } else {
      return data;
    }
  }
  return [];
}

export function generateResponseData(item: any, dataKey?: string): object[] {
  if (item) {
    if (isArray(item)) {
      return item;
    }
    if (isObject(item)) {
      if (dataKey) {
        const result = ObjectChainValue.get(item, dataKey);
        if (result === undefined) {
          return [item];
        }
        if (isArray(result)) {
          return result;
        }
        if (isObject(result)) {
          return [result];
        }
      } else {
        return [item];
      }
    }
  }
  return [];
}

export function getRecordValue(
  record: Record,
  cb: (record: Record, fieldName: string) => boolean,
  fieldName?: string | string[],
) {
  if (fieldName) {
    if (isArrayLike(fieldName)) {
      return fieldName.reduce<object>((value, key) => {
        value[key] = getRecordValue(record, cb, key);
        return value;
      }, {});
    }
    const { dataSet } = record;
    const chainFieldName = getChainFieldName(record, fieldName);
    const { checkField, treeCheckStrictly } = dataSet.props;
    if (treeCheckStrictly !== true && checkField && chainFieldName === getChainFieldName(record, checkField)) {
      const field = dataSet.getField(checkField);
      const trueValue = field ? field.get(BooleanValue.trueValue, record) : true;
      const falseValue = field ? field.get(BooleanValue.falseValue, record) : false;
      const { children } = record;
      if (children) {
        return children.every(child => equalTrueValue(trueValue, cb(child, checkField)))
          ? getFirstValue(trueValue)
          : getFirstValue(falseValue);
      }
    }
    return ObjectChainValue.get(record.data, chainFieldName as string);
  }
}

export function processIntlField(
  name: string,
  callback: (props: FieldProps) => Field,
  fieldProps: FieldProps | undefined,
  dataSet: DataSet,
): [Field, Map<string, Field> | undefined] {
  const field = callback({ ...fieldProps, name });
  if (fieldProps && fieldProps.type === FieldType.intl) {
    const { transformRequest, trim } = fieldProps;
    const tlsKey = dataSet.getConfig('tlsKey');
    const { supports } = localeContext;
    const languages = Object.keys(supports);
    const intlFields = new Map<string, Field>();
    languages.forEach(language =>
      intlFields.set(`${tlsKey}.${name}.${language}`, callback({
        name: `${tlsKey}.${name}.${language}`,
        type: FieldType.string,
        label: `${supports[language]}`,
        transformRequest,
        trim,
        dynamicProps: {
          bind: ({ record }) => {
            if (record) {
              const tls = record.get(tlsKey) || {};
              if (name in tls && dataSet.lang === language) {
                return name;
              }
            }
          },
        },
      })),
    );
    return [field, intlFields];
  }
  return [field, undefined];
}

export function findBindFieldBy(myField: Field, fields: Fields, prop: string, record?: Record): Field | undefined {
  const value = myField.get(prop, record);
  const myName = myField.name;
  return iteratorFind(fields.values(), field => {
    const bind = field.get('bind', record);
    return bind && bind === `${myName}.${value}`;
  });
}

export function getLimit(limit: any, record: Record, minOrMax: any, type: FieldType) {
  if (isString(limit) && record.dataSet.getField(limit)) {
    return record.get(limit);
  }
  if (limit === undefined) {
    const configLimit = record.dataSet.getConfig(minOrMax);
    if (configLimit && typeof configLimit === 'function') {
      return configLimit(type);
    }
  }
  return limit;
}

export function adapterDataToJSON(
  isSelected?: boolean,
  noCascade?: boolean,
): DataToJSON | undefined {
  if (isSelected) {
    if (noCascade) {
      return DataToJSON['selected-self'];
    }
    return DataToJSON.selected;
  }
  if (noCascade) {
    return DataToJSON['dirty-self'];
  }
  return undefined;
}

export function generateData(records: Record[]): { dirty: boolean; data: object[] } {
  let dirty = false;
  const data: object[] = records.reduce<object[]>((list, record) => {
    if (record.isRemoved) {
      dirty = true;
    } else {
      const d = record.toData();
      if (d.__dirty) {
        dirty = true;
      }
      delete d.__dirty;
      list.push(d);
    }
    return list;
  }, []);
  return {
    dirty,
    data,
  };
}

export function generateJSONData(
  ds: DataSet,
  records: Record[],
): { dirty: boolean; data: object[] } {
  const { dataToJSON } = ds;
  const data: object[] = [];
  records.forEach(record => generateRecordJSONData(data, record, dataToJSON));
  return {
    dirty: data.length > 0,
    data,
  };
}

export function getUniqueFieldNames(dataSet: DataSet): string[] {
  const keys: string[] = [];
  dataSet.fields.forEach((field, key) => {
    if (field.get('unique')) {
      keys.push(key);
    }
  });
  return keys;
}

export function getUniqueKeysAndPrimaryKey(dataSet: DataSet): string[] {
  const keys: string[] = getUniqueFieldNames(dataSet);
  const { primaryKey } = dataSet.props;
  if (primaryKey) {
    keys.push(primaryKey);
  }
  return keys;
}

export function isDirtyRecord(record: Record) {
  return record.status !== RecordStatus.sync || record.dirty;
}

export function getSpliceRecord(records: Record[], inserts: Record[], fromRecord?: Record): Record | undefined {
  if (fromRecord) {
    if (inserts.includes(fromRecord)) {
      return getSpliceRecord(records, inserts, records[records.indexOf(fromRecord) + 1]);
    }
    return fromRecord;
  }
}

// bugs in react native
export function fixAxiosConfig(config: AxiosRequestConfig): AxiosRequestConfig {
  const { method } = config;
  if (method && method.toLowerCase() === 'get') {
    delete config.data;
  }
  return config;
}

function normalizeGroupsToTree(groups: Group[]): Group[] {
  const map1: Map<string, Group> = new Map();
  const map2: Map<string, Group> = new Map();
  groups.forEach((group) => {
    const { subGroups, value } = group;
    map1.set(String(value), group);
    map2.set(String(value), group);
    if (subGroups.length) {
      group.subGroups = normalizeGroupsToTree(subGroups);
    }
  });
  if (map1.size) {
    map1.forEach((group) => {
      const { parentValue } = group;
      const parent = parentValue ? map1.get(String(parentValue)) : undefined;
      if (parent) {
        if (parent.children) {
          parent.children.push(group);
        } else {
          parent.children = [group];
        }
        group.parent = parent;
        map2.delete(String(group.value));
      }
    });
    return [...map2.values()];
  }
  return groups;
}

const EMPTY_GROUP_KEY = Symbol('__empty_group__');

export function normalizeGroups(groups: string[], hGroups: string[], records: Record[], parentFields?: Map<string | symbol, string>): Group[] {
  const optGroups: Group[] = [];
  const emptyGroup = new Group(EMPTY_GROUP_KEY, 0);
  records.forEach((record) => {
    let previousGroup: Group | undefined;
    groups.forEach((name) => {
      const value = record.get(name);
      if (!previousGroup) {
        previousGroup = optGroups.find(item => item.value === value);
        if (!previousGroup) {
          previousGroup = new Group(name, optGroups.length, value);
          optGroups.push(previousGroup);
        }
      } else {
        const { subGroups } = previousGroup;
        const parent = previousGroup;
        previousGroup = subGroups.find(item => item.value === value);
        if (!previousGroup) {
          previousGroup = new Group(name, subGroups.length, value, parent);
          subGroups.push(previousGroup);
        }
      }
      const parentField = parentFields && parentFields.get(name);
      if (previousGroup && previousGroup.parentName !== parentField) {
        previousGroup.parentName = parentField;
        previousGroup.parentValue = record.get(parentField);
      }
    });
    if (hGroups.length) {
      let { subHGroups } = previousGroup || emptyGroup;
      if (!subHGroups) {
        subHGroups = new Set<Group>();
        (previousGroup || emptyGroup).subHGroups = subHGroups;
      }
      hGroups.forEach((key) => {
        const label = record.get(key);
        if (!previousGroup) {
          previousGroup = optGroups.find(item => item.value === label);
          if (!previousGroup) {
            previousGroup = new Group(key, optGroups.length, label);
            optGroups.push(previousGroup);
          }
        } else {
          const { subGroups } = previousGroup;
          const parent = previousGroup;
          previousGroup = subGroups.find(item => item.value === label);
          if (!previousGroup) {
            previousGroup = new Group(key, subGroups.length, label, parent);
            subGroups.push(previousGroup);
          }
        }
      });
      if (previousGroup) {
        subHGroups.add(previousGroup);
      }
    }
    if (previousGroup) {
      const { records: groupRecords } = previousGroup;
      groupRecords.push(record);
      let parent: Group | undefined = previousGroup;
      while (parent) {
        parent.totalRecords.push(record);
        parent = parent.parentGroup;
      }
    }
  });
  if (parentFields && parentFields.size) {
    return normalizeGroupsToTree(optGroups);
  }
  if (!groups.length) {
    if (hGroups.length) {
      emptyGroup.subGroups = optGroups;
    } else {
      emptyGroup.records = records.slice();
    }
    return [
      emptyGroup,
    ];
  }
  return optGroups;
}

function mergeHGroupStates(newGroups: Set<Group> | undefined, oldGroups: Set<Group> | undefined) {
  if (newGroups && oldGroups && newGroups.size && oldGroups.size) {
    oldGroups.forEach((oldGroup) => {
      const { state } = oldGroup;
      if (state) {
        const { name, value } = oldGroup;
        const newGroup = iteratorFind(newGroups.values(), group => group.name === name && group.value === value);
        if (newGroup) {
          newGroup.mergeState(state);
          mergeGroupStates(newGroup.subGroups, oldGroup.subGroups);
          mergeHGroupStates(newGroup.subHGroups, oldGroup.subHGroups);
        }
      }
    });
  }
}

export function mergeGroupStates(newGroups: Group[], oldGroups: Group[] | undefined): Group[] {
  if (oldGroups && oldGroups.length && newGroups.length) {
    oldGroups.forEach((oldGroup) => {
      const { state } = oldGroup;
      if (state) {
        const { name, value } = oldGroup;
        const newGroup = newGroups.find(group => group.name === name && group.value === value);
        if (newGroup) {
          newGroup.mergeState(state);
          mergeGroupStates(newGroup.subGroups, oldGroup.subGroups);
          mergeHGroupStates(newGroup.subHGroups, oldGroup.subHGroups);
        }
      }
    });
  }
  return newGroups;
}

/**
 *
 * @param data 导出需要导出的数据
 * @param excelname 导出表单的名字
 */
export function exportExcel(data, excelName, getXLSX: () => Promise<any>) {
  const promise = getXLSX();
  if (!promise || !isPromise(promise)) {
    throw new Error('For using the excel export, please set the `xlsx` hook of configure to import xlsx module.');
  }
  promise.then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true }); /* 新建空workbook，然后加入worksheet */
    const wb = XLSX.utils.book_new();  /* 新建book */
    XLSX.utils.book_append_sheet(wb, ws); /* 生成xlsx文件(book,sheet数据,sheet命名) */
    XLSX.writeFile(wb, `${excelName}.xlsx`); /* 写文件(book,xlsx文件名称) */
  });
}

export function getSortedFields(dataSet: DataSet): ObservableMap {
  const { fields } = dataSet;
  if (dataSet.$needToSortFields) {
    const normalFields: [string, Field][] = [];
    const objectBindFields: [string, Field][] = [];
    const bindFields: [string, Field][] = [];
    const transformResponseField: [string, Field][] = [];
    const dynamicFields: [string, Field][] = [];
    const dynamicObjectBindFields: [string, Field][] = [];
    const dynamicBindFields: [string, Field][] = [];
    fields.forEach((field, name, map) => {
      const entry: [string, Field] = [name, field];
      const dynamicProps = field.get('dynamicProps') || field.get('computedProps');
      const type = field.get('type');
      const bind = field.get('bind');
      const transformResponse = field.get('transformResponse');
      if (dynamicProps) {
        if (dynamicProps.bind) {
          if (type === FieldType.object) {
            dynamicObjectBindFields.push(entry);
          } else {
            dynamicBindFields.push(entry);
          }
        } else {
          dynamicFields.push(entry);
        }
      } else if (bind) {
        const targetNames = bind.split('.');
        targetNames.pop();
        if (targetNames.some((targetName) => {
          const target = map.get(targetName);
          return target && (target.get('computedProps') || target.get('dynamicProps'));
        })) {
          if (type === FieldType.object) {
            dynamicObjectBindFields.push(entry);
          } else {
            dynamicBindFields.push(entry);
          }
        } else if (transformResponse) {
          transformResponseField.push(entry);
        } else if (type === FieldType.object) {
          objectBindFields.push(entry);
        } else {
          bindFields.push(entry);
        }
      } else {
        normalFields.push(entry);
      }
    });
    fields.replace([
      ...normalFields,
      ...objectBindFields,
      ...bindFields,
      ...transformResponseField,
      ...dynamicFields,
      ...dynamicObjectBindFields,
      ...dynamicBindFields,
    ]);
    delete dataSet.$needToSortFields;
  }
  return fields;
}

export async function concurrentPromise(
  promiseLoaders: { getPromise: () => Promise<any> }[],
  cancelFnc: (readyPromiseNumber: number) => boolean,
) {
  const promiseLoadersLength = promiseLoaders.length;
  let fail = false;
  return new Promise((resolve, reject) => {
    const resulet: any = Array(promiseLoadersLength).fill(null);
    // 依次执行promise
    // 最大并发数
    const maxConcurrent = Math.min(5, promiseLoadersLength);
    let currentPromiseIndex = 0;
    const execPromise = async (loader: { getPromise: () => Promise<any> } | undefined, index: number) => {
      if (fail) {
        return;
      }
      if (cancelFnc(resulet.filter(Boolean).length)) {
        fail = true;
        reject();
        return;
      }
      let res;
      try {
        if (!loader) {
          throw new Error('loader is undefined');
        }
        res = await loader.getPromise();
      } catch (error) {
        fail = true;
        reject(error);
        return;
      }
      resulet[index] = res;
      // 判断是否完结
      if (currentPromiseIndex === promiseLoadersLength - 1 && resulet.every(Boolean)) {
        resolve(resulet);
        return;
      }
      // 执行下一个promise
      if (currentPromiseIndex < promiseLoadersLength - 1) {
        ++currentPromiseIndex;
        execPromise(promiseLoaders[currentPromiseIndex], currentPromiseIndex);
      }
    };

    // 初始化执行
    for (let i = 0; i < maxConcurrent; i++) {
      execPromise(promiseLoaders[i], i);
    }
    currentPromiseIndex = maxConcurrent - 1;
  });
}

export function treeSelect(dataSet: DataSet, record: Record, selected: Record[]) {
  dataSet.select(record);
  if (record.isSelected) {
    selected.push(record);
    const { children } = record;
    if (children) {
      children.forEach(child => treeSelect(dataSet, child, selected));
    }
  }
}

export function treeUnSelect(dataSet: DataSet, record: Record, unSelected: Record[]) {
  dataSet.unSelect(record);
  if (!record.isSelected) {
    unSelected.push(record);
    const { children } = record;
    if (children) {
      children.forEach(child => treeUnSelect(dataSet, child, unSelected));
    }
  }
}

export function treeSelectParent(dataSet: DataSet, record: Record, selected: Record[]) {
  const { parent } = record;
  if (parent && !parent.isSelected) {
    dataSet.select(parent);
    selected.push(parent);
    treeSelectParent(dataSet, parent, selected);
  }
}

export function treeUnSelectParent(dataSet: DataSet, record: Record, unSelected: Record[]) {
  const { parent } = record;
  if (parent && parent.isSelected) {
    const { children } = parent;
    if (children && children.every(child => !child.isSelected)) {
      dataSet.unSelect(parent);
      unSelected.push(parent);
      treeUnSelectParent(dataSet, parent, unSelected);
    }
  }
}

export function exchangeTreeNode(newRecord: Record, oldRecord: Record): Record {
  const { parent, children } = oldRecord;
  newRecord.parent = parent;
  newRecord.children = children;
  if (parent) {
    const { children: parentChildren } = parent;
    if (parentChildren) {
      const index = parentChildren.indexOf(oldRecord);
      if (index !== -1) {
        parentChildren.splice(index, 1, newRecord);
      }
    }
  }
  return newRecord;
}

export function getIf<T, V>(target: T, propName: string, defaultValue: V | (() => V)): V {
  const value = target[propName];
  if (value === undefined) {
    target[propName] = typeof defaultValue === 'function' ? (defaultValue as () => V)() : defaultValue;
    return target[propName];
  }
  return value;
}

export function getIfForMap<T extends Map<string, V>, V>(target: T, propName: string, defaultValue: V | (() => V)): V {
  const value = target.get(propName);
  if (value === undefined) {
    const newValue = typeof defaultValue === 'function' ? (defaultValue as () => V)() : defaultValue;
    target.set(propName, newValue);
    return newValue;
  }
  return value;
}

export function getRecordDynamicProps<T extends keyof RecordDynamicProps>(record: Record, key: T, defaultValue: NonNullable<ReturnType<NonNullable<RecordDynamicProps[T]>>>): NonNullable<ReturnType<NonNullable<RecordDynamicProps[T]>>> {
  const { dataSet: { props: { record: recordProps } } } = record;
  if (recordProps) {
    const { dynamicProps } = recordProps;
    if (dynamicProps) {
      const hook = dynamicProps[key];
      if (hook) {
        const result = hook(record);
        if (result !== undefined) {
          return result as NonNullable<ReturnType<NonNullable<RecordDynamicProps[T]>>>;
        }
      }
    }
    const value = recordProps[key];
    if (value !== undefined) {
      return value as NonNullable<ReturnType<NonNullable<RecordDynamicProps[T]>>>;
    }
  }
  return defaultValue;
}

export function mergeDataSetProps(props: DataSetProps | undefined, dataSetProps?: DataSetProps | ((p: DataSetProps) => DataSetProps)): DataSetProps {
  if (typeof dataSetProps === 'function') {
    return dataSetProps(props || {});
  }
  return { ...props, ...dataSetProps };
}

export function appendFormData(formData: FormData, data: object) {
  Object.keys(data).forEach(key => formData.append(key, data[key]));
}

/**
 * 比较两个 formData 值是否相同
 * @param oldFormData formData 值1
 * @param newFormData formData 值2
 * @returns boolean
 */
export function isFormDataEqual(oldFormData: FormData, newFormData: FormData): boolean {
  const oldEntries = Array.from(oldFormData.entries());
  const newEntries = Array.from(newFormData.entries());
  if (oldEntries.length !== newEntries.length) {
    return false;
  }
  for (const [oldKey, oldValue] of oldEntries) {
    // 检查每个键值对是否在另一个 FormData 中存在
    const found = newEntries.some(([newKey, newValue]) => {
      if (oldKey !== newKey) return false;
      // 如果值是文件，比较文件名和大小
      if (oldValue instanceof File && newValue instanceof File) {
        return oldValue.name === newValue.name && oldValue.size === newValue.size;
      }
      // 否则，比较值本身
      return oldValue === newValue;
    });

    if (!found) {
      return false;
    }
  }
  return true;
}

/**
 * 判断是否为 trueValue 的值
 * @param trueValue trueValue 值，可以是单个值或者数组
 * @param value 待判断的值
 * @returns 
 */
export function equalTrueValue(trueValue: string | number | boolean | any[], value: any): boolean {
  const trueValueArr = isArrayLike(trueValue) ? trueValue : [trueValue];
  return trueValueArr.includes(value);
}

export function getFirstValue(values: string | number | boolean | any[]): string | number | boolean {
  const valueArr = isArrayLike(values) ? values : [values];
  return valueArr[0];
}

export function isObjectEmptyByIgnore(obj, ignoreKeys: string[] = []) {
  // 获取对象的所有键，并过滤掉需要忽略的键
  const filteredKeys = Object.keys(obj).filter(key => !ignoreKeys.includes(key));
  // 判断过滤后的键数量是否为 0
  return filteredKeys.length === 0;
}