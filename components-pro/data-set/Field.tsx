import { action, computed, get, observable, ObservableMap, runInAction, set } from 'mobx';
import { MomentInput } from 'moment';
import isObject from 'lodash/isObject';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import defer from 'lodash/defer';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet from './DataSet';
import Record from './Record';
import Validator, { CustomValidator } from '../validator/Validator';
import { DataSetEvents, FieldIgnore, FieldType, SortOrder } from './enum';
import lookupStore from '../stores/LookupCodeStore';
import lovCodeStore from '../stores/LovCodeStore';
import localeContext from '../locale-context';
import { processValue } from './utils';
import Validity from '../validator/Validity';
import ValidationResult from '../validator/ValidationResult';
import { LovConfig } from '../lov/Lov';
import { ValidatorProps } from '../validator/rules';

function isValueDirty(name: string, record: Record): boolean {
  const pristineValue = record.getPristineValue(name);
  const value = record.get(name);
  return !isEqual(pristineValue, value);
}

function setFieldDirty(field?: Field, dirty?: boolean) {
  if (field) {
    if (dirty) {
      field.dirty = true;
    } else {
      const { record, name } = field;
      if (record) {
        if (!isValueDirty(name, record)) {
          field.dirty = false;
        }
      } else {
        field.dirty = false;
      }
    }
  }
}

function getParentField(name: string, record?: Record): Field | undefined {
  if (record) {
    const parentFieldIndex = name.lastIndexOf('.');
    if (parentFieldIndex > -1) {
      const parentFieldName = name.slice(0, parentFieldIndex);
      const parentField = record.getField(parentFieldName);
      if (parentField) {
        return parentField;
      }
      return getParentField(parentFieldName, record);
    }
  }
}

