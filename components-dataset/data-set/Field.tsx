import { CSSProperties, ReactNode } from 'react';
import { action, computed, get, IComputedValue, isObservableObject, observable, ObservableMap, remove, runInAction, set, toJS } from 'mobx';
import { MomentInput } from 'moment';
import raf from 'raf';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import { AxiosRequestConfig } from 'axios';
import { getDateFormatByField, isSame, isSameLike, warning } from '../utils';
import DataSet, { DataSetProps } from './DataSet';
import Record from './Record';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import {
  CheckedStrategy,
  DataSetEvents,
  DataSetSelection,
  DataSetStatus,
  DateMode,
  FieldFormat,
  FieldIgnore,
  FieldTrim,
  FieldType,
  SortOrder,
} from './enum';
import lookupStore from '../stores/LookupCodeStore';
import lovCodeStore from '../stores/LovCodeStore';
import attachmentStore, { AttachmentCache } from '../stores/AttachmentStore';
import localeContext from '../locale-context';
import { defaultTextField, defaultValueField, getBaseType, getChainFieldName, getIf, getIfForMap, getLimit, isFormDataEqual, mergeDataSetProps } from './utils';
import { isFormData } from '../axios/_helpers/utils';
import ValidationResult from '../validator/ValidationResult';
import { ValidatorProps } from '../validator/rules';
import { LovConfig, TimeStep } from '../interface';
import { TransportHookProps } from './Transport';
import { buildURLWithAxiosConfig } from '../axios/utils';
import { getLovPara } from '../stores/utils';
import AttachmentFile, { FileLike } from './AttachmentFile';
import { iteratorFind, iteratorSome } from '../iterator-helper';
import { treeFind } from '../tree-helper';
import LookupCache from './LookupCache';
import { AttachmentValue } from '../configure';

function isEqualDynamicProps(oldProps, newProps) {
  if (newProps === oldProps) {
    return true;
  }
  if (isObject(newProps) && isObject(oldProps)) {
    const newKeys = Object.keys(newProps);
    const { length } = newKeys;
    if (length) {
      if (length !== Object.keys(oldProps).length) {
        return false;
      }
      return newKeys.every(key => {
        const value = newProps[key];
        const oldValue = oldProps[key];
        if (oldValue === value) {
          return true;
        }
        if (typeof value === 'function' && typeof oldValue === 'function') {
          return value.toString() === oldValue.toString();
        }
        if (isFormData(value) && isFormData(oldValue)) {
          return isFormDataEqual(oldValue, value);
        }
        return isEqual(oldValue, value);
      });
    }
  }
  return isEqual(newProps, oldProps);
}

function getPropsFromLovConfig(lovCode: string, propsName: string[]) {
  const props = {};
  if (lovCode) {
    const config = lovCodeStore.getConfig(lovCode);
    if (config) {
      propsName.forEach(name => {
        const value = config[name];
        if (value) {
          props[name] = value;
        }
      });
    }
  }
  return props;
}

const LOOKUP_SIDE_EFFECT_KEYS = [
  'type',
  'lookupUrl',
  'lookupCode',
  'lookupAxiosConfig',
  'lovCode',
  'lovQueryAxiosConfig',
  'lovPara',
  'cascadeMap',
  'lovQueryUrl',
  'optionsProps',
];

const LOV_SIDE_EFFECT_KEYS = ['lovCode', 'lovDefineAxiosConfig', 'lovDefineUrl', 'optionsProps'];

const LOOKUP_DATA = 'lookupData';

function getLookupToken(field: Field, record: Record | undefined): string | undefined {
  if (record) {
    const { lookupTokens } = record;
    if (lookupTokens) {
      const { name } = field;
      if (lookupTokens.has(name)) {
        return lookupTokens.get(name);
      }
    }
    if (field.record) {
      const dsField = record.dataSet.getField(field.name);
      return dsField && dsField.lookupToken;
    }
  }
  return field.lookupToken;
}

function setLookupToken(field: Field, token: string | undefined, record: Record | undefined) {
  if (record) {
    if (token !== undefined || record.lookupTokens) {
      const lookupTokens = getIf<Record, ObservableMap<string, string | undefined>>(record, 'lookupTokens', () => observable.map());
      lookupTokens.set(field.name, token);
    }
  } else if (token !== field.lookupToken) {
    field.lookupToken = token;
  }
}

function combineWithOldLookupData(lookup: object[], field: Field, record?: Record): object[] {
  const lookupData = field.get(LOOKUP_DATA, record);
  const checkValue = field.get('checkValueOnOptionsChange');
  if (lookupData && !checkValue) {
    const valueField = field.get('valueField', record);
    const others = lookupData.filter((data) => lookup.every(item => item[valueField] !== data[valueField]));
    if (others.length) {
      return others.concat(lookup.slice());
    }
  }
  return lookup;
}

export type FormatNumberFuncOptions = {
  lang?: string | undefined;
  options: Intl.NumberFormatOptions;
};
export type Fields = ObservableMap<string, Field>;
export type DynamicPropsArguments = { dataSet: DataSet; record: Record; name: string };
export type DynamicProps = { [P in keyof FieldProps]?: (propsArg: DynamicPropsArguments) => FieldProps[P]; }
export type HighlightProps = {
  title?: ReactNode;
  content?: ReactNode;
  dataSet?: DataSet | undefined;
  record?: Record | undefined;
  name?: string | undefined;
  className?: string;
  style?: CSSProperties;
  hidden?: boolean;
};

