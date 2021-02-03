import { __decorate } from "tslib";
import { action, computed, get, observable, runInAction, set, toJS } from 'mobx';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import merge from 'lodash/merge';
import defer from 'lodash/defer';
import unionBy from 'lodash/unionBy';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import DataSet from './DataSet';
import Validator from '../validator/Validator';
import lookupStore from '../stores/LookupCodeStore';
import lovCodeStore from '../stores/LovCodeStore';
import localeContext from '../locale-context';
import { findBindFields, getLimit, processValue } from './utils';
import isSame from '../_util/isSame';
import PromiseQueue from '../_util/PromiseQueue';
import isSameLike from '../_util/isSameLike';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import { buildURLWithAxiosConfig } from '../axios/utils';
import { getDateFormatByField } from '../field/utils';
import { getLovPara } from '../stores/utils';
function isEqualDynamicProps(oldProps, newProps) {
    if (newProps === oldProps) {
        return true;
    }
    if (isObject(newProps) && isObject(oldProps) && Object.keys(newProps).length) {
        return Object.keys(newProps).every(key => {
            const value = newProps[key];
            const oldValue = oldProps[key];
            if (oldValue === value) {
                return true;
            }
            if (isFunction(value) && isFunction(oldValue)) {
                return value.toString() === oldValue.toString();
            }
            return isEqual(oldValue, value);
        });
    }
    return isEqual(newProps, oldProps);
}
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
export default class Field {
    constructor(props = {}, dataSet, record) {
        this.validator = new Validator(this);
        this.pending = new PromiseQueue();
        this.lastDynamicProps = {};
        this.isDynamicPropsComputing = false;
        runInAction(() => {
            this.dataSet = dataSet;
            this.record = record;
            this.pristineProps = props;
            this.props = props;
            this.fetchLookup();
            this.fetchLovConfig();
        });
    }
    get lookup() {
        const lookup = this.get('lookup');
        const valueField = this.get('valueField');
        if (lookup) {
            const lookupData = this.get('lookupData') || [];
            return unionBy(lookup.concat(lookupData), valueField);
        }
        return undefined;
    }
    get options() {
        const options = this.get('options');
        if (options) {
            return options;
        }
        // 确保 lookup 相关配置介入观察
        lookupStore.getAxiosConfig(this);
        const { lookup } = this;
        if (lookup) {
            const selection = this.get('multiple') ? "multiple" /* multiple */ : "single" /* single */;
            return new DataSet({
                data: lookup,
                paging: false,
                selection,
            });
        }
        return undefined;
    }
    get intlFields() {
        const { record, type, name } = this;
        const tlsKey = getConfig('tlsKey');
        if (type === "intl" /* intl */ && record && record.get(tlsKey)) {
            return Object.keys(localeContext.supports).reduce((arr, lang) => {
                const field = record.getField(`${tlsKey}.${name}.${lang}`);
                if (field) {
                    arr.push(field);
                }
                return arr;
            }, []);
        }
        return [];
    }
    get dirty() {
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
                }
                catch (e) {
                    console.error(e);
                    return true;
                }
            }
            return !isSame(pristineValue, value);
        }
        return false;
    }
    get name() {
        return this.props.name;
    }
    get order() {
        return this.get('order');
    }
    set order(order) {
        this.set('order', order);
    }
    get valid() {
        const { intlFields, validator: { validity: { valid }, }, } = this;
        if (valid && intlFields.length) {
            return intlFields.every(field => field.valid);
        }
        return valid;
    }
    get validationMessage() {
        return this.validator.validationMessage;
    }
    /**
     * 获取所有属性
     * @return 属性对象
     */
    getProps() {
        const dsField = this.findDataSetField();
        const lovCode = this.get('lovCode');
        return merge({ lookupUrl: getConfig('lookupUrl') }, Field.defaultProps, getPropsFromLovConfig(lovCode, 'textField'), getPropsFromLovConfig(lovCode, 'valueField'), dsField && dsField.props, this.props);
    }
    /**
     * 根据属性名获取属性值
     * @param propsName 属性名
     * @return {any}
     */
    get(propsName) {
        const prop = this.getProp(propsName);
        if (prop !== undefined) {
            return prop;
        }
        return Field.defaultProps[propsName];
    }
    getProp(propsName) {
        if (propsName !== 'dynamicProps') {
            const dynamicProps = this.get('dynamicProps');
            if (dynamicProps) {
                if (typeof dynamicProps === 'function') {
                    warning(false, ` The dynamicProps hook will be deprecated. Please use dynamicProps map.
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
              }`);
                    const props = this.executeDynamicProps(dynamicProps);
                    if (props && propsName in props) {
                        const prop = props[propsName];
                        this.checkDynamicProp(propsName, prop);
                        return prop;
                    }
                }
                else {
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
            const dsValue = dsField.getProp(propsName);
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
        return undefined;
    }
    /**
     * 设置属性值
     * @param propsName 属性名
     * @param value 属性值
     * @return {any}
     */
    set(propsName, value) {
        const oldValue = this.get(propsName);
        if (!isEqualDynamicProps(oldValue, value)) {
            set(this.props, propsName, value);
            const { record, dataSet, name } = this;
            if (record) {
                if (propsName === 'type') {
                    record.set(name, processValue(record.get(name), this));
                }
            }
            if (dataSet) {
                dataSet.fireEvent("fieldChange" /* fieldChange */, {
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
    getLookupData(value = this.getValue()) {
        const valueField = this.get('valueField');
        const data = {};
        if (this.lookup) {
            return this.lookup.find(obj => isSameLike(get(obj, valueField), value)) || data;
        }
        return data;
    }
    getValue() {
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
    getText(value = this.getValue(), showValueIfNotFound) {
        const textField = this.get('textField');
        const valueField = this.get('valueField');
        const { lookup, options } = this;
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
        if (options) {
            const found = options.find(record => isSameLike(record.get(valueField), value));
            if (found) {
                return found.get(textField);
            }
        }
        if (textField && isObject(value)) {
            return get(value, textField);
        }
        return value;
    }
    setOptions(options) {
        this.set('options', options);
    }
    getOptions() {
        return this.options;
    }
    /**
     * 重置设置的属性
     */
    reset() {
        this.props = this.pristineProps;
    }
    commit() {
        this.validator.reset();
    }
    /**
     * 是否必选
     * @return true | false
     */
    get required() {
        return this.get('required');
    }
    /**
     * 设置是否必选
     * @param required 是否必选
     */
    set required(required) {
        this.set('required', required);
    }
    /**
     * 是否只读
     * @return true | false
     */
    get readOnly() {
        return this.get('readOnly');
    }
    /**
     * 是否禁用
     * @return true | false
     */
    get disabled() {
        return this.get('disabled');
    }
    /**
     * 设置是否只读
     * @param readOnly 是否只读
     */
    set readOnly(readOnly) {
        this.set('readOnly', readOnly);
    }
    /**
     * 设置是否禁用
     * @param disabled 是否禁用
     */
    set disabled(disabled) {
        this.set('disabled', disabled);
    }
    /**
     * 获取字段类型
     * @return 获取字段类型
     */
    get type() {
        return this.get('type');
    }
    /**
     * 设置字段类型
     * @param type 字段类型
     */
    set type(type) {
        this.set('type', type);
    }
    /**
     * 设置Lov的查询参数
     * @param {String} name
     * @param {Object} value
     */
    setLovPara(name, value) {
        const p = toJS(this.get('lovPara')) || {};
        if (value === null) {
            delete p[name];
        }
        else {
            p[name] = value;
        }
        this.set('lovPara', p);
    }
    getValidatorProps() {
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
    async checkValidity() {
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
    async fetchLookup() {
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
            result = await this.pending.add(lookupStore.fetchLookupDataInBatch(lookupCode));
        }
        else {
            const axiosConfig = lookupStore.getAxiosConfig(this);
            if (dsField) {
                const dsConfig = lookupStore.getAxiosConfig(dsField);
                if (dsConfig.url &&
                    buildURLWithAxiosConfig(dsConfig) === buildURLWithAxiosConfig(axiosConfig)) {
                    this.set('lookup', undefined);
                    return dsField.get('lookup');
                }
            }
            if (axiosConfig.url) {
                result = await this.pending.add(lookupStore.fetchLookupData(axiosConfig));
            }
        }
        if (result) {
            runInAction(() => {
                const { lookup } = this;
                this.set('lookup', result);
                const value = this.getValue();
                const valueField = this.get('valueField');
                if (value && valueField && lookup) {
                    this.set('lookupData', [].concat(value).reduce((lookupData, v) => {
                        const found = lookup.find(item => isSameLike(item[valueField], v));
                        if (found) {
                            lookupData.push(found);
                        }
                        return lookupData;
                    }, []));
                }
            });
        }
        return result;
    }
    async fetchLovConfig() {
        const lovCode = this.get('lovCode');
        if (lovCode) {
            await this.pending.add(lovCodeStore.fetchConfig(lovCode, this));
            if (this.type === "object" /* object */ || this.type === "auto" /* auto */) {
                const options = lovCodeStore.getLovDataSet(lovCode, this);
                if (options) {
                    this.set('options', options);
                }
            }
        }
    }
    isValid() {
        return this.valid;
    }
    getValidationMessage() {
        return this.validator.validationMessage;
    }
    getValidityState() {
        return this.validator.validity;
    }
    getValidationErrorValues() {
        return this.validator.validationResults;
    }
    ready() {
        // const { options } = this;
        // return Promise.all([this.pending.ready(), options && options.ready()]);
        return this.pending.ready();
    }
    findDataSetField() {
        const { dataSet, name, record } = this;
        if (record && dataSet && name) {
            return dataSet.getField(name);
        }
    }
    checkDynamicProp(propsName, newProp) {
        // if (propsName in this.lastDynamicProps) {
        const oldProp = this.lastDynamicProps[propsName];
        if (!isEqualDynamicProps(oldProp, newProp)) {
            defer(action(() => {
                if (propsName in this.validator.props || propsName === 'validator') {
                    this.validator.reset();
                    // this.checkValidity();
                }
                this.handlePropChange(propsName, newProp, oldProp);
            }));
        }
        // }
        this.lastDynamicProps[propsName] = newProp;
    }
    handlePropChange(propsName, newProp, oldProp) {
        if (propsName === 'bind' && this.type !== "intl" /* intl */) {
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
        if ([
            'type',
            'lookupUrl',
            'lookupCode',
            'lookupAxiosConfig',
            'lovCode',
            'lovQueryAxiosConfig',
            'lovPara',
            'cascadeMap',
            'lovQueryUrl',
        ].includes(propsName)) {
            this.set('lookupData', undefined);
            this.fetchLookup();
        }
        if (['lovCode', 'lovDefineAxiosConfig', 'lovDefineUrl'].includes(propsName)) {
            this.fetchLovConfig();
        }
    }
    executeDynamicProps(dynamicProps) {
        const { dataSet, name, record } = this;
        if (this.isDynamicPropsComputing) {
            warning(false, `Cycle dynamicProps execution of field<${name}>.`);
        }
        else if (dataSet && record) {
            this.isDynamicPropsComputing = true;
            const props = dynamicProps({ dataSet, record, name });
            this.isDynamicPropsComputing = false;
            return props;
        }
    }
}
Field.defaultProps = {
    type: "auto" /* auto */,
    required: false,
    readOnly: false,
    disabled: false,
    group: false,
    textField: 'meaning',
    valueField: 'value',
    trueValue: true,
    falseValue: false,
    trim: "both" /* both */,
};
__decorate([
    observable
], Field.prototype, "props", void 0);
__decorate([
    computed
], Field.prototype, "lookup", null);
__decorate([
    computed
], Field.prototype, "options", null);
__decorate([
    computed
], Field.prototype, "intlFields", null);
__decorate([
    computed
], Field.prototype, "dirty", null);
__decorate([
    computed
], Field.prototype, "valid", null);
__decorate([
    computed
], Field.prototype, "validationMessage", null);
__decorate([
    action
], Field.prototype, "set", null);
__decorate([
    action
], Field.prototype, "reset", null);
__decorate([
    action
], Field.prototype, "commit", null);
__decorate([
    action
], Field.prototype, "setLovPara", null);
__decorate([
    action
], Field.prototype, "checkValidity", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGEtc2V0L0ZpZWxkLnRzeCIsIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBaUIsV0FBVyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFaEcsT0FBTyxVQUFVLE1BQU0sbUJBQW1CLENBQUM7QUFDM0MsT0FBTyxPQUFPLE1BQU0sZ0JBQWdCLENBQUM7QUFDckMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFFckQsT0FBTyxPQUFPLE1BQU0sV0FBVyxDQUFDO0FBRWhDLE9BQU8sU0FBa0QsTUFBTSx3QkFBd0IsQ0FBQztBQUV4RixPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQztBQUNwRCxPQUFPLFlBQVksTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFJakUsT0FBTyxNQUFNLE1BQU0saUJBQWlCLENBQUM7QUFDckMsT0FBTyxZQUFZLE1BQU0sdUJBQXVCLENBQUM7QUFHakQsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxLQUFLLGdCQUFnQixNQUFNLDJCQUEyQixDQUFDO0FBQzlELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxvQkFB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dkMsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEtBQUssRUFBRSx5Q0FBeUMsSUFBSSxJQUFJLENBQUMsQ0FBQztTQUNuRTthQUFNLElBQUksT0FBTyxJQUFJLE1BQU0sRUFBRTtZQUM1QixJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDO1lBQ3BDLE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO1lBQ3JDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDOztBQTdvQk0sa0JBQVksR0FBZTtJQUNoQyxJQUFJLG1CQUFnQjtJQUNwQixRQUFRLEVBQUUsS0FBSztJQUNmLFFBQVEsRUFBRSxLQUFLO0lBQ2YsUUFBUSxFQUFFLEtBQUs7SUFDZixLQUFLLEVBQUUsS0FBSztJQUNaLFNBQVMsRUFBRSxTQUFTO0lBQ3BCLFVBQVUsRUFBRSxPQUFPO0lBQ25CLFNBQVMsRUFBRSxJQUFJO0lBQ2YsVUFBVSxFQUFFLEtBQUs7SUFDakIsSUFBSSxtQkFBZ0I7Q0FDckIsQ0FBQztBQWdCVTtJQUFYLFVBQVU7b0NBQTRDO0FBR3ZEO0lBREMsUUFBUTttQ0FTUjtBQUdEO0lBREMsUUFBUTtvQ0FrQlI7QUFHRDtJQURDLFFBQVE7dUNBY1I7QUFHRDtJQURDLFFBQVE7a0NBMEJSO0FBZUQ7SUFEQyxRQUFRO2tDQVlSO0FBR0Q7SUFEQyxRQUFROzhDQUdSO0FBd0hEO0lBREMsTUFBTTtnQ0F3Qk47QUFvRUQ7SUFEQyxNQUFNO2tDQUdOO0FBR0Q7SUFEQyxNQUFNO21DQUdOO0FBd0VEO0lBREMsTUFBTTt1Q0FTTjtBQStDRDtJQURDLE1BQU07MENBVU4iLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGEtc2V0L0ZpZWxkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhY3Rpb24sIGNvbXB1dGVkLCBnZXQsIG9ic2VydmFibGUsIE9ic2VydmFibGVNYXAsIHJ1bkluQWN0aW9uLCBzZXQsIHRvSlMgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IE1vbWVudElucHV0IH0gZnJvbSAnbW9tZW50JztcbmltcG9ydCBpc0Z1bmN0aW9uIGZyb20gJ2xvZGFzaC9pc0Z1bmN0aW9uJztcbmltcG9ydCBpc0VxdWFsIGZyb20gJ2xvZGFzaC9pc0VxdWFsJztcbmltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2gvaXNPYmplY3QnO1xuaW1wb3J0IG1lcmdlIGZyb20gJ2xvZGFzaC9tZXJnZSc7XG5pbXBvcnQgZGVmZXIgZnJvbSAnbG9kYXNoL2RlZmVyJztcbmltcG9ydCB1bmlvbkJ5IGZyb20gJ2xvZGFzaC91bmlvbkJ5JztcbmltcG9ydCB7IEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvX3V0aWwvd2FybmluZyc7XG5pbXBvcnQgeyBSZWFjdE5vZGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRGF0YVNldCBmcm9tICcuL0RhdGFTZXQnO1xuaW1wb3J0IFJlY29yZCBmcm9tICcuL1JlY29yZCc7XG5pbXBvcnQgVmFsaWRhdG9yLCB7IEN1c3RvbVZhbGlkYXRvciwgVmFsaWRhdGlvbk1lc3NhZ2VzIH0gZnJvbSAnLi4vdmFsaWRhdG9yL1ZhbGlkYXRvcic7XG5pbXBvcnQgeyBEYXRhU2V0RXZlbnRzLCBEYXRhU2V0U2VsZWN0aW9uLCBGaWVsZEZvcm1hdCwgRmllbGRJZ25vcmUsIEZpZWxkVHJpbSwgRmllbGRUeXBlLCBTb3J0T3JkZXIgfSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IGxvb2t1cFN0b3JlIGZyb20gJy4uL3N0b3Jlcy9Mb29rdXBDb2RlU3RvcmUnO1xuaW1wb3J0IGxvdkNvZGVTdG9yZSBmcm9tICcuLi9zdG9yZXMvTG92Q29kZVN0b3JlJztcbmltcG9ydCBsb2NhbGVDb250ZXh0IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0JztcbmltcG9ydCB7IGZpbmRCaW5kRmllbGRzLCBnZXRMaW1pdCwgcHJvY2Vzc1ZhbHVlIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgVmFsaWRpdHkgZnJvbSAnLi4vdmFsaWRhdG9yL1ZhbGlkaXR5JztcbmltcG9ydCBWYWxpZGF0aW9uUmVzdWx0IGZyb20gJy4uL3ZhbGlkYXRvci9WYWxpZGF0aW9uUmVzdWx0JztcbmltcG9ydCB7IFZhbGlkYXRvclByb3BzIH0gZnJvbSAnLi4vdmFsaWRhdG9yL3J1bGVzJztcbmltcG9ydCBpc1NhbWUgZnJvbSAnLi4vX3V0aWwvaXNTYW1lJztcbmltcG9ydCBQcm9taXNlUXVldWUgZnJvbSAnLi4vX3V0aWwvUHJvbWlzZVF1ZXVlJztcbmltcG9ydCB7IExvdkNvbmZpZyB9IGZyb20gJy4uL2xvdi9Mb3YnO1xuaW1wb3J0IHsgVHJhbnNwb3J0SG9va1Byb3BzIH0gZnJvbSAnLi9UcmFuc3BvcnQnO1xuaW1wb3J0IGlzU2FtZUxpa2UgZnJvbSAnLi4vX3V0aWwvaXNTYW1lTGlrZSc7XG5pbXBvcnQgKiBhcyBPYmplY3RDaGFpblZhbHVlIGZyb20gJy4uL191dGlsL09iamVjdENoYWluVmFsdWUnO1xuaW1wb3J0IHsgYnVpbGRVUkxXaXRoQXhpb3NDb25maWcgfSBmcm9tICcuLi9heGlvcy91dGlscyc7XG5pbXBvcnQgeyBnZXREYXRlRm9ybWF0QnlGaWVsZCB9IGZyb20gJy4uL2ZpZWxkL3V0aWxzJztcbmltcG9ydCB7IGdldExvdlBhcmEgfSBmcm9tICcuLi9zdG9yZXMvdXRpbHMnO1xuaW1wb3J0IHsgVGltZVN0ZXAgfSBmcm9tICcuLi9kYXRlLXBpY2tlci9EYXRlUGlja2VyJztcblxuZnVuY3Rpb24gaXNFcXVhbER5bmFtaWNQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgaWYgKG5ld1Byb3BzID09PSBvbGRQcm9wcykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChpc09iamVjdChuZXdQcm9wcykgJiYgaXNPYmplY3Qob2xkUHJvcHMpICYmIE9iamVjdC5rZXlzKG5ld1Byb3BzKS5sZW5ndGgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMobmV3UHJvcHMpLmV2ZXJ5KGtleSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IG5ld1Byb3BzW2tleV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFByb3BzW2tleV07XG4gICAgICBpZiAob2xkVmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpICYmIGlzRnVuY3Rpb24ob2xkVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpID09PSBvbGRWYWx1ZS50b1N0cmluZygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzRXF1YWwob2xkVmFsdWUsIHZhbHVlKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaXNFcXVhbChuZXdQcm9wcywgb2xkUHJvcHMpO1xufVxuXG5mdW5jdGlvbiBnZXRQcm9wc0Zyb21Mb3ZDb25maWcobG92Q29kZSwgcHJvcHNOYW1lKSB7XG4gIGlmIChsb3ZDb2RlKSB7XG4gICAgY29uc3QgY29uZmlnID0gbG92Q29kZVN0b3JlLmdldENvbmZpZyhsb3ZDb2RlKTtcbiAgICBpZiAoY29uZmlnKSB7XG4gICAgICBpZiAoY29uZmlnW3Byb3BzTmFtZV0pIHtcbiAgICAgICAgcmV0dXJuIHsgW3Byb3BzTmFtZV06IGNvbmZpZ1twcm9wc05hbWVdIH07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7fTtcbn1cblxuZXhwb3J0IHR5cGUgRmllbGRzID0gT2JzZXJ2YWJsZU1hcDxzdHJpbmcsIEZpZWxkPjtcbmV4cG9ydCB0eXBlIER5bmFtaWNQcm9wc0FyZ3VtZW50cyA9IHsgZGF0YVNldDogRGF0YVNldDsgcmVjb3JkOiBSZWNvcmQ7IG5hbWU6IHN0cmluZyB9O1xuXG5leHBvcnQgdHlwZSBGaWVsZFByb3BzID0ge1xuICAvKipcbiAgICog5a2X5q615ZCNXG4gICAqL1xuICBuYW1lPzogc3RyaW5nO1xuICAvKipcbiAgICog5a2X5q6157G75Z6LXG4gICAqL1xuICB0eXBlPzogRmllbGRUeXBlO1xuICAvKipcbiAgICog5o6S5bqP57G75Z6LXG4gICAqIOWPr+mAieWAvO+8miBhc2MgfCBkZXNjXG4gICAqL1xuICBvcmRlcj86IFNvcnRPcmRlcjtcbiAgLyoqXG4gICAqIOWtl+auteagh+etvlxuICAgKi9cbiAgbGFiZWw/OiBzdHJpbmcgfCBSZWFjdE5vZGU7XG4gIC8qKlxuICAgKiDlrZfmrrXmoIfnrb7lrr3luqZcbiAgICovXG4gIGxhYmVsV2lkdGg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlrZfnrKbkuLLnsbvlnovlkozml6XmnJ/nsbvlnovlrZfmrrXlgLzmoLzlvI/ljJZcbiAgICovXG4gIGZvcm1hdD86IHN0cmluZyB8IEZpZWxkRm9ybWF0O1xuICAvKipcbiAgICog5q2j5YiZXG4gICAqL1xuICBwYXR0ZXJuPzogc3RyaW5nIHwgUmVnRXhwO1xuICAvKipcbiAgICog5pyA5bCP6ZW/5bqmXG4gICAqL1xuICBtaW5MZW5ndGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDmnIDlpKfplb/luqZcbiAgICovXG4gIG1heExlbmd0aD86IG51bWJlcjtcbiAgLyoqXG4gICAqIOatpei3nVxuICAgKi9cbiAgc3RlcD86IG51bWJlciB8IFRpbWVTdGVwO1xuICAvKipcbiAgICog5pyA5aSn5YC8XG4gICAqL1xuICBtYXg/OiBNb21lbnRJbnB1dCB8IG51bGw7XG4gIC8qKlxuICAgKiDmnIDlsI/lgLxcbiAgICovXG4gIG1pbj86IE1vbWVudElucHV0IHwgbnVsbDtcbiAgLyoqXG4gICAqIOagoemqjOWZqFxuICAgKi9cbiAgdmFsaWRhdG9yPzogQ3VzdG9tVmFsaWRhdG9yO1xuICAvKipcbiAgICog5piv5ZCm5b+F6YCJXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICByZXF1aXJlZD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmmK/lkKblj6ror7tcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHJlYWRPbmx5PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOaYr+WQpuemgeeUqFxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGlzYWJsZWQ/OiBib29sZWFuO1xuICAvKipcbiAgICogMS7lvZN0eXBl5Li6b2JqZWN05pe26ZyA6KaB5pi+56S655qE5a2X5q615ZCNXG4gICAqIDIu5YC85YiX6KGo55qE5paH5pys5a2X5q6177yM6buY6K6k5YC85Li6YG1lYW5pbmdgXG4gICAqL1xuICB0ZXh0RmllbGQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlgLzliJfooajnmoTlgLzlrZfmrrXvvIzpu5jorqTlgLzkuLpgdmFsdWVgXG4gICAqL1xuICB2YWx1ZUZpZWxkPzogc3RyaW5nO1xuICAvKipcbiAgICogIOexu+Wei+S4umJvb2xlYW7ml7bvvIx0cnVl5a+55bqU55qE5YC8XG4gICAqL1xuICB0cnVlVmFsdWU/OiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuO1xuICAvKipcbiAgICogIOexu+Wei+S4umJvb2xlYW7ml7bvvIxmYWxzZeWvueW6lOeahOWAvFxuICAgKi9cbiAgZmFsc2VWYWx1ZT86IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW47XG4gIC8qKlxuICAgKiDkuIvmi4nmoYbnu4Tku7bnmoToj5zljZXmlbDmja7pm4ZcbiAgICovXG4gIG9wdGlvbnM/OiBEYXRhU2V0IHwgc3RyaW5nO1xuICAvKipcbiAgICog5piv5ZCm5YiG57uEXG4gICAqIOWmguaenOaYr251bWJlcu+8jOWImeS4uuWIhue7hOeahOmhuuW6j1xuICAgKi9cbiAgZ3JvdXA/OiBudW1iZXIgfCBib29sZWFuO1xuICAvKipcbiAgICog6buY6K6k5YC8XG4gICAqL1xuICBkZWZhdWx0VmFsdWU/OiBhbnk7XG4gIC8qKlxuICAgKiDmmK/lkKbkuLrlgLzmlbDnu4RcbiAgICog5b2T5Li65a2X56ym5Liy5pe277yM5L2c5Li65pWw5o2u5YiG6ZqU56ym77yM5p+l6K+i5pe25Lya5bCG5a2X56ym5Liy5YiG5Ymy5oiQ5pWw57uE77yM5o+Q5Lqk5pe25Lya5bCG5pWw57uE5ou85o6l5oiQ5a2X56ym5LiyXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtdWx0aXBsZT86IGJvb2xlYW4gfCBzdHJpbmc7XG4gIC8qKlxuICAgKiDmmK/lkKbkuLrlpJrooYznsbvlnotcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG11bHRpTGluZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmmK/lkKbkuLrojIPlm7TlgLxcbiAgICog5b2T5Li6dHJ1ZeaXtu+8jOWImeWAvOS4ultzdGFydFZhbHVlLCBlbmRWYWx1ZV1cbiAgICog5b2T5Li65pWw57uE5pe277yM5L6L5aaCWydzdGFydCcsICdlbmQnXeaXtu+8jOWImeWAvOS4unsgc3RhcnQ6IHN0YXJ0VmFsdWUsIGVuZDogZW5kVmFsdWUgfVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgcmFuZ2U/OiBib29sZWFuIHwgW3N0cmluZywgc3RyaW5nXTtcbiAgLyoqXG4gICAqIOWUr+S4gOe0ouW8leaIluiBlOWQiOWUr+S4gOe0ouW8lee7hOWQjVxuICAgKi9cbiAgdW5pcXVlPzogYm9vbGVhbiB8IHN0cmluZztcbiAgLyoqXG4gICAqIExPVuS7o+eggVxuICAgKi9cbiAgbG92Q29kZT86IHN0cmluZztcbiAgLyoqXG4gICAqIExPVuafpeivouWPguaVsFxuICAgKi9cbiAgbG92UGFyYT86IG9iamVjdDtcbiAgLyoqXG4gICAqIOWAvOWIl+ihqOS7o+eggVxuICAgKi9cbiAgbG9va3VwQ29kZT86IHN0cmluZztcbiAgLyoqXG4gICAqIOWAvOWIl+ihqOivt+axgueahFVybFxuICAgKi9cbiAgbG9va3VwVXJsPzogc3RyaW5nIHwgKChjb2RlOiBzdHJpbmcpID0+IHN0cmluZyk7XG4gIC8qKlxuICAgKiBMT1bphY3nva7or7fmsYLlnLDlnYBcbiAgICovXG4gIGxvdkRlZmluZVVybD86IHN0cmluZyB8ICgoY29kZTogc3RyaW5nKSA9PiBzdHJpbmcpO1xuICAvKipcbiAgICogTE9W5p+l6K+i6K+35rGC5Zyw5Z2AXG4gICAqL1xuICBsb3ZRdWVyeVVybD86XG4gICAgfCBzdHJpbmdcbiAgICB8ICgoY29kZTogc3RyaW5nLCBjb25maWc6IExvdkNvbmZpZyB8IHVuZGVmaW5lZCwgcHJvcHM6IFRyYW5zcG9ydEhvb2tQcm9wcykgPT4gc3RyaW5nKTtcbiAgLyoqXG4gICAqIOWAvOWIl+ihqOivt+axgueahGF4aW9zQ29uZmlnXG4gICAqL1xuICBsb29rdXBBeGlvc0NvbmZpZz86XG4gICAgfCBBeGlvc1JlcXVlc3RDb25maWdcbiAgICB8ICgocHJvcHM6IHtcbiAgICBwYXJhbXM/OiBhbnk7XG4gICAgZGF0YVNldD86IERhdGFTZXQ7XG4gICAgcmVjb3JkPzogUmVjb3JkO1xuICAgIGxvb2t1cENvZGU/OiBzdHJpbmc7XG4gIH0pID0+IEF4aW9zUmVxdWVzdENvbmZpZyk7XG4gIC8qKlxuICAgKiBMT1bphY3nva7or7fmsYLnmoTpkqnlrZBcbiAgICovXG4gIGxvdkRlZmluZUF4aW9zQ29uZmlnPzogQXhpb3NSZXF1ZXN0Q29uZmlnIHwgKChjb2RlOiBzdHJpbmcpID0+IEF4aW9zUmVxdWVzdENvbmZpZyk7XG4gIC8qKlxuICAgKiBMT1bmn6Xor6Lor7fmsYLnmoTpkqnlrZBcbiAgICovXG4gIGxvdlF1ZXJ5QXhpb3NDb25maWc/OlxuICAgIHwgQXhpb3NSZXF1ZXN0Q29uZmlnXG4gICAgfCAoKGNvZGU6IHN0cmluZywgbG92Q29uZmlnPzogTG92Q29uZmlnKSA9PiBBeGlvc1JlcXVlc3RDb25maWcpO1xuICAvKipcbiAgICog5YaF6YOo5a2X5q615Yir5ZCN57uR5a6aXG4gICAqL1xuICBiaW5kPzogc3RyaW5nO1xuICAvKipcbiAgICog5Yqo5oCB5bGe5oCnXG4gICAqL1xuICBkeW5hbWljUHJvcHM/OlxuICAgIHwgKChwcm9wczogRHluYW1pY1Byb3BzQXJndW1lbnRzKSA9PiBGaWVsZFByb3BzIHwgdW5kZWZpbmVkKVxuICAgIHwgeyBba2V5OiBzdHJpbmddOiAoRHluYW1pY1Byb3BzQXJndW1lbnRzKSA9PiBhbnkgfTtcbiAgLyoqXG4gICAqIOW/q+eggeWSjExPVuafpeivouaXtueahOe6p+iBlOWPguaVsOaYoOWwhFxuICAgKiBAZXhhbXBsZVxuICAgKiBjYXNjYWRlTWFwOiB7IHBhcmVudENvZGVWYWx1ZTogJ2NpdHknIH1cbiAgICog5YW25LitJ2NpdHkn5piv5b2T5YmN5omA5Zyo5pWw5o2u5rqQ55qE5YW25LuW5a2X5q615ZCN77yMcGFyZW50Q29kZVZhbHVl5piv5YWz6IGU54i257qn55qE5p+l6K+i5a2X5q61XG4gICAqL1xuICBjYXNjYWRlTWFwPzogb2JqZWN0O1xuICAvKipcbiAgICog6LSn5biB5Luj56CBXG4gICAqL1xuICBjdXJyZW5jeT86IHN0cmluZztcbiAgLyoqXG4gICAqIOW/veeVpeaPkOS6pFxuICAgKiDlj6/pgInlgLw6IGFsd2F5cyAtIOaAu+aYr+W/veeVpSBjbGVhbiAtIOWAvOacquWPmOWMluaXtuW/veeVpSBuZXZlciAtIOS7juS4jeW/veeVpVxuICAgKiBAZGVmYXVsdCBuZXZlclxuICAgKi9cbiAgaWdub3JlPzogRmllbGRJZ25vcmU7XG4gIC8qKlxuICAgKiDlnKjlj5HpgIHor7fmsYLkuYvliY3lr7nmlbDmja7ov5vooYzlpITnkIZcbiAgICovXG4gIHRyYW5zZm9ybVJlcXVlc3Q/OiAodmFsdWU6IGFueSwgcmVjb3JkOiBSZWNvcmQpID0+IGFueTtcbiAgLyoqXG4gICAqIOWcqOiOt+W+l+WTjeW6lOS5i+WQjuWvueaVsOaNrui/m+ihjOWkhOeQhlxuICAgKi9cbiAgdHJhbnNmb3JtUmVzcG9uc2U/OiAodmFsdWU6IGFueSwgb2JqZWN0OiBhbnkpID0+IGFueTtcbiAgLyoqXG4gICAqIOWtl+espuS4suWAvOaYr+WQpuWOu+aOiemmluWwvuepuuagvFxuICAgKiDlj6/pgInlgLw6IGJvdGggbGVmdCByaWdodCBub25lXG4gICAqL1xuICB0cmltPzogRmllbGRUcmltO1xuICAvKipcbiAgICog6buY6K6k5qCh6aqM5L+h5oGvXG4gICAqL1xuICBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzPzogVmFsaWRhdGlvbk1lc3NhZ2VzO1xuICAvKipcbiAgICog6aKd5aSW5L+h5oGv77yM5bi455So5LqO5o+Q56S6XG4gICAqL1xuICBoZWxwPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmllbGQge1xuICBzdGF0aWMgZGVmYXVsdFByb3BzOiBGaWVsZFByb3BzID0ge1xuICAgIHR5cGU6IEZpZWxkVHlwZS5hdXRvLFxuICAgIHJlcXVpcmVkOiBmYWxzZSxcbiAgICByZWFkT25seTogZmFsc2UsXG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIGdyb3VwOiBmYWxzZSxcbiAgICB0ZXh0RmllbGQ6ICdtZWFuaW5nJyxcbiAgICB2YWx1ZUZpZWxkOiAndmFsdWUnLFxuICAgIHRydWVWYWx1ZTogdHJ1ZSxcbiAgICBmYWxzZVZhbHVlOiBmYWxzZSxcbiAgICB0cmltOiBGaWVsZFRyaW0uYm90aCxcbiAgfTtcblxuICBkYXRhU2V0PzogRGF0YVNldDtcblxuICByZWNvcmQ/OiBSZWNvcmQ7XG5cbiAgcHJpc3RpbmVQcm9wczogRmllbGRQcm9wcztcblxuICB2YWxpZGF0b3I6IFZhbGlkYXRvciA9IG5ldyBWYWxpZGF0b3IodGhpcyk7XG5cbiAgcGVuZGluZzogUHJvbWlzZVF1ZXVlID0gbmV3IFByb21pc2VRdWV1ZSgpO1xuXG4gIGxhc3REeW5hbWljUHJvcHM6IGFueSA9IHt9O1xuXG4gIGlzRHluYW1pY1Byb3BzQ29tcHV0aW5nOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQG9ic2VydmFibGUgcHJvcHM6IEZpZWxkUHJvcHMgJiB7IFtrZXk6IHN0cmluZ106IGFueSB9O1xuXG4gIEBjb21wdXRlZFxuICBnZXQgbG9va3VwKCk6IG9iamVjdFtdIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBsb29rdXAgPSB0aGlzLmdldCgnbG9va3VwJyk7XG4gICAgY29uc3QgdmFsdWVGaWVsZCA9IHRoaXMuZ2V0KCd2YWx1ZUZpZWxkJyk7XG4gICAgaWYgKGxvb2t1cCkge1xuICAgICAgY29uc3QgbG9va3VwRGF0YSA9IHRoaXMuZ2V0KCdsb29rdXBEYXRhJykgfHwgW107XG4gICAgICByZXR1cm4gdW5pb25CeShsb29rdXAuY29uY2F0KGxvb2t1cERhdGEpLCB2YWx1ZUZpZWxkKTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgb3B0aW9ucygpOiBEYXRhU2V0IHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5nZXQoJ29wdGlvbnMnKTtcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuICAgIC8vIOehruS/nSBsb29rdXAg55u45YWz6YWN572u5LuL5YWl6KeC5a+fXG4gICAgbG9va3VwU3RvcmUuZ2V0QXhpb3NDb25maWcodGhpcyk7XG4gICAgY29uc3QgeyBsb29rdXAgfSA9IHRoaXM7XG4gICAgaWYgKGxvb2t1cCkge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gdGhpcy5nZXQoJ211bHRpcGxlJykgPyBEYXRhU2V0U2VsZWN0aW9uLm11bHRpcGxlIDogRGF0YVNldFNlbGVjdGlvbi5zaW5nbGU7XG4gICAgICByZXR1cm4gbmV3IERhdGFTZXQoe1xuICAgICAgICBkYXRhOiBsb29rdXAsXG4gICAgICAgIHBhZ2luZzogZmFsc2UsXG4gICAgICAgIHNlbGVjdGlvbixcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBpbnRsRmllbGRzKCk6IEZpZWxkW10ge1xuICAgIGNvbnN0IHsgcmVjb3JkLCB0eXBlLCBuYW1lIH0gPSB0aGlzO1xuICAgIGNvbnN0IHRsc0tleSA9IGdldENvbmZpZygndGxzS2V5Jyk7XG4gICAgaWYgKHR5cGUgPT09IEZpZWxkVHlwZS5pbnRsICYmIHJlY29yZCAmJiByZWNvcmQuZ2V0KHRsc0tleSkpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhsb2NhbGVDb250ZXh0LnN1cHBvcnRzKS5yZWR1Y2U8RmllbGRbXT4oKGFyciwgbGFuZykgPT4ge1xuICAgICAgICBjb25zdCBmaWVsZCA9IHJlY29yZC5nZXRGaWVsZChgJHt0bHNLZXl9LiR7bmFtZX0uJHtsYW5nfWApO1xuICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICBhcnIucHVzaChmaWVsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgIH0sIFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkaXJ0eSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IHJlY29yZCwgbmFtZSwgaW50bEZpZWxkcyB9ID0gdGhpcztcbiAgICBpZiAoaW50bEZpZWxkcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBpbnRsRmllbGRzLnNvbWUobGFuZ0ZpZWxkID0+IGxhbmdGaWVsZC5kaXJ0eSk7XG4gICAgfVxuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIGNvbnN0IHByaXN0aW5lVmFsdWUgPSB0b0pTKHJlY29yZC5nZXRQcmlzdGluZVZhbHVlKG5hbWUpKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdG9KUyhyZWNvcmQuZ2V0KG5hbWUpKTtcbiAgICAgIGlmIChpc09iamVjdChwcmlzdGluZVZhbHVlKSAmJiBpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKGlzRXF1YWwocHJpc3RpbmVWYWx1ZSwgdmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgZmllbGRzID0gZmluZEJpbmRGaWVsZHModGhpcywgcmVjb3JkLmZpZWxkcywgdHJ1ZSk7XG4gICAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZHMuc29tZSgoeyBkaXJ0eSB9KSA9PiBkaXJ0eSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuICFpc1NhbWUocHJpc3RpbmVWYWx1ZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLm5hbWUhO1xuICB9XG5cbiAgZ2V0IG9yZGVyKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdvcmRlcicpO1xuICB9XG5cbiAgc2V0IG9yZGVyKG9yZGVyOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLnNldCgnb3JkZXInLCBvcmRlcik7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHZhbGlkKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGludGxGaWVsZHMsXG4gICAgICB2YWxpZGF0b3I6IHtcbiAgICAgICAgdmFsaWRpdHk6IHsgdmFsaWQgfSxcbiAgICAgIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKHZhbGlkICYmIGludGxGaWVsZHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaW50bEZpZWxkcy5ldmVyeShmaWVsZCA9PiBmaWVsZC52YWxpZCk7XG4gICAgfVxuICAgIHJldHVybiB2YWxpZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdmFsaWRhdGlvbk1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IEZpZWxkUHJvcHMgPSB7fSwgZGF0YVNldD86IERhdGFTZXQsIHJlY29yZD86IFJlY29yZCkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMuZGF0YVNldCA9IGRhdGFTZXQ7XG4gICAgICB0aGlzLnJlY29yZCA9IHJlY29yZDtcbiAgICAgIHRoaXMucHJpc3RpbmVQcm9wcyA9IHByb3BzO1xuICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgdGhpcy5mZXRjaExvb2t1cCgpO1xuICAgICAgdGhpcy5mZXRjaExvdkNvbmZpZygpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaJgOacieWxnuaAp1xuICAgKiBAcmV0dXJuIOWxnuaAp+WvueixoVxuICAgKi9cbiAgZ2V0UHJvcHMoKTogRmllbGRQcm9wcyAmIHsgW2tleTogc3RyaW5nXTogYW55IH0ge1xuICAgIGNvbnN0IGRzRmllbGQgPSB0aGlzLmZpbmREYXRhU2V0RmllbGQoKTtcbiAgICBjb25zdCBsb3ZDb2RlID0gdGhpcy5nZXQoJ2xvdkNvZGUnKTtcbiAgICByZXR1cm4gbWVyZ2UoXG4gICAgICB7IGxvb2t1cFVybDogZ2V0Q29uZmlnKCdsb29rdXBVcmwnKSB9LFxuICAgICAgRmllbGQuZGVmYXVsdFByb3BzLFxuICAgICAgZ2V0UHJvcHNGcm9tTG92Q29uZmlnKGxvdkNvZGUsICd0ZXh0RmllbGQnKSxcbiAgICAgIGdldFByb3BzRnJvbUxvdkNvbmZpZyhsb3ZDb2RlLCAndmFsdWVGaWVsZCcpLFxuICAgICAgZHNGaWVsZCAmJiBkc0ZpZWxkLnByb3BzLFxuICAgICAgdGhpcy5wcm9wcyxcbiAgICApO1xuICB9XG5cblxuICAvKipcbiAgICog5qC55o2u5bGe5oCn5ZCN6I635Y+W5bGe5oCn5YC8XG4gICAqIEBwYXJhbSBwcm9wc05hbWUg5bGe5oCn5ZCNXG4gICAqIEByZXR1cm4ge2FueX1cbiAgICovXG4gIGdldChwcm9wc05hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgcHJvcCA9IHRoaXMuZ2V0UHJvcChwcm9wc05hbWUpO1xuICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH1cbiAgICByZXR1cm4gRmllbGQuZGVmYXVsdFByb3BzW3Byb3BzTmFtZV07XG4gIH1cblxuICBwcml2YXRlIGdldFByb3AocHJvcHNOYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIGlmIChwcm9wc05hbWUgIT09ICdkeW5hbWljUHJvcHMnKSB7XG4gICAgICBjb25zdCBkeW5hbWljUHJvcHMgPSB0aGlzLmdldCgnZHluYW1pY1Byb3BzJyk7XG4gICAgICBpZiAoZHluYW1pY1Byb3BzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZHluYW1pY1Byb3BzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgd2FybmluZyhcbiAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgYCBUaGUgZHluYW1pY1Byb3BzIGhvb2sgd2lsbCBiZSBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIGR5bmFtaWNQcm9wcyBtYXAuXG4gICAgICAgICAgICAgIEZvciBlLmcsXG4gICAgICAgICAgICAgIEJhZCBjYXNlOlxuICAgICAgICAgICAgICBkeW5hbWljUHJvcHMoeyByZWNvcmQgfSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICBiaW5kOiByZWNvcmQuZ2V0KCd4eCcpLFxuICAgICAgICAgICAgICAgICAgbGFiZWw6IHJlY29yZC5nZXQoJ3l5JyksXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIEdvb2QgY2FzZTpcbiAgICAgICAgICAgICAgZHluYW1pY1Byb3BzID0ge1xuICAgICAgICAgICAgICAgIGJpbmQoeyByZWNvcmQgfSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZC5nZXQoJ3h4JylcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxhYmVsKHsgcmVjb3JkIH0pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZWNvcmQuZ2V0KCd5eScpLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfWAsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCBwcm9wcyA9IHRoaXMuZXhlY3V0ZUR5bmFtaWNQcm9wcyhkeW5hbWljUHJvcHMpO1xuICAgICAgICAgIGlmIChwcm9wcyAmJiBwcm9wc05hbWUgaW4gcHJvcHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1twcm9wc05hbWVdO1xuICAgICAgICAgICAgdGhpcy5jaGVja0R5bmFtaWNQcm9wKHByb3BzTmFtZSwgcHJvcCk7XG4gICAgICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZHluYW1pY1Byb3AgPSBkeW5hbWljUHJvcHNbcHJvcHNOYW1lXTtcbiAgICAgICAgICBpZiAodHlwZW9mIGR5bmFtaWNQcm9wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zdCBwcm9wID0gdGhpcy5leGVjdXRlRHluYW1pY1Byb3BzKGR5bmFtaWNQcm9wKTtcbiAgICAgICAgICAgIGlmIChwcm9wICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy5jaGVja0R5bmFtaWNQcm9wKHByb3BzTmFtZSwgcHJvcCk7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrRHluYW1pY1Byb3AocHJvcHNOYW1lLCB1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IGdldCh0aGlzLnByb3BzLCBwcm9wc05hbWUpO1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIGNvbnN0IGRzRmllbGQgPSB0aGlzLmZpbmREYXRhU2V0RmllbGQoKTtcbiAgICBpZiAoZHNGaWVsZCkge1xuICAgICAgY29uc3QgZHNWYWx1ZSA9IGRzRmllbGQuZ2V0UHJvcChwcm9wc05hbWUpO1xuICAgICAgaWYgKGRzVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZHNWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByb3BzTmFtZSA9PT0gJ3RleHRGaWVsZCcgfHwgcHJvcHNOYW1lID09PSAndmFsdWVGaWVsZCcpIHtcbiAgICAgIGNvbnN0IGxvdkNvZGUgPSB0aGlzLmdldCgnbG92Q29kZScpO1xuICAgICAgY29uc3QgbG92UHJvcHMgPSBnZXRQcm9wc0Zyb21Mb3ZDb25maWcobG92Q29kZSwgcHJvcHNOYW1lKTtcbiAgICAgIGlmIChwcm9wc05hbWUgaW4gbG92UHJvcHMpIHtcbiAgICAgICAgcmV0dXJuIGxvdlByb3BzW3Byb3BzTmFtZV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcm9wc05hbWUgPT09ICdsb29rdXBVcmwnKSB7XG4gICAgICByZXR1cm4gZ2V0Q29uZmlnKHByb3BzTmFtZSk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICog6K6+572u5bGe5oCn5YC8XG4gICAqIEBwYXJhbSBwcm9wc05hbWUg5bGe5oCn5ZCNXG4gICAqIEBwYXJhbSB2YWx1ZSDlsZ7mgKflgLxcbiAgICogQHJldHVybiB7YW55fVxuICAgKi9cbiAgQGFjdGlvblxuICBzZXQocHJvcHNOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMuZ2V0KHByb3BzTmFtZSk7XG4gICAgaWYgKCFpc0VxdWFsRHluYW1pY1Byb3BzKG9sZFZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgIHNldCh0aGlzLnByb3BzLCBwcm9wc05hbWUsIHZhbHVlKTtcbiAgICAgIGNvbnN0IHsgcmVjb3JkLCBkYXRhU2V0LCBuYW1lIH0gPSB0aGlzO1xuICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICBpZiAocHJvcHNOYW1lID09PSAndHlwZScpIHtcbiAgICAgICAgICByZWNvcmQuc2V0KG5hbWUsIHByb2Nlc3NWYWx1ZShyZWNvcmQuZ2V0KG5hbWUpLCB0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICAgIGRhdGFTZXQuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMuZmllbGRDaGFuZ2UsIHtcbiAgICAgICAgICBkYXRhU2V0LFxuICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGZpZWxkOiB0aGlzLFxuICAgICAgICAgIHByb3BzTmFtZSxcbiAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICBvbGRWYWx1ZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLmhhbmRsZVByb3BDaGFuZ2UocHJvcHNOYW1lLCB2YWx1ZSwgb2xkVmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja5sb29rdXDlgLzojrflj5Zsb29rdXDlr7nosaFcbiAgICogQHBhcmFtIHZhbHVlIGxvb2t1cOWAvFxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRMb29rdXBEYXRhKHZhbHVlOiBhbnkgPSB0aGlzLmdldFZhbHVlKCkpOiBvYmplY3Qge1xuICAgIGNvbnN0IHZhbHVlRmllbGQgPSB0aGlzLmdldCgndmFsdWVGaWVsZCcpO1xuICAgIGNvbnN0IGRhdGEgPSB7fTtcbiAgICBpZiAodGhpcy5sb29rdXApIHtcbiAgICAgIHJldHVybiB0aGlzLmxvb2t1cC5maW5kKG9iaiA9PiBpc1NhbWVMaWtlKGdldChvYmosIHZhbHVlRmllbGQpLCB2YWx1ZSkpIHx8IGRhdGE7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZ2V0VmFsdWUoKTogYW55IHtcbiAgICBjb25zdCB7IGRhdGFTZXQsIG5hbWUgfSA9IHRoaXM7XG4gICAgY29uc3QgcmVjb3JkID0gdGhpcy5yZWNvcmQgfHwgKGRhdGFTZXQgJiYgZGF0YVNldC5jdXJyZW50KTtcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICByZXR1cm4gcmVjb3JkLmdldChuYW1lKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5qC55o2ubG9va3Vw5YC86I635Y+WbG9va3Vw5ZCr5LmJXG4gICAqIEBwYXJhbSB2YWx1ZSBsb29rdXDlgLxcbiAgICogQHBhcmFtIGJvb2xlYW4gc2hvd1ZhbHVlSWZOb3RGb3VuZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRUZXh0KHZhbHVlOiBhbnkgPSB0aGlzLmdldFZhbHVlKCksIHNob3dWYWx1ZUlmTm90Rm91bmQ/OiBib29sZWFuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB0ZXh0RmllbGQgPSB0aGlzLmdldCgndGV4dEZpZWxkJyk7XG4gICAgY29uc3QgdmFsdWVGaWVsZCA9IHRoaXMuZ2V0KCd2YWx1ZUZpZWxkJyk7XG4gICAgY29uc3QgeyBsb29rdXAsIG9wdGlvbnMgfSA9IHRoaXM7XG4gICAgaWYgKGxvb2t1cCkge1xuICAgICAgY29uc3QgZm91bmQgPSBsb29rdXAuZmluZChvYmogPT4gaXNTYW1lTGlrZShnZXQob2JqLCB2YWx1ZUZpZWxkKSwgdmFsdWUpKTtcbiAgICAgIGlmIChmb3VuZCkge1xuICAgICAgICByZXR1cm4gZ2V0KGZvdW5kLCB0ZXh0RmllbGQpO1xuICAgICAgfVxuICAgICAgaWYgKHNob3dWYWx1ZUlmTm90Rm91bmQpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IGZvdW5kID0gb3B0aW9ucy5maW5kKHJlY29yZCA9PiBpc1NhbWVMaWtlKHJlY29yZC5nZXQodmFsdWVGaWVsZCksIHZhbHVlKSk7XG4gICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGZvdW5kLmdldCh0ZXh0RmllbGQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGV4dEZpZWxkICYmIGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGdldCh2YWx1ZSwgdGV4dEZpZWxkKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgc2V0T3B0aW9ucyhvcHRpb25zOiBEYXRhU2V0KTogdm9pZCB7XG4gICAgdGhpcy5zZXQoJ29wdGlvbnMnLCBvcHRpb25zKTtcbiAgfVxuXG4gIGdldE9wdGlvbnMoKTogRGF0YVNldCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiDph43nva7orr7nva7nmoTlsZ7mgKdcbiAgICovXG4gIEBhY3Rpb25cbiAgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcyA9IHRoaXMucHJpc3RpbmVQcm9wcztcbiAgfVxuXG4gIEBhY3Rpb25cbiAgY29tbWl0KCk6IHZvaWQge1xuICAgIHRoaXMudmFsaWRhdG9yLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICog5piv5ZCm5b+F6YCJXG4gICAqIEByZXR1cm4gdHJ1ZSB8IGZhbHNlXG4gICAqL1xuICBnZXQgcmVxdWlyZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdyZXF1aXJlZCcpO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuvue9ruaYr+WQpuW/hemAiVxuICAgKiBAcGFyYW0gcmVxdWlyZWQg5piv5ZCm5b+F6YCJXG4gICAqL1xuICBzZXQgcmVxdWlyZWQocmVxdWlyZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnNldCgncmVxdWlyZWQnLCByZXF1aXJlZCk7XG4gIH1cblxuICAvKipcbiAgICog5piv5ZCm5Y+q6K+7XG4gICAqIEByZXR1cm4gdHJ1ZSB8IGZhbHNlXG4gICAqL1xuICBnZXQgcmVhZE9ubHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdyZWFkT25seScpO1xuICB9XG5cbiAgLyoqXG4gICAqIOaYr+WQpuemgeeUqFxuICAgKiBAcmV0dXJuIHRydWUgfCBmYWxzZVxuICAgKi9cbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGlzYWJsZWQnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorr7nva7mmK/lkKblj6ror7tcbiAgICogQHBhcmFtIHJlYWRPbmx5IOaYr+WQpuWPquivu1xuICAgKi9cbiAgc2V0IHJlYWRPbmx5KHJlYWRPbmx5OiBib29sZWFuKSB7XG4gICAgdGhpcy5zZXQoJ3JlYWRPbmx5JywgcmVhZE9ubHkpO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuvue9ruaYr+WQpuemgeeUqFxuICAgKiBAcGFyYW0gZGlzYWJsZWQg5piv5ZCm56aB55SoXG4gICAqL1xuICBzZXQgZGlzYWJsZWQoZGlzYWJsZWQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLnNldCgnZGlzYWJsZWQnLCBkaXNhYmxlZCk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5a2X5q6157G75Z6LXG4gICAqIEByZXR1cm4g6I635Y+W5a2X5q6157G75Z6LXG4gICAqL1xuICBnZXQgdHlwZSgpOiBGaWVsZFR5cGUge1xuICAgIHJldHVybiB0aGlzLmdldCgndHlwZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuvue9ruWtl+auteexu+Wei1xuICAgKiBAcGFyYW0gdHlwZSDlrZfmrrXnsbvlnotcbiAgICovXG4gIHNldCB0eXBlKHR5cGU6IEZpZWxkVHlwZSkge1xuICAgIHRoaXMuc2V0KCd0eXBlJywgdHlwZSk7XG4gIH1cblxuICAvKipcbiAgICog6K6+572uTG9255qE5p+l6K+i5Y+C5pWwXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICAgKi9cbiAgQGFjdGlvblxuICBzZXRMb3ZQYXJhKG5hbWUsIHZhbHVlKSB7XG4gICAgY29uc3QgcCA9IHRvSlModGhpcy5nZXQoJ2xvdlBhcmEnKSkgfHwge307XG4gICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICBkZWxldGUgcFtuYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICB0aGlzLnNldCgnbG92UGFyYScsIHApO1xuICB9XG5cbiAgZ2V0VmFsaWRhdG9yUHJvcHMoKTogVmFsaWRhdG9yUHJvcHMgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcmVjb3JkLCBkYXRhU2V0LCBuYW1lLCB0eXBlLCByZXF1aXJlZCB9ID0gdGhpcztcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICBjb25zdCBjdXN0b21WYWxpZGF0b3IgPSB0aGlzLmdldCgndmFsaWRhdG9yJyk7XG4gICAgICBjb25zdCBtYXggPSB0aGlzLmdldCgnbWF4Jyk7XG4gICAgICBjb25zdCBtaW4gPSB0aGlzLmdldCgnbWluJyk7XG4gICAgICBjb25zdCBmb3JtYXQgPSB0aGlzLmdldCgnZm9ybWF0JykgfHwgZ2V0RGF0ZUZvcm1hdEJ5RmllbGQodGhpcywgdGhpcy50eXBlKTtcbiAgICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmdldCgncGF0dGVybicpO1xuICAgICAgY29uc3Qgc3RlcCA9IHRoaXMuZ2V0KCdzdGVwJyk7XG4gICAgICBjb25zdCBtaW5MZW5ndGggPSB0aGlzLmdldCgnbWluTGVuZ3RoJyk7XG4gICAgICBjb25zdCBtYXhMZW5ndGggPSB0aGlzLmdldCgnbWF4TGVuZ3RoJyk7XG4gICAgICBjb25zdCBsYWJlbCA9IHRoaXMuZ2V0KCdsYWJlbCcpO1xuICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldCgncmFuZ2UnKTtcbiAgICAgIGNvbnN0IG11bHRpcGxlID0gdGhpcy5nZXQoJ211bHRpcGxlJyk7XG4gICAgICBjb25zdCB1bmlxdWUgPSB0aGlzLmdldCgndW5pcXVlJyk7XG4gICAgICBjb25zdCBkZWZhdWx0VmFsaWRhdGlvbk1lc3NhZ2VzID0gdGhpcy5nZXQoJ2RlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGUsXG4gICAgICAgIHJlcXVpcmVkLFxuICAgICAgICByZWNvcmQsXG4gICAgICAgIGRhdGFTZXQsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHVuaXF1ZSxcbiAgICAgICAgY3VzdG9tVmFsaWRhdG9yLFxuICAgICAgICBwYXR0ZXJuLFxuICAgICAgICBtYXg6IGdldExpbWl0KG1heCwgcmVjb3JkKSxcbiAgICAgICAgbWluOiBnZXRMaW1pdChtaW4sIHJlY29yZCksXG4gICAgICAgIHN0ZXAsXG4gICAgICAgIG1pbkxlbmd0aCxcbiAgICAgICAgbWF4TGVuZ3RoLFxuICAgICAgICBsYWJlbCxcbiAgICAgICAgcmFuZ2UsXG4gICAgICAgIG11bHRpcGxlLFxuICAgICAgICBmb3JtYXQsXG4gICAgICAgIGRlZmF1bHRWYWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDmoKHpqozlrZfmrrXlgLxcbiAgICog5Y+q5pyJ6YCa6L+HcmVjb3JkLmdldEZpZWxkKCnojrflj5bnmoRmaWVsZOaJjeiDveagoemqjFxuICAgKiBAcmV0dXJuIHRydWUgfCBmYWxzZVxuICAgKi9cbiAgQGFjdGlvblxuICBhc3luYyBjaGVja1ZhbGlkaXR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGxldCB2YWxpZCA9IHRydWU7XG4gICAgY29uc3QgeyByZWNvcmQsIHZhbGlkYXRvciwgbmFtZSB9ID0gdGhpcztcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICB2YWxpZGF0b3IucmVzZXQoKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gcmVjb3JkLmdldChuYW1lKTtcbiAgICAgIHZhbGlkID0gYXdhaXQgdmFsaWRhdG9yLmNoZWNrVmFsaWRpdHkodmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH1cblxuICAvKipcbiAgICog6K+35rGCbG9va3Vw5YC8LCDlpoLmnInnvJPlrZjlgLznm7TmjqXojrflvpfjgIJcbiAgICogQHJldHVybiBQcm9taXNlPG9iamVjdFtdPlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hMb29rdXAoKTogUHJvbWlzZTxvYmplY3RbXSB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IGJhdGNoID0gZ2V0Q29uZmlnKCdsb29rdXBCYXRjaEF4aW9zQ29uZmlnJyk7XG4gICAgY29uc3QgbG9va3VwQ29kZSA9IHRoaXMuZ2V0KCdsb29rdXBDb2RlJyk7XG4gICAgY29uc3QgbG92UGFyYSA9IGdldExvdlBhcmEodGhpcywgdGhpcy5yZWNvcmQpO1xuICAgIGNvbnN0IGRzRmllbGQgPSB0aGlzLmZpbmREYXRhU2V0RmllbGQoKTtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChiYXRjaCAmJiBsb29rdXBDb2RlICYmIE9iamVjdC5rZXlzKGxvdlBhcmEpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKGRzRmllbGQgJiYgZHNGaWVsZC5nZXQoJ2xvb2t1cENvZGUnKSA9PT0gbG9va3VwQ29kZSkge1xuICAgICAgICB0aGlzLnNldCgnbG9va3VwJywgdW5kZWZpbmVkKTtcbiAgICAgICAgcmV0dXJuIGRzRmllbGQuZ2V0KCdsb29rdXAnKTtcbiAgICAgIH1cblxuICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5wZW5kaW5nLmFkZDxvYmplY3RbXSB8IHVuZGVmaW5lZD4oXG4gICAgICAgIGxvb2t1cFN0b3JlLmZldGNoTG9va3VwRGF0YUluQmF0Y2gobG9va3VwQ29kZSksXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBheGlvc0NvbmZpZyA9IGxvb2t1cFN0b3JlLmdldEF4aW9zQ29uZmlnKHRoaXMpO1xuICAgICAgaWYgKGRzRmllbGQpIHtcbiAgICAgICAgY29uc3QgZHNDb25maWcgPSBsb29rdXBTdG9yZS5nZXRBeGlvc0NvbmZpZyhkc0ZpZWxkKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRzQ29uZmlnLnVybCAmJlxuICAgICAgICAgIGJ1aWxkVVJMV2l0aEF4aW9zQ29uZmlnKGRzQ29uZmlnKSA9PT0gYnVpbGRVUkxXaXRoQXhpb3NDb25maWcoYXhpb3NDb25maWcpXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuc2V0KCdsb29rdXAnLCB1bmRlZmluZWQpO1xuICAgICAgICAgIHJldHVybiBkc0ZpZWxkLmdldCgnbG9va3VwJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChheGlvc0NvbmZpZy51cmwpIHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgdGhpcy5wZW5kaW5nLmFkZDxvYmplY3RbXSB8IHVuZGVmaW5lZD4oXG4gICAgICAgICAgbG9va3VwU3RvcmUuZmV0Y2hMb29rdXBEYXRhKGF4aW9zQ29uZmlnKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICBjb25zdCB7IGxvb2t1cCB9ID0gdGhpcztcbiAgICAgICAgdGhpcy5zZXQoJ2xvb2t1cCcsIHJlc3VsdCk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICBjb25zdCB2YWx1ZUZpZWxkID0gdGhpcy5nZXQoJ3ZhbHVlRmllbGQnKTtcbiAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlRmllbGQgJiYgbG9va3VwKSB7XG4gICAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgICAnbG9va3VwRGF0YScsXG4gICAgICAgICAgICBbXS5jb25jYXQodmFsdWUpLnJlZHVjZTxvYmplY3RbXT4oKGxvb2t1cERhdGEsIHYpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSBsb29rdXAuZmluZChpdGVtID0+IGlzU2FtZUxpa2UoaXRlbVt2YWx1ZUZpZWxkXSwgdikpO1xuICAgICAgICAgICAgICBpZiAoZm91bmQpIHtcbiAgICAgICAgICAgICAgICBsb29rdXBEYXRhLnB1c2goZm91bmQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBsb29rdXBEYXRhO1xuICAgICAgICAgICAgfSwgW10pLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hMb3ZDb25maWcoKSB7XG4gICAgY29uc3QgbG92Q29kZSA9IHRoaXMuZ2V0KCdsb3ZDb2RlJyk7XG4gICAgaWYgKGxvdkNvZGUpIHtcbiAgICAgIGF3YWl0IHRoaXMucGVuZGluZy5hZGQobG92Q29kZVN0b3JlLmZldGNoQ29uZmlnKGxvdkNvZGUsIHRoaXMpKTtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT09IEZpZWxkVHlwZS5vYmplY3QgfHwgdGhpcy50eXBlID09PSBGaWVsZFR5cGUuYXV0bykge1xuICAgICAgICBjb25zdCBvcHRpb25zID0gbG92Q29kZVN0b3JlLmdldExvdkRhdGFTZXQobG92Q29kZSwgdGhpcyk7XG4gICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgdGhpcy5zZXQoJ29wdGlvbnMnLCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzVmFsaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsaWQ7XG4gIH1cblxuICBnZXRWYWxpZGF0aW9uTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2U7XG4gIH1cblxuICBnZXRWYWxpZGl0eVN0YXRlKCk6IFZhbGlkaXR5IHtcbiAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRpdHk7XG4gIH1cblxuICBnZXRWYWxpZGF0aW9uRXJyb3JWYWx1ZXMoKTogVmFsaWRhdGlvblJlc3VsdFtdIHtcbiAgICByZXR1cm4gdGhpcy52YWxpZGF0b3IudmFsaWRhdGlvblJlc3VsdHM7XG4gIH1cblxuICByZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgIC8vIGNvbnN0IHsgb3B0aW9ucyB9ID0gdGhpcztcbiAgICAvLyByZXR1cm4gUHJvbWlzZS5hbGwoW3RoaXMucGVuZGluZy5yZWFkeSgpLCBvcHRpb25zICYmIG9wdGlvbnMucmVhZHkoKV0pO1xuICAgIHJldHVybiB0aGlzLnBlbmRpbmcucmVhZHkoKTtcbiAgfVxuXG4gIHByaXZhdGUgZmluZERhdGFTZXRGaWVsZCgpOiBGaWVsZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBkYXRhU2V0LCBuYW1lLCByZWNvcmQgfSA9IHRoaXM7XG4gICAgaWYgKHJlY29yZCAmJiBkYXRhU2V0ICYmIG5hbWUpIHtcbiAgICAgIHJldHVybiBkYXRhU2V0LmdldEZpZWxkKG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tEeW5hbWljUHJvcChwcm9wc05hbWUsIG5ld1Byb3ApIHtcbiAgICAvLyBpZiAocHJvcHNOYW1lIGluIHRoaXMubGFzdER5bmFtaWNQcm9wcykge1xuICAgIGNvbnN0IG9sZFByb3AgPSB0aGlzLmxhc3REeW5hbWljUHJvcHNbcHJvcHNOYW1lXTtcbiAgICBpZiAoIWlzRXF1YWxEeW5hbWljUHJvcHMob2xkUHJvcCwgbmV3UHJvcCkpIHtcbiAgICAgIGRlZmVyKFxuICAgICAgICBhY3Rpb24oKCkgPT4ge1xuICAgICAgICAgIGlmIChwcm9wc05hbWUgaW4gdGhpcy52YWxpZGF0b3IucHJvcHMgfHwgcHJvcHNOYW1lID09PSAndmFsaWRhdG9yJykge1xuICAgICAgICAgICAgdGhpcy52YWxpZGF0b3IucmVzZXQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuY2hlY2tWYWxpZGl0eSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmhhbmRsZVByb3BDaGFuZ2UocHJvcHNOYW1lLCBuZXdQcm9wLCBvbGRQcm9wKTtcbiAgICAgICAgfSksXG4gICAgICApO1xuICAgIH1cbiAgICAvLyB9XG4gICAgdGhpcy5sYXN0RHluYW1pY1Byb3BzW3Byb3BzTmFtZV0gPSBuZXdQcm9wO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVQcm9wQ2hhbmdlKHByb3BzTmFtZSwgbmV3UHJvcCwgb2xkUHJvcCkge1xuICAgIGlmIChwcm9wc05hbWUgPT09ICdiaW5kJyAmJiB0aGlzLnR5cGUgIT09IEZpZWxkVHlwZS5pbnRsKSB7XG4gICAgICBjb25zdCB7IHJlY29yZCB9ID0gdGhpcztcbiAgICAgIGlmIChyZWNvcmQgJiYgIXRoaXMuZGlydHkpIHtcbiAgICAgICAgaWYgKG5ld1Byb3ApIHtcbiAgICAgICAgICByZWNvcmQuaW5pdChuZXdQcm9wLCBPYmplY3RDaGFpblZhbHVlLmdldChyZWNvcmQuZGF0YSwgb2xkUHJvcCB8fCB0aGlzLm5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2xkUHJvcCkge1xuICAgICAgICAgIHJlY29yZC5pbml0KG9sZFByb3AsIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgW1xuICAgICAgICAndHlwZScsXG4gICAgICAgICdsb29rdXBVcmwnLFxuICAgICAgICAnbG9va3VwQ29kZScsXG4gICAgICAgICdsb29rdXBBeGlvc0NvbmZpZycsXG4gICAgICAgICdsb3ZDb2RlJyxcbiAgICAgICAgJ2xvdlF1ZXJ5QXhpb3NDb25maWcnLFxuICAgICAgICAnbG92UGFyYScsXG4gICAgICAgICdjYXNjYWRlTWFwJyxcbiAgICAgICAgJ2xvdlF1ZXJ5VXJsJyxcbiAgICAgIF0uaW5jbHVkZXMocHJvcHNOYW1lKVxuICAgICkge1xuICAgICAgdGhpcy5zZXQoJ2xvb2t1cERhdGEnLCB1bmRlZmluZWQpO1xuICAgICAgdGhpcy5mZXRjaExvb2t1cCgpO1xuICAgIH1cbiAgICBpZiAoWydsb3ZDb2RlJywgJ2xvdkRlZmluZUF4aW9zQ29uZmlnJywgJ2xvdkRlZmluZVVybCddLmluY2x1ZGVzKHByb3BzTmFtZSkpIHtcbiAgICAgIHRoaXMuZmV0Y2hMb3ZDb25maWcoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGV4ZWN1dGVEeW5hbWljUHJvcHMoZHluYW1pY1Byb3BzOiAoRHluYW1pY1Byb3BzQXJndW1lbnRzKSA9PiBhbnkpIHtcbiAgICBjb25zdCB7IGRhdGFTZXQsIG5hbWUsIHJlY29yZCB9ID0gdGhpcztcbiAgICBpZiAodGhpcy5pc0R5bmFtaWNQcm9wc0NvbXB1dGluZykge1xuICAgICAgd2FybmluZyhmYWxzZSwgYEN5Y2xlIGR5bmFtaWNQcm9wcyBleGVjdXRpb24gb2YgZmllbGQ8JHtuYW1lfT4uYCk7XG4gICAgfSBlbHNlIGlmIChkYXRhU2V0ICYmIHJlY29yZCkge1xuICAgICAgdGhpcy5pc0R5bmFtaWNQcm9wc0NvbXB1dGluZyA9IHRydWU7XG4gICAgICBjb25zdCBwcm9wcyA9IGR5bmFtaWNQcm9wcyh7IGRhdGFTZXQsIHJlY29yZCwgbmFtZSB9KTtcbiAgICAgIHRoaXMuaXNEeW5hbWljUHJvcHNDb21wdXRpbmcgPSBmYWxzZTtcbiAgICAgIHJldHVybiBwcm9wcztcbiAgICB9XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==