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
import Field, { DynamicPropsArguments, FieldProps, Fields } from './Field';
import { BooleanValue, DataToJSON, FieldType, RecordStatus, SortOrder } from './enum';
import DataSet from './DataSet';
import Record from './Record';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import localeContext, { $l } from '../locale-context';
import { SubmitTypes, TransportType, TransportTypes } from './Transport';
import formatString from '../formatter/formatString';
import { Lang } from '../locale-context/enum';
import formatNumber from '../formatter/formatNumber';
import formatCurrency from '../formatter/formatCurrency';
import { getPrecision } from '../number-field/utils';

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
  return [DataToJSON.dirty, DataToJSON.selected, DataToJSON.all, DataToJSON.normal].includes(
    dataToJSON,
  );
}

export function useDirty(dataToJSON: DataToJSON): boolean {
  return [DataToJSON.dirty, DataToJSON['dirty-self']].includes(dataToJSON);
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

export function processToJSON(value) {
  if (isDate(value)) {
    value = moment(value);
  }
  if (isMoment(value)) {
    const { jsonDate } = getConfig('formatter');
    value = jsonDate ? value.format(jsonDate) : +value;
  }
  return value;
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
            value = Number(value);
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
        default:
      }
    }
  }
  return value;
}

export function processValue(value: any, field?: Field): any {
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
      return value.map(item => processOne(item, field));
    }
    return processOne(value, field);
  }
  return value;
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

function getBaseType(type: FieldType): FieldType {
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
  if (process.env.NODE_ENV !== 'production') {
    if (!isEmpty(value)) {
      if (isArrayLike(value)) {
        return value.every(item => checkFieldType(item, field));
      }
      const fieldType = getBaseType(field.type);
      const valueType =
        field.type === FieldType.boolean &&
        [field.get(BooleanValue.trueValue), field.get(BooleanValue.falseValue)].includes(value)
          ? FieldType.boolean
          : getValueType(value);
      if (
        fieldType !== FieldType.auto &&
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

export function findBindFields(myField: Field, fields: Fields, excludeSelf?: boolean): Field[] {
  const { name } = myField;
  return [...fields.values()].filter(field => {
    if (field !== myField) {
      const bind = field.get('bind');
      return isString(bind) && bind.startsWith(`${name}.`);
    }
    return !excludeSelf;
  });
}

export function findBindField(
  myField: Field | string,
  fields: Fields,
  callback?: (field: Field) => boolean,
): Field | undefined {
  const name = isString(myField) ? myField : myField.name;
  return [...fields.values()].find(field => {
    if (field.name !== name) {
      const bind = field.get('bind');
      return isString(bind) && bind.startsWith(`${name}.`) && (!callback || callback(field));
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

export function generateRecordJSONData(array: object[], record: Record, dataToJSON: DataToJSON) {
  const normal = useNormal(dataToJSON);
  const json = normal
    ? record.status !== RecordStatus.delete && record.toData()
    : record.toJSONData();
  if (json && (normal || useAll(dataToJSON) || !useDirty(dataToJSON) || json.__dirty)) {
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
  data: any,
  cb: (record: Record, fieldName: string) => boolean,
  fieldName?: string,
) {
  if (fieldName) {
    const field = this.getField(fieldName);
    if (field) {
      const bind = field.get('bind');
      if (bind) {
        fieldName = bind;
      }
    }
    const { dataSet } = this;
    if (dataSet) {
      const { checkField } = dataSet.props;
      if (checkField && checkField === fieldName) {
        const trueValue = field ? field.get(BooleanValue.trueValue) : true;
        const falseValue = field ? field.get(BooleanValue.falseValue) : false;
        const { children } = this;
        if (children) {
          return children.every(child => cb(child, checkField) === trueValue)
            ? trueValue
            : falseValue;
        }
      }
    }
    return ObjectChainValue.get(data, fieldName as string);
  }
}

function tlsBind(
  props: DynamicPropsArguments,
  name: string,
  lang: Lang,
  tlsKey: string,
): string | undefined {
  const tls = props.record.get(tlsKey) || {};
  if (name in tls) {
    return `${tlsKey}.${name}.${lang}`;
  }
}

export function processIntlField(
  name: string,
  fieldProps: FieldProps,
  callback: (name: string, props: FieldProps) => Field,
  dataSet?: DataSet,
): Field {
  const tlsKey = getConfig('tlsKey');
  const { supports } = localeContext;
  const languages = Object.keys(supports);
  const { type, dynamicProps } = fieldProps;
  if (type === FieldType.intl) {
    languages.forEach(language =>
      callback(`${tlsKey}.${name}.${language}`, {
        type: FieldType.string,
        label: `${supports[language]}`,
      }),
    );
    const { lang = localeContext.locale.lang } = dataSet || {};
    const newDynamicProps =
      typeof dynamicProps === 'function'
        ? props => {
            return {
              ...dynamicProps(props),
              bind: tlsBind(props, name, lang, tlsKey),
            };
          }
        : {
            ...dynamicProps,
            bind: props => {
              return tlsBind(props, name, lang, tlsKey);
            },
          };
    return callback(name, {
      ...fieldProps,
      dynamicProps: newDynamicProps,
    });
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

export function processFieldValue(value, field: Field, lang: Lang, showValueIfNotFound?: boolean) {
  const { type } = field;
  if (type === FieldType.number) {
    const precision = getPrecision(value || 0);
    const options = {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };
    return formatNumber(value, lang, options);
  }
  if (type === FieldType.currency) {
    return formatCurrency(value, lang, {
      currency: field.get('currency'),
    });
  }
  return field.getText(value, showValueIfNotFound);
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

export function generateData(ds: DataSet): { dirty: boolean; data: object[] } {
  let dirty = false;
  const data: object[] = ds.data.map(record => {
    const d = record.toData();
    if (d.__dirty) {
      dirty = true;
    }
    delete d.__dirty;
    return d;
  });
  return {
    dirty,
    data,
  };
}

export function generateJSONData(
  ds: DataSet,
  isSelect?: boolean,
): { dirty: boolean; data: object[] } {
  const { dataToJSON } = ds;
  const data: object[] = [];
  (isSelect || useSelected(dataToJSON) ? ds.selected : ds.records).forEach(record =>
    generateRecordJSONData(data, record, dataToJSON),
  );
  return {
    dirty: data.length > 0,
    data,
  };
}
