import queryString from 'querystringify';
import moment, { isDate, isMoment } from 'moment';
import { isArrayLike } from 'mobx';
import { AxiosRequestConfig } from 'axios';
import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isEqual from 'lodash/isEqual';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig } from 'choerodon-ui/lib/configure';
import Field, { FieldProps, Fields } from './Field';
import { BooleanValue, FieldType, RecordStatus, SortOrder } from './enum';
import DataSet from './DataSet';
import Record from './Record';
import Constants from './Constants';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import localeContext, { $l } from '../locale-context';
import Transport, { TransportType } from './Transport';

export function append(url: string, suffix?: object) {
  if (suffix) {
    return url + queryString.stringify(suffix, url.indexOf('?') === -1);
  } else {
    return url;
  }
}

export function getOrderFields(fields: Fields): Field[] {
  const result: Field[] = [];
  for (const field of fields.values()) {
    if (field.order) {
      result.push(field);
    }
  }
  return result;
}

export function processToJSON(value) {
  if (isDate(value)) {
    value = moment(value);
  }
  if (isMoment(value)) {
    value = value.format(Constants.DATE_JSON_FORMAT);
  }
  return value;
}

function processOne(value: any, field: Field, checkRange: boolean = true) {
  if (!isEmpty(value)) {
    const range = field.get('range');
    if (range && checkRange) {
      if (isArray(range)) {
        if (isObject(value)) {
          const [start, end] = range;
          value[start] = processOne(value[start], field, false);
          value[end] = processOne(value[end], field, false);
        }
      } else if (isArray(value)) {
        value[0] = processOne(value[0], field, false);
        value[1] = processOne(value[1], field, false);
      }
    } else if (value instanceof Date) {
      value = moment(value, Constants.DATE_JSON_FORMAT);
    } else if (!isObject(value)) {
      switch (field.type) {
        case FieldType.boolean:
          const trueValue = field.get(BooleanValue.trueValue);
          const falseValue = field.get(BooleanValue.falseValue);
          if (value !== trueValue) {
            value = falseValue;
          }
          break;
        case FieldType.number:
          if (!isNaN(value)) {
            value = Number(value);
          } else {
            value = '';
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
        case FieldType.year:
          value = moment(value, Constants.DATE_JSON_FORMAT);
          break;
        default:
      }
    }
  }
  return value;
}

export function processValue(value: any, field?: Field): any {
  if (field) {
    const multiple = field.get('multiple');
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
    if (isArray(value)) {
      return value.map(item => processOne(item, field));
    }
    return processOne(value, field);
  }
  return value;
}

export function childrenInfoForDelete(json: {}, children: { [key: string]: DataSet }): {} {
  for (const name of Object.keys(children)) {
    const child = children[name];
    if (child) {
      json[name] = [childrenInfoForDelete({}, child.children)];
    }
  }
  return json;
}

export function sortTree(children: Record[], orderField: Field): Record[] {
  if (orderField && children.length > 0) {
    const { name, order } = orderField;
    const m = Number.MIN_SAFE_INTEGER;
    children.sort((record1, record2) => {
      const a = record1.get(name) || m;
      const b = record2.get(name) || m;
      if (isString(a) || isString(b)) {
        return order === SortOrder.asc ?
          String(a).localeCompare(String(b)) : String(b).localeCompare(String(a));
      } else {
        return order === SortOrder.asc ? a - b : b - a;
      }
    });
  }
  return children;
}

export function checkParentByInsert({ parent }: DataSet) {
  if (parent && !parent.current) {
    throw new Error($l('DataSet', 'cannot_add_record_when_head_no_current'));
  }
}

export function isSame(newValue, oldValue) {
  return (isEmpty(newValue) && isEmpty(oldValue))
    || isEqual(newValue, oldValue);
}

export function isSameLike(newValue, oldValue) {
  /* tslint:disable */
  return isSame(newValue, oldValue) || newValue == oldValue;
  /* tslint:enable */
}

function getBaseType(type: FieldType): FieldType {
  switch (type) {
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

function getValueType(value: any): FieldType {
  return isBoolean(value) ? FieldType.boolean
    : isNumber(value) ? FieldType.number
      : isString(value) ? FieldType.string
        : isMoment(value) ? FieldType.date
          : isObject(value) ? FieldType.object
            : FieldType.auto;
}

export function checkFieldType(value: any, field: Field): boolean {
  if (process.env.NODE_ENV !== 'production') {
    if (!isEmpty(value)) {
      if (isArrayLike(value)) {
        return value.every(item => checkFieldType(item, field));
      } else {
        const fieldType = getBaseType(field.type);
        const valueType = getValueType(value);
        if (fieldType !== FieldType.auto && fieldType !== FieldType.reactNode && fieldType !== valueType) {
          warning(false,
            `Value type error: The value<${value}>'s type is ${valueType}, but the field<${field.name}>'s type is ${fieldType}.`,
          );
          return false;
        }
      }
    }
  }
  return true;
}

let iframe;

export function doExport(url, data) {
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = '_export_window';
    iframe.name = '_export_window';
    iframe.style.cssText = 'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;display:none';
    document.body.appendChild(iframe);
  }

  const form = document.createElement('form');
  form.target = '_export_window';
  form.method = 'post';
  form.action = url;
  const s = document.createElement('input');
  s.id = '_request_data';
  s.type = 'hidden';
  s.name = '_request_data';
  s.value = data;
  form.appendChild(s);
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

export function findBindFieldBy(myField: Field, fields: Fields, prop: string): Field | undefined {
  const value = myField.get(prop);
  const myName = myField.name;
  for (const field of fields.values()) {
    const bind = field.get('bind');
    if (bind && bind === `${myName}.${value}`) {
      return field;
    }
  }
}

export function findBindFields(myField: Field, fields: Fields): Field[] {
  const bindFields: Field[] = [myField];
  const myName = myField.name;
  const myBind = myField.get('bind');
  for (const field of fields.values()) {
    if (field !== myField) {
      const bind = field.get('bind');
      if (bind && bind.startsWith(`${myName}.`)) {
        bindFields.push(field);
      } else if (myBind && myBind.startsWith(`${field.name}.`)) {
        bindFields.push(field);
      }
    }
  }
  return bindFields;
}

export function findInvalidField(field: Field): Field {
  const { record } = field;
  if (record) {
    return findBindFields(field, record.fields).find(oneField => !oneField.validator.validity.valid) || field;
  }
  return field;
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

export function getDateFormatByFieldType(type: FieldType) {
  switch (type) {
    case FieldType.date:
      return Constants.DATE_FORMAT;
    case FieldType.dateTime:
      return Constants.DATE_TIME_FORMAT;
    case FieldType.week:
      return Constants.WEEK_FORMAT;
    case FieldType.month:
      return Constants.MONTH_FORMAT;
    case FieldType.year:
      return Constants.YEAR_FORMAT;
    case FieldType.time:
      return Constants.TIME_FORMAT;
    default:
      return Constants.DATE_FORMAT;
  }
}

export function getDateFormatByField(field?: Field, type?: FieldType): string {
  if (field) {
    return field.get('format') || getDateFormatByFieldType(type || field.type);
  }
  if (type) {
    return getDateFormatByFieldType(type);
  }
  return Constants.DATE_JSON_FORMAT;
}

export function generateJSONData(array: object[], record: Record, isSelect?: boolean, noCascade?: boolean) {
  const json = record.toJSONData(noCascade);
  if (json.__dirty || isSelect) {
    delete json.__dirty;
    array.push(json);
  }
}

export function prepareSubmitData(records: Record[], isSelect?: boolean, noCascade?: boolean): [object[], object[], object[], object[]] {
  const created: object[] = [];
  const updated: object[] = [];
  const destroyed: object[] = [];
  const cascade: object[] = [];

  function storeWith(status) {
    switch (status) {
      case RecordStatus.add:
        return created;
      case RecordStatus.update:
        return updated;
      case RecordStatus.delete:
        return destroyed;
      default:
        return cascade;
    }
  }

  records.forEach(
    record => (noCascade && record.status === RecordStatus.sync) || generateJSONData(storeWith(record.status), record, isSelect, noCascade),
  );
  return [created, updated, destroyed, cascade];
}

type SubmitType = 'create' | 'update' | 'destroy' | 'submit';

export function prepareForSubmit(type: SubmitType,
                                 data: object[],
                                 transport: Transport,
                                 configs: AxiosRequestConfig[],
                                 dataSet: DataSet): object[] {
  const { adapter, [type]: config = {} } = transport;
  if (data.length) {
    const newConfig = axiosAdapter(config, dataSet, data);
    const adapterConfig = adapter(newConfig, type) || newConfig;
    if (adapterConfig.url) {
      configs.push(adapterConfig);
    } else {
      return data;
    }
  }
  return [];
}

export function axiosAdapter(config: TransportType, dataSet: DataSet, data?: any, params?: any): AxiosRequestConfig {
  const newConfig: AxiosRequestConfig = {
    data,
    params,
    method: 'post',
  };
  if (isString(config)) {
    newConfig.url = config;
  } else if (config) {
    Object.assign(newConfig, typeof config === 'function' ? config({ data, dataSet, params }) : config);
  }
  if (newConfig.data && newConfig.method && newConfig.method.toLowerCase() === 'get') {
    newConfig.params = {
      ...newConfig.params,
      ...newConfig.data,
    };
  }
  return newConfig;
}

export function generateResponseData(item: any, dataKey?: string): object[] {
  return item ? isArray(item) ? item : dataKey && isObject(item) && dataKey in item ? item[dataKey] || [] : [item] : [];
}

export function getRecordValue(data: any, cb: (record: Record, fieldName: string) => boolean, fieldName?: string) {
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
          return children.every(child => cb(child, checkField) === trueValue) ? trueValue : falseValue;
        }
      }
    }
    return ObjectChainValue.get(data, fieldName as string);
  }
}

export function processIntlField(name: string,
                                 fieldProps: FieldProps,
                                 callback: (name: string, props: FieldProps) => Field,
                                 dataSet?: DataSet): Field {
  const tlsKey = getConfig('tlsKey');
  const languages = Object.keys(localeContext.supports);
  const { type, dynamicProps } = fieldProps;
  if (type === FieldType.intl) {
    languages.forEach(language => (
      callback(`${tlsKey}.${name}.${language}`, {
        ...fieldProps,
        type: FieldType.string,
        label: `${languages[language]}`,
        dynamicProps(props) {
          const { record } = props;
          const field = record.getField(name);
          return {
            ...(dynamicProps && dynamicProps(props)),
            required: field && field.required && !!record.get(tlsKey),
          };
        },
      })
    ));
    return callback(name, {
      ...fieldProps,
      dynamicProps(props) {
        const { lang = localeContext.locale.lang } = dataSet || {};
        return {
          ...(dynamicProps && dynamicProps(props)),
          bind: props.record.get(tlsKey) ? `${tlsKey}.${name}.${lang}` : void 0,
        };
      },
    });
  }
  return callback(name, fieldProps);
}
