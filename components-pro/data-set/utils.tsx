import queryString from 'querystringify';
import moment, { isDate, isMoment } from 'moment';
import { isArrayLike } from 'mobx';
import { AxiosRequestConfig } from 'axios';
import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig } from 'choerodon-ui/lib/configure';
import isNil from 'lodash/isNil';
import _isEmpty from 'lodash/isEmpty';
import Field, { FieldProps, Fields } from './Field';
// import XLSX from 'xlsx';
import { BooleanValue, DataToJSON, FieldType, RecordStatus, SortOrder } from './enum';
import DataSet, { Group } from './DataSet';
import Record from './Record';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import localeContext, { $l } from '../locale-context';
import { SubmitTypes, TransportType, TransportTypes } from './Transport';
import formatString from '../formatter/formatString';
import { parseNumber } from '../number-field/utils';
import { treeReduce } from '../_util/treeUtils';

export const defaultTextField = 'meaning';
export const defaultValueField = 'value';

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

export function getOrderFields(fields: Fields): Field[] {
  return [...fields.values()].filter(({ order }) => order);
}

function processOneToJSON(value, field: Field, checkRange: boolean = true) {
  if (!isEmpty(value)) {
    const range = field.get('range');
    if (range && checkRange) {
      if (isArrayLike(range)) {
        if (isObject(value)) {
          const [start, end] = range;
          value = {
            [start]: processOneToJSON(value[start], field, false),
            [end]: processOneToJSON(value[end], field, false),
          };
        }
      } else if (isArrayLike(value)) {
        value = [
          processOneToJSON(value[0], field, false),
          processOneToJSON(value[1], field, false),
        ];
      }
    } else {
      if (isDate(value)) {
        value = moment(value);
      }
      if (isMoment(value)) {
        const { jsonDate } = getConfig('formatter');
        value = jsonDate ? value.format(jsonDate) : +value;
      }
      if (field.type === FieldType.json) {
        value = JSON.stringify(value);
      }
    }
  }
  return value;
}

export function processToJSON(value, field: Field) {
  if (!isEmpty(value)) {
    const multiple = field.get('multiple');
    const range = field.get('range');
    if (isArrayLike(value) && (multiple || !range)) {
      value = value.map(v => processOneToJSON(v, field));
      if (isString(multiple)) {
        return value.join(multiple);
      }
      return value;
    }
    return processOneToJSON(value, field);
  }
  return value;
}

export function arrayMove<T = Record>(array: T[], from: number, to: number): void {
  const startIndex = to < 0 ? array.length + to : to;
  const item = array.splice(from, 1)[0];
  array.splice(startIndex, 0, item);
}