export type FieldProps = {
  /**
   * 字段名
   */
  name?: string;
  /**
   * 字段类型
   */
  type?: FieldType;
  /**
   * 排序类型
   * 可选值： asc | desc
   */
  order?: SortOrder;
  /**
   * 字段标签
   */
  label?: string | ReactNode;
  /**
   * 字段标签宽度
   */
  labelWidth?: string;
  /**
   * 字符串类型和日期类型字段值格式化
   */
  format?: string | FieldFormat;
  /**
   * 正则
   */
  pattern?: string | RegExp;
  /**
   * 最小长度
   */
  minLength?: number;
  /**
   * 最大长度
   */
  maxLength?: number;
  /**
   * 步距
   */
  step?: number | string | TimeStep;
  /**
   * 非严格步距
   */
  nonStrictStep?: boolean;
  /**
   * 最大值
   */
  max?: MomentInput | null;
  /**
   * 最小值
   */
  min?: MomentInput | null;
  /**
   * 最大值，严格大于
   */
  maxExcl?: MomentInput | null;
  /**
   * 最小值，严格小于
   */
  minExcl?: MomentInput | null;
  /**
   * 小数点精度， 提交时会截断
   */
  precision?: number;
  /**
   * 千分位分组显示
   */
  numberGrouping?: boolean;
  /**
   * 数字和货币格式化配置
   */
  formatterOptions?: FormatNumberFuncOptions;
  /**
   * 校验器
   */
  validator?: CustomValidator;
  /**
   * 是否必选
   * @default false
   */
  required?: boolean;
  /**
   * 是否只读
   * @default false
   */
  readOnly?: boolean;
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * 1.当type为object时需要显示的字段名
   * 2.值列表的文本字段，默认值为`meaning`
   */
  textField?: string;
  /**
   * 值列表的值字段，默认值为`value`
   */
  valueField?: string;
  /**
   * 树形值列表的值字段，默认值为`value`
   */
  idField?: string;
  /**
   * 树形值列表的父值字段
   */
  parentField?: string;
  /**
   *  类型为boolean时，true对应的值
   */
  trueValue?: string | number | boolean | any[];
  /**
   *  类型为boolean时，false对应的值
   */
  falseValue?: string | number | boolean | any[];
  /**
   * 下拉框组件的菜单数据集
   */
  options?: DataSet | string;
  /**
   * 值集组件的数据集配置
   */
  optionsProps?: DataSetProps | ((p: DataSetProps) => DataSetProps);
  /**
   * 是否分组
   * 如果是number，则为分组的顺序
   */
  group?: number | boolean;
  /**
   * 默认值
   */
  defaultValue?: any;
  /**
   * 是否为值数组
   * 当为字符串时，作为数据分隔符，查询时会将字符串分割成数组，提交时会将数组拼接成字符串
   * @default false
   */
  multiple?: boolean | string;
  /**
   * 是否为多行类型
   * @default false
   */
  multiLine?: boolean;
  /**
   * 是否为范围值
   * 当为true时，则值为[startValue, endValue]
   * 当为数组时，例如['start', 'end']时，则值为{ start: startValue, end: endValue }
   * @default false
   */
  range?: boolean | [string, string];
  /**
   * 唯一索引或联合唯一索引组名
   */
  unique?: boolean | string;
  /**
   * LOV代码
   */
  lovCode?: string;
  /**
   * LOV查询参数
   */
  lovPara?: object;
  /**
   * 值列表代码
   */
  lookupCode?: string;
  /**
   * 值列表请求的Url
   */
  lookupUrl?: string | ((code: string) => string);
  /**
   * LOV配置请求地址
   */
  lovDefineUrl?: string | ((code: string) => string);
  /**
   * LOV查询请求地址
   */
  lovQueryUrl?:
    | string
    | ((code: string, config: LovConfig | undefined, props: TransportHookProps) => string);
  /**
   * 值列表请求的axiosConfig
   */
  lookupAxiosConfig?:
    | AxiosRequestConfig
    | ((props: {
    params?: any;
    dataSet?: DataSet;
    record?: Record;
    lookupCode?: string;
  }) => AxiosRequestConfig);
  /**
   * LOV配置请求的钩子
   */
  lovDefineAxiosConfig?: AxiosRequestConfig | ((code: string, field?: Field) => AxiosRequestConfig);
  /**
   * 批量请求LOV配置的钩子
   */
  lovDefineBatchAxiosConfig?: (codes: string[]) => AxiosRequestConfig;
  /**
   * LOV查询请求的钩子
   */
  lovQueryAxiosConfig?: AxiosRequestConfig | ((code: string, lovConfig?: LovConfig, props?: TransportHookProps, lovQueryUrl?: string) => AxiosRequestConfig);
  /**
   * 批量值列表请求的axiosConfig
   */
  lookupBatchAxiosConfig?: (codes: string[]) => AxiosRequestConfig;
  /**
   * 内部字段别名绑定
   */
  bind?: string;
  /**
   * 动态属性
   */
  dynamicProps?: DynamicProps | /* @deprecated */ ((props: DynamicPropsArguments) => FieldProps | undefined);
  /**
   * 计算属性，具有 mobx-computed 的缓存功能
   */
  computedProps?: DynamicProps;
  /**
   * 快码和LOV查询时的级联参数映射
   * @example
   * cascadeMap: { parentCodeValue: 'city' }
   * 其中'city'是当前所在数据源的其他字段名，parentCodeValue是关联父级的查询字段
   */
  cascadeMap?: object;
  /**
   * 货币代码
   */
  currency?: string;
  /**
   * 忽略提交
   * 可选值: always - 总是忽略 clean - 值未变化时忽略 never - 从不忽略
   */
  ignore?: FieldIgnore;
  /**
   * 在发送请求之前对数据进行处理
   */
  transformRequest?: ((value: any, record: Record) => any) | undefined;
  /**
   * 在获得响应之后对数据进行处理
   */
  transformResponse?: (value: any, object: any) => any;
  /**
   * 字符串值是否去掉首尾空格
   * 可选值: both left right none
   */
  trim?: FieldTrim;
  /**
   * 默认校验信息
   */
  defaultValidationMessages?: ValidationMessages;
  /**
   * 额外信息，常用于提示
   */
  help?: ReactNode;
  /**
   * 高亮
   */
  highlight?: boolean | ReactNode | HighlightProps;
  /**
   * 树形多选时定义选中项回填的方式。
   */
  showCheckedStrategy?: CheckedStrategy;
  /**
   * 附件上传的桶名
   */
  bucketName?: string;
  /**
   * 附件上传的桶目录
   */
  bucketDirectory?: string;
  /**
   * 附件存储编码
   */
  storageCode?: string;
  /**
   * 附件数量
   */
  attachmentCount?: number;
  /**
   * 附件模板
   */
  template?: AttachmentValue;
  /**
   * 附件上传属性名
   */
  fileKey?: string;
  /**
   * 附件大小限制
   */
  fileSize?: number;
  /**
   * 附件开启分片上传
   */
  useChunk?: boolean;
  /**
   * 附件分片大小
   */
  chunkSize?: number;
  /**
   * 附件分片上传并发数
   */
  chunkThreads?: number;
  /**
   * 值变化前，拦截并返回新的值
   */
  processValue?: (value: any, range?: 0 | 1) => any;
  dateMode?: DateMode;
  /**
   *  Attachment 可接受的上传文件类型
   */
  accept?: string[] | undefined;
  /**
   * 占位词
   */
  placeholder?: string | string[];
  useLookupBatch?: (code: string, field?: Field) => boolean;
  useLovDefineBatch?: (code: string, field?: Field) => boolean;
  checkValueOnOptionsChange?: boolean,
};