export type Fields = ObservableMap<string, Field>;

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
   * 日期类型字段值格式化
   */
  format?: string;
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
  max?: MomentInput;
  /**
   * 最小值
   */
  min?: MomentInput;
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
   * 2.值列表的文本字段，当有lookupCode时，默认值为`meaning`
   */
  textField?: string;
  /**
   * 值列表的值字段，当有lookupCode时，默认值为`value`
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
   * 内部字段别名绑定
   */
  bind?: string;
  /**
   * 动态属性
   */
  dynamicProps?: (props: { dataSet: DataSet; record: Record; name: string }) => any;
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
  };

  dataSet?: DataSet;

  record?: Record;

  pristineProps: FieldProps;

  validator: Validator = new Validator();

  lookUpPending?: Promise<object[] | undefined>;

  lovPending?: Promise<LovConfig | undefined>;

  lastDynamicProps: any = {};

  @observable props: FieldProps & { [key: string]: any };

  @observable modified: boolean;

  isDirtyComputing: boolean = false;

  isDynamicPropsComputing: boolean = false;

  @computed
  get bindTarget(): Field | undefined {
    const { record } = this;
    const bind = this.get('bind');
    if (bind && record) {
      return record.getField(bind);
    }
    return undefined;
  }

  @computed
  get parent(): Field | undefined {
    const { bindTarget, record, name } = this;
    if (bindTarget) {
      return bindTarget.parent;
    }
    return getParentField(name, record);
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
    if (this.modified) {
      return true;
    }
    const { record, name } = this;
    if (record) {
      try {
        this.isDirtyComputing = true;
        const { intlFields } = this;
        if (intlFields.length) {
          return intlFields.some(langField =>
            !langField.isDirtyComputing ? langField.dirty : false,
          );
        }
        const { bindTarget } = this;
        if (bindTarget && !bindTarget.isDirtyComputing) {
          return bindTarget.dirty;
        }
        const { parent } = this;
        if (parent && parent !== this && !parent.isDirtyComputing) {
          return parent.dirty && isValueDirty(bindTarget ? bindTarget.name : name, record);
        }
      } catch (e) {
        warning(false, `Field#${name}; ${e.message}`);
      } finally {
        this.isDirtyComputing = false;
      }
    }
    return false;
  }

  set dirty(dirty: boolean) {
    runInAction(() => {
      setFieldDirty(this.bindTarget, dirty);
      setFieldDirty(this.parent, dirty);
      this.modified = dirty;
    });
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
    const {
      intlFields,
      validator: {
        validationMessage,
        validity: { valid },
      },
    } = this;
    if (valid && intlFields.length && !this.valid) {
      return intlFields.map(field => field.validationMessage);
    }
    return validationMessage;
  }

  constructor(props: FieldProps = {}, dataSet?: DataSet, record?: Record) {
    runInAction(() => {
      this.dataSet = dataSet;
      this.record = record;
      this.pristineProps = props;
      this.props = props;
      this.modified = false;
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
    return merge(
      { lookupUrl: getConfig('lookupUrl') },
      Field.defaultProps,
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
      if (typeof dynamicProps === 'function') {
        const { dataSet, name } = this;
        let { record } = this;
        if (record && !record.data) {
          record = new Record(record.initData);
          record.dataSet = dataSet;
        }
        if (this.isDynamicPropsComputing) {
          warning(false, `Cycle dynamicProps execution of field<${name}>.`);
        } else if (dataSet && record) {
          this.isDynamicPropsComputing = true;
          const props = dynamicProps({ dataSet, record, name });
          this.isDynamicPropsComputing = false;
          if (props && propsName in props) {
            const prop = props[propsName];
            this.checkDynamicProp(propsName, prop);
            return prop;
          }
          this.checkDynamicProp(propsName, undefined);
        }
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
      const { record, dataSet } = this;
      if (record) {
        if (propsName === 'type') {
          record.set(this.name, processValue(record.get(this.name), this));
        }
      }
      if (dataSet) {
        dataSet.fireEvent(DataSetEvents.fieldChange, {
          dataSet,
          record,
          field: this,
          propsName,
          value,
          oldValue,
        });
      }
      this.handlePropChange(propsName);
    }
  }

  /**
   * 根据lookup值获取lookup对象
   * @param value lookup值
   * @return {object}
   */
  getLookupData(value: any = this.getValue()): object {
    const valueField = this.get('valueField');
    const lookupKey = lookupStore.getKey(this);
    const data = {};
    if (lookupKey) {
      return lookupStore.getByValue(lookupKey, value, valueField) || data;
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
    const lookupKey = lookupStore.getKey(this);
    if (lookupKey) {
      const found = lookupStore.getByValue(lookupKey, value, valueField);
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
      return value[textField];
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
    this.dirty = false;
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
  setLovPara(name, value) {
    const p = this.get('lovPara') || {};
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
      const pattern = this.get('pattern');
      const step = this.get('step');
      const minLength = this.get('minLength');
      const maxLength = this.get('maxLength');
      const label = this.get('label');
      return {
        type,
        required,
        record,
        dataSet,
        name,
        unique: this.dirty ? this.get('unique') : false,
        customValidator,
        pattern,
        max,
        min,
        step,
        minLength,
        maxLength,
        label,
      };
    }
  }

  /**
   * 校验字段值
   * 只有通过record.getField()获取的field才能校验
   * @return true | false
   */
  async checkValidity(): Promise<boolean> {
    let valid = true;
    const { record, validator, name } = this;
    if (record) {
      const value = record.get(name);
      validator.setProps(this.getValidatorProps());
      valid = await validator.checkValidity(value);
    }
    return valid;
  }

  async fetchLookup() {
    const axiosConfig = lookupStore.getAxiosConfig(this);
    if (axiosConfig.url) {
      try {
        await (this.lookUpPending = lookupStore.fetchLookupData(axiosConfig));
      } finally {
        this.lookUpPending = undefined;
      }
    }
  }

  async fetchLovConfig() {
    const lovCode = this.get('lovCode');
    if (lovCode) {
      try {
        const config = await (this.lovPending = lovCodeStore.fetchConfig(lovCode));
        if (config) {
          runInAction(() => {
            const { textField, valueField } = config;
            if (textField) {
              this.set('textField', textField);
              this.pristineProps.textField = valueField;
            }
            if (valueField) {
              this.set('valueField', valueField);
              this.pristineProps.valueField = valueField;
            }
          });
        }
      } finally {
        this.lovPending = undefined;
      }
    }
  }

  isValid() {
    return this.valid;
  }

  getValidationMessage() {
    return this.validationMessage;
  }

  getValidityState(): Validity {
    return this.validator.validity;
  }

  getValidationErrorValues(): ValidationResult[] {
    return this.validator.validationErrorValues;
  }

  async ready(): Promise<any> {
    const { lookUpPending, lovPending } = this;
    const options = this.getOptions();
    const result = await Promise.all([
      this.lookUpPending,
      this.lovPending,
      options && options.ready(),
    ]);
    if (
      (this.lookUpPending && this.lookUpPending !== lookUpPending) ||
      (this.lovPending && this.lovPending !== lovPending)
    ) {
      return this.ready();
    }
    return result;
  }

  private findDataSetField(): Field | undefined {
    const { dataSet, name, record } = this;
    if (record && dataSet && name) {
      return dataSet.getField(name);
    }
  }

  private checkDynamicProp(propsName, newProp) {
    if (propsName in this.lastDynamicProps) {
      const oldProp = this.lastDynamicProps[propsName];
      if (oldProp !== newProp) {
        defer(() => {
          if (propsName in this.validator.props || propsName === 'validator') {
            this.validator.reset();
            // this.checkValidity();
          }
          this.handlePropChange(propsName);
        });
      }
    }
    this.lastDynamicProps[propsName] = newProp;
  }

  private handlePropChange(propsName) {
    if (propsName === 'type' || propsName === 'lookupUrl' || propsName === 'lookupCode') {
      this.fetchLookup();
    }
    if (propsName === 'lovCode') {
      this.fetchLookup();
      this.fetchLovConfig();
    }
  }
}
