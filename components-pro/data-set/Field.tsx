import { action, computed, get, observable, ObservableMap, runInAction, set, toJS } from 'mobx';
import { MomentInput } from 'moment';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import defer from 'lodash/defer';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet from './DataSet';
import Record from './Record';
import Validator, { CustomValidator, ValidationMessages } from '../validator/Validator';
import { DataSetEvents, FieldFormat, FieldIgnore, FieldTrim, FieldType, SortOrder } from './enum';
import lookupStore from '../stores/LookupCodeStore';
import lovCodeStore from '../stores/LovCodeStore';
import localeContext from '../locale-context';
import { findBindFields, getLimit, processValue } from './utils';
import Validity from '../validator/Validity';
import ValidationResult from '../validator/ValidationResult';
import { ValidatorProps } from '../validator/rules';
import isSame from '../_util/isSame';
import PromiseQueue from '../_util/PromiseQueue';
import { LovConfig } from '../lov/Lov';
import { TransportHookProps } from './Transport';
import isSameLike from '../_util/isSameLike';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import { buildURLWithAxiosConfig } from '../axios/utils';
import { getDateFormatByField } from '../field/utils';
import { getLovPara } from '../stores/utils';

function getPropsFromLovConfig(lovCode, propsName) {
  if (lovCode) {
    const config = lovCodeStore.getConfig(lovCode);
    if (config) {
      if (config[propsName]) {
        return { [propsName]: config[propsName] };
      }
    }
  }
  return {};
}

export type Fields = ObservableMap<string, Field>;
export type DynamicPropsArguments = { dataSet: DataSet; record: Record; name: string };

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
  label?: string;
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
  step?: number;
  /**
   * 最大值
   */
  max?: MomentInput | null;
  /**
   * 最小值
   */
  min?: MomentInput | null;
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
   * 1.当type为object时需要显示的字段名
   * 2.值列表的文本字段，默认值为`meaning`
   */
  textField?: string;
  /**
   * 值列表的值字段，默认值为`value`
   */
  valueField?: string;
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
  lovQueryAxiosConfig?:
    | AxiosRequestConfig
    | ((code: string, lovConfig?: LovConfig) => AxiosRequestConfig);
  /**
   * 内部字段别名绑定
   */
  bind?: string;
  /**
   * 动态属性
   */
  dynamicProps?:
    | ((props: DynamicPropsArguments) => FieldProps | undefined)
    | { [key: string]: (DynamicPropsArguments) => any };
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
   * @default never
   */
  ignore?: FieldIgnore;
  /**
   * 在发送请求之前对数据进行处理
   */
  transformRequest?: (value: any) => any;
  /**
   * 在获得响应之后对数据进行处理
   */
  transformResponse?: (value: any) => any;
  /**
   * 字符串值是否去掉首尾空格
   * 可选值: both left right none
   */
  trim?: FieldTrim;
  /**
   * 默认校验信息
   */
  defaultValidationMessages?: ValidationMessages;
};

export default class Field {
  static defaultProps: FieldProps = {
    type: FieldType.auto,
    required: false,
    readOnly: false,
    group: false,
    textField: 'meaning',
    valueField: 'value',
    trueValue: true,
    falseValue: false,
    trim: FieldTrim.both,
  };

  dataSet?: DataSet;

  record?: Record;

  pristineProps: FieldProps;

  validator: Validator = new Validator(this);

  pending: PromiseQueue = new PromiseQueue();

  lastDynamicProps: any = {};

  isDynamicPropsComputing: boolean = false;

  @observable props: FieldProps & { [key: string]: any };

  @computed
  get lookup(): object[] | undefined {
    const lookup = this.get('lookup');
    if (lookup) {
      const lookupData = this.get('lookupData') || [];
      return lookup.concat(lookupData);
    }
    return undefined;
  }

  @computed
  get intlFields(): Field[] {
    const { record, type, name } = this;
    const tlsKey = getConfig('tlsKey');
    if (type === FieldType.intl && record && record.get(tlsKey)) {
      return Object.keys(localeContext.supports).reduce<Field[]>((arr, lang) => {
        const field = record.getField(`${tlsKey}.${name}.${lang}`);
        if (field) {
          arr.push(field);
        }
        return arr;
      }, []);
    }
    return [];
  }

  @computed
  get dirty(): boolean {
    const { record, name, intlFields } = this;
    if (intlFields.length) {
      return intlFields.some(langField => langField.dirty);
    }
    if (record) {
      const pristineValue = toJS(record.getPristineValue(name));
      const value = toJS(record.get(name));
      if (isObject(pristineValue) && isObject(value)) {
        if (isEqual(pristineValue, value)) {
          return false;
        }
        try {
          const fields = findBindFields(this, record.fields, true);
          if (fields.length) {
            return fields.some(({ dirty }) => dirty);
          }
        } catch (e) {
          console.error(e);
          return true;
        }
      }
      return !isSame(pristineValue, value);
    }
    return false;
  }