const defaultProps: FieldProps = {
  type: FieldType.auto,
  required: false,
  readOnly: false,
  disabled: false,
  group: false,
  textField: defaultTextField,
  valueField: defaultValueField,
  trueValue: true,
  falseValue: false,
  trim: FieldTrim.both,
  checkValueOnOptionsChange: true,
};

export default class Field {
  static defaultProps = defaultProps;

  dataSet: DataSet;

  record?: Record | undefined;

  @observable lookupToken?: string | undefined;

  lastDynamicProps?: { [key: string]: any } | undefined;

  dynamicPropsComputingChains?: string[] | undefined;

  computedProps?: Map<string | symbol, IComputedValue<any>> | undefined;

  computedOptions?: IComputedValue<DataSet | undefined> | undefined;

  @observable props: ObservableMap<string, any>;

  @observable dirtyProps?: Partial<FieldProps> | undefined;

  @observable searchPara?: object;

  get attachments(): AttachmentFile[] | undefined {
    return this.getAttachments();
  }

  set attachments(attachments: AttachmentFile[] | undefined) {
    this.setAttachments(attachments);
  }

  get attachmentCount(): number | undefined {
    return this.getAttachmentCount();
  }

  set attachmentCount(count: number | undefined) {
    this.setAttachmentCount(count);
  }

  get pristineProps(): FieldProps {
    return {
      ...this.props.toPOJO(),
      ...this.dirtyProps,
    };
  }

  set pristineProps(props: FieldProps) {
    runInAction(() => {
      const { dirtyProps } = this;
      if (dirtyProps) {
        const newProps = {};
        const dirtyKeys = Object.keys(dirtyProps);
        if (dirtyKeys.length) {
          dirtyKeys.forEach((key) => {
            const item = this.props.get(key);
            newProps[key] = item;
            if (isSame(item, props[key])) {
              delete dirtyProps[key];
            } else {
              dirtyProps[key] = props[key];
            }
          });
        }
        this.props.replace({
          ...props,
          ...newProps,
        });
      } else {
        this.props.replace(props);
      }
    });
  }

  get lookup(): object[] | undefined {
    return this.getLookup();
  }

  get options(): DataSet | undefined {
    return this.getOptions();
  }

  get dirty(): boolean {
    return this.isDirty();
  }

  get name(): string {
    return this.props.get('name');
  }

  get order(): string | undefined {
    return this.get('order');
  }

  set order(order: string | undefined) {
    this.set('order', order);
  }

  get valid(): boolean {
    return this.isValid();
  }

  get validationMessage() {
    return this.getValidationMessage();
  }

  private hasLookupSideEffects: boolean | undefined;

  private hasLovSideEffects: boolean | undefined;

  constructor(props: FieldProps = {}, dataSet: DataSet, record?: Record | undefined) {
    runInAction(() => {
      this.dataSet = dataSet;
      this.record = record;
      this.props = observable.map(props);
      if (!props.options) {
        const { dynamicProps, computedProps } = props;
        if (typeof dynamicProps === 'function') {
          this.hasLookupSideEffects = true;
          this.hasLovSideEffects = true;
        } else {
          const keys = Object.keys({ ...computedProps, ...dynamicProps });
          if (keys.length) {
            this.hasLookupSideEffects = keys.some(key => LOOKUP_SIDE_EFFECT_KEYS.includes(key));
            this.hasLovSideEffects = keys.some(key => LOV_SIDE_EFFECT_KEYS.includes(key));
          }
        }
        if (record) {
          const dsField = dataSet.getField(props.name);
          if (dsField) {
            if (!this.hasLookupSideEffects) {
              this.hasLookupSideEffects = dsField.hasLookupSideEffects;
            }
            if (!this.hasLovSideEffects) {
              this.hasLovSideEffects = dsField.hasLovSideEffects;
            }
          }
          this.processForLookupAndLovConfig(record);
        } else {
          raf(() => {
            this.fetchLookup();
            this.fetchLovConfig();
          });
        }
      }
    });
  }

  processForLookupAndLovConfig(record: Record) {
    const { hasLovSideEffects, hasLookupSideEffects } = this;
    if (hasLovSideEffects || hasLookupSideEffects) {
      raf(() => {
        if (hasLookupSideEffects) {
          this.fetchLookup(undefined, record);
        }
        if (hasLovSideEffects) {
          this.fetchLovConfig(record);
        }
      });
    }
  }

