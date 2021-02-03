import queryString from 'querystringify';
import moment, { isDate, isMoment } from 'moment';
import { isArrayLike } from 'mobx';
import isBoolean from 'lodash/isBoolean';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig } from 'choerodon-ui/lib/configure';
import isNil from 'lodash/isNil';
import { isEmpty as _isEmpty } from 'lodash';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import localeContext, { $l } from '../locale-context';
import formatString from '../formatter/formatString';
import formatNumber from '../formatter/formatNumber';
import formatCurrency from '../formatter/formatCurrency';
import { getPrecision } from '../number-field/utils';
export function useNormal(dataToJSON) {
    return ["normal" /* normal */, "normal-self" /* 'normal-self' */].includes(dataToJSON);
}
export function useAll(dataToJSON) {
    return ["all" /* all */, "all-self" /* 'all-self' */].includes(dataToJSON);
}
export function useSelected(dataToJSON) {
    return ["selected" /* selected */, "selected-self" /* 'selected-self' */].includes(dataToJSON);
}
export function useCascade(dataToJSON) {
    return ["dirty" /* dirty */, "selected" /* selected */, "all" /* all */, "normal" /* normal */].includes(dataToJSON);
}
export function useDirty(dataToJSON) {
    return ["dirty" /* dirty */, "dirty-self" /* 'dirty-self' */].includes(dataToJSON);
}
export function append(url, suffix) {
    if (suffix) {
        return url + queryString.stringify(suffix, url.indexOf('?') === -1);
    }
    return url;
}
export function getOrderFields(fields) {
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
export const arrayMove = (array, from, to) => {
    const startIndex = to < 0 ? array.length + to : to;
    const item = array.splice(from, 1)[0];
    array.splice(startIndex, 0, item);
};
function processOne(value, field, checkRange = true) {
    if (!isEmpty(value)) {
        const range = field.get('range');
        if (range && checkRange) {
            if (isArrayLike(range)) {
                if (isObject(value)) {
                    const [start, end] = range;
                    value[start] = processOne(value[start], field, false);
                    value[end] = processOne(value[end], field, false);
                }
            }
            else if (isArrayLike(value)) {
                value[0] = processOne(value[0], field, false);
                value[1] = processOne(value[1], field, false);
            }
        }
        else if (value instanceof Date) {
            value = moment(value);
        }
        else if (!isObject(value)) {
            value = formatString(value, {
                trim: field.get('trim'),
                format: field.get('format'),
            });
            switch (field.type) {
                case "boolean" /* boolean */: {
                    const trueValue = field.get("trueValue" /* trueValue */);
                    const falseValue = field.get("falseValue" /* falseValue */);
                    if (value !== trueValue) {
                        value = falseValue;
                    }
                    break;
                }
                case "number" /* number */:
                case "currency" /* currency */:
                    if (!isNaN(value)) {
                        value = Number(value);
                    }
                    else {
                        value = undefined;
                    }
                    break;
                case "string" /* string */:
                case "intl" /* intl */:
                case "email" /* email */:
                case "url" /* url */:
                    value = String(value);
                    break;
                case "date" /* date */:
                case "dateTime" /* dateTime */:
                case "time" /* time */:
                case "week" /* week */:
                case "month" /* month */:
                case "year" /* year */: {
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
export function processValue(value, field) {
    if (field) {
        const multiple = field.get('multiple');
        const range = field.get('range');
        if (multiple) {
            if (isEmpty(value)) {
                value = [];
            }
            else if (!isArray(value)) {
                if (isString(multiple) && isString(value)) {
                    value = value.split(multiple);
                }
                else {
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
const processRangeToText = (resultValue, field) => {
    return resultValue.map((item) => {
        const valueRange = isMoment(item)
            ? item.format()
            : isObject(item)
                ? item[field.get('textField')]
                : item.toString();
        return valueRange;
    }).join(`~`);
};
export function processExportValue(value, field) {
    if (field) {
        const multiple = field.get('multiple');
        const range = field.get('range');
        if (multiple) {
            if (isEmpty(value)) {
                value = [];
            }
            else if (!isArray(value)) {
                if (isString(multiple) && isString(value)) {
                    value = value.split(multiple);
                }
                else {
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
export function getSplitValue(dataItem, name, isBind = true) {
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
        return dataItem[name];
    }
    return dataItem;
}
export function childrenInfoForDelete(json, children) {
    return Object.keys(children).reduce((data, name) => {
        const child = children[name];
        if (child) {
            data[name] = [childrenInfoForDelete({}, child.children)];
        }
        return data;
    }, json);
}
export function sortTree(children, orderField) {
    if (orderField && children.length > 0) {
        const { name, order } = orderField;
        const m = Number.MIN_SAFE_INTEGER;
        children.sort((record1, record2) => {
            const a = record1.get(name) || m;
            const b = record2.get(name) || m;
            if (isString(a) || isString(b)) {
                return order === "asc" /* asc */
                    ? String(a).localeCompare(String(b))
                    : String(b).localeCompare(String(a));
            }
            return order === "asc" /* asc */ ? a - b : b - a;
        });
    }
    return children;
}
// 递归生成树获取树形结构数据
function availableTree(idField, parentField, parentId, allData) {
    let result = [];
    allData.forEach(element => {
        if (element[parentField] === parentId) {
            const childresult = availableTree(idField, parentField, element[idField], allData);
            result = result.concat(element).concat(childresult);
        }
    });
    return result;
}
// 获取单个页面能够展示的数据
export function sliceTree(idField, parentField, allData, pageSize) {
    let availableTreeData = [];
    if (allData.length) {
        let parentLength = 0;
        allData.forEach((item) => {
            if (item) {
                if (isNil(item[parentField]) && !isNil(idField) && parentLength < pageSize) {
                    parentLength++;
                    const childresult = availableTree(idField, parentField, item[idField], allData);
                    availableTreeData = availableTreeData.concat(item).concat(childresult);
                }
            }
        });
    }
    return availableTreeData;
}
export function checkParentByInsert({ parent }) {
    if (parent && !parent.current) {
        throw new Error($l('DataSet', 'cannot_add_record_when_head_no_current'));
    }
}
function getValueType(value) {
    return isBoolean(value)
        ? "boolean" /* boolean */
        : isNumber(value)
            ? "number" /* number */
            : isString(value)
                ? "string" /* string */
                : isMoment(value)
                    ? "date" /* date */
                    : isObject(value)
                        ? "object" /* object */
                        : "auto" /* auto */;
}
function getBaseType(type) {
    switch (type) {
        case "number" /* number */:
        case "currency" /* currency */:
            return "number" /* number */;
        case "dateTime" /* dateTime */:
        case "time" /* time */:
        case "week" /* week */:
        case "month" /* month */:
        case "year" /* year */:
            return "date" /* date */;
        case "intl" /* intl */:
        case "url" /* url */:
        case "email" /* email */:
            return "string" /* string */;
        default:
            return type;
    }
}
export function checkFieldType(value, field) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isEmpty(value)) {
            if (isArrayLike(value)) {
                return value.every(item => checkFieldType(item, field));
            }
            const fieldType = getBaseType(field.type);
            const valueType = field.type === "boolean" /* boolean */ &&
                [field.get("trueValue" /* trueValue */), field.get("falseValue" /* falseValue */)].includes(value)
                ? "boolean" /* boolean */
                : getValueType(value);
            if (fieldType !== "auto" /* auto */ &&
                fieldType !== "reactNode" /* reactNode */ &&
                fieldType !== valueType) {
                warning(false, `Value type error: The value<${value}>'s type is ${valueType}, but the field<${field.name}>'s type is ${fieldType}.`);
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
export function findBindFields(myField, fields, excludeSelf) {
    const { name } = myField;
    return [...fields.values()].filter(field => {
        if (field !== myField) {
            const bind = field.get('bind');
            return isString(bind) && bind.startsWith(`${name}.`);
        }
        return !excludeSelf;
    });
}
export function findBindField(myField, fields, callback) {
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
export function getFieldSorter(field) {
    const { name } = field;
    switch (field.type) {
        case "number" /* number */:
        case "currency" /* currency */:
        case "date" /* date */:
        case "dateTime" /* dateTime */:
        case "week" /* week */:
        case "month" /* month */:
        case "year" /* year */:
        case "time" /* time */:
            return field.order === "asc" /* asc */
                ? (a, b) => numberSorter(a.get(name), b.get(name))
                : (a, b) => numberSorter(b.get(name), a.get(name));
        default:
            return field.order === "asc" /* asc */
                ? (a, b) => stringSorter(a.get(name), b.get(name))
                : (a, b) => stringSorter(b.get(name), a.get(name));
    }
}
export function generateRecordJSONData(array, record, dataToJSON) {
    const normal = useNormal(dataToJSON);
    const json = normal
        ? record.status !== "delete" /* delete */ && record.toData()
        : record.toJSONData();
    if (json && (normal || useAll(dataToJSON) || !useDirty(dataToJSON) || json.__dirty)) {
        delete json.__dirty;
        array.push(json);
    }
}
export function prepareSubmitData(records, dataToJSON) {
    const created = [];
    const updated = [];
    const destroyed = [];
    function storeWith(status) {
        switch (status) {
            case "add" /* add */:
                return created;
            case "delete" /* delete */:
                return destroyed;
            default:
                return updated;
        }
    }
    records.forEach(record => generateRecordJSONData(storeWith(record.status), record, dataToJSON));
    return [created, updated, destroyed];
}
function defaultAxiosConfigAdapter(config) {
    return config;
}
function generateConfig(config, dataSet, data, params, options) {
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
export function axiosConfigAdapter(type, dataSet, data, params, options) {
    const newConfig = {
        data,
        params,
        method: 'post',
    };
    const { [type]: globalConfig, adapter: globalAdapter = defaultAxiosConfigAdapter } = getConfig('transport') || {};
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
export function findRootParent(children) {
    if (children.parent) {
        return findRootParent(children.parent);
    }
    return children;
}
export function prepareForSubmit(type, data, configs, dataSet) {
    if (data.length) {
        const newConfig = axiosConfigAdapter(type, dataSet, data);
        if (newConfig.url) {
            configs.push(newConfig);
        }
        else {
            return data;
        }
    }
    return [];
}
export function generateResponseData(item, dataKey) {
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
            }
            else {
                return [item];
            }
        }
    }
    return [];
}
export function getRecordValue(data, cb, fieldName) {
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
                const trueValue = field ? field.get("trueValue" /* trueValue */) : true;
                const falseValue = field ? field.get("falseValue" /* falseValue */) : false;
                const { children } = this;
                if (children) {
                    return children.every(child => cb(child, checkField) === trueValue)
                        ? trueValue
                        : falseValue;
                }
            }
        }
        return ObjectChainValue.get(data, fieldName);
    }
}
function tlsBind(props, name, lang, tlsKey) {
    const tls = props.record.get(tlsKey) || {};
    if (name in tls) {
        return `${tlsKey}.${name}.${lang}`;
    }
}
export function processIntlField(name, fieldProps, callback, dataSet) {
    const tlsKey = getConfig('tlsKey');
    const { supports } = localeContext;
    const languages = Object.keys(supports);
    const { type, dynamicProps } = fieldProps;
    if (type === "intl" /* intl */) {
        languages.forEach(language => callback(`${tlsKey}.${name}.${language}`, {
            type: "string" /* string */,
            label: `${supports[language]}`,
        }));
        const { lang = localeContext.locale.lang } = dataSet || {};
        const newDynamicProps = typeof dynamicProps === 'function'
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
export function findBindFieldBy(myField, fields, prop) {
    const value = myField.get(prop);
    const myName = myField.name;
    return [...fields.values()].find(field => {
        const bind = field.get('bind');
        return bind && bind === `${myName}.${value}`;
    });
}
export function processFieldValue(value, field, lang, showValueIfNotFound) {
    const { type } = field;
    if (type === "number" /* number */) {
        const precision = getPrecision(value || 0);
        const options = {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        };
        return formatNumber(value, lang, options);
    }
    if (type === "currency" /* currency */) {
        return formatCurrency(value, lang, {
            currency: field.get('currency'),
        });
    }
    return field.getText(value, showValueIfNotFound);
}
export function getLimit(limit, record) {
    if (isString(limit) && record.getField(limit)) {
        return record.get(limit);
    }
    return limit;
}
export function adapterDataToJSON(isSelected, noCascade) {
    if (isSelected) {
        if (noCascade) {
            return "selected-self" /* 'selected-self' */;
        }
        return "selected" /* selected */;
    }
    if (noCascade) {
        return "dirty-self" /* 'dirty-self' */;
    }
    return undefined;
}
export function generateData(ds) {
    let dirty = ds.destroyed.length > 0;
    const data = ds.data.map(record => {
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
export function generateJSONData(ds, isSelect) {
    const { dataToJSON } = ds;
    const data = [];
    (isSelect || useSelected(dataToJSON) ? ds.selected : ds.records).forEach(record => generateRecordJSONData(data, record, dataToJSON));
    return {
        dirty: data.length > 0,
        data,
    };
}
export function isDirtyRecord(record) {
    return record.status !== "sync" /* sync */ || record.dirty;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGEtc2V0L3V0aWxzLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLFdBQVcsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDbEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVuQyxPQUFPLFNBQVMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLE9BQU8sTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxLQUFLLE1BQU0sY0FBYyxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxPQUFPLElBQUksUUFBUSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBSzdDLE9BQU8sT0FBTyxNQUFNLGtCQUFrQixDQUFDO0FBQ3ZDLE9BQU8sS0FBSyxnQkFBZ0IsTUFBTSwyQkFBMkIsQ0FBQztBQUM5RCxPQUFPLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRXRELE9BQU8sWUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBRXJELE9BQU8sWUFBWSxNQUFNLDJCQUEyQixDQUFDO0FBQ3JELE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVyRCxNQUFNLFVBQVUsU0FBUyxDQUFDLFVBQXNCO0lBQzlDLE9BQU8sMERBQThDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxD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Q0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FDaEYsc0JBQXNCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FDakQsQ0FBQztJQUNGLE9BQU87UUFDTCxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO1FBQ3RCLElBQUk7S0FDTCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsTUFBTTtJQUNsQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDN0QsQ0FBQyIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy1wcm8vZGF0YS1zZXQvdXRpbHMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeXN0cmluZ2lmeSc7XG5pbXBvcnQgbW9tZW50LCB7IGlzRGF0ZSwgaXNNb21lbnQgfSBmcm9tICdtb21lbnQnO1xuaW1wb3J0IHsgaXNBcnJheUxpa2UgfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gJ2F4aW9zJztcbmltcG9ydCBpc0Jvb2xlYW4gZnJvbSAnbG9kYXNoL2lzQm9vbGVhbic7XG5pbXBvcnQgaXNPYmplY3QgZnJvbSAnbG9kYXNoL2lzT2JqZWN0JztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IGlzQXJyYXkgZnJvbSAnbG9kYXNoL2lzQXJyYXknO1xuaW1wb3J0IGlzTnVtYmVyIGZyb20gJ2xvZGFzaC9pc051bWJlcic7XG5pbXBvcnQgd2FybmluZyBmcm9tICdjaG9lcm9kb24tdWkvbGliL191dGlsL3dhcm5pbmcnO1xuaW1wb3J0IHsgZ2V0Q29uZmlnIH0gZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9jb25maWd1cmUnO1xuaW1wb3J0IGlzTmlsIGZyb20gJ2xvZGFzaC9pc05pbCc7XG5pbXBvcnQgeyBpc0VtcHR5IGFzIF9pc0VtcHR5IH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBGaWVsZCwgeyBEeW5hbWljUHJvcHNBcmd1bWVudHMsIEZpZWxkUHJvcHMsIEZpZWxkcyB9IGZyb20gJy4vRmllbGQnO1xuaW1wb3J0IHsgQm9vbGVhblZhbHVlLCBEYXRhVG9KU09OLCBGaWVsZFR5cGUsIFJlY29yZFN0YXR1cywgU29ydE9yZGVyIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCBEYXRhU2V0IGZyb20gJy4vRGF0YVNldCc7XG5pbXBvcnQgUmVjb3JkIGZyb20gJy4vUmVjb3JkJztcbmltcG9ydCBpc0VtcHR5IGZyb20gJy4uL191dGlsL2lzRW1wdHknO1xuaW1wb3J0ICogYXMgT2JqZWN0Q2hhaW5WYWx1ZSBmcm9tICcuLi9fdXRpbC9PYmplY3RDaGFpblZhbHVlJztcbmltcG9ydCBsb2NhbGVDb250ZXh0LCB7ICRsIH0gZnJvbSAnLi4vbG9jYWxlLWNvbnRleHQnO1xuaW1wb3J0IHsgU3VibWl0VHlwZXMsIFRyYW5zcG9ydFR5cGUsIFRyYW5zcG9ydFR5cGVzIH0gZnJvbSAnLi9UcmFuc3BvcnQnO1xuaW1wb3J0IGZvcm1hdFN0cmluZyBmcm9tICcuLi9mb3JtYXR0ZXIvZm9ybWF0U3RyaW5nJztcbmltcG9ydCB7IExhbmcgfSBmcm9tICcuLi9sb2NhbGUtY29udGV4dC9lbnVtJztcbmltcG9ydCBmb3JtYXROdW1iZXIgZnJvbSAnLi4vZm9ybWF0dGVyL2Zvcm1hdE51bWJlcic7XG5pbXBvcnQgZm9ybWF0Q3VycmVuY3kgZnJvbSAnLi4vZm9ybWF0dGVyL2Zvcm1hdEN1cnJlbmN5JztcbmltcG9ydCB7IGdldFByZWNpc2lvbiB9IGZyb20gJy4uL251bWJlci1maWVsZC91dGlscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VOb3JtYWwoZGF0YVRvSlNPTjogRGF0YVRvSlNPTik6IGJvb2xlYW4ge1xuICByZXR1cm4gW0RhdGFUb0pTT04ubm9ybWFsLCBEYXRhVG9KU09OWydub3JtYWwtc2VsZiddXS5pbmNsdWRlcyhkYXRhVG9KU09OKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUFsbChkYXRhVG9KU09OOiBEYXRhVG9KU09OKTogYm9vbGVhbiB7XG4gIHJldHVybiBbRGF0YVRvSlNPTi5hbGwsIERhdGFUb0pTT05bJ2FsbC1zZWxmJ11dLmluY2x1ZGVzKGRhdGFUb0pTT04pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2VsZWN0ZWQoZGF0YVRvSlNPTjogRGF0YVRvSlNPTik6IGJvb2xlYW4ge1xuICByZXR1cm4gW0RhdGFUb0pTT04uc2VsZWN0ZWQsIERhdGFUb0pTT05bJ3NlbGVjdGVkLXNlbGYnXV0uaW5jbHVkZXMoZGF0YVRvSlNPTik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VDYXNjYWRlKGRhdGFUb0pTT046IERhdGFUb0pTT04pOiBib29sZWFuIHtcbiAgcmV0dXJuIFtEYXRhVG9KU09OLmRpcnR5LCBEYXRhVG9KU09OLnNlbGVjdGVkLCBEYXRhVG9KU09OLmFsbCwgRGF0YVRvSlNPTi5ub3JtYWxdLmluY2x1ZGVzKFxuICAgIGRhdGFUb0pTT04sXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEaXJ0eShkYXRhVG9KU09OOiBEYXRhVG9KU09OKTogYm9vbGVhbiB7XG4gIHJldHVybiBbRGF0YVRvSlNPTi5kaXJ0eSwgRGF0YVRvSlNPTlsnZGlydHktc2VsZiddXS5pbmNsdWRlcyhkYXRhVG9KU09OKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZCh1cmw6IHN0cmluZywgc3VmZml4Pzogb2JqZWN0KSB7XG4gIGlmIChzdWZmaXgpIHtcbiAgICByZXR1cm4gdXJsICsgcXVlcnlTdHJpbmcuc3RyaW5naWZ5KHN1ZmZpeCwgdXJsLmluZGV4T2YoJz8nKSA9PT0gLTEpO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcmRlckZpZWxkcyhmaWVsZHM6IEZpZWxkcyk6IEZpZWxkW10ge1xuICByZXR1cm4gWy4uLmZpZWxkcy52YWx1ZXMoKV0uZmlsdGVyKCh7IG9yZGVyIH0pID0+IG9yZGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NUb0pTT04odmFsdWUpIHtcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICB2YWx1ZSA9IG1vbWVudCh2YWx1ZSk7XG4gIH1cbiAgaWYgKGlzTW9tZW50KHZhbHVlKSkge1xuICAgIGNvbnN0IHsganNvbkRhdGUgfSA9IGdldENvbmZpZygnZm9ybWF0dGVyJyk7XG4gICAgdmFsdWUgPSBqc29uRGF0ZSA/IHZhbHVlLmZvcm1hdChqc29uRGF0ZSkgOiArdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5leHBvcnQgY29uc3QgYXJyYXlNb3ZlID0gKGFycmF5OiBSZWNvcmRbXSwgZnJvbTogbnVtYmVyLCB0bzogbnVtYmVyKSA9PiB7XG4gIGNvbnN0IHN0YXJ0SW5kZXggPSB0byA8IDAgPyBhcnJheS5sZW5ndGggKyB0byA6IHRvO1xuICBjb25zdCBpdGVtID0gYXJyYXkuc3BsaWNlKGZyb20sIDEpWzBdXG4gIGFycmF5LnNwbGljZShzdGFydEluZGV4LCAwLCBpdGVtKVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzT25lKHZhbHVlOiBhbnksIGZpZWxkOiBGaWVsZCwgY2hlY2tSYW5nZTogYm9vbGVhbiA9IHRydWUpIHtcbiAgaWYgKCFpc0VtcHR5KHZhbHVlKSkge1xuICAgIGNvbnN0IHJhbmdlID0gZmllbGQuZ2V0KCdyYW5nZScpO1xuICAgIGlmIChyYW5nZSAmJiBjaGVja1JhbmdlKSB7XG4gICAgICBpZiAoaXNBcnJheUxpa2UocmFuZ2UpKSB7XG4gICAgICAgIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSByYW5nZTtcbiAgICAgICAgICB2YWx1ZVtzdGFydF0gPSBwcm9jZXNzT25lKHZhbHVlW3N0YXJ0XSwgZmllbGQsIGZhbHNlKTtcbiAgICAgICAgICB2YWx1ZVtlbmRdID0gcHJvY2Vzc09uZSh2YWx1ZVtlbmRdLCBmaWVsZCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSkge1xuICAgICAgICB2YWx1ZVswXSA9IHByb2Nlc3NPbmUodmFsdWVbMF0sIGZpZWxkLCBmYWxzZSk7XG4gICAgICAgIHZhbHVlWzFdID0gcHJvY2Vzc09uZSh2YWx1ZVsxXSwgZmllbGQsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgdmFsdWUgPSBtb21lbnQodmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgdmFsdWUgPSBmb3JtYXRTdHJpbmcodmFsdWUsIHtcbiAgICAgICAgdHJpbTogZmllbGQuZ2V0KCd0cmltJyksXG4gICAgICAgIGZvcm1hdDogZmllbGQuZ2V0KCdmb3JtYXQnKSxcbiAgICAgIH0pO1xuICAgICAgc3dpdGNoIChmaWVsZC50eXBlKSB7XG4gICAgICAgIGNhc2UgRmllbGRUeXBlLmJvb2xlYW46IHtcbiAgICAgICAgICBjb25zdCB0cnVlVmFsdWUgPSBmaWVsZC5nZXQoQm9vbGVhblZhbHVlLnRydWVWYWx1ZSk7XG4gICAgICAgICAgY29uc3QgZmFsc2VWYWx1ZSA9IGZpZWxkLmdldChCb29sZWFuVmFsdWUuZmFsc2VWYWx1ZSk7XG4gICAgICAgICAgaWYgKHZhbHVlICE9PSB0cnVlVmFsdWUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gZmFsc2VWYWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBGaWVsZFR5cGUubnVtYmVyOlxuICAgICAgICBjYXNlIEZpZWxkVHlwZS5jdXJyZW5jeTpcbiAgICAgICAgICBpZiAoIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRmllbGRUeXBlLnN0cmluZzpcbiAgICAgICAgY2FzZSBGaWVsZFR5cGUuaW50bDpcbiAgICAgICAgY2FzZSBGaWVsZFR5cGUuZW1haWw6XG4gICAgICAgIGNhc2UgRmllbGRUeXBlLnVybDpcbiAgICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRmllbGRUeXBlLmRhdGU6XG4gICAgICAgIGNhc2UgRmllbGRUeXBlLmRhdGVUaW1lOlxuICAgICAgICBjYXNlIEZpZWxkVHlwZS50aW1lOlxuICAgICAgICBjYXNlIEZpZWxkVHlwZS53ZWVrOlxuICAgICAgICBjYXNlIEZpZWxkVHlwZS5tb250aDpcbiAgICAgICAgY2FzZSBGaWVsZFR5cGUueWVhcjoge1xuICAgICAgICAgIGNvbnN0IHsganNvbkRhdGUgfSA9IGdldENvbmZpZygnZm9ybWF0dGVyJyk7XG4gICAgICAgICAgdmFsdWUgPSBqc29uRGF0ZSA/IG1vbWVudCh2YWx1ZSwganNvbkRhdGUpIDogbW9tZW50KHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzVmFsdWUodmFsdWU6IGFueSwgZmllbGQ/OiBGaWVsZCk6IGFueSB7XG4gIGlmIChmaWVsZCkge1xuICAgIGNvbnN0IG11bHRpcGxlID0gZmllbGQuZ2V0KCdtdWx0aXBsZScpO1xuICAgIGNvbnN0IHJhbmdlID0gZmllbGQuZ2V0KCdyYW5nZScpO1xuICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgaWYgKGlzRW1wdHkodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gW107XG4gICAgICB9IGVsc2UgaWYgKCFpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBpZiAoaXNTdHJpbmcobXVsdGlwbGUpICYmIGlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQobXVsdGlwbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkgJiYgKG11bHRpcGxlIHx8ICFyYW5nZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiBwcm9jZXNzT25lKGl0ZW0sIGZpZWxkKSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9jZXNzT25lKHZhbHVlLCBmaWVsZCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG4vLyDlpITnkIbljZXkuKpyYW5nZVxuY29uc3QgcHJvY2Vzc1JhbmdlVG9UZXh0ID0gKHJlc3VsdFZhbHVlLCBmaWVsZCk6IHN0cmluZyA9PiB7XG4gIHJldHVybiByZXN1bHRWYWx1ZS5tYXAoKGl0ZW0pID0+IHtcbiAgICBjb25zdCB2YWx1ZVJhbmdlID0gaXNNb21lbnQoaXRlbSlcbiAgICAgID8gaXRlbS5mb3JtYXQoKVxuICAgICAgOiBpc09iamVjdChpdGVtKVxuICAgICAgICA/IGl0ZW1bZmllbGQuZ2V0KCd0ZXh0RmllbGQnKV1cbiAgICAgICAgOiBpdGVtLnRvU3RyaW5nKClcbiAgICByZXR1cm4gdmFsdWVSYW5nZVxuICB9KS5qb2luKGB+YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NFeHBvcnRWYWx1ZSh2YWx1ZTogYW55LCBmaWVsZD86IEZpZWxkKTogYW55IHtcbiAgaWYgKGZpZWxkKSB7XG4gICAgY29uc3QgbXVsdGlwbGUgPSBmaWVsZC5nZXQoJ211bHRpcGxlJyk7XG4gICAgY29uc3QgcmFuZ2UgPSBmaWVsZC5nZXQoJ3JhbmdlJyk7XG4gICAgaWYgKG11bHRpcGxlKSB7XG4gICAgICBpZiAoaXNFbXB0eSh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBbXTtcbiAgICAgIH0gZWxzZSBpZiAoIWlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmIChpc1N0cmluZyhtdWx0aXBsZSkgJiYgaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdChtdWx0aXBsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiAobXVsdGlwbGUgfHwgIXJhbmdlKSkge1xuICAgICAgaWYgKGZpZWxkICYmICFfaXNFbXB0eShmaWVsZC5sb29rdXApKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiBmaWVsZC5nZXRUZXh0KHByb2Nlc3NPbmUoaXRlbSwgZmllbGQpKSkuam9pbignLCcpXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICBjb25zdCBpdGVtVmFsdWUgPSBwcm9jZXNzT25lKGl0ZW0sIGZpZWxkKVxuICAgICAgICBpZiAoZmllbGQgJiYgZmllbGQuZ2V0KCd0ZXh0RmllbGQnKSAmJiBpdGVtVmFsdWUgJiYgaXNPYmplY3QoaXRlbVZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBpdGVtVmFsdWVbZmllbGQuZ2V0KCd0ZXh0RmllbGQnKV1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXRlbVZhbHVlXG4gICAgICB9KS5qb2luKCcsJyk7XG4gICAgfVxuICAgIGlmIChpc0FycmF5KHZhbHVlKSAmJiBtdWx0aXBsZSAmJiByYW5nZSkge1xuICAgICAgaWYgKGZpZWxkICYmICFfaXNFbXB0eShmaWVsZC5sb29rdXApKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5tYXAoaXRlbSA9PiBmaWVsZC5nZXRUZXh0KHByb2Nlc3NSYW5nZVRvVGV4dChwcm9jZXNzT25lKGl0ZW0sIGZpZWxkKSwgZmllbGQpKSkuam9pbignLCcpXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUubWFwKGl0ZW0gPT4ge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc1JhbmdlVG9UZXh0KHByb2Nlc3NPbmUoaXRlbSwgZmllbGQpLCBmaWVsZClcbiAgICAgIH0pLmpvaW4oJywnKTtcbiAgICB9XG4gICAgaWYgKGZpZWxkICYmICFfaXNFbXB0eShmaWVsZC5sb29rdXApKSB7XG4gICAgICByZXR1cm4gZmllbGQuZ2V0VGV4dChwcm9jZXNzT25lKHZhbHVlLCBmaWVsZCkpXG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdFZhbHVlID0gcHJvY2Vzc09uZSh2YWx1ZSwgZmllbGQpXG4gICAgaWYgKGlzTW9tZW50KHJlc3VsdFZhbHVlKSkge1xuICAgICAgcmV0dXJuIHJlc3VsdFZhbHVlLmZvcm1hdCgpXG4gICAgfVxuICAgIGlmIChmaWVsZCAmJiBmaWVsZC5nZXQoJ3RleHRGaWVsZCcpICYmIHJlc3VsdFZhbHVlICYmIGlzT2JqZWN0KHJlc3VsdFZhbHVlKSkge1xuICAgICAgaWYgKHJhbmdlICYmIGlzQXJyYXlMaWtlKHJlc3VsdFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gcHJvY2Vzc1JhbmdlVG9UZXh0KHJlc3VsdFZhbHVlLCBmaWVsZCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0VmFsdWVbZmllbGQuZ2V0KCd0ZXh0RmllbGQnKV1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFZhbHVlO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiDlrp7njrDlpoLmnpzlkI3lrZfmmK/luKbmnInlsZ7mgKflkKvkuYlgLmDmib7liLDog73lpJ/lr7zlh7rnmoTlgLxcbiAqIEBwYXJhbSBkYXRhSXRlbSDkuIDooYzmlbDmja5cbiAqIEBwYXJhbSBuYW1lIOWvueW6lOeahGZpZWxkbmFtZVxuICogQHBhcmFtIGlzQmluZCDmmK/lkKbmmK/ku47nu5Hlrprojrflj5blgLxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNwbGl0VmFsdWUoZGF0YUl0ZW06IGFueSwgbmFtZTogc3RyaW5nLCBpc0JpbmQ6IGJvb2xlYW4gPSB0cnVlKTogYW55IHtcbiAgY29uc3QgbmFtZUFycmF5ID0gbmFtZS5zcGxpdCgnLicpO1xuICBpZiAobmFtZUFycmF5Lmxlbmd0aCA+IDEpIHtcbiAgICBsZXQgbGV2ZWxWYWx1ZSA9IGRhdGFJdGVtXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYW1lQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNPYmplY3QobGV2ZWxWYWx1ZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaXNCaW5kIHx8IGkgIT09IDApIHtcbiAgICAgICAgbGV2ZWxWYWx1ZSA9IGxldmVsVmFsdWVbbmFtZUFycmF5W2ldXVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGV2ZWxWYWx1ZTtcbiAgfVxuICBpZiAoaXNCaW5kKSB7XG4gICAgcmV0dXJuIGRhdGFJdGVtW25hbWVdXG4gIH1cbiAgcmV0dXJuIGRhdGFJdGVtO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRyZW5JbmZvRm9yRGVsZXRlKGpzb246IHt9LCBjaGlsZHJlbjogeyBba2V5OiBzdHJpbmddOiBEYXRhU2V0IH0pOiB7fSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhjaGlsZHJlbikucmVkdWNlKChkYXRhLCBuYW1lKSA9PiB7XG4gICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlbltuYW1lXTtcbiAgICBpZiAoY2hpbGQpIHtcbiAgICAgIGRhdGFbbmFtZV0gPSBbY2hpbGRyZW5JbmZvRm9yRGVsZXRlKHt9LCBjaGlsZC5jaGlsZHJlbildO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfSwganNvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0VHJlZShjaGlsZHJlbjogUmVjb3JkW10sIG9yZGVyRmllbGQ6IEZpZWxkKTogUmVjb3JkW10ge1xuICBpZiAob3JkZXJGaWVsZCAmJiBjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgeyBuYW1lLCBvcmRlciB9ID0gb3JkZXJGaWVsZDtcbiAgICBjb25zdCBtID0gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVI7XG4gICAgY2hpbGRyZW4uc29ydCgocmVjb3JkMSwgcmVjb3JkMikgPT4ge1xuICAgICAgY29uc3QgYSA9IHJlY29yZDEuZ2V0KG5hbWUpIHx8IG07XG4gICAgICBjb25zdCBiID0gcmVjb3JkMi5nZXQobmFtZSkgfHwgbTtcbiAgICAgIGlmIChpc1N0cmluZyhhKSB8fCBpc1N0cmluZyhiKSkge1xuICAgICAgICByZXR1cm4gb3JkZXIgPT09IFNvcnRPcmRlci5hc2NcbiAgICAgICAgICA/IFN0cmluZyhhKS5sb2NhbGVDb21wYXJlKFN0cmluZyhiKSlcbiAgICAgICAgICA6IFN0cmluZyhiKS5sb2NhbGVDb21wYXJlKFN0cmluZyhhKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3JkZXIgPT09IFNvcnRPcmRlci5hc2MgPyBhIC0gYiA6IGIgLSBhO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBjaGlsZHJlbjtcbn1cblxuLy8g6YCS5b2S55Sf5oiQ5qCR6I635Y+W5qCR5b2i57uT5p6E5pWw5o2uXG5mdW5jdGlvbiBhdmFpbGFibGVUcmVlKGlkRmllbGQsIHBhcmVudEZpZWxkLCBwYXJlbnRJZCwgYWxsRGF0YSkge1xuICBsZXQgcmVzdWx0ID0gW11cbiAgYWxsRGF0YS5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgIGlmIChlbGVtZW50W3BhcmVudEZpZWxkXSA9PT0gcGFyZW50SWQpIHtcbiAgICAgIGNvbnN0IGNoaWxkcmVzdWx0ID0gYXZhaWxhYmxlVHJlZShpZEZpZWxkLCBwYXJlbnRGaWVsZCwgZWxlbWVudFtpZEZpZWxkXSwgYWxsRGF0YSk7XG4gICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGVsZW1lbnQpLmNvbmNhdChjaGlsZHJlc3VsdClcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5cbi8vIOiOt+WPluWNleS4qumhtemdouiDveWkn+WxleekuueahOaVsOaNrlxuZXhwb3J0IGZ1bmN0aW9uIHNsaWNlVHJlZShpZEZpZWxkLCBwYXJlbnRGaWVsZCwgYWxsRGF0YSwgcGFnZVNpemUpIHtcbiAgbGV0IGF2YWlsYWJsZVRyZWVEYXRhID0gW11cbiAgaWYgKGFsbERhdGEubGVuZ3RoKSB7XG4gICAgbGV0IHBhcmVudExlbmd0aCA9IDBcbiAgICBhbGxEYXRhLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgIGlmIChpc05pbChpdGVtW3BhcmVudEZpZWxkXSkgJiYgIWlzTmlsKGlkRmllbGQpICYmIHBhcmVudExlbmd0aCA8IHBhZ2VTaXplKSB7XG4gICAgICAgICAgcGFyZW50TGVuZ3RoKytcbiAgICAgICAgICBjb25zdCBjaGlsZHJlc3VsdCA9IGF2YWlsYWJsZVRyZWUoaWRGaWVsZCwgcGFyZW50RmllbGQsIGl0ZW1baWRGaWVsZF0sIGFsbERhdGEpXG4gICAgICAgICAgYXZhaWxhYmxlVHJlZURhdGEgPSBhdmFpbGFibGVUcmVlRGF0YS5jb25jYXQoaXRlbSkuY29uY2F0KGNoaWxkcmVzdWx0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZXR1cm4gYXZhaWxhYmxlVHJlZURhdGFcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUGFyZW50QnlJbnNlcnQoeyBwYXJlbnQgfTogRGF0YVNldCkge1xuICBpZiAocGFyZW50ICYmICFwYXJlbnQuY3VycmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcigkbCgnRGF0YVNldCcsICdjYW5ub3RfYWRkX3JlY29yZF93aGVuX2hlYWRfbm9fY3VycmVudCcpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZVR5cGUodmFsdWU6IGFueSk6IEZpZWxkVHlwZSB7XG4gIHJldHVybiBpc0Jvb2xlYW4odmFsdWUpXG4gICAgPyBGaWVsZFR5cGUuYm9vbGVhblxuICAgIDogaXNOdW1iZXIodmFsdWUpXG4gICAgICA/IEZpZWxkVHlwZS5udW1iZXJcbiAgICAgIDogaXNTdHJpbmcodmFsdWUpXG4gICAgICAgID8gRmllbGRUeXBlLnN0cmluZ1xuICAgICAgICA6IGlzTW9tZW50KHZhbHVlKVxuICAgICAgICAgID8gRmllbGRUeXBlLmRhdGVcbiAgICAgICAgICA6IGlzT2JqZWN0KHZhbHVlKVxuICAgICAgICAgICAgPyBGaWVsZFR5cGUub2JqZWN0XG4gICAgICAgICAgICA6IEZpZWxkVHlwZS5hdXRvO1xufVxuXG5mdW5jdGlvbiBnZXRCYXNlVHlwZSh0eXBlOiBGaWVsZFR5cGUpOiBGaWVsZFR5cGUge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIEZpZWxkVHlwZS5udW1iZXI6XG4gICAgY2FzZSBGaWVsZFR5cGUuY3VycmVuY3k6XG4gICAgICByZXR1cm4gRmllbGRUeXBlLm51bWJlcjtcbiAgICBjYXNlIEZpZWxkVHlwZS5kYXRlVGltZTpcbiAgICBjYXNlIEZpZWxkVHlwZS50aW1lOlxuICAgIGNhc2UgRmllbGRUeXBlLndlZWs6XG4gICAgY2FzZSBGaWVsZFR5cGUubW9udGg6XG4gICAgY2FzZSBGaWVsZFR5cGUueWVhcjpcbiAgICAgIHJldHVybiBGaWVsZFR5cGUuZGF0ZTtcbiAgICBjYXNlIEZpZWxkVHlwZS5pbnRsOlxuICAgIGNhc2UgRmllbGRUeXBlLnVybDpcbiAgICBjYXNlIEZpZWxkVHlwZS5lbWFpbDpcbiAgICAgIHJldHVybiBGaWVsZFR5cGUuc3RyaW5nO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdHlwZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tGaWVsZFR5cGUodmFsdWU6IGFueSwgZmllbGQ6IEZpZWxkKTogYm9vbGVhbiB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgaWYgKCFpc0VtcHR5KHZhbHVlKSkge1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWUuZXZlcnkoaXRlbSA9PiBjaGVja0ZpZWxkVHlwZShpdGVtLCBmaWVsZCkpO1xuICAgICAgfVxuICAgICAgY29uc3QgZmllbGRUeXBlID0gZ2V0QmFzZVR5cGUoZmllbGQudHlwZSk7XG4gICAgICBjb25zdCB2YWx1ZVR5cGUgPVxuICAgICAgICBmaWVsZC50eXBlID09PSBGaWVsZFR5cGUuYm9vbGVhbiAmJlxuICAgICAgICAgIFtmaWVsZC5nZXQoQm9vbGVhblZhbHVlLnRydWVWYWx1ZSksIGZpZWxkLmdldChCb29sZWFuVmFsdWUuZmFsc2VWYWx1ZSldLmluY2x1ZGVzKHZhbHVlKVxuICAgICAgICAgID8gRmllbGRUeXBlLmJvb2xlYW5cbiAgICAgICAgICA6IGdldFZhbHVlVHlwZSh2YWx1ZSk7XG4gICAgICBpZiAoXG4gICAgICAgIGZpZWxkVHlwZSAhPT0gRmllbGRUeXBlLmF1dG8gJiZcbiAgICAgICAgZmllbGRUeXBlICE9PSBGaWVsZFR5cGUucmVhY3ROb2RlICYmXG4gICAgICAgIGZpZWxkVHlwZSAhPT0gdmFsdWVUeXBlXG4gICAgICApIHtcbiAgICAgICAgd2FybmluZyhcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICBgVmFsdWUgdHlwZSBlcnJvcjogVGhlIHZhbHVlPCR7dmFsdWV9PidzIHR5cGUgaXMgJHt2YWx1ZVR5cGV9LCBidXQgdGhlIGZpZWxkPCR7ZmllbGQubmFtZX0+J3MgdHlwZSBpcyAke2ZpZWxkVHlwZX0uYCxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxubGV0IGlmcmFtZTtcbi8qKlxuICog55uu5YmN5a6a5LmJ5Li65pyN5Yqh56uv6K+35rGC55qE5pa55rOVXG4gKiBAcGFyYW0gdXJsIOWvvOWHuuWcsOWdgFxuICogQHBhcmFtIGRhdGEg5a+85Ye65Lyg6YCS5Y+C5pWwXG4gKiBAcGFyYW0gbWV0aG9kIOm7mOiupHBvc3Tor7fmsYJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvRXhwb3J0KHVybCwgZGF0YSwgbWV0aG9kID0gJ3Bvc3QnKSB7XG4gIGlmICghaWZyYW1lKSB7XG4gICAgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgaWZyYW1lLmlkID0gJ19leHBvcnRfd2luZG93JztcbiAgICBpZnJhbWUubmFtZSA9ICdfZXhwb3J0X3dpbmRvdyc7XG4gICAgaWZyYW1lLnN0eWxlLmNzc1RleHQgPVxuICAgICAgJ3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTEwMDAwcHg7dG9wOi0xMDAwMHB4O3dpZHRoOjFweDtoZWlnaHQ6MXB4O2Rpc3BsYXk6bm9uZSc7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICB9XG5cbiAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Zvcm0nKTtcbiAgZm9ybS50YXJnZXQgPSAnX2V4cG9ydF93aW5kb3cnO1xuICBmb3JtLm1ldGhvZCA9IG1ldGhvZDtcbiAgZm9ybS5hY3Rpb24gPSB1cmw7XG4gIGNvbnN0IHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICBzLmlkID0gJ19yZXF1ZXN0X2RhdGEnO1xuICBzLnR5cGUgPSAnaGlkZGVuJztcbiAgcy5uYW1lID0gJ19yZXF1ZXN0X2RhdGEnO1xuICBzLnZhbHVlID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gIGZvcm0uYXBwZW5kQ2hpbGQocyk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gIGZvcm0uc3VibWl0KCk7XG4gIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZm9ybSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQmluZEZpZWxkcyhteUZpZWxkOiBGaWVsZCwgZmllbGRzOiBGaWVsZHMsIGV4Y2x1ZGVTZWxmPzogYm9vbGVhbik6IEZpZWxkW10ge1xuICBjb25zdCB7IG5hbWUgfSA9IG15RmllbGQ7XG4gIHJldHVybiBbLi4uZmllbGRzLnZhbHVlcygpXS5maWx0ZXIoZmllbGQgPT4ge1xuICAgIGlmIChmaWVsZCAhPT0gbXlGaWVsZCkge1xuICAgICAgY29uc3QgYmluZCA9IGZpZWxkLmdldCgnYmluZCcpO1xuICAgICAgcmV0dXJuIGlzU3RyaW5nKGJpbmQpICYmIGJpbmQuc3RhcnRzV2l0aChgJHtuYW1lfS5gKTtcbiAgICB9XG4gICAgcmV0dXJuICFleGNsdWRlU2VsZjtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQmluZEZpZWxkKFxuICBteUZpZWxkOiBGaWVsZCB8IHN0cmluZyxcbiAgZmllbGRzOiBGaWVsZHMsXG4gIGNhbGxiYWNrPzogKGZpZWxkOiBGaWVsZCkgPT4gYm9vbGVhbixcbik6IEZpZWxkIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgbmFtZSA9IGlzU3RyaW5nKG15RmllbGQpID8gbXlGaWVsZCA6IG15RmllbGQubmFtZTtcbiAgcmV0dXJuIFsuLi5maWVsZHMudmFsdWVzKCldLmZpbmQoZmllbGQgPT4ge1xuICAgIGlmIChmaWVsZC5uYW1lICE9PSBuYW1lKSB7XG4gICAgICBjb25zdCBiaW5kID0gZmllbGQuZ2V0KCdiaW5kJyk7XG4gICAgICByZXR1cm4gaXNTdHJpbmcoYmluZCkgJiYgYmluZC5zdGFydHNXaXRoKGAke25hbWV9LmApICYmICghY2FsbGJhY2sgfHwgY2FsbGJhY2soZmllbGQpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbnVtYmVyU29ydGVyKGEsIGIpIHtcbiAgcmV0dXJuIGEgLSBiO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdTb3J0ZXIoYSwgYikge1xuICByZXR1cm4gU3RyaW5nKGEgfHwgJycpLmxvY2FsZUNvbXBhcmUoU3RyaW5nKGIgfHwgJycpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpZWxkU29ydGVyKGZpZWxkOiBGaWVsZCkge1xuICBjb25zdCB7IG5hbWUgfSA9IGZpZWxkO1xuXG4gIHN3aXRjaCAoZmllbGQudHlwZSkge1xuICAgIGNhc2UgRmllbGRUeXBlLm51bWJlcjpcbiAgICBjYXNlIEZpZWxkVHlwZS5jdXJyZW5jeTpcbiAgICBjYXNlIEZpZWxkVHlwZS5kYXRlOlxuICAgIGNhc2UgRmllbGRUeXBlLmRhdGVUaW1lOlxuICAgIGNhc2UgRmllbGRUeXBlLndlZWs6XG4gICAgY2FzZSBGaWVsZFR5cGUubW9udGg6XG4gICAgY2FzZSBGaWVsZFR5cGUueWVhcjpcbiAgICBjYXNlIEZpZWxkVHlwZS50aW1lOlxuICAgICAgcmV0dXJuIGZpZWxkLm9yZGVyID09PSBTb3J0T3JkZXIuYXNjXG4gICAgICAgID8gKGEsIGIpID0+IG51bWJlclNvcnRlcihhLmdldChuYW1lKSwgYi5nZXQobmFtZSkpXG4gICAgICAgIDogKGEsIGIpID0+IG51bWJlclNvcnRlcihiLmdldChuYW1lKSwgYS5nZXQobmFtZSkpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmllbGQub3JkZXIgPT09IFNvcnRPcmRlci5hc2NcbiAgICAgICAgPyAoYSwgYikgPT4gc3RyaW5nU29ydGVyKGEuZ2V0KG5hbWUpLCBiLmdldChuYW1lKSlcbiAgICAgICAgOiAoYSwgYikgPT4gc3RyaW5nU29ydGVyKGIuZ2V0KG5hbWUpLCBhLmdldChuYW1lKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUmVjb3JkSlNPTkRhdGEoYXJyYXk6IG9iamVjdFtdLCByZWNvcmQ6IFJlY29yZCwgZGF0YVRvSlNPTjogRGF0YVRvSlNPTikge1xuICBjb25zdCBub3JtYWwgPSB1c2VOb3JtYWwoZGF0YVRvSlNPTik7XG4gIGNvbnN0IGpzb24gPSBub3JtYWxcbiAgICA/IHJlY29yZC5zdGF0dXMgIT09IFJlY29yZFN0YXR1cy5kZWxldGUgJiYgcmVjb3JkLnRvRGF0YSgpXG4gICAgOiByZWNvcmQudG9KU09ORGF0YSgpO1xuICBpZiAoanNvbiAmJiAobm9ybWFsIHx8IHVzZUFsbChkYXRhVG9KU09OKSB8fCAhdXNlRGlydHkoZGF0YVRvSlNPTikgfHwganNvbi5fX2RpcnR5KSkge1xuICAgIGRlbGV0ZSBqc29uLl9fZGlydHk7XG4gICAgYXJyYXkucHVzaChqc29uKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZVN1Ym1pdERhdGEoXG4gIHJlY29yZHM6IFJlY29yZFtdLFxuICBkYXRhVG9KU09OOiBEYXRhVG9KU09OLFxuKTogW29iamVjdFtdLCBvYmplY3RbXSwgb2JqZWN0W11dIHtcbiAgY29uc3QgY3JlYXRlZDogb2JqZWN0W10gPSBbXTtcbiAgY29uc3QgdXBkYXRlZDogb2JqZWN0W10gPSBbXTtcbiAgY29uc3QgZGVzdHJveWVkOiBvYmplY3RbXSA9IFtdO1xuXG4gIGZ1bmN0aW9uIHN0b3JlV2l0aChzdGF0dXMpIHtcbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBSZWNvcmRTdGF0dXMuYWRkOlxuICAgICAgICByZXR1cm4gY3JlYXRlZDtcbiAgICAgIGNhc2UgUmVjb3JkU3RhdHVzLmRlbGV0ZTpcbiAgICAgICAgcmV0dXJuIGRlc3Ryb3llZDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB1cGRhdGVkO1xuICAgIH1cbiAgfVxuXG4gIHJlY29yZHMuZm9yRWFjaChyZWNvcmQgPT4gZ2VuZXJhdGVSZWNvcmRKU09ORGF0YShzdG9yZVdpdGgocmVjb3JkLnN0YXR1cyksIHJlY29yZCwgZGF0YVRvSlNPTikpO1xuICByZXR1cm4gW2NyZWF0ZWQsIHVwZGF0ZWQsIGRlc3Ryb3llZF07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRBeGlvc0NvbmZpZ0FkYXB0ZXIoY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcpOiBBeGlvc1JlcXVlc3RDb25maWcge1xuICByZXR1cm4gY29uZmlnO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNvbmZpZyhcbiAgY29uZmlnOiBUcmFuc3BvcnRUeXBlLFxuICBkYXRhU2V0OiBEYXRhU2V0LFxuICBkYXRhPzogYW55LFxuICBwYXJhbXM/OiBhbnksXG4gIG9wdGlvbnM/OiBvYmplY3QsXG4pOiBBeGlvc1JlcXVlc3RDb25maWcge1xuICBpZiAoaXNTdHJpbmcoY29uZmlnKSkge1xuICAgIHJldHVybiB7XG4gICAgICB1cmw6IGNvbmZpZyxcbiAgICB9O1xuICB9XG4gIGlmICh0eXBlb2YgY29uZmlnID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGNvbmZpZyh7IC4uLm9wdGlvbnMsIGRhdGEsIGRhdGFTZXQsIHBhcmFtcyB9KTtcbiAgfVxuICByZXR1cm4gY29uZmlnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXhpb3NDb25maWdBZGFwdGVyKFxuICB0eXBlOiBUcmFuc3BvcnRUeXBlcyxcbiAgZGF0YVNldDogRGF0YVNldCxcbiAgZGF0YT86IGFueSxcbiAgcGFyYW1zPzogYW55LFxuICBvcHRpb25zPzogb2JqZWN0LFxuKTogQXhpb3NSZXF1ZXN0Q29uZmlnIHtcbiAgY29uc3QgbmV3Q29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB7XG4gICAgZGF0YSxcbiAgICBwYXJhbXMsXG4gICAgbWV0aG9kOiAncG9zdCcsXG4gIH07XG5cbiAgY29uc3QgeyBbdHlwZV06IGdsb2JhbENvbmZpZywgYWRhcHRlcjogZ2xvYmFsQWRhcHRlciA9IGRlZmF1bHRBeGlvc0NvbmZpZ0FkYXB0ZXIgfSA9XG4gICAgZ2V0Q29uZmlnKCd0cmFuc3BvcnQnKSB8fCB7fTtcbiAgY29uc3QgeyBbdHlwZV06IGNvbmZpZywgYWRhcHRlciB9ID0gZGF0YVNldC50cmFuc3BvcnQ7XG4gIGlmIChnbG9iYWxDb25maWcpIHtcbiAgICBPYmplY3QuYXNzaWduKG5ld0NvbmZpZywgZ2VuZXJhdGVDb25maWcoZ2xvYmFsQ29uZmlnLCBkYXRhU2V0LCBkYXRhLCBwYXJhbXMsIG9wdGlvbnMpKTtcbiAgfVxuICBpZiAoY29uZmlnKSB7XG4gICAgT2JqZWN0LmFzc2lnbihuZXdDb25maWcsIGdlbmVyYXRlQ29uZmlnKGNvbmZpZywgZGF0YVNldCwgZGF0YSwgcGFyYW1zLCBvcHRpb25zKSk7XG4gIH1cbiAgaWYgKG5ld0NvbmZpZy5kYXRhICYmIG5ld0NvbmZpZy5tZXRob2QgJiYgbmV3Q29uZmlnLm1ldGhvZC50b0xvd2VyQ2FzZSgpID09PSAnZ2V0Jykge1xuICAgIG5ld0NvbmZpZy5wYXJhbXMgPSB7XG4gICAgICAuLi5uZXdDb25maWcucGFyYW1zLFxuICAgICAgLi4ubmV3Q29uZmlnLmRhdGEsXG4gICAgfTtcbiAgfVxuICByZXR1cm4gKGFkYXB0ZXIgfHwgZ2xvYmFsQWRhcHRlcikobmV3Q29uZmlnLCB0eXBlKSB8fCBuZXdDb25maWc7XG59XG5cbi8vIOafpeivoumhtuWxgueItuS6suiKgueCuVxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSb290UGFyZW50KGNoaWxkcmVuOiBSZWNvcmQpIHtcbiAgaWYgKGNoaWxkcmVuLnBhcmVudCkge1xuICAgIHJldHVybiBmaW5kUm9vdFBhcmVudChjaGlsZHJlbi5wYXJlbnQpXG4gIH1cbiAgcmV0dXJuIGNoaWxkcmVuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwYXJlRm9yU3VibWl0KFxuICB0eXBlOiBTdWJtaXRUeXBlcyxcbiAgZGF0YTogb2JqZWN0W10sXG4gIGNvbmZpZ3M6IEF4aW9zUmVxdWVzdENvbmZpZ1tdLFxuICBkYXRhU2V0OiBEYXRhU2V0LFxuKTogb2JqZWN0W10ge1xuICBpZiAoZGF0YS5sZW5ndGgpIHtcbiAgICBjb25zdCBuZXdDb25maWcgPSBheGlvc0NvbmZpZ0FkYXB0ZXIodHlwZSwgZGF0YVNldCwgZGF0YSk7XG4gICAgaWYgKG5ld0NvbmZpZy51cmwpIHtcbiAgICAgIGNvbmZpZ3MucHVzaChuZXdDb25maWcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVSZXNwb25zZURhdGEoaXRlbTogYW55LCBkYXRhS2V5Pzogc3RyaW5nKTogb2JqZWN0W10ge1xuICBpZiAoaXRlbSkge1xuICAgIGlmIChpc0FycmF5KGl0ZW0pKSB7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KGl0ZW0pKSB7XG4gICAgICBpZiAoZGF0YUtleSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBPYmplY3RDaGFpblZhbHVlLmdldChpdGVtLCBkYXRhS2V5KTtcbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuIFtpdGVtXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNPYmplY3QocmVzdWx0KSkge1xuICAgICAgICAgIHJldHVybiBbcmVzdWx0XTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtpdGVtXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVjb3JkVmFsdWUoXG4gIGRhdGE6IGFueSxcbiAgY2I6IChyZWNvcmQ6IFJlY29yZCwgZmllbGROYW1lOiBzdHJpbmcpID0+IGJvb2xlYW4sXG4gIGZpZWxkTmFtZT86IHN0cmluZyxcbikge1xuICBpZiAoZmllbGROYW1lKSB7XG4gICAgY29uc3QgZmllbGQgPSB0aGlzLmdldEZpZWxkKGZpZWxkTmFtZSk7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBjb25zdCBiaW5kID0gZmllbGQuZ2V0KCdiaW5kJyk7XG4gICAgICBpZiAoYmluZCkge1xuICAgICAgICBmaWVsZE5hbWUgPSBiaW5kO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgY2hlY2tGaWVsZCB9ID0gZGF0YVNldC5wcm9wcztcbiAgICAgIGlmIChjaGVja0ZpZWxkICYmIGNoZWNrRmllbGQgPT09IGZpZWxkTmFtZSkge1xuICAgICAgICBjb25zdCB0cnVlVmFsdWUgPSBmaWVsZCA/IGZpZWxkLmdldChCb29sZWFuVmFsdWUudHJ1ZVZhbHVlKSA6IHRydWU7XG4gICAgICAgIGNvbnN0IGZhbHNlVmFsdWUgPSBmaWVsZCA/IGZpZWxkLmdldChCb29sZWFuVmFsdWUuZmFsc2VWYWx1ZSkgOiBmYWxzZTtcbiAgICAgICAgY29uc3QgeyBjaGlsZHJlbiB9ID0gdGhpcztcbiAgICAgICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkcmVuLmV2ZXJ5KGNoaWxkID0+IGNiKGNoaWxkLCBjaGVja0ZpZWxkKSA9PT0gdHJ1ZVZhbHVlKVxuICAgICAgICAgICAgPyB0cnVlVmFsdWVcbiAgICAgICAgICAgIDogZmFsc2VWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0Q2hhaW5WYWx1ZS5nZXQoZGF0YSwgZmllbGROYW1lIGFzIHN0cmluZyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdGxzQmluZChcbiAgcHJvcHM6IER5bmFtaWNQcm9wc0FyZ3VtZW50cyxcbiAgbmFtZTogc3RyaW5nLFxuICBsYW5nOiBMYW5nLFxuICB0bHNLZXk6IHN0cmluZyxcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHRscyA9IHByb3BzLnJlY29yZC5nZXQodGxzS2V5KSB8fCB7fTtcbiAgaWYgKG5hbWUgaW4gdGxzKSB7XG4gICAgcmV0dXJuIGAke3Rsc0tleX0uJHtuYW1lfS4ke2xhbmd9YDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ludGxGaWVsZChcbiAgbmFtZTogc3RyaW5nLFxuICBmaWVsZFByb3BzOiBGaWVsZFByb3BzLFxuICBjYWxsYmFjazogKG5hbWU6IHN0cmluZywgcHJvcHM6IEZpZWxkUHJvcHMpID0+IEZpZWxkLFxuICBkYXRhU2V0PzogRGF0YVNldCxcbik6IEZpZWxkIHtcbiAgY29uc3QgdGxzS2V5ID0gZ2V0Q29uZmlnKCd0bHNLZXknKTtcbiAgY29uc3QgeyBzdXBwb3J0cyB9ID0gbG9jYWxlQ29udGV4dDtcbiAgY29uc3QgbGFuZ3VhZ2VzID0gT2JqZWN0LmtleXMoc3VwcG9ydHMpO1xuICBjb25zdCB7IHR5cGUsIGR5bmFtaWNQcm9wcyB9ID0gZmllbGRQcm9wcztcbiAgaWYgKHR5cGUgPT09IEZpZWxkVHlwZS5pbnRsKSB7XG4gICAgbGFuZ3VhZ2VzLmZvckVhY2gobGFuZ3VhZ2UgPT5cbiAgICAgIGNhbGxiYWNrKGAke3Rsc0tleX0uJHtuYW1lfS4ke2xhbmd1YWdlfWAsIHtcbiAgICAgICAgdHlwZTogRmllbGRUeXBlLnN0cmluZyxcbiAgICAgICAgbGFiZWw6IGAke3N1cHBvcnRzW2xhbmd1YWdlXX1gLFxuICAgICAgfSksXG4gICAgKTtcbiAgICBjb25zdCB7IGxhbmcgPSBsb2NhbGVDb250ZXh0LmxvY2FsZS5sYW5nIH0gPSBkYXRhU2V0IHx8IHt9O1xuICAgIGNvbnN0IG5ld0R5bmFtaWNQcm9wcyA9XG4gICAgICB0eXBlb2YgZHluYW1pY1Byb3BzID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gcHJvcHMgPT4ge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5keW5hbWljUHJvcHMocHJvcHMpLFxuICAgICAgICAgICAgYmluZDogdGxzQmluZChwcm9wcywgbmFtZSwgbGFuZywgdGxzS2V5KSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIDoge1xuICAgICAgICAgIC4uLmR5bmFtaWNQcm9wcyxcbiAgICAgICAgICBiaW5kOiBwcm9wcyA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGxzQmluZChwcm9wcywgbmFtZSwgbGFuZywgdGxzS2V5KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIHJldHVybiBjYWxsYmFjayhuYW1lLCB7XG4gICAgICAuLi5maWVsZFByb3BzLFxuICAgICAgZHluYW1pY1Byb3BzOiBuZXdEeW5hbWljUHJvcHMsXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNhbGxiYWNrKG5hbWUsIGZpZWxkUHJvcHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEJpbmRGaWVsZEJ5KG15RmllbGQ6IEZpZWxkLCBmaWVsZHM6IEZpZWxkcywgcHJvcDogc3RyaW5nKTogRmllbGQgfCB1bmRlZmluZWQge1xuICBjb25zdCB2YWx1ZSA9IG15RmllbGQuZ2V0KHByb3ApO1xuICBjb25zdCBteU5hbWUgPSBteUZpZWxkLm5hbWU7XG4gIHJldHVybiBbLi4uZmllbGRzLnZhbHVlcygpXS5maW5kKGZpZWxkID0+IHtcbiAgICBjb25zdCBiaW5kID0gZmllbGQuZ2V0KCdiaW5kJyk7XG4gICAgcmV0dXJuIGJpbmQgJiYgYmluZCA9PT0gYCR7bXlOYW1lfS4ke3ZhbHVlfWA7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0ZpZWxkVmFsdWUodmFsdWUsIGZpZWxkOiBGaWVsZCwgbGFuZzogTGFuZywgc2hvd1ZhbHVlSWZOb3RGb3VuZD86IGJvb2xlYW4pIHtcbiAgY29uc3QgeyB0eXBlIH0gPSBmaWVsZDtcbiAgaWYgKHR5cGUgPT09IEZpZWxkVHlwZS5udW1iZXIpIHtcbiAgICBjb25zdCBwcmVjaXNpb24gPSBnZXRQcmVjaXNpb24odmFsdWUgfHwgMCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogcHJlY2lzaW9uLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBwcmVjaXNpb24sXG4gICAgfTtcbiAgICByZXR1cm4gZm9ybWF0TnVtYmVyKHZhbHVlLCBsYW5nLCBvcHRpb25zKTtcbiAgfVxuICBpZiAodHlwZSA9PT0gRmllbGRUeXBlLmN1cnJlbmN5KSB7XG4gICAgcmV0dXJuIGZvcm1hdEN1cnJlbmN5KHZhbHVlLCBsYW5nLCB7XG4gICAgICBjdXJyZW5jeTogZmllbGQuZ2V0KCdjdXJyZW5jeScpLFxuICAgIH0pO1xuICB9XG4gIHJldHVybiBmaWVsZC5nZXRUZXh0KHZhbHVlLCBzaG93VmFsdWVJZk5vdEZvdW5kKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpbWl0KGxpbWl0OiBhbnksIHJlY29yZDogUmVjb3JkKSB7XG4gIGlmIChpc1N0cmluZyhsaW1pdCkgJiYgcmVjb3JkLmdldEZpZWxkKGxpbWl0KSkge1xuICAgIHJldHVybiByZWNvcmQuZ2V0KGxpbWl0KTtcbiAgfVxuICByZXR1cm4gbGltaXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGFwdGVyRGF0YVRvSlNPTihcbiAgaXNTZWxlY3RlZD86IGJvb2xlYW4sXG4gIG5vQ2FzY2FkZT86IGJvb2xlYW4sXG4pOiBEYXRhVG9KU09OIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzU2VsZWN0ZWQpIHtcbiAgICBpZiAobm9DYXNjYWRlKSB7XG4gICAgICByZXR1cm4gRGF0YVRvSlNPTlsnc2VsZWN0ZWQtc2VsZiddO1xuICAgIH1cbiAgICByZXR1cm4gRGF0YVRvSlNPTi5zZWxlY3RlZDtcbiAgfVxuICBpZiAobm9DYXNjYWRlKSB7XG4gICAgcmV0dXJuIERhdGFUb0pTT05bJ2RpcnR5LXNlbGYnXTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVEYXRhKGRzOiBEYXRhU2V0KTogeyBkaXJ0eTogYm9vbGVhbjsgZGF0YTogb2JqZWN0W10gfSB7XG4gIGxldCBkaXJ0eSA9IGRzLmRlc3Ryb3llZC5sZW5ndGggPiAwO1xuICBjb25zdCBkYXRhOiBvYmplY3RbXSA9IGRzLmRhdGEubWFwKHJlY29yZCA9PiB7XG4gICAgY29uc3QgZCA9IHJlY29yZC50b0RhdGEoKTtcbiAgICBpZiAoZC5fX2RpcnR5KSB7XG4gICAgICBkaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIGRlbGV0ZSBkLl9fZGlydHk7XG4gICAgcmV0dXJuIGQ7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIGRpcnR5LFxuICAgIGRhdGEsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUpTT05EYXRhKFxuICBkczogRGF0YVNldCxcbiAgaXNTZWxlY3Q/OiBib29sZWFuLFxuKTogeyBkaXJ0eTogYm9vbGVhbjsgZGF0YTogb2JqZWN0W10gfSB7XG4gIGNvbnN0IHsgZGF0YVRvSlNPTiB9ID0gZHM7XG4gIGNvbnN0IGRhdGE6IG9iamVjdFtdID0gW107XG4gIChpc1NlbGVjdCB8fCB1c2VTZWxlY3RlZChkYXRhVG9KU09OKSA/IGRzLnNlbGVjdGVkIDogZHMucmVjb3JkcykuZm9yRWFjaChyZWNvcmQgPT5cbiAgICBnZW5lcmF0ZVJlY29yZEpTT05EYXRhKGRhdGEsIHJlY29yZCwgZGF0YVRvSlNPTiksXG4gICk7XG4gIHJldHVybiB7XG4gICAgZGlydHk6IGRhdGEubGVuZ3RoID4gMCxcbiAgICBkYXRhLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEaXJ0eVJlY29yZChyZWNvcmQpIHtcbiAgcmV0dXJuIHJlY29yZC5zdGF0dXMgIT09IFJlY29yZFN0YXR1cy5zeW5jIHx8IHJlY29yZC5kaXJ0eTtcbn1cbiJdLCJ2ZXJzaW9uIjozfQ==