function processOne(value: any, field: Field, checkRange: boolean = true) {
  if (!isEmpty(value)) {
    const range = field.get('range');
    if (range && checkRange) {
      if (isArrayLike(range)) {
        if (isObject(value)) {
          const [start, end] = range;
          value[start] = processOne(value[start], field, false);
          value[end] = processOne(value[end], field, false);
        }
      } else if (isArrayLike(value)) {
        value[0] = processOne(value[0], field, false);
        value[1] = processOne(value[1], field, false);
      }
    } else if (value instanceof Date) {
      value = moment(value);
    } else if (!isObject(value)) {
      value = formatString(value, {
        trim: field.get('trim'),
        format: field.get('format'),
      });
      switch (field.type) {
        case FieldType.boolean: {
          const trueValue = field.get(BooleanValue.trueValue);
          const falseValue = field.get(BooleanValue.falseValue);
          if (value !== trueValue) {
            value = falseValue;
          }
          break;
        }
        case FieldType.number:
        case FieldType.currency:
          if (!isNaN(value)) {
            value = parseNumber(value, field.get('precision'));
          } else {
            value = undefined;
          }
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
        case FieldType.year: {
          const { jsonDate } = getConfig('formatter');
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

export function processValue(value: any, field?: Field, isCreated?: boolean): any {
  if (field) {
    const multiple = field.get('multiple');
    const range = field.get('range');
    if (multiple && field.type !== FieldType.attachment) {
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
      return value.map(item => processOne(item, field));
    }
    return processOne(value, field);
  }
  return value;
}

// 处理单个range
const processRangeToText = (resultValue, field): string => {
  return resultValue.map((item) => {
    const valueRange = isMoment(item)
      ? item.format()
      : isObject(item)
        ? item[field.get('textField')]
        : item.toString();
    return valueRange;
  }).join(`~`);
};

export function processExportValue(value: any, field?: Field): any {
  if (field) {
    const multiple = field.get('multiple');
    const range = field.get('range');
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
      if (field && !_isEmpty(field.lookup)) {
        return value.map(item => field.getText(processOne(item, field))).join(',');
      }
      return value.map(item => {
        const itemValue = processOne(item, field);
        if (field && field.get('textField') && itemValue && isObject(itemValue)) {
          return itemValue[field.get('textField')];
        }
        return itemValue;
      }).join(',');
    }
    if (isArray(value) && multiple && range) {
      if (field && !_isEmpty(field.lookup)) {
        return value.map(item => field.getText(processRangeToText(processOne(item, field), field))).join(',');
      }
      return value.map(item => {
        return processRangeToText(processOne(item, field), field);
      }).join(',');
    }
    if (field && !_isEmpty(field.lookup)) {
      return field.getText(processOne(value, field));
    }
    const resultValue = processOne(value, field);
    if (isMoment(resultValue)) {
      return resultValue.format();
    }
    if (field && field.get('textField') && resultValue && isObject(resultValue)) {
      if (range && isArrayLike(resultValue)) {
        return processRangeToText(resultValue, field);
      }
      return resultValue[field.get('textField')];
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
export function getSplitValue(dataItem: any, name: string, isBind: boolean = true): any {
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

export function childrenInfoForDelete(json: {}, children: { [key: string]: DataSet; }): {} {
  return Object.keys(children).reduce((data, name) => {
    const child = children[name];
    if (child) {
      data[name] = [childrenInfoForDelete({}, child.children)];
    }
    return data;
  }, json);
}

export function sortTree(children: Record[], orderField: Field): Record[] {
  if (orderField && children.length > 0) {
    const { name, order } = orderField;
    const m = Number.MIN_SAFE_INTEGER;
    children.sort((record1, record2) => {
      const a = record1.get(name) || m;
      const b = record2.get(name) || m;
      if (isString(a) || isString(b)) {
        return order === SortOrder.asc
          ? String(a).localeCompare(String(b))
          : String(b).localeCompare(String(a));
      }
      return order === SortOrder.asc ? a - b : b - a;
    });
  }
  return children;
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
    [...itemMap.entries()].forEach(([key, node]) => {
      const parent = itemMap.get(node.item[parentField]);
      if (parent) {
        parent.children.push(node);
        rootMap.delete(key);
      }
    });
    return treeReduce<object[], Node>([...rootMap.values()].slice(0, pageSize), (previousValue, node) => previousValue.concat(node.item), []);
  }
  return [];
}

export function checkParentByInsert({ parent }: DataSet) {
  if (parent && !parent.current) {
    throw new Error($l('DataSet', 'cannot_add_record_when_head_no_current'));
  }
}

function getValueType(value: any): FieldType {
  return isBoolean(value)
    ? FieldType.boolean
    : isNumber(value)
      ? FieldType.number
      : isString(value)
        ? FieldType.string
        : isMoment(value)
          ? FieldType.date
          : isObject(value)
            ? FieldType.object
            : FieldType.auto;
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

export function checkFieldType(value: any, field: Field): boolean {
  if (process.env.NODE_ENV !== 'production' && !isEmpty(value)) {
    const fieldType = getBaseType(field.type);
    if (fieldType !== FieldType.auto) {
      if (isArrayLike(value)) {
        return value.every(item => checkFieldType(item, field));
      }
      const valueType =
        field.type === FieldType.boolean &&
        [field.get(BooleanValue.trueValue), field.get(BooleanValue.falseValue)].includes(value)
          ? FieldType.boolean
          : getValueType(value);
      if (
        fieldType !== FieldType.reactNode &&
        fieldType !== valueType
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
  const keys = [...map.keys()];
  throw new Error(`DataSet: Cycle binding fields[${[...keys].join(' -> ')} -> ${keys[0]}].`);
}

function getChainFieldNamePrivate(record: Record, fieldName: string, linkedMap: Map<string, Field> = new Map(), init: boolean = true): string {
  const field = record.getField(fieldName);
  if (field) {
    const bind = field.get('bind');
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

export function findBindTargetFields(myField: Field, fields: Fields, deep?: boolean, bindFields: Map<string, Field> = new Map()): Field[] {
  const bind = myField.get('bind');
  if (bind) {
    [...fields.entries()].some(([fieldName, field]) => {
      if (field !== myField) {
        if ((bind === fieldName || bind.startsWith(`${fieldName}.`))) {
          if (bindFields.has(fieldName)) {
            throwCycleBindingFields(bindFields);
          }
          bindFields.set(fieldName, field);
          if (deep) {
            findBindTargetFields(field, fields, deep, bindFields);
          }
          return true;
        }
      }
      return false;
    });
  }
  return [...bindFields.values()];
}

export function findBindFields(myField: Field, fields: Fields, deep?: boolean, bindFields: Map<string, Field> = new Map()): Field[] {
  const { name } = myField;
  [...fields.entries()].forEach(([fieldName, field]) => {
    if (field !== myField) {
      const bind = field.get('bind');
      if (bind && (bind === name || bind.startsWith(`${name}.`))) {
        if (bindFields.has(fieldName)) {
          throwCycleBindingFields(bindFields);
        }
        bindFields.set(fieldName, field);
        if (deep) {
          findBindFields(field, fields, deep, bindFields);
        }
      }
    }
  });
  return [...bindFields.values()];
}

export function findBindField(
  myField: string,
  chainFieldName: string,
  record: Record,
): Field | undefined {
  return [...record.fields.values()].find((field) => {
    const fieldName = field.name;
    if (fieldName !== myField) {
      const bind = field.get('bind');
      if (bind) {
        return chainFieldName === getChainFieldName(record, fieldName);
      }
    }
    return false;
  });
}

function numberSorter(a, b) {
  return a - b;
}

function stringSorter(a, b) {
  return String(a || '').localeCompare(String(b || ''));
}

export function getFieldSorter(field: Field) {
  const { name } = field;

  switch (field.type) {
    case FieldType.number:
    case FieldType.currency:
    case FieldType.date:
    case FieldType.dateTime:
    case FieldType.week:
    case FieldType.month:
    case FieldType.year:
    case FieldType.time:
      return field.order === SortOrder.asc
        ? (a, b) => numberSorter(a.get(name), b.get(name))
        : (a, b) => numberSorter(b.get(name), a.get(name));
    default:
      return field.order === SortOrder.asc
        ? (a, b) => stringSorter(a.get(name), b.get(name))
        : (a, b) => stringSorter(b.get(name), a.get(name));
  }
}

// export function generateRecordChildrenData(dataSet: DataSet, record: Record): { dirty: boolean; data: object[]; } | undefined {
//   const { props: { childrenField }, dataToJSON } = dataSet;
//   if (childrenField && !useSelected(dataToJSON)) {
//     const { children } = record;
//     if (children) {
//       const normal = useNormal(dataToJSON);
//       return normal
//         ? generateData(children)
//         : generateJSONData(dataSet, children);
//     }
//   }
// }

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
  getConfig('transport') || {};
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
    const chainFieldName = getChainFieldName(record, fieldName);
    const { dataSet } = record;
    if (dataSet) {
      const { checkField } = dataSet.props;
      if (checkField && chainFieldName === getChainFieldName(record, checkField)) {
        const field = record.getField(checkField);
        const trueValue = field ? field.get(BooleanValue.trueValue) : true;
        const falseValue = field ? field.get(BooleanValue.falseValue) : false;
        const { children } = record;
        if (children) {
          return children.every(child => cb(child, checkField) === trueValue)
            ? trueValue
            : falseValue;
        }
      }
    }
    return ObjectChainValue.get(record.data, chainFieldName as string);
  }
}

export function processIntlField(
  name: string,
  fieldProps: FieldProps,
  callback: (name: string, props: FieldProps) => Field,
  dataSet?: DataSet,
): Field {
  if (fieldProps.type === FieldType.intl) {
    const { transformRequest } = fieldProps;
    const tlsKey = getConfig('tlsKey');
    const { supports } = localeContext;
    const languages = Object.keys(supports);
    languages.forEach(language =>
      callback(`${tlsKey}.${name}.${language}`, {
        type: FieldType.string,
        label: `${supports[language]}`,
        transformRequest,
        computedProps: {
          bind: ({ record }) => {
            if (record) {
              const tls = record.get(tlsKey) || {};
              if (name in tls && (dataSet ? dataSet.lang : localeContext.locale.lang) === language) {
                return name;
              }
            }
          },
        },
      }),
    );
  }
  return callback(name, fieldProps);
}

export function findBindFieldBy(myField: Field, fields: Fields, prop: string): Field | undefined {
  const value = myField.get(prop);
  const myName = myField.name;
  return [...fields.values()].find(field => {
    const bind = field.get('bind');
    return bind && bind === `${myName}.${value}`;
  });
}

export function getLimit(limit: any, record: Record) {
  if (isString(limit) && record.getField(limit)) {
    return record.get(limit);
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

export function generateData(records: Record[]): { dirty: boolean; data: object[]; } {
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
): { dirty: boolean; data: object[]; } {
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
  [...dataSet.fields.entries()].forEach(([key, field]) => {
    if (field.get('unique')) {
      keys.push(key);
    }
  });
  return keys;
}

export function getUniqueKeysAndPrimaryKey(dataSet?: DataSet): string[] {
  if (dataSet) {
    const keys: string[] = getUniqueFieldNames(dataSet);
    const { primaryKey } = dataSet.props;
    if (primaryKey) {
      keys.push(primaryKey);
    }
    return keys;
  }
  return [];
}

export function isDirtyRecord(record) {
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

const EMPTY_GROUP_KEY = '__empty_group__';

export function normalizeGroups(groups: string[], records: Record[]): Group[] {
  const optGroups: Group[] = [];
  const restRecords: Record[] = [];
  records.forEach((record) => {
    let previousGroup: Group | undefined;
    groups.every((key) => {
      const label = record.get(key);
      if (label !== undefined) {
        if (!previousGroup) {
          previousGroup = optGroups.find(item => item.value === label);
          if (!previousGroup) {
            previousGroup = {
              name: key,
              value: label,
              records: [],
              subGroups: [],
            };
            optGroups.push(previousGroup);
          }
        } else {
          const { subGroups } = previousGroup;
          previousGroup = subGroups.find(item => item.value === label);
          if (!previousGroup) {
            previousGroup = {
              name: key,
              value: label,
              records: [],
              subGroups: [],
            };
            subGroups.push(previousGroup);
          }
        }
        return true;
      }
      return false;
    });
    if (previousGroup) {
      const { records: groupRecords } = previousGroup;
      groupRecords.push(record);
    } else {
      restRecords.push(record);
    }
  });
  if (restRecords.length) {
    optGroups.push({
      name: EMPTY_GROUP_KEY,
      value: undefined,
      records: restRecords,
      subGroups: [],
    });
  }
  return optGroups;
}

/**
 *
 * @param data 导出需要导出的数据
 * @param excelname 导出表单的名字
 */
export function exportExcel(data, excelName) {
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true }); /* 新建空workbook，然后加入worksheet */
    const wb = XLSX.utils.book_new();  /* 新建book */
    XLSX.utils.book_append_sheet(wb, ws); /* 生成xlsx文件(book,sheet数据,sheet命名) */
    XLSX.writeFile(wb, `${excelName}.xlsx`); /* 写文件(book,xlsx文件名称) */
  });
}

export function getSortedFields(fields: Fields): [string, Field][] {
  const normalFields: [string, Field][] = [];
  const objectBindFields: [string, Field][] = [];
  const bindFields: [string, Field][] = [];
  const transformResponseField: [string, Field][] = [];
  const dynamicFields: [string, Field][] = [];
  const dynamicObjectBindFields: [string, Field][] = [];
  const dynamicBindFields: [string, Field][] = [];
  [...fields.entries()].forEach((entry) => {
    const [, field] = entry;
    const dynamicProps = field.get('computedProps') || field.get('dynamicProps');
    if (dynamicProps) {
      if (dynamicProps.bind) {
        if (field.type === FieldType.object) {
          dynamicObjectBindFields.push(entry);
        } else {
          dynamicBindFields.push(entry);
        }
      } else {
        dynamicFields.push(entry);
      }
    } else {
      const bind = field.get('bind');
      if (bind) {
        const targetNames = bind.split('.');
        targetNames.pop();
        if (targetNames.some((targetName) => {
          const target = fields.get(targetName);
          return target && (target.get('computedProps') || target.get('dynamicProps'));
        })) {
          if (field.type === FieldType.object) {
            dynamicObjectBindFields.push(entry);
          } else {
            dynamicBindFields.push(entry);
          }
        } else if (field.get('transformResponse')) {
          transformResponseField.push(entry);
        } else if (field.type === FieldType.object) {
          objectBindFields.push(entry);
        } else {
          bindFields.push(entry);
        }
      } else {
        normalFields.push(entry);
      }
    }
  });
  return [
    ...normalFields,
    ...objectBindFields,
    ...bindFields,
    ...transformResponseField,
    ...dynamicFields,
    ...dynamicObjectBindFields,
    ...dynamicBindFields,
  ];
}


export async function concurrentPromise(
  promiseLoaders: { getPromise: () => Promise<any>; }[],
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
    const execPromise = async (getPromise: () => Promise<any>, index: number) => {
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
        res = await getPromise();
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
        execPromise(promiseLoaders[currentPromiseIndex]?.getPromise, currentPromiseIndex);
      }
    };

    // 初始化执行
    for (let i = 0; i < maxConcurrent; i++) {
      execPromise(promiseLoaders[i]?.getPromise, i);
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

export function getIf<T, V>(target: T, propName: string, defaultValue: V | (() => V)): V {
  const value = target[propName];
  if (value === undefined) {
    target[propName] = typeof defaultValue === 'function' ? (defaultValue as () => V)() : defaultValue;
    return target[propName];
  }
  return value;
}
