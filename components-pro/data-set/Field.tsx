import { CSSProperties, ReactNode } from 'react';
import {
  action,
  computed,
  get,
  IComputedValue,
  isArrayLike,
  isObservableObject,
  observable,
  ObservableMap,
  remove,
  runInAction,
  set,
  toJS,
} from 'mobx';
import { MomentInput } from 'moment';
import raf from 'raf';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet, { DataSetProps } from './DataSet';
import Record from './Record';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import { CheckedStrategy, DataSetEvents, DataSetSelection, FieldFormat, FieldIgnore, FieldTrim, FieldType, SortOrder } from './enum';
import lookupStore from '../stores/LookupCodeStore';
import lovCodeStore from '../stores/LovCodeStore';
import attachmentStore from '../stores/AttachmentStore';
import localeContext from '../locale-context';
import { defaultTextField, defaultValueField, getBaseType, getChainFieldName, getIf, getLimit } from './utils';
import Validity from '../validator/Validity';
import ValidationResult from '../validator/ValidationResult';
import { ValidatorProps } from '../validator/rules';
import isSame from '../_util/isSame';
import { LovConfig } from '../lov/Lov';
import { TransportHookProps } from './Transport';
import isSameLike from '../_util/isSameLike';
import { buildURLWithAxiosConfig } from '../axios/utils';
import { getDateFormatByField } from '../field/utils';
import { getLovPara } from '../stores/utils';
import { TimeStep } from '../date-picker/DatePicker';
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from '../number-field/utils';
import AttachmentFile from './AttachmentFile';

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
      return lookupTokens.get(field.name);
    }
  }
  return field.lookupToken;
}

function setLookupToken(field: Field, token: string | undefined, record: Record | undefined) {
  if (record) {
    const lookupTokens = getIf<Record, ObservableMap<string, string | undefined>>(record, 'lookupTokens', () => observable.map());
    lookupTokens.set(field.name, token);
  } else {
    field.lookupToken = token;
  }
}

export type Fields = ObservableMap<string, Field>;
export type DynamicPropsArguments = { dataSet: DataSet; record: Record; name: string };
export type DynamicProps = { [P in keyof FieldProps]?: (DynamicPropsArguments) => FieldProps[P]; }
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
  step?: number | TimeStep;
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
   * 小数点精度
   */
  precision?: number;
  /**
   * 千分位分组显示
   */
  numberGrouping?: boolean;
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
  trueValue?: string | number | boolean;
  /**
   *  类型为boolean时，false对应的值
   */
  falseValue?: string | number | boolean;
  /**
   * 下拉框组件的菜单数据集
   */
  options?: DataSet | string;
  /**
   * 值集组件的数据集配置
   */
  optionsProps?: DataSetProps;
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
  lovDefineAxiosConfig?: AxiosRequestConfig | ((code: string) => AxiosRequestConfig);
  /**
   * LOV查询请求的钩子
   */
  lovQueryAxiosConfig?: AxiosRequestConfig | ((code: string, lovConfig?: LovConfig) => AxiosRequestConfig);
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
  help?: string;
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
   * 值变化前，拦截并返回新的值
   */
  processValue?: (value: any, range?: 0 | 1) => any;
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
};

export default class Field {
  static defaultProps = defaultProps;

  dataSet: DataSet;

  record?: Record | undefined;

  @observable validator?: Validator;

  @observable pending?: boolean;

  @observable lookupToken?: string | undefined;

  lastDynamicProps?: { [key: string]: any } | undefined;

  validatorPropKeys?: string[] | undefined;

  dynamicPropsComputingChains?: string[] | undefined;

  computedProps?: Map<string | symbol, IComputedValue<any>> | undefined;

  computedOptions?: IComputedValue<DataSet | undefined> | undefined;

  @observable props: ObservableMap<string, any>;

  @observable dirtyProps?: Partial<FieldProps> | undefined;

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
    return this.isDirty(this.record);
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