  isDirty(record: Record | undefined = this.record): boolean {
    if (record) {
      const { name } = this;
      const { dirtyData } = record;
      if (dirtyData && dirtyData.size) {
        const chainFieldName = getChainFieldName(record, name);
        if (dirtyData.has(chainFieldName) || iteratorSome(dirtyData.keys(), (key) => chainFieldName.startsWith(`${key}.`))) {
          return true;
        }
        if (this.get('type', record) === FieldType.intl) {
          const tlsKey = this.dataSet.getConfig('tlsKey');
          if (record.get(tlsKey) && Object.keys(localeContext.supports).some(lang => dirtyData.has(getChainFieldName(record, `${tlsKey}.${name}.${lang}`)))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * 获取所有属性
   * @return 属性对象
   */
  getProps(record: Record | undefined = this.record): FieldProps & { [key: string]: any } {
    const dsField = this.findDataSetField();
    const lovCode = this.get('lovCode', record);
    return merge(
      { lookupUrl: this.dataSet.getConfig('lookupUrl') },
      defaultProps,
      getPropsFromLovConfig(lovCode, ['textField', 'valueField']),
      dsField && dsField.props.toPOJO(),
      this.props.toPOJO(),
    );
  }

  /**
   * 根据属性名获取属性值
   * @param propsName 属性名
   * @return {any}
   */
  get(propsName: string, record: Record | undefined = this.record): any {
    const prop = this.getProp(propsName, record);
    if (prop !== undefined) {
      return prop;
    }
    return defaultProps[propsName];
  }

  private getProp(propsName: string, record: Record | undefined = this.record): any {
    if (record && !this.record) {
      const recordField = record.ownerFields.get(this.name);
      if (recordField) {
        const recordProp = recordField.getProp(propsName);
        if (recordProp !== undefined) {
          return recordProp;
        }
      }
    }
    if (!['computedProps', 'dynamicProps'].includes(propsName)) {
      const computedPropsMap = record ?
        getIf<Record, Map<string | symbol, IComputedValue<any>>>(record, 'computedFieldProps', () => new Map()) :
        getIf<Field, Map<string | symbol, IComputedValue<any>>>(this, 'computedProps', () => new Map());
      const computedKey = `__${this.name}$${propsName}__`;
      const computedProp = computedPropsMap.get(computedKey);
      if (computedProp) {
        const computedValue = computedProp.get();
        if (computedValue !== undefined) {
          return computedValue;
        }
      } else {
        const computedProps = this.get('computedProps', record);
        if (computedProps) {
          const newComputedProp = computed(() => {
            const computProp = computedProps[propsName];
            if (typeof computProp === 'function') {
              const prop = this.executeDynamicProps(computProp, propsName, record);
              if (prop !== undefined) {
                this.checkDynamicProp(propsName, prop, record);
                return prop;
              }
            }
          }, { name: computedKey, context: record || this });
          computedPropsMap.set(computedKey, newComputedProp);
          const computedValue = newComputedProp.get();
          if (computedValue !== undefined) {
            return computedValue;
          }
        }
      }
      const dynamicProps = this.get('dynamicProps', record);
      if (dynamicProps) {
        if (typeof dynamicProps === 'function') {
          warning(
            false,
            ` The dynamicProps hook will be deprecated. Please use dynamicProps map.
              For e.g,
              Bad case:
              dynamicProps({ record }) {
                return {
                  bind: record.get('xx'),
                  label: record.get('yy'),
                }
              }
              Good case:
              dynamicProps = {
                bind({ record }) {
                  return record.get('xx')
                },
                label({ record }) {
                  return record.get('yy'),
                }
              }`,
          );
          const props = this.executeDynamicProps(dynamicProps, propsName, record);
          if (props && propsName in props) {
            const prop = props[propsName];
            this.checkDynamicProp(propsName, prop, record);
            return prop;
          }
        } else {
          const dynamicProp = dynamicProps[propsName];
          if (typeof dynamicProp === 'function') {
            const prop = this.executeDynamicProps(dynamicProp, propsName, record);
            if (prop !== undefined) {
              this.checkDynamicProp(propsName, prop, record);
              return prop;
            }
          }
        }
        this.checkDynamicProp(propsName, undefined, record);
      }
    }
    const value = this.props.get(propsName);
    if (value !== undefined) {
      return value;
    }
    if (propsName === 'lookup') {
      const { dataSet } = this;
      const lookupToken = getLookupToken(this, record);
      const { lookupCaches } = dataSet;
      if (lookupToken && lookupCaches) {
        const lookup = lookupCaches.get(lookupToken);
        if (lookup) {
          const { items } = lookup;
          if (items) {
            return items;
          }
        }
        return undefined;
      }
    }
    const dsField = this.findDataSetField();
    if (dsField) {
      const dsValue = dsField.getProp(propsName);
      if (dsValue !== undefined) {
        return dsValue;
      }
    }
    if (propsName === 'textField' || propsName === 'valueField') {
      const lovCode = this.get('lovCode', record);
      const lovProp = getPropsFromLovConfig(lovCode, [propsName])[propsName];
      if (lovProp) {
        return lovProp;
      }
    }
    if (propsName === 'lookupUrl') {
      return this.dataSet.getConfig('lookupUrl');
    }
    if (['min', 'max', 'maxExcl', 'minExcl'].includes(propsName)) {
      if (this.get('type', record) === FieldType.number) {
        if (propsName === 'max' || propsName === 'maxExcl') {
          return Infinity;
        }
        return -Infinity;
      }
    }
    return undefined;
  }

  /**
   * 设置属性值
   * @param propsName 属性名
   * @param value 属性值
   * @return {any}
   */
  @action
  set(propsName: string, value: any): Field {
    const { record, name } = this;
    if (record) {
      const recordField = record.ownerFields.get(name);
      if (recordField) {
        if (recordField !== this) {
          recordField.set(propsName, value);
          return recordField;
        }
      } else {
        record.ownerFields.set(name, this);
      }
    }
    const oldValue = this.get(propsName);
    if (!isEqualDynamicProps(toJS(oldValue), value)) {
      const dirtyProps = getIf<Field, Partial<FieldProps>>(this, 'dirtyProps', {});
      if (!(propsName in dirtyProps)) {
        set(dirtyProps, propsName, oldValue);
      } else if (isSame(toJS(dirtyProps[propsName]), value)) {
        remove(dirtyProps, propsName);
      }
      this.props.set(propsName, value);
      const { dataSet } = this;
      dataSet.fireEvent(DataSetEvents.fieldChange, {
        dataSet,
        record,
        name,
        field: this,
        propsName,
        value,
        oldValue,
      });
      this.handlePropChange(propsName, value, oldValue, record);
      if (!record) {
        dataSet.forEach((r) => {
          const recordField = r.ownerFields.get(name);
          if (!recordField || !recordField.props.has(propsName)) {
            this.handlePropChange(propsName, value, oldValue, r);
          }
        });
      }
    }

    return this;
  }

  @action
  replace(props: Partial<FieldProps> = {}): Field {
    const p = { ...props };
    this.props.forEach((_v, key) => {
      if (![LOOKUP_DATA, 'name'].includes(key)) {
        this.set(key, props[key]);
      }
      delete p[key];
    });
    return this.merge(p);
  }

  @action
  merge(props: Partial<FieldProps>): Field {
    Object.keys(props).forEach((key) => {
      if (key !== 'name') {
        this.set(key, props[key]);
      }
    });
    return this;
  }

  getLookup(record: Record | undefined = this.record): object[] | undefined {
    const lookupToken = getLookupToken(this, record);
    const { lookupCaches } = this.dataSet;
    if (lookupToken && lookupCaches) {
      const lookup = lookupCaches.get(lookupToken);
      if (lookup) {
        const { items } = lookup;
        if (items) {
          return combineWithOldLookupData(items, this, record);
        }
      }
    }
  }

  /**
   * 根据lookup值获取lookup对象
   * @param value lookup值
   * @return {object}
   */
  getLookupData(value?: any, record: Record | undefined = this.record): object {
    value = value === undefined ? this.getValue(record) : value;
    const valueField = this.get('valueField', record);
    const data = {};
    const lookup = this.getLookup(record);
    if (lookup) {
      return lookup.find(obj => isSameLike(get(obj, valueField), value)) || data;
    }
    return data;
  }

  getValue(record: Record | undefined = this.record): any {
    const r = record || this.dataSet.current;
    if (r) {
      return r.get(this.name);
    }
  }

  /**
   * 可以根据lookup值获取含义
   * @param value lookup值
   * @param boolean showValueIfNotFound
   * @return {string}
   */
  getLookupText(value?: any, showValueIfNotFound?: boolean, record: Record | undefined = this.record): string | undefined {
    value = value === undefined ? this.getValue(record) : value;
    const textField = this.get('textField', record);
    const valueField = this.get('valueField', record);
    const lookup = this.getLookup(record);
    if (lookup) {
      const optionsProps = this.get('optionsProps', record);
      let found: object | undefined;
      if (optionsProps && optionsProps.childrenField) {
        found = treeFind(
          lookup,
          (node) => isSameLike(get(node, valueField), value),
          optionsProps.childrenField,
        );
      } else {
        found = lookup.find(obj => isSameLike(get(obj, valueField), value));
      }
      if (found) {
        return get(found, textField);
      }
      if (showValueIfNotFound) {
        return value;
      }
      return undefined;
    }
  }

  /**
   * 可以根据options值获取含义
   * @param value opions值
   * @param boolean showValueIfNotFound
   * @return {string}
   */
  getOptionsText(value?: any, showValueIfNotFound?: boolean, record: Record | undefined = this.record): string | undefined {
    value = value === undefined ? this.getValue(record) : value;
    const textField = this.get('textField', record);
    const valueField = this.get('valueField', record);
    const options = this.getOptions(record);
    if (options) {
      const found = options.find(item => isSameLike(item.get(valueField), value));
      if (found) {
        return found.get(textField);
      }
      if (showValueIfNotFound) {
        return value;
      }
      return undefined;
    }
  }

  /**
   * 根据lookup值获取lookup含义
   * @param value lookup值
   * @param boolean showValueIfNotFound
   * @return {string}
   */
  getText(value?: any, showValueIfNotFound?: boolean, record: Record | undefined = this.record): string | undefined {
    value = value === undefined ? this.getValue(record) : value;
    const lookup = this.getLookup(record);
    const options = this.get('options', record);
    const isSelect = this.get('lookupCode', record) ||
    isString(this.get('lookupUrl', record)) ||
    (this.type !== FieldType.object && (this.get('lovCode', record) || lookup ||options));

    if (lookup && !isObject(value)) {
      return this.getLookupText(value, showValueIfNotFound, record);
    }
    const textField = this.get('textField', record);
    if (options) {
      const valueField = this.get('valueField', record);
      const found = options.find(item => isSameLike(item.get(valueField), value));
      if (found) {
        return found.get(textField);
      }
    }
    if (textField && isObject(value)) {
      if (isObservableObject(value)) {
        return get(value, textField);
      }
      return value[textField];
    }
    const showValueIfNotFoundConfig = showValueIfNotFound !== undefined ? showValueIfNotFound : this.dataSet.getConfig('showValueIfNotFound');
    const showValue = this.dataSet.getConfig('showSelectLoading') && isSelect && !lookup ? '_loading_' : value;
    return showValueIfNotFoundConfig ? showValue : undefined;
  }

  setOptions(options: DataSet): void {
    this.set('options', options);
  }

  getOptions(record: Record | undefined = this.record): DataSet | undefined {
    const options = this.get('options', record);
    if (options) {
      return options;
    }
    const { name } = this;
    const computedOptionsMap: Map<string, IComputedValue<DataSet | undefined>> | undefined = record ? getIf<Record, Map<string, IComputedValue<DataSet | undefined>>>(record, 'computedFieldOptions', () => new Map()) : undefined;
    const computedOptions: IComputedValue<DataSet | undefined> | undefined = computedOptionsMap ? computedOptionsMap.get(name) :
      this.computedOptions;
    if (computedOptions) {
      return computedOptions.get();
    }
    const newComputedOptions = computed<DataSet | undefined>(() => {
      const optionsProps = this.get('optionsProps', record);
      const lovCode = this.get('lovCode', record);
      if (lovCode) {
        const type = this.get('type', record);
        if (type === FieldType.object || type === FieldType.auto) {
          return lovCodeStore.getLovDataSet(lovCode, this, optionsProps, record);
        }
      }
      // 确保 lookup 相关配置介入观察
      lookupStore.getAxiosConfig(this, record);
      const lookupToken = getLookupToken(this, record);
      if (lookupToken) {
        const { lookupCaches } = this.dataSet;
        if (lookupCaches) {
          const lookup = lookupCaches.get(lookupToken);
          if (lookup) {
            const { items, promise } = lookup;
            if (items) {
              const parentField = this.get('parentField', record);
              const idField = this.get('idField', record) || this.get('valueField', record);
              const selection = this.get('multiple', record) ? DataSetSelection.multiple : DataSetSelection.single;
              const props = {
                data: combineWithOldLookupData(items, this, record),
                paging: false,
                selection,
                idField,
                parentField,
                status: promise ? DataSetStatus.loading : DataSetStatus.ready,
              };
              return new DataSet(mergeDataSetProps(props, optionsProps), this.dataSet.context);
            }
            if (promise) {
              return new DataSet({ status: DataSetStatus.loading }, this.dataSet.context);
            }
          }
        }
      }
      return undefined;
    });
    if (computedOptionsMap) {
      computedOptionsMap.set(name, newComputedOptions);
    } else {
      this.computedOptions = newComputedOptions;
    }
    return newComputedOptions.get();
  }

  /**
   * 重置设置的属性
   */
  @action
  reset(): void {
    const { dirtyProps } = this;
    if (dirtyProps) {
      this.props.merge(dirtyProps);
      this.dirtyProps = undefined;
    }
  }

  @action
  commit(record: Record | undefined = this.record): void {
    if (record) {
      record.clearValidationError(this.name);
    }
  }

  /**
   * 是否必选
   * @return true | false
   */
  get required(): boolean {
    return this.get('required');
  }

  /**
   * 设置是否必选
   * @param required 是否必选
   */
  set required(required: boolean) {
    this.set('required', required);
  }

  /**
   * 是否只读
   * @return true | false
   */
  get readOnly(): boolean {
    return this.get('readOnly');
  }

  /**
   * 设置是否只读
   * @param readOnly 是否只读
   */
  set readOnly(readOnly: boolean) {
    this.set('readOnly', readOnly);
  }

  /**
   * 是否禁用
   * @return true | false
   */
  get disabled(): boolean {
    return this.get('disabled');
  }

  /**
   * 设置是否禁用
   * @param disabled 是否禁用
   */
  set disabled(disabled: boolean) {
    this.set('disabled', disabled);
  }

  /**
   * 获取字段类型
   * @return 获取字段类型
   */
  get type(): FieldType {
    return this.get('type');
  }

  /**
   * 设置字段类型
   * @param type 字段类型
   */
  set type(type: FieldType) {
    this.set('type', type);
  }

  /**
   * 设置Lov的查询参数
   * @param {String} name
   * @param {Object} value
   */
  @action
  setLovPara(name: string, value: any, record: Record | undefined = this.record) {
    const isComputedLovPara = this.get('computedProps')?.lovPara;
    const p = isComputedLovPara ? cloneDeep(toJS(this.get('lovPara', record))) : toJS(this.get('lovPara', record)) || {};
    if (value === null) {
      delete p[name];
      this.searchPara = undefined;
    } else {
      p[name] = value;
      this.searchPara = { [name]: value };
    }
    this.set('lovPara', p);
  }


  getValidatorPropGetter(record: Record | undefined = this.record): <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T] {
    return (key) => {
      if (record) {
        switch (key) {
          case 'attachmentCount': {
            const attachments = this.getAttachments(record);
            const validAttachments = attachments && attachments.filter(({ status }) => !status || ['success', 'done'].includes(status));
            return validAttachments ? validAttachments.length : this.getAttachmentCount(record);
          }
          case 'max':
          case 'min':
          case 'maxExcl':
          case 'minExcl':
            return getLimit(this.get(key, record), record, key, this.get('type', record));
          case 'minLength':
          case 'maxLength':
            return getBaseType(this.get('type', record)) !== FieldType.string ? undefined : this.get(key, record);
          case 'format':
            return this.get('format', record) || getDateFormatByField(this, this.get('type', record), record);
          case 'nonStrictStep': {
            const nonStrictStep = this.get('nonStrictStep', record);
            if (nonStrictStep === undefined) {
              return this.dataSet.getConfig('numberFieldNonStrictStep');
            }
            return nonStrictStep;
          }
          case 'customValidator':
            return this.get('validator', record);
          case 'defaultValidationMessages':
            return {
              ...this.dataSet.getConfig('defaultValidationMessages'),
              ...this.get('defaultValidationMessages', record),
            };
          default:
            return this.get(key, record);
        }
      }
    };
  }

  /**
   * 校验字段值
   * 只有通过record.getField()获取的field才能校验
   * @return true | false
   */
  @action
  async checkValidity(record: Record | undefined = this.record): Promise<boolean> {
    if (record) {
      const { name } = this;
      const { valid, validationResults } = await Validator.checkValidity(record.get(name), {
        dataSet: record.dataSet,
        name,
        record,
      }, this.getValidatorPropGetter(record));
      record.setValidationError(name, validationResults);
      if (!record.validating) {
        record.reportValidity({
          field: this,
          errors: validationResults,
          valid,
        }, true);
      }
      return valid;
    }
    return true;
  }

  /**
   * 请求lookup值, 如有缓存值直接获得。
   * @param noCache default: undefined
   * @return Promise<object[]>
   */
  @action
  fetchLookup(noCache = false, record: Record | undefined = this.record): Promise<object[] | undefined> {
    const lookupCaches = getIf<DataSet, ObservableMap<string, LookupCache>>(this.dataSet, 'lookupCaches', () => observable.map());
    const oldToken = getLookupToken(this, record);
    const batch = this.get('lookupBatchAxiosConfig', record) || this.dataSet.getConfig('lookupBatchAxiosConfig');
    const lookupCode = this.get('lookupCode', record);
    const lookupAxiosConfig = this.get('lookupAxiosConfig', record);
    const useLookupBatchFunc = this.get('useLookupBatch', record) || this.dataSet.getConfig('useLookupBatch');
    const useLookupBatch = lookupCode && useLookupBatchFunc(lookupCode, this) !== false;
    let promise;
    if (batch && lookupCode && !lookupAxiosConfig && Object.keys(getLovPara(this, record)).length === 0 && useLookupBatch && !noCache) {
      const cachedLookup = getIfForMap<ObservableMap<string, LookupCache>, LookupCache>(lookupCaches, lookupCode, () => new LookupCache());
      if (lookupCode !== oldToken) {
        setLookupToken(this, lookupCode, record);
      }
      const { items } = cachedLookup;
      if (items) {
        promise = Promise.resolve<object[] | undefined>(items);
      } else {
        promise = cachedLookup.promise;
      }
      if (!promise) {
        promise = lookupStore.fetchLookupDataInBatch(lookupCode, batch).then(action((result: object[]) => {
          if (result) {
            cachedLookup.items = result;
            cachedLookup.promise = undefined;
          }
          return result;
        }));
        cachedLookup.promise = promise;
      }
    } else {
      const axiosConfig = lookupStore.getAxiosConfig(this, record, noCache);
      if (this.searchPara) {
        if (axiosConfig.params) {
          Object.keys(this.searchPara).forEach((key) => {
            // 计算或动态属性设置了 lovPara 会导致 searchable 搜索参数丢失
            if (!axiosConfig.params[key]) {
              axiosConfig.params[key] = this.searchPara![key];
            }
          });
        } else {
          axiosConfig.params = this.searchPara;
        }
      }
      if (axiosConfig.url) {
        const lookupToken = buildURLWithAxiosConfig(axiosConfig);
        if (lookupToken !== oldToken) {
          setLookupToken(this, lookupToken, record);
        }
        const cachedLookup = getIfForMap<ObservableMap<string, LookupCache>, LookupCache>(lookupCaches, lookupToken, () => new LookupCache());
        if (!noCache) {
          const { items } = cachedLookup;
          if (items) {
            promise = Promise.resolve<object[] | undefined>(items);
          } else {
            promise = cachedLookup.promise;
          }
        }
        if (!promise) {
          promise = lookupStore.fetchLookupData(axiosConfig, undefined, this).then(action((result: object[]) => {
            if (result) {
              cachedLookup.items = result;
              cachedLookup.promise = undefined;
            }
            return result;
          }));
          cachedLookup.promise = promise;
        }
      } else {
        setLookupToken(this, undefined, record);
      }
    }
    if (promise) {
      return promise.then(action((result) => {
        const lookup = oldToken ? lookupCaches.get(oldToken) : undefined;
        if (lookup) {
          const { items } = lookup;
          if (items && oldToken !== getLookupToken(this, record)) {
            const value = this.getValue(record);
            const valueField = this.get('valueField', record);
            if (value && valueField) {
              const values = this.get('multiple', record) ? [].concat(...value) : [].concat(value);
              this.set(
                LOOKUP_DATA,
                values.reduce<object[]>((lookupData, v) => {
                  const found = items.find(item => isSameLike(item[valueField], v));
                  if (found) {
                    lookupData.push(found);
                  }
                  return lookupData;
                }, []),
              );
            }
          }
        }
        return toJS(result);
      }));
    }
    return Promise.resolve(undefined);
  }

  fetchLovConfig(record: Record | undefined = this.record) {
    const lovCode = this.get('lovCode', record);
    if (lovCode) {
      lovCodeStore.fetchConfig(lovCode, this, record);
    }
  }

  fetchAttachments(props: { bucketName?: string, bucketDirectory?: string, storageCode?: string, attachmentUUID: string, isPublic?: boolean }, record: Record | undefined = this.record) {
    const { bucketName, bucketDirectory, attachmentUUID, storageCode, isPublic } = props;
    const { fetchList } = this.dataSet.getConfig('attachment');
    if (fetchList) {
      fetchList({ bucketName, bucketDirectory, attachmentUUID, storageCode, isPublic }).then(action((results: FileLike[]) => {
        this.setAttachments(results.map(file => new AttachmentFile(file)), record, undefined);
      })).finally(() => {
        if (this.isDirty(record)) {
          this.checkValidity(record);
        }
      });
    }
  }

  fetchAttachmentCount(uuid: string, isPublic?: boolean, record: Record | undefined = this.record) {
    const { batchFetchCount } = this.dataSet.getConfig('attachment');
    if (batchFetchCount && !this.attachments) {
      attachmentStore.fetchCountInBatch({
        attachmentUUID: uuid,
        bucketName: this.get('bucketName', record),
        bucketDirectory: this.get('bucketDirectory', record),
        storageCode: this.get('storageCode', record),
        isPublic,
      }, this).then((count) => {
        this.setAttachmentCount(count, record);
      }).finally(() => {
        if (this.isDirty(record)) {
          this.checkValidity(record);
        }
      });
    }
  }

  isValid(record: Record | undefined = this.record): boolean {
    if (record) {
      const results = this.getValidationErrorValues(record);
      return !results || !results.length;
    }
    return true;
  }

  getValidationMessage(record: Record | undefined = this.record): ReactNode {
    if (record) {
      const results = this.getValidationErrorValues(record);
      if (results && results.length) {
        return results[0].validationMessage;
      }
    }
    return undefined;
  }

  getValidationErrorValues(record: Record | undefined = this.record): ValidationResult[] {
    if (record) {
      const errors = record.getValidationError(this.name);
      if (errors && errors.length) {
        return errors;
      }
      const unique = this.get('unique', record);
      if (isString(unique)) {
        const { validationErrors } = record;
        if (validationErrors) {
          const uniqueErrors = iteratorFind(validationErrors.values(), (errors) => errors.some(error => error.ruleName === 'uniqueError' && error.validationProps.unique === unique));
          if (uniqueErrors) {
            return uniqueErrors;
          }
        }
      }
    }
    return [];
  }

  @action
  setAttachments(attachments: AttachmentFile[] | undefined, record: Record | undefined = this.record, uuid?: string | undefined) {
    if (record) {
      const value = uuid || record.get(this.name);
      if (value) {
        const attachmentCaches = getIf<Record, ObservableMap<string, AttachmentCache>>(record, 'attachmentCaches', () => observable.map());
        const cache = attachmentCaches.get(value);
        if (cache) {
          set(cache, 'attachments', attachments);
        } else {
          attachmentCaches.set(value, { attachments });
        }
      }
    } else {
      this.set('attachments', attachments);
    }
  }

  getAttachments(record: Record | undefined = this.record, uuid?: string | undefined) {
    if (record) {
      const value = uuid || record.get(this.name);
      if (value) {
        const { attachmentCaches } = record;
        if (attachmentCaches) {
          const cache = attachmentCaches.get(value);
          if (cache) {
            return get(cache, 'attachments');
          }
        }
      }
    } else {
      return this.get('attachments');
    }
    return undefined;
  }

  @action
  setAttachmentCount(count: number | undefined, record: Record | undefined = this.record) {
    if (record) {
      const uuid = record.get(this.name);
      if (uuid) {
        const attachmentCaches = getIf<Record, ObservableMap<string, AttachmentCache>>(record, 'attachmentCaches', () => observable.map());
        const cache = attachmentCaches.get(uuid);
        if (cache) {
          set(cache, 'count', count);
        } else {
          attachmentCaches.set(uuid, { count });
        }
      }
    } else {
      this.set('attachmentCount', count);
    }
  }

  getAttachmentCount(record: Record | undefined = this.record) {
    const attachments = this.getAttachments(record);
    if (attachments) {
      return attachments.length;
    }
    if (record) {
      const uuid = record.get(this.name);
      if (uuid) {
        const { attachmentCaches } = record;
        if (attachmentCaches) {
          const cache = attachmentCaches.get(uuid);
          if (cache) {
            return get(cache, 'count');
          }
        }
      }
    } else {
      return this.get('attachmentCount');
    }
    return undefined;
  }

  ready(): Promise<any> {
    return Promise.resolve(true);
  }

  private checkDynamicProp(propsName: string, newProp, record: Record | undefined = this.record) {
    const { name } = this;
    const lastDynamicProps = record ? (() => {
      const lastDynamicFieldProps = getIf<Record, Map<string, { [key: string]: any } | undefined>>(record, 'lastDynamicFieldProps', () => new Map());
      let last = lastDynamicFieldProps.get(name);
      if (!last) {
        last = {};
        lastDynamicFieldProps.set(name, last);
      }
      return last;
    })() : getIf<Field, { [key: string]: any }>(this, 'lastDynamicProps', {});
    const oldProp = lastDynamicProps[propsName];
    if (!isEqualDynamicProps(oldProp, newProp)) {
      raf(action(() => {
        if (record && oldProp !== undefined) {
          const { name } = this;
          const errors = record.getValidationError(name);
          if (errors) {
            if (propsName === 'validator') {
              record.clearValidationError(name);
            } else if (!['label', 'defaultValidationMessages'].includes(propsName)) {
              errors.some(error => {
                const { validationProps } = error;
                if (validationProps && Object.keys(validationProps).includes(propsName)) {
                  record.clearValidationError(name);
                  return true;
                }
                return false;
              });
            }
          }
        }
        this.handlePropChange(propsName, newProp, oldProp, record);
      }));
    }
    lastDynamicProps[propsName] = newProp;
  }

  private handlePropChange(propsName, newProp, oldProp, record: Record | undefined = this.record) {
    if (propsName === 'bind' && this.get('type', record) !== FieldType.intl) {
      if (record && !this.isDirty(record)) {
        if (newProp && oldProp) {
          record.init(newProp, record.get(oldProp));
        }
        if (oldProp) {
          record.init(oldProp, undefined);
        }
      }
      return;
    }
    if (
      LOOKUP_SIDE_EFFECT_KEYS.includes(propsName) ||
      (
        ['dynamicProps', 'computedProps'].includes(propsName) &&
        (
          typeof newProp === 'function' || typeof oldProp === 'function' ||
          (newProp && Object.keys(newProp).some(key => LOOKUP_SIDE_EFFECT_KEYS.includes(key))) ||
          (oldProp && Object.keys(oldProp).some(key => LOOKUP_SIDE_EFFECT_KEYS.includes(key)))
        )
      )
    ) {
      const noCache = this.get('noCache', record);
      this.set(LOOKUP_DATA, undefined);
      this.fetchLookup(noCache, record);
    }
    if (
      LOV_SIDE_EFFECT_KEYS.includes(propsName) ||
      (
        ['dynamicProps', 'computedProps'].includes(propsName) &&
        (
          typeof newProp === 'function' || typeof oldProp === 'function' ||
          (newProp && Object.keys(newProp).some(key => LOV_SIDE_EFFECT_KEYS.includes(key))) ||
          (oldProp && Object.keys(oldProp).some(key => LOV_SIDE_EFFECT_KEYS.includes(key)))
        )
      )
    ) {
      this.fetchLovConfig(record);
    }
  }

  private executeDynamicProps(dynamicProps: (DynamicPropsArguments) => any, propsName: string, record: Record | undefined = this.record) {
    const { dataSet, name } = this;
    const dynamicPropsComputingChains = getIf<Field, string[]>(this, 'dynamicPropsComputingChains', []);
    if (dynamicPropsComputingChains.includes(propsName)) {
      warning(false, `Cycle dynamicProps execution of field<${name}>. [${dynamicPropsComputingChains.join(' -> ')} -> ${propsName}]`);
    } else {
      dynamicPropsComputingChains.push(propsName);
      try {
        return dynamicProps({ dataSet, record, name });
      } catch (e) {
        if (record) {
          throw e;
        }
        if (process.env.NODE_ENV !== 'production') {
          console.warn(e);
        }
      } finally {
        dynamicPropsComputingChains.pop();
      }
    }
  }

  private findDataSetField(): Field | undefined {
    const { dataSet, name, record } = this;
    if (record && dataSet && name) {
      return dataSet.getField(name);
    }
  }
}
