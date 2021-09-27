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
import { defaultTextField, defaultValueField, getBaseType, getChainFieldName, getIf, getLimit, processValue } from './utils';
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

const LOOKUP_TOKEN = '__lookup_token__';

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
  transformRequest?: (value: any, record: Record) => any;
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

export default class Field {
  static defaultProps: FieldProps = {
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

  dataSet?: DataSet;

  record?: Record;

  @observable validator?: Validator;

  @observable pending?: boolean;

  lastDynamicProps?: { [key: string]: any } | undefined;

  validatorPropKeys?: string[] | undefined;

  dynamicPropsComputingChains?: string[] | undefined;

  computedProps?: Map<string | symbol, IComputedValue<any>> | undefined;

  @observable props: ObservableMap<string, any>;

  @observable dirtyProps?: Partial<FieldProps> | undefined;

  get attachments(): AttachmentFile[] | undefined {
    const { dataSet, record } = this;
    if (dataSet && record) {
      const { attachmentCaches } = dataSet;
      const uuid = record.get(this.name);
      if (uuid && attachmentCaches) {
        const cache = attachmentCaches.get(uuid);
        if (cache) {
          return cache.attachments;
        }
      }
    }
    return this.get('attachments');
  }

  set attachments(attachments: AttachmentFile[] | undefined) {
    runInAction(() => {
      const { record } = this;
      if (record) {
        const uuid = record.get(this.name);
        const { dataSet } = this;
        if (dataSet && uuid) {
          const attachmentCaches = getIf<DataSet, ObservableMap<string, { count?: number | undefined; attachments?: AttachmentFile[] | undefined }>>(dataSet, 'attachmentCaches', () => observable.map());
          if (attachmentCaches) {
            const cache = attachmentCaches.get(uuid);
            if (cache) {
              cache.attachments = attachments;
            } else {
              attachmentCaches.set(uuid, { attachments });
            }
            return;
          }
        }
      }
      this.set('attachments', attachments);
    });
  }

  get attachmentCount(): number | undefined {
    const { attachments } = this;
    if (attachments) {
      return attachments.length;
    }
    const { dataSet, record } = this;
    if (dataSet && record) {
      const { attachmentCaches } = dataSet;
      const uuid = record.get(this.name);
      if (uuid && attachmentCaches) {
        const cache = attachmentCaches.get(uuid);
        if (cache) {
          return cache.count;
        }
      }
    }
    return this.get('attachmentCount');
  }

  set attachmentCount(count: number | undefined) {
    runInAction(() => {
      const { record } = this;
      if (record) {
        const uuid = record.get(this.name);
        const { dataSet } = this;
        if (dataSet && uuid) {
          const attachmentCaches = getIf<DataSet, ObservableMap<string, { count?: number | undefined; attachments?: AttachmentFile[] | undefined }>>(dataSet, 'attachmentCaches', () => observable.map());
          if (attachmentCaches) {
            const cache = attachmentCaches.get(uuid);
            if (cache) {
              cache.count = count;
            } else {
              attachmentCaches.set(uuid, { count });
            }
            return;
          }
        }
      }
      this.set('attachmentCount', count);
    });
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
    const { dataSet } = this;
    if (dataSet) {
      const lookupToken = this.get(LOOKUP_TOKEN);
      const { lookupCaches } = dataSet;
      if (lookupToken && lookupCaches) {
        const lookup = lookupCaches.get(lookupToken);
        if (isArrayLike(lookup)) {
          const valueField = this.get('valueField');
          const lookupData = this.get('lookupData');
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
    return undefined;
  }

  @computed
  get options(): DataSet | undefined {
    const options = this.get('options');
    if (options) {
      return options;
    }
    // 确保 lookup 相关配置介入观察
    lookupStore.getAxiosConfig(this);
    const optionsProps = this.get('optionsProps');
    const { lookup, type } = this;
    if (lookup) {
      const parentField = this.get('parentField');
      const idField = this.get('idField') || this.get('valueField');
      const selection = this.get('multiple') ? DataSetSelection.multiple : DataSetSelection.single;
      return new DataSet({
        data: lookup,
        paging: false,
        selection,
        idField,
        parentField,
        ...optionsProps,
      });
    }
    const lovCode = this.get('lovCode');
    if (lovCode) {
      if (type === FieldType.object || type === FieldType.auto) {
        return lovCodeStore.getLovDataSet(lovCode, this, optionsProps);
      }
    }
    return undefined;
  }

  get dirty(): boolean {
    const { record, name } = this;
    if (record) {
      const { dirtyData } = record;
      if (dirtyData) {
        const dirtyNames = [...dirtyData.keys()];
        if (dirtyNames.length) {
          if (dirtyNames.includes(getChainFieldName(record, name))) {
            return true;
          }
          if (this.type === FieldType.intl) {
            const tlsKey = getConfig('tlsKey');
            if (record.get(tlsKey) && Object.keys(localeContext.supports).some(lang => dirtyNames.includes(getChainFieldName(record, `${tlsKey}.${name}.${lang}`)))) {
              return true;
            }
          }
        }
      }
    }
    return false;
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
    const { validator } = this;
    return validator ? validator.validity.valid : true;
  }

  get validationMessage() {
    return this.getValidationMessage();
  }

  constructor(props: FieldProps = {}, dataSet?: DataSet, record?: Record) {
    runInAction(() => {
      this.dataSet = dataSet;
      this.record = record;
      this.props = observable.map(props);

      // 优化性能，没有动态属性时不用处理， 直接引用dsField； 有options时，也不处理
      if (
        !this.getProp('options')
      ) {
        const dynamicProps = this.getProp('dynamicProps');
        if (!record || typeof dynamicProps === 'function') {
          raf(() => {
            this.fetchLookup();
            this.fetchLovConfig();
          });
        } else {
          const computedProps = this.getProp('computedProps');
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

  /**
   * 获取所有属性
   * @return 属性对象
   */
  getProps(): FieldProps & { [key: string]: any } {
    const dsField = this.findDataSetField();
    const lovCode = this.get('lovCode');
    return merge(
      { lookupUrl: getConfig('lookupUrl') },
      Field.defaultProps,
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
  get(propsName: string): any {
    const prop = this.getProp(propsName);
    if (prop !== undefined) {
      return prop;
    }
    return Field.defaultProps[propsName];
  }

  private getProp(propsName: string): any {
    if (!['computedProps', 'dynamicProps'].includes(propsName)) {
      const computedPropsMap = getIf<Field, Map<string | symbol, IComputedValue<any>>>(this, 'computedProps', () => new Map());
      const computedProp = computedPropsMap.get(propsName);
      if (computedProp) {
        const computedValue = computedProp.get();
        if (computedValue !== undefined) {
          return computedValue;
        }
      } else {
        const computedProps = this.get('computedProps');
        if (computedProps) {
          const newComputedProp = computed(() => {
            const computProp = computedProps[propsName];
            if (typeof computProp === 'function') {
              const prop = this.executeDynamicProps(computProp, propsName);
              if (prop !== undefined) {
                this.checkDynamicProp(propsName, prop);
                return prop;
              }
            }
          }, { name: propsName, context: this });
          computedPropsMap.set(propsName, newComputedProp);
          const computedValue = newComputedProp.get();
          if (computedValue !== undefined) {
            return computedValue;
          }
        }
      }
      const dynamicProps = this.get('dynamicProps');
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
          const props = this.executeDynamicProps(dynamicProps, propsName);
          if (props && propsName in props) {
            const prop = props[propsName];
            this.checkDynamicProp(propsName, prop);
            return prop;
          }
        } else {
          const dynamicProp = dynamicProps[propsName];
          if (typeof dynamicProp === 'function') {
            const prop = this.executeDynamicProps(dynamicProp, propsName);
            if (prop !== undefined) {
              this.checkDynamicProp(propsName, prop);
              return prop;
            }
          }
        }
        this.checkDynamicProp(propsName, undefined);
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
      if (dataSet) {
        const lookupToken = this.get(LOOKUP_TOKEN);
        const { lookupCaches } = dataSet;
        if (lookupToken && lookupCaches) {
          return lookupCaches.get(lookupToken);
        }
      }
    }
    if (propsName === 'textField' || propsName === 'valueField') {
      const lovCode = this.get('lovCode');
      const lovProp = getPropsFromLovConfig(lovCode, [propsName])[propsName];
      if (lovProp) {
        return lovProp;
      }
    }
    if (propsName === 'lookupUrl') {
      return getConfig(propsName);
    }
    if (['min', 'max'].includes(propsName)) {
      if (this.type === FieldType.number) {
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
  set(propsName: string, value: any): void {
    const oldValue = this.get(propsName);
    if (!isEqualDynamicProps(toJS(oldValue), value)) {
      const dirtyProps = getIf<Field, Partial<FieldProps>>(this, 'dirtyProps', {});
      if (!(propsName in dirtyProps)) {
        set(dirtyProps, propsName, oldValue);
      } else if (isSame(toJS(dirtyProps[propsName]), value)) {
        remove(dirtyProps, propsName);
      }
      this.props.set(propsName, value);
      const { record, dataSet, name } = this;
      if (record && propsName === 'type') {
        record.set(name, processValue(record.get(name), this));
      }
      if (dataSet) {
        dataSet.fireEvent(DataSetEvents.fieldChange, {
          dataSet,
          record,
          name,
          field: this,
          propsName,
          value,
          oldValue,
        });
      }
      this.handlePropChange(propsName, value, oldValue);
    }
  }

  /**
   * 根据lookup值获取lookup对象
   * @param value lookup值
   * @return {object}
   */
  getLookupData(value: any = this.getValue()): object {
    const valueField = this.get('valueField');
    const data = {};
    if (this.lookup) {
      return this.lookup.find(obj => isSameLike(get(obj, valueField), value)) || data;
    }
    return data;
  }

  getValue(): any {
    const { dataSet, name } = this;
    const record = this.record || (dataSet && dataSet.current);
    if (record) {
      return record.get(name);
    }
  }

  /**
   * 可以根据lookup值获取含义
   * @param value lookup值
   * @param boolean showValueIfNotFound
   * @return {string}
   */
  getLookupText(value: any = this.getValue(), showValueIfNotFound?: boolean): string | undefined {
    const textField = this.get('textField');
    const valueField = this.get('valueField');
    const { lookup } = this;
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
  getOptionsText(value: any = this.getValue(), showValueIfNotFound?: boolean): string | undefined {
    const textField = this.get('textField');
    const valueField = this.get('valueField');
    const { options } = this;
    if (options) {
      const found = options.find(record => isSameLike(record.get(valueField), value));
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
  getText(value: any = this.getValue(), showValueIfNotFound?: boolean): string | undefined {
    const { lookup } = this;
    if (lookup && !isObject(value)) {
      return this.getLookupText(value, showValueIfNotFound);
    }
    const options = this.get('options');
    const textField = this.get('textField');
    if (options) {
      const valueField = this.get('valueField');
      const found = options.find(record => isSameLike(record.get(valueField), value));
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
    return value;
  }

  setOptions(options: DataSet): void {
    this.set('options', options);
  }

  getOptions(): DataSet | undefined {
    return this.options;
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
  commit(): void {
    const { validator } = this;
    if (validator) {
      validator.reset();
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
  setLovPara(name, value) {
    const p = toJS(this.get('lovPara')) || {};
    if (value === null) {
      delete p[name];
    } else {
      p[name] = value;
    }
    this.set('lovPara', p);
  }

  getValidatorProps(): ValidatorProps | undefined {
    const { record } = this;
    if (record) {
      const { dataSet, name, type, required, attachmentCount } = this;
      const baseType = getBaseType(type);
      const customValidator = this.get('validator');
      const max = this.get('max');
      const min = this.get('min');
      const format = this.get('format') || getDateFormatByField(this, this.type);
      const pattern = this.get('pattern');
      const step = this.get('step');
      const nonStrictStep = this.get('nonStrictStep') === undefined ? getConfig('numberFieldNonStrictStep') : this.get('nonStrictStep');
      const minLength = baseType !== FieldType.string ? undefined : this.get('minLength');
      const maxLength = baseType !== FieldType.string ? undefined : this.get('maxLength');
      const label = this.get('label');
      const range = this.get('range');
      const multiple = this.get('multiple');
      const unique = this.get('unique');
      const defaultValidationMessages = this.get('defaultValidationMessages');
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
  async checkValidity(report = true): Promise<boolean> {
    let valid = true;
    const { record } = this;
    if (record) {
      let { validator } = this;
      if (validator) {
        validator.reset();
      } else {
        validator = new Validator(this);
        this.validator = validator;
      }
      const value = record.get(this.name);
      valid = await validator.checkValidity(value);
      if (report && !record.validating) {
        record.reportValidity(valid);
      }
    }
    return valid;
  }

  /**
   * 请求lookup值, 如有缓存值直接获得。
   * @param noCache default: undefined
   * @return Promise<object[]>
   */
  @action
  fetchLookup(noCache = false): Promise<object[] | undefined> {
    const { dataSet } = this;
    if (dataSet) {
      const { lookup } = this;
      const lookupCaches = getIf<DataSet, ObservableMap<string, object[] | Promise<object[]>>>(dataSet, 'lookupCaches', () => observable.map());
      const oldToken = this.get(LOOKUP_TOKEN);
      const batch = this.get('lookupBatchAxiosConfig') || getConfig('lookupBatchAxiosConfig');
      const lookupCode = this.get('lookupCode');
      let promise;
      if (batch && lookupCode && Object.keys(getLovPara(this, this.record)).length === 0) {
        const cachedLookup = lookupCaches.get(lookupCode);
        if (lookupCode !== oldToken) {
          this.set(LOOKUP_TOKEN, lookupCode);
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
        const axiosConfig = lookupStore.getAxiosConfig(this, noCache);
        if (axiosConfig.url) {
          const lookupToken = buildURLWithAxiosConfig(axiosConfig);
          if (lookupToken !== oldToken) {
            this.set(LOOKUP_TOKEN, lookupToken);
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
        }
      }
      if (promise) {
        return promise.then(action((result) => {
          this.pending = false;
          if (lookup && oldToken !== this.get(LOOKUP_TOKEN)) {
            const value = this.getValue();
            const valueField = this.get('valueField');
            if (value && valueField) {
              const values = this.get('multiple') ? [].concat(...value) : [].concat(value);
              this.set(
                'lookupData',
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
        })).catch(e => {
          this.pending = false;
          throw e;
        });
      }
    }
    return Promise.resolve(undefined);
  }

  fetchLovConfig() {
    const lovCode = this.get('lovCode');
    if (lovCode) {
      lovCodeStore.fetchConfig(lovCode, this);
    }
  }

  fetchAttachments(props: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) {
    const { bucketName, bucketDirectory, attachmentUUID, storageCode } = props;
    const { fetchList } = getConfig('attachment');
    if (fetchList) {
      fetchList({ bucketName, bucketDirectory, attachmentUUID, storageCode }).then(action((results) => {
        this.attachments = results.map(file => new AttachmentFile(file));
      }));
    }
  }

  fetchAttachmentCount(uuid: string) {
    const { batchFetchCount } = getConfig('attachment');
    if (batchFetchCount && !this.attachments) {
      attachmentStore.fetchCountInBatch(uuid).then((count) => {
        this.attachmentCount = count;
      });
    }
  }

  isValid() {
    return this.valid;
  }

  getValidationMessage() {
    const { validator } = this;
    return validator ? validator.validationMessage : undefined;
  }

  getValidityState(): Validity | undefined {
    const { validator } = this;
    return validator ? validator.validity : undefined;
  }

  getValidationErrorValues(): ValidationResult[] {
    const { validator } = this;
    return validator ? validator.validationResults : [];
  }

  ready(): Promise<any> {
    return Promise.resolve(true);
  }

  private findDataSetField(): Field | undefined {
    const { dataSet, name, record } = this;
    if (record && dataSet && name) {
      return dataSet.getField(name);
    }
  }

  private checkDynamicProp(propsName, newProp) {
    const lastDynamicProps = getIf<Field, { [key: string]: any }>(this, 'lastDynamicProps', {});
    const oldProp = lastDynamicProps[propsName];
    if (!isEqualDynamicProps(oldProp, newProp)) {
      raf(action(() => {
        const { validator, validatorPropKeys } = this;
        if (validator && (propsName === 'validator' || (validatorPropKeys && validatorPropKeys.includes(propsName)))) {
          validator.reset();
        }
        this.handlePropChange(propsName, newProp, oldProp);
      }));
    }
    lastDynamicProps[propsName] = newProp;
  }

  private handlePropChange(propsName, newProp, oldProp) {
    if (propsName === 'bind' && this.type !== FieldType.intl) {
      const { record } = this;
      if (record && !this.dirty) {
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
      this.set('lookupData', undefined);
      this.fetchLookup();
    }
    if (LOV_SIDE_EFFECT_KEYS.includes(propsName)) {
      this.fetchLovConfig();
    }
  }

  private executeDynamicProps(dynamicProps: (DynamicPropsArguments) => any, propsName: string) {
    const { dataSet, name, record } = this;
    const dynamicPropsComputingChains = getIf<Field, string[]>(this, 'dynamicPropsComputingChains', []);
    if (dynamicPropsComputingChains.includes(propsName)) {
      warning(false, `Cycle dynamicProps execution of field<${name}>. [${dynamicPropsComputingChains.join(' -> ')} -> ${propsName}]`);
    } else if (dataSet) {
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
}