  constructor(props: FieldProps = {}, dataSet: DataSet, record?: Record | undefined) {
    runInAction(() => {
      this.dataSet = dataSet;
      this.record = record;
      this.props = observable.map(props);
      // 优化性能，没有动态属性时不用处理， 直接引用dsField； 有options时，也不处理
      if (!props.options) {
        const dynamicProps = this.getProp('dynamicProps', record);
        if (!record || typeof dynamicProps === 'function') {
          raf(() => {
            this.fetchLookup();
            this.fetchLovConfig();
          });
        } else {
          const computedProps = this.getProp('computedProps', record);
          if (computedProps || dynamicProps) {
            const keys = Object.keys({ ...computedProps, ...dynamicProps });
            if (keys.length) {
              const fetches: Function[] = [];
              if (keys.some(key => LOOKUP_SIDE_EFFECT_KEYS.includes(key))) {
                fetches.push(this.fetchLookup);
              }
              if (keys.some(key => LOV_SIDE_EFFECT_KEYS.includes(key))) {
                fetches.push(this.fetchLovConfig);
              }
              if (fetches.length) {
                raf(() => fetches.forEach(one => one.call(this)));
              }
            }
          }
        }
      }
    });
  }

  isDirty(record: Record | undefined = this.record): boolean {
    if (record) {
      const { name } = this;
      const { dirtyData } = record;
      if (dirtyData && dirtyData.size) {
        if (dirtyData.has(getChainFieldName(record, name))) {
          return true;
        }
        if (this.get('type', record) === FieldType.intl) {
          const tlsKey = getConfig('tlsKey');
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
      { lookupUrl: getConfig('lookupUrl') },
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
    const dsField = this.findDataSetField();
    if (dsField) {
      const dsValue = dsField.getProp(propsName);
      if (dsValue !== undefined) {
        return dsValue;
      }
    }
    if (propsName === 'lookup') {
      const { dataSet } = this;
      const lookupToken = getLookupToken(this, record);
      const { lookupCaches } = dataSet;
      if (lookupToken && lookupCaches) {
        return lookupCaches.get(lookupToken);
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
      return getConfig(propsName);
    }
    if (['min', 'max'].includes(propsName)) {
      if (this.get('type', record) === FieldType.number) {
        if (propsName === 'max') {
          return MAX_SAFE_INTEGER;
        }
        return MIN_SAFE_INTEGER;
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
      if (isArrayLike(lookup)) {
        const valueField = this.get('valueField', record);
        const lookupData = this.get(LOOKUP_DATA, record);
        if (lookupData) {
          const others = lookupData.filter((data) => lookup.every(item => item[valueField] !== data[valueField]));
          if (others.length) {
            return others.concat(lookup.slice());
          }
        }
        return lookup;
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
      const found = lookup.find(obj => isSameLike(get(obj, valueField), value));
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
    if (lookup && !isObject(value)) {
      return this.getLookupText(value, showValueIfNotFound, record);
    }
    const options = this.get('options', record);
    const textField = this.get('textField', record);
    if (options) {
      const valueField = this.get('valueField', record);
      const found = options.find(item => isSameLike(item.get(valueField), value));
      if (found) {
        return found.get(textField, record);
      }
    }
    if (textField && isObject(value)) {
      if (isObservableObject(value)) {
        return get(value, textField);
      }
      return value[textField];
    }
    return value;
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
      // 确保 lookup 相关配置介入观察
      lookupStore.getAxiosConfig(this, record);
      const optionsProps = this.get('optionsProps', record);
      const lookup = this.getLookup(record);
      const type = this.get('type', record);
      if (lookup) {
        const parentField = this.get('parentField', record);
        const idField = this.get('idField', record) || this.get('valueField', record);
        const selection = this.get('multiple', record) ? DataSetSelection.multiple : DataSetSelection.single;
        return new DataSet({
          data: lookup,
          paging: false,
          selection,
          idField,
          parentField,
          ...optionsProps,
        });
      }
      const lovCode = this.get('lovCode', record);
      if (lovCode) {
        if (type === FieldType.object || type === FieldType.auto) {
          return lovCodeStore.getLovDataSet(lovCode, this, optionsProps, record);
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
  commit(record?: Record | undefined): void {
    if (record) {
      const recordField = record.ownerFields.get(this.name);
      if (recordField) {
        recordField.commit();
      }
    } else {
      const { validator } = this;
      if (validator) {
        validator.reset();
      }
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
    const p = toJS(this.get('lovPara', record)) || {};
    if (value === null) {
      delete p[name];
    } else {
      p[name] = value;
    }
    this.set('lovPara', p);
  }

  getValidatorProps(record: Record | undefined = this.record): ValidatorProps | undefined {
    if (record) {
      const { dataSet, name } = this;
      const type = this.get('type', record);
      const baseType = getBaseType(type);
      const required = this.get('required', record);
      const customValidator = this.get('validator', record);
      const max = this.get('max', record);
      const min = this.get('min', record);
      const format = this.get('format', record) || getDateFormatByField(this, this.get('type', record), record);
      const pattern = this.get('pattern', record);
      const step = this.get('step', record);
      const nonStrictStep = this.get('nonStrictStep', record) === undefined ? getConfig('numberFieldNonStrictStep') : this.get('nonStrictStep', record);
      const minLength = baseType !== FieldType.string ? undefined : this.get('minLength', record);
      const maxLength = baseType !== FieldType.string ? undefined : this.get('maxLength', record);
      const label = this.get('label', record);
      const range = this.get('range', record);
      const multiple = this.get('multiple', record);
      const unique = this.get('unique', record);
      const defaultValidationMessages = this.get('defaultValidationMessages', record);
      const attachments = this.getAttachments(record);
      const validAttachments = attachments && attachments.filter(({ status }) => !status || ['success', 'done'].includes(status));
      const attachmentCount = validAttachments ? validAttachments.length : this.getAttachmentCount(record);
      const validatorProps = {
        type,
        required,
        record,
        dataSet,
        name,
        unique,
        customValidator,
        pattern,
        max: getLimit(max, record),
        min: getLimit(min, record),
        step,
        nonStrictStep,
        minLength,
        maxLength,
        label,
        range,
        multiple,
        format,
        attachmentCount,
        defaultValidationMessages,
      };
      if (!this.validatorPropKeys) {
        this.validatorPropKeys = Object.keys(omit(validatorProps, ['label', 'defaultValidationMessages']));
      }
      return validatorProps;
    }
  }

  /**
   * 校验字段值
   * 只有通过record.getField()获取的field才能校验
   * @return true | false
   */
  @action
  async checkValidity(report?: boolean, record: Record | undefined = this.record): Promise<boolean> {
    if (record) {
      const { name } = this;
      let recordField = record.ownerFields.get(name);
      if (!recordField) {
        recordField = this.record ? this : record.addField(name);
        record.ownerFields.set(name, recordField);
      }
      let { validator } = this;
      if (validator) {
        validator.reset();
      } else {
        validator = new Validator(recordField);
        recordField.validator = validator;
      }
      const value = record.get(name);
      const valid = await validator!.checkValidity(value);
      if (report && !record.validating) {
        record.reportValidity(valid);
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
    const lookup = this.getLookup(record);
    const lookupCaches = getIf<DataSet, ObservableMap<string, object[] | Promise<object[]>>>(this.dataSet, 'lookupCaches', () => observable.map());
    const oldToken = getLookupToken(this, record);
    const batch = this.get('lookupBatchAxiosConfig', record) || getConfig('lookupBatchAxiosConfig');
    const lookupCode = this.get('lookupCode', record);
    let promise;
    if (batch && lookupCode && Object.keys(getLovPara(this, record)).length === 0) {
      const cachedLookup = lookupCaches.get(lookupCode);
      if (lookupCode !== oldToken) {
        setLookupToken(this, lookupCode, record);
      }
      if (cachedLookup) {
        if (isArrayLike(cachedLookup)) {
          promise = Promise.resolve<object[] | undefined>(cachedLookup);
        } else {
          this.pending = true;
          promise = cachedLookup;
        }
      }
      if (!promise) {
        this.pending = true;
        promise = lookupStore.fetchLookupDataInBatch(lookupCode, batch).then(action((result) => {
          if (result) {
            lookupCaches.set(lookupCode, result);
          }
          return result;
        }));
        lookupCaches.set(lookupCode, promise);
      }
    } else {
      const axiosConfig = lookupStore.getAxiosConfig(this, record, noCache);
      if (axiosConfig.url) {
        const lookupToken = buildURLWithAxiosConfig(axiosConfig);
        if (lookupToken !== oldToken) {
          setLookupToken(this, lookupToken, record);
        }
        if (!noCache) {
          const cachedLookup = lookupCaches.get(lookupToken);
          if (cachedLookup) {
            if (isArrayLike(cachedLookup)) {
              promise = Promise.resolve<object[] | undefined>(cachedLookup);
            } else {
              this.pending = true;
              promise = cachedLookup;
            }
          }
        }
        if (!promise) {
          this.pending = true;
          promise = lookupStore.fetchLookupData(axiosConfig).then(action((result) => {
            if (result) {
              lookupCaches.set(lookupToken, result);
            }
            return result;
          }));
          lookupCaches.set(lookupToken, promise);
        }
      } else {
        setLookupToken(this, undefined, record);
      }
    }
    if (promise) {
      return promise.then(action((result) => {
        this.pending = false;
        if (lookup && oldToken !== getLookupToken(this, record)) {
          const value = this.getValue(record);
          const valueField = this.get('valueField', record);
          if (value && valueField) {
            const values = this.get('multiple', record) ? [].concat(...value) : [].concat(value);
            this.set(
              LOOKUP_DATA,
              values.reduce<object[]>((lookupData, v) => {
                const found = lookup.find(item => isSameLike(item[valueField], v));
                if (found) {
                  lookupData.push(found);
                }
                return lookupData;
              }, []),
            );
          }
        }
        return toJS(result);
      })).catch(action(e => {
        this.pending = false;
        throw e;
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

  fetchAttachments(props: { bucketName?: string, bucketDirectory?: string, storageCode?: string, attachmentUUID: string }, record: Record | undefined = this.record) {
    const { bucketName, bucketDirectory, attachmentUUID, storageCode } = props;
    const { fetchList } = getConfig('attachment');
    if (fetchList) {
      fetchList({ bucketName, bucketDirectory, attachmentUUID, storageCode }).then(action((results) => {
        this.setAttachments(results.map(file => new AttachmentFile(file)), record, undefined);
      }));
    }
  }

  fetchAttachmentCount(uuid: string, record: Record | undefined = this.record) {
    const { batchFetchCount } = getConfig('attachment');
    if (batchFetchCount && !this.attachments) {
      attachmentStore.fetchCountInBatch(uuid).then((count) => {
        this.setAttachmentCount(count, record);
      });
    }
  }

  isValid(record: Record | undefined = this.record): boolean {
    if (record) {
      const recordField = record.ownerFields.get(this.name);
      if (recordField) {
        const { validator } = recordField;
        if (validator) {
          return validator.validity.valid;
        }
      }
    }
    return true;
  }

  getValidationMessage(record: Record | undefined = this.record): ReactNode {
    if (record) {
      const recordField = record.ownerFields.get(this.name);
      if (recordField) {
        const { validator } = recordField;
        if (validator) {
          return validator.validationMessage;
        }
      }
    }
    return undefined;
  }

  getValidityState(record: Record | undefined = this.record): Validity | undefined {
    if (record) {
      const recordField = record.ownerFields.get(this.name);
      if (recordField) {
        const { validator } = recordField;
        return validator ? validator.validity : undefined;
      }
    }
    return undefined;
  }

  getValidationErrorValues(record: Record | undefined = this.record): ValidationResult[] {
    if (record) {
      const recordField = record.ownerFields.get(this.name);
      if (recordField) {
        const { validator } = recordField;
        if (validator) {
          return validator.validationResults;
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
        const cache = attachmentStore.get(value);
        if (cache) {
          set(cache, 'attachments', attachments);
        } else {
          attachmentStore.set(value, { attachments });
        }
      }
    } else {
      this.set('attachments', attachments);
    }
  }

  getAttachments(record: Record | undefined = this.record) {
    if (record) {
      const uuid = record.get(this.name);
      if (uuid) {
        return attachmentStore.getAttachments(uuid);
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
        const cache = attachmentStore.get(uuid);
        if (cache) {
          set(cache, 'count', count);
        } else {
          attachmentStore.set(uuid, { count });
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
        return attachmentStore.getCount(uuid);
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
          const recordField = record.ownerFields.get(this.name);
          if (recordField) {
            const { validator, validatorPropKeys } = recordField;
            if (validator && (propsName === 'validator' || (validatorPropKeys && validatorPropKeys.includes(propsName)))) {
              validator.reset();
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
      LOOKUP_SIDE_EFFECT_KEYS.includes(propsName)
    ) {
      this.set(LOOKUP_DATA, undefined);
      this.fetchLookup(undefined, record);
    }
    if (LOV_SIDE_EFFECT_KEYS.includes(propsName)) {
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