  get name(): string {
    return this.props.name!;
  }

  get order(): string | undefined {
    return this.get('order');
  }

  set order(order: string | undefined) {
    this.set('order', order);
  }

  @computed
  get valid(): boolean {
    const {
      intlFields,
      validator: {
        validity: { valid },
      },
    } = this;
    if (valid && intlFields.length) {
      return intlFields.every(field => field.valid);
    }
    return valid;
  }

  @computed
  get validationMessage() {
    return this.validator.validationMessage;
  }

  constructor(props: FieldProps = {}, dataSet?: DataSet, record?: Record) {
    runInAction(() => {
      this.dataSet = dataSet;
      this.record = record;
      this.pristineProps = props;
      this.props = props;
      this.fetchLookup();
      this.fetchLovConfig();
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
      getPropsFromLovConfig(lovCode, 'textField'),
      getPropsFromLovConfig(lovCode, 'valueField'),
      dsField && dsField.props,
      this.props,
    );
  }

  /**
   * 根据属性名获取属性值
   * @param propsName 属性名
   * @return {any}
   */
  get(propsName: string): any {
    if (propsName !== 'dynamicProps') {
      const dynamicProps = this.get('dynamicProps');
      if (dynamicProps) {
        if (typeof dynamicProps === 'function') {
          warning(
            false,
            `
The dynamicProps hook will be deprecated. Please use dynamicProps map.
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
          const props = this.executeDynamicProps(dynamicProps);
          if (props && propsName in props) {
            const prop = props[propsName];
            this.checkDynamicProp(propsName, prop);
            return prop;
          }
        } else {
          const dynamicProp = dynamicProps[propsName];
          if (typeof dynamicProp === 'function') {
            const prop = this.executeDynamicProps(dynamicProp);
            if (prop !== undefined) {
              this.checkDynamicProp(propsName, prop);
              return prop;
            }
          }
        }
        this.checkDynamicProp(propsName, undefined);
      }
    }
    const value = get(this.props, propsName);
    if (value !== undefined) {
      return value;
    }
    const dsField = this.findDataSetField();
    if (dsField) {
      const dsValue = dsField.get(propsName);
      if (dsValue !== undefined) {
        return dsValue;
      }
    }
    if (propsName === 'textField' || propsName === 'valueField') {
      const lovCode = this.get('lovCode');
      const lovProps = getPropsFromLovConfig(lovCode, propsName);
      if (propsName in lovProps) {
        return lovProps[propsName];
      }
    }
    if (propsName === 'lookupUrl') {
      return getConfig(propsName);
    }
    return Field.defaultProps[propsName];
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
    if (oldValue !== value) {
      set(this.props, propsName, value);
      const { record, dataSet, name } = this;
      if (record) {
        if (propsName === 'type') {
          record.set(name, processValue(record.get(name), this));
        }
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
   * 根据lookup值获取lookup含义
   * @param value lookup值
   * @param boolean showValueIfNotFound
   * @return {string}
   */
  getText(value: any = this.getValue(), showValueIfNotFound?: boolean): string | undefined {
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
    const options = this.getOptions();
    if (options) {
      const found = options.find(record => record.get(valueField) === value);
      if (found) {
        return found.get(textField);
      }
    }
    if (textField && isObject(value)) {
      return get(value, textField);
    }
    return value;
  }

  setOptions(options: DataSet): void {
    this.set('options', options);
  }

  getOptions(): DataSet | undefined {
    return this.get('options');
  }

  /**
   * 重置设置的属性
   */
  @action
  reset(): void {
    this.props = this.pristineProps;
  }

  @action
  commit(): void {
    this.validator.reset();
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
    const { record, dataSet, name, type, required } = this;
    if (record) {
      const customValidator = this.get('validator');
      const max = this.get('max');
      const min = this.get('min');
      const format = this.get('format') || getDateFormatByField(this, this.type);
      const pattern = this.get('pattern');
      const step = this.get('step');
      const minLength = this.get('minLength');
      const maxLength = this.get('maxLength');
      const label = this.get('label');
      const range = this.get('range');
      const multiple = this.get('multiple');
      const unique = this.get('unique');
      const defaultValidationMessages = this.get('defaultValidationMessages');
      return {
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
        minLength,
        maxLength,
        label,
        range,
        multiple,
        format,
        defaultValidationMessages,
      };
    }
  }

  /**
   * 校验字段值
   * 只有通过record.getField()获取的field才能校验
   * @return true | false
   */
  @action
  async checkValidity(): Promise<boolean> {
    let valid = true;
    const { record, validator, name } = this;
    if (record) {
      validator.reset();
      const value = record.get(name);
      valid = await validator.checkValidity(value);
    }
    return valid;
  }

  /**
   * 请求lookup值, 如有缓存值直接获得。
   * @return Promise<object[]>
   */
  async fetchLookup(): Promise<object[] | undefined> {
    const batch = getConfig('lookupBatchAxiosConfig');
    const lookupCode = this.get('lookupCode');
    const lovPara = getLovPara(this, this.record);
    const dsField = this.findDataSetField();
    let result;
    if (batch && lookupCode && Object.keys(lovPara).length === 0) {
      if (dsField && dsField.get('lookupCode') === lookupCode) {
        this.set('lookup', undefined);
        return dsField.get('lookup');
      }

      result = await this.pending.add<object[] | undefined>(
        lookupStore.fetchLookupDataInBatch(lookupCode),
      );
    } else {
      const axiosConfig = lookupStore.getAxiosConfig(this);
      if (dsField) {
        const dsConfig = lookupStore.getAxiosConfig(dsField);
        if (
          dsConfig.url &&
          buildURLWithAxiosConfig(dsConfig) === buildURLWithAxiosConfig(axiosConfig)
        ) {
          this.set('lookup', undefined);
          return dsField.get('lookup');
        }
      }
      if (axiosConfig.url) {
        result = await this.pending.add<object[] | undefined>(
          lookupStore.fetchLookupData(axiosConfig),
        );
      }
    }
    if (result) {
      runInAction(() => {
        const { lookup } = this;
        this.set('lookup', result);
        const value = this.getValue();
        const valueField = this.get('valueField');
        if (value && valueField && lookup) {
          this.set(
            'lookupData',
            [].concat(value).reduce<object[]>((lookupData, v) => {
              const found = lookup.find(item => isSameLike(item[valueField], v));
              if (found) {
                lookupData.push(found);
              }
              return lookupData;
            }, []),
          );
        }
      });
    }
    return result;
  }

  fetchLovConfig() {
    const lovCode = this.get('lovCode');
    if (lovCode) {
      this.pending.add(lovCodeStore.fetchConfig(lovCode, this));
    }
  }

  isValid() {
    return this.valid;
  }

  getValidationMessage() {
    return this.validator.validationMessage;
  }

  getValidityState(): Validity {
    return this.validator.validity;
  }

  getValidationErrorValues(): ValidationResult[] {
    return this.validator.validationResults;
  }

  ready(): Promise<any> {
    const options = this.getOptions();
    return Promise.all([this.pending.ready(), options && options.ready()]);
  }

  private findDataSetField(): Field | undefined {
    const { dataSet, name, record } = this;
    if (record && dataSet && name) {
      return dataSet.getField(name);
    }
  }

  private checkDynamicProp(propsName, newProp) {
    // if (propsName in this.lastDynamicProps) {
    const oldProp = this.lastDynamicProps[propsName];
    if (!isEqual(oldProp, newProp)) {
      defer(
        action(() => {
          if (propsName in this.validator.props || propsName === 'validator') {
            this.validator.reset();
            // this.checkValidity();
          }
          this.handlePropChange(propsName, newProp, oldProp);
        }),
      );
    }
    // }
    this.lastDynamicProps[propsName] = newProp;
  }

  private handlePropChange(propsName, newProp, oldProp) {
    if (propsName === 'bind' && this.type !== FieldType.intl) {
      const { record } = this;
      if (record && !this.dirty) {
        if (newProp) {
          record.init(newProp, ObjectChainValue.get(record.data, oldProp || this.name));
        }
        if (oldProp) {
          record.init(oldProp, undefined);
        }
      }
      return;
    }
    if (
      [
        'type',
        'lookupUrl',
        'lookupCode',
        'lookupAxiosConfig',
        'lovCode',
        'lovQueryAxiosConfig',
        'lovPara',
        'cascadeMap',
        'lovQueryUrl',
      ].includes(propsName)
    ) {
      this.fetchLookup();
    }
    if (['lovCode', 'lovDefineAxiosConfig', 'lovDefineUrl'].includes(propsName)) {
      this.fetchLovConfig();
    }
  }

  private executeDynamicProps(dynamicProps: (DynamicPropsArguments) => any) {
    const { dataSet, name, record } = this;
    if (this.isDynamicPropsComputing) {
      warning(false, `Cycle dynamicProps execution of field<${name}>.`);
    } else if (dataSet && record) {
      this.isDynamicPropsComputing = true;
      const props = dynamicProps({ dataSet, record, name });
      this.isDynamicPropsComputing = false;
      return props;
    }
  }
}
