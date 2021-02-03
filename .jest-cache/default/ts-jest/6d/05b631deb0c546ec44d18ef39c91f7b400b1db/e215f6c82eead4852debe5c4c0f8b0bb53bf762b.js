import { __decorate } from "tslib";
import { action, computed, get, isArrayLike, isObservableArray, observable, runInAction, set, toJS, } from 'mobx';
import merge from 'lodash/merge';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from './DataSet';
import Field from './Field';
import { axiosConfigAdapter, checkFieldType, childrenInfoForDelete, findBindFields, generateData, generateJSONData, generateResponseData, getRecordValue, isDirtyRecord, processIntlField, processToJSON, processValue, useCascade, useNormal, } from './utils';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import localeContext from '../locale-context';
import isSame from '../_util/isSame';
/**
 * 记录ID生成器
 */
const IDGen = (function* (start) {
    while (true) {
        yield ++start;
    }
})(1000);
export default class Record {
    constructor(data = {}, dataSet) {
        this.dataSetSnapshot = {};
        this.cascadeRecordsMap = {};
        runInAction(() => {
            const initData = toJS(data);
            this.state = {};
            this.fields = observable.map();
            this.status = "add" /* add */;
            this.selectable = true;
            this.isSelected = false;
            this.isCurrent = false;
            this.isCached = false;
            this.id = IDGen.next().value;
            this.data = initData;
            if (dataSet) {
                this.dataSet = dataSet;
                const { fields } = dataSet;
                if (fields) {
                    this.initFields(fields);
                }
            }
            const d = this.processData(initData);
            this.pristineData = d;
            this.data = d;
        });
    }
    get key() {
        if (this.status !== "add" /* add */) {
            const { dataSet } = this;
            if (dataSet) {
                const { primaryKey } = dataSet.props;
                if (primaryKey) {
                    const key = this.get(primaryKey);
                    if (isString(key) || isNumber(key)) {
                        return key;
                    }
                }
            }
        }
        return this.id;
    }
    get index() {
        const { dataSet } = this;
        if (dataSet) {
            return dataSet.indexOf(this);
        }
        return -1;
    }
    get isRemoved() {
        return this.status === "delete" /* delete */;
    }
    get isIndeterminate() {
        const { dataSet } = this;
        if (dataSet) {
            const { checkField } = dataSet.props;
            if (checkField) {
                const field = this.getField(checkField);
                const trueValue = field ? field.get("trueValue" /* trueValue */) : true;
                const { children } = this;
                if (children) {
                    let checkedLength = 0;
                    return (children.some(record => {
                        if (record.isIndeterminate) {
                            return true;
                        }
                        if (record.get(checkField) === trueValue) {
                            checkedLength += 1;
                        }
                        return false;
                    }) ||
                        (checkedLength > 0 && checkedLength !== children.length));
                }
            }
        }
        return false;
    }
    get isExpanded() {
        const { dataSet } = this;
        if (dataSet) {
            const { expandField } = dataSet.props;
            if (expandField) {
                const expanded = this.get(expandField);
                const field = this.getField(expandField);
                return expanded === (field ? field.get("trueValue" /* trueValue */) : true);
            }
        }
        return false;
    }
    set isExpanded(expand) {
        const { dataSet } = this;
        if (dataSet) {
            const { expandField } = dataSet.props;
            if (expandField) {
                const field = this.getField(expandField);
                this.set(expandField, field
                    ? expand
                        ? field.get("trueValue" /* trueValue */)
                        : field.get("falseValue" /* falseValue */)
                    : expand);
            }
        }
    }
    get previousRecord() {
        const { parent, dataSet } = this;
        let children;
        if (parent) {
            children = parent.children;
        }
        else if (dataSet) {
            children = dataSet.treeData;
        }
        if (children) {
            return children[children.indexOf(this) - 1];
        }
        return undefined;
    }
    get nextRecord() {
        const { parent, dataSet } = this;
        let children;
        if (parent) {
            children = parent.children;
        }
        else if (dataSet) {
            children = dataSet.treeData;
        }
        if (children) {
            return children[children.indexOf(this) + 1];
        }
        return undefined;
    }
    get records() {
        const { dataSet } = this;
        if (dataSet) {
            const { cascadeParent } = this;
            if (cascadeParent && !cascadeParent.isCurrent) {
                return cascadeParent.getCascadeRecords(dataSet.parentName) || [];
            }
            return dataSet.records;
        }
        return [];
    }
    get children() {
        const { dataSet } = this;
        if (dataSet) {
            const { parentField, idField } = dataSet.props;
            if (parentField && idField) {
                const children = this.records.filter(record => {
                    const childParentId = record.get(parentField);
                    const id = this.get(idField);
                    return !isNil(childParentId) && !isNil(id) && childParentId === id;
                });
                return children.length > 0 ? children : undefined;
            }
        }
        return undefined;
    }
    get parent() {
        const { dataSet } = this;
        if (dataSet) {
            const { parentField, idField } = dataSet.props;
            if (parentField && idField) {
                return this.records.find(record => {
                    const parentId = this.get(parentField);
                    const id = record.get(idField);
                    return !isNil(parentId) && !isNil(id) && parentId === id;
                });
            }
        }
        return undefined;
    }
    get level() {
        const { parent } = this;
        if (parent) {
            return parent.level + 1;
        }
        return 0;
    }
    get dirty() {
        const { fields, status, dataSet, isCurrent, dataSetSnapshot } = this;
        if (status === "update" /* update */ || [...fields.values()].some(({ dirty }) => dirty)) {
            return true;
        }
        if (dataSet) {
            const { children } = dataSet;
            return Object.keys(children).some(key => {
                return isCurrent
                    ? children[key].dirty
                    : !!dataSetSnapshot[key] && dataSetSnapshot[key].records.some(isDirtyRecord);
            });
        }
        return false;
    }
    get cascadeParent() {
        const { dataSet } = this;
        if (dataSet) {
            const { parent, parentName } = dataSet;
            if (parent && parentName) {
                return parent.find(record => (record.getCascadeRecords(parentName) || []).indexOf(this) !== -1);
            }
        }
        return undefined;
    }
    toData(needIgnore, noCascade, isCascadeSelect, all = true) {
        const { status, dataSet } = this;
        const dataToJSON = dataSet && dataSet.dataToJSON;
        const cascade = noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
        const normal = all || (dataToJSON && useNormal(dataToJSON));
        let dirty = status !== "sync" /* sync */;
        const json = this.normalizeData(needIgnore);
        if (cascade && this.normalizeCascadeData(json, normal, isCascadeSelect)) {
            dirty = true;
        }
        return {
            ...json,
            __dirty: dirty,
        };
    }
    toJSONData(noCascade, isCascadeSelect) {
        const { status } = this;
        return {
            ...this.toData(true, noCascade, isCascadeSelect, false),
            __id: this.id,
            [getConfig('statusKey')]: getConfig('status')[status === "sync" /* sync */ ? "update" /* update */ : status],
        };
    }
    validate(all, noCascade) {
        const { dataSetSnapshot, isCurrent, dataSet, status, fields } = this;
        return Promise.all([
            ...[...fields.values()].map(field => all || status !== "sync" /* sync */ ? field.checkValidity() : true),
            ...(noCascade
                ? []
                : Object.keys(dataSetSnapshot).map(key => (isCurrent && dataSet
                    ? dataSet.children[key]
                    : new DataSet().restore(dataSetSnapshot[key])).validate(all))),
        ]).then(results => results.every(result => result));
    }
    getField(fieldName) {
        if (fieldName) {
            return this.fields.get(fieldName);
        }
    }
    getCascadeRecords(fieldName) {
        const { dataSet } = this;
        if (fieldName && dataSet) {
            const childDataSet = dataSet.children[fieldName];
            if (childDataSet) {
                if (dataSet.current === this) {
                    return childDataSet.slice();
                }
                const snapshot = this.dataSetSnapshot[fieldName];
                if (snapshot) {
                    return snapshot.records.filter(r => r.status !== "delete" /* delete */);
                }
                const cascadeRecords = this.cascadeRecordsMap[fieldName];
                if (cascadeRecords) {
                    return cascadeRecords;
                }
                const data = this.get(fieldName);
                if (isObservableArray(data)) {
                    const records = childDataSet.processData(data);
                    this.cascadeRecordsMap[fieldName] = records;
                    return records;
                }
            }
        }
    }
    get(fieldName) {
        return getRecordValue.call(this, this.data, (child, checkField) => child.get(checkField), fieldName);
    }
    set(item, value) {
        if (isString(item)) {
            let fieldName = item;
            const oldName = fieldName;
            const field = this.getField(fieldName) || this.addField(fieldName);
            checkFieldType(value, field);
            const bind = field.get('bind');
            if (bind) {
                fieldName = bind;
            }
            const oldValue = toJS(this.get(fieldName));
            const newValue = processValue(value, field);
            if (!isSame(newValue, oldValue)) {
                const { fields } = this;
                ObjectChainValue.set(this.data, fieldName, newValue, fields);
                const pristineValue = toJS(this.getPristineValue(fieldName));
                if (isSame(pristineValue, newValue)) {
                    if (this.status === "update" /* update */ && [...fields.values()].every(f => !f.dirty)) {
                        this.status = "sync" /* sync */;
                    }
                }
                else if (this.status === "sync" /* sync */) {
                    this.status = "update" /* update */;
                }
                const { dataSet } = this;
                if (dataSet) {
                    dataSet.fireEvent("update" /* update */, {
                        dataSet,
                        record: this,
                        name: oldName,
                        value: newValue,
                        oldValue,
                    });
                    const { checkField } = dataSet.props;
                    if (checkField && (checkField === fieldName || checkField === oldName)) {
                        const { children } = this;
                        if (children) {
                            children.forEach(record => record.set(fieldName, value));
                        }
                    }
                }
            }
            findBindFields(field, this.fields).forEach(oneField => {
                // oneField.dirty = field.dirty,
                oneField.validator.reset();
                oneField.checkValidity();
            });
        }
        else if (isPlainObject(item)) {
            Object.keys(item).forEach(key => this.set(key, item[key]));
        }
        return this;
    }
    getPristineValue(fieldName) {
        return getRecordValue.call(this, this.pristineData, (child, checkField) => child.getPristineValue(checkField), fieldName);
    }
    init(item, value) {
        const { fields, pristineData, data } = this;
        if (isString(item)) {
            let fieldName = item;
            const field = this.getField(fieldName) || this.addField(fieldName);
            const bind = field.get('bind');
            if (bind) {
                fieldName = bind;
            }
            ObjectChainValue.set(pristineData, fieldName, value, fields);
            ObjectChainValue.set(data, fieldName, value, fields);
            field.commit();
        }
        else if (isPlainObject(item)) {
            Object.keys(item).forEach(key => this.init(key, item[key]));
        }
        return this;
    }
    clone() {
        const { dataSet } = this;
        const cloneData = this.toData();
        if (dataSet) {
            const { primaryKey } = dataSet.props;
            if (primaryKey) {
                delete cloneData[primaryKey];
            }
            return new Record(cloneData, dataSet);
        }
        return new Record(cloneData);
    }
    ready() {
        return Promise.all([...this.fields.values()].map(field => field.ready()));
    }
    async tls(name) {
        const tlsKey = getConfig('tlsKey');
        const { dataSet } = this;
        if (dataSet && name) {
            const tlsData = this.get(tlsKey) || {};
            if (!(name in tlsData)) {
                const { axios, lang } = dataSet;
                const { primaryKey } = dataSet.props;
                const newConfig = axiosConfigAdapter('tls', dataSet, {}, primaryKey && { key: this.get(primaryKey) }, { name, record: this });
                if (newConfig.url && this.status !== "add" /* add */) {
                    const result = await axios(newConfig);
                    if (result) {
                        const dataKey = getConfig('dataKey');
                        this.commitTls(generateResponseData(result, dataKey)[0], name);
                    }
                }
                else {
                    this.commitTls([...this.fields.entries()].reduce((data, [key, field]) => {
                        if (field.type === "intl" /* intl */) {
                            data[key] = {
                                [lang]: this.get(key),
                            };
                        }
                        return data;
                    }, {}), name);
                }
            }
        }
    }
    reset() {
        const { status, fields, dataSet, dirty } = this;
        [...fields.values()].forEach(field => field.commit());
        if (status === "update" /* update */ || status === "delete" /* delete */) {
            this.status = "sync" /* sync */;
        }
        if (status === "delete" /* delete */ || dirty) {
            this.data = toJS(this.pristineData);
            this.memo = undefined;
            if (dataSet && !dataSet.resetInBatch) {
                dataSet.fireEvent("reset" /* reset */, { records: [this], dataSet });
            }
        }
        return this;
    }
    save() {
        this.memo = toJS(this.data);
        return this;
    }
    restore() {
        const { memo } = this;
        if (memo) {
            this.set(memo);
            this.memo = undefined;
        }
        return this;
    }
    clear() {
        return this.set([...this.fields.keys()].reduce((obj, key) => {
            obj[key] = null;
            return obj;
        }, {}));
    }
    commit(data, dataSet) {
        const { dataSetSnapshot, fields, status } = this;
        if (dataSet) {
            const { records } = dataSet;
            if (status === "delete" /* delete */) {
                const index = records.indexOf(this);
                if (index !== -1) {
                    dataSet.totalCount -= 1;
                    records.splice(index, 1);
                }
                return this;
            }
            if (status === "add" /* add */) {
                const index = records.indexOf(this);
                if (index !== -1) {
                    dataSet.totalCount += 1;
                }
            }
            if (data) {
                const newData = this.processData(data, true);
                this.pristineData = newData;
                Object.keys(newData).forEach(key => {
                    const newValue = newData[key];
                    if (this.get(key) !== newValue) {
                        set(this.data, key, newData[key]);
                    }
                });
                const snapShorts = Object.keys(dataSetSnapshot);
                if (snapShorts.length) {
                    const isCurrent = dataSet.current === this;
                    const ds = new DataSet();
                    snapShorts.forEach(key => (dataSetSnapshot[key] = (isCurrent
                        ? dataSet.children[key]
                        : ds.restore(dataSetSnapshot[key]))
                        .commitData(data[key] || [])
                        .snapshot()));
                }
            }
        }
        [...fields.values()].forEach(field => field.commit());
        this.status = "sync" /* sync */;
        return this;
    }
    setState(item, value) {
        if (isString(item)) {
            set(this.state, item, value);
        }
        else if (isPlainObject(item)) {
            set(this.state, item);
        }
        return this;
    }
    getState(key) {
        return get(this.state, key);
    }
    commitTls(data = {}, name) {
        const { dataSet } = this;
        const lang = dataSet ? dataSet.lang : localeContext.locale.lang;
        const tlsKey = getConfig('tlsKey');
        const values = {};
        if (!(name in data)) {
            data[name] = {};
        }
        Object.keys(data).forEach(key => {
            const value = data[key];
            const field = this.getField(key);
            if (field && field.dirty) {
                values[`${tlsKey}.${key}.${lang}`] = this.get(key);
            }
            this.init(`${tlsKey}.${key}`, value);
        });
        this.set(values);
    }
    initFields(fields) {
        [...fields.keys()].forEach(key => this.addField(key));
    }
    addField(name, fieldProps = {}) {
        const { dataSet } = this;
        return processIntlField(name, fieldProps, (langName, langProps) => {
            const field = new Field({ ...langProps, name: langName }, dataSet, this);
            this.fields.set(langName, field);
            return field;
        }, dataSet);
    }
    processData(data = {}, needMerge) {
        const { fields } = this;
        const newData = { ...data };
        [...fields.entries()].forEach(([fieldName, field]) => {
            let value = ObjectChainValue.get(data, fieldName);
            const bind = field.get('bind');
            const type = field.get('type');
            const transformResponse = field.get('transformResponse');
            if (bind) {
                fieldName = bind;
                const bindValue = ObjectChainValue.get(data, fieldName);
                if (isNil(value) && !isNil(bindValue)) {
                    value = bindValue;
                }
            }
            if (value === undefined && type === "boolean" /* boolean */) {
                value = false;
            }
            if (transformResponse) {
                value = transformResponse(value, data);
            }
            value = processValue(value, field);
            if (value === null) {
                value = undefined;
            }
            if (needMerge && isObject(value)) {
                const oldValue = this.get(fieldName);
                if (isObject(oldValue)) {
                    value = merge(oldValue, value);
                }
            }
            ObjectChainValue.set(newData, fieldName, value, fields);
        });
        return newData;
    }
    normalizeData(needIgnore) {
        const { fields } = this;
        const json = toJS(this.data);
        const objectFieldsList = [];
        const normalFields = [];
        const ignoreFieldNames = new Set();
        [...fields.keys()].forEach(key => {
            const field = this.getField(key);
            if (field) {
                const ignore = field.get('ignore');
                if (needIgnore &&
                    (ignore === "always" /* always */ || (ignore === "clean" /* clean */ && !field.dirty))) {
                    ignoreFieldNames.add(key);
                }
                else {
                    const type = field.get('type');
                    if (type === "object" /* object */) {
                        const level = key.split('.').length - 1;
                        objectFieldsList[level] = (objectFieldsList[level] || []).concat(field);
                    }
                    else {
                        normalFields.push(field);
                    }
                }
            }
        });
        [...objectFieldsList, normalFields].forEach(items => {
            if (items) {
                items.forEach(field => {
                    const { name } = field;
                    let value = ObjectChainValue.get(json, name);
                    const bind = field.get('bind');
                    const multiple = field.get('multiple');
                    const transformRequest = field.get('transformRequest');
                    if (bind) {
                        value = this.get(bind);
                    }
                    if (isString(multiple) && isArrayLike(value)) {
                        value = value.map(processToJSON).join(multiple);
                    }
                    if (transformRequest) {
                        value = transformRequest(value, this);
                    }
                    if (value !== undefined) {
                        ObjectChainValue.set(json, name, processToJSON(value), fields);
                    }
                    else {
                        ignoreFieldNames.add(name);
                    }
                });
            }
        });
        [...ignoreFieldNames].forEach(key => ObjectChainValue.remove(json, key));
        return json;
    }
    normalizeCascadeData(json, normal, isSelect) {
        const { dataSetSnapshot, dataSet, isCurrent, status, fields } = this;
        const isDelete = status === "delete" /* delete */;
        if (dataSet) {
            let dirty = false;
            const { children } = dataSet;
            if (isDelete) {
                childrenInfoForDelete(json, children);
            }
            else {
                const keys = Object.keys(children);
                if (keys) {
                    keys.forEach(name => {
                        const snapshot = dataSetSnapshot[name];
                        const child = isCurrent ? children[name] : snapshot && new DataSet().restore(snapshot);
                        if (child) {
                            const jsonArray = normal || useNormal(child.dataToJSON)
                                ? generateData(child)
                                : generateJSONData(child, isSelect);
                            if (jsonArray.dirty) {
                                dirty = true;
                            }
                            ObjectChainValue.set(json, name, jsonArray.data, fields);
                        }
                    });
                }
            }
            return dirty;
        }
    }
}
__decorate([
    observable
], Record.prototype, "fields", void 0);
__decorate([
    observable
], Record.prototype, "pristineData", void 0);
__decorate([
    observable
], Record.prototype, "data", void 0);
__decorate([
    observable
], Record.prototype, "status", void 0);
__decorate([
    observable
], Record.prototype, "selectable", void 0);
__decorate([
    observable
], Record.prototype, "isSelected", void 0);
__decorate([
    observable
], Record.prototype, "isCurrent", void 0);
__decorate([
    observable
], Record.prototype, "isCached", void 0);
__decorate([
    observable
], Record.prototype, "editing", void 0);
__decorate([
    observable
], Record.prototype, "state", void 0);
__decorate([
    computed
], Record.prototype, "key", null);
__decorate([
    computed
], Record.prototype, "index", null);
__decorate([
    computed
], Record.prototype, "isRemoved", null);
__decorate([
    computed
], Record.prototype, "isIndeterminate", null);
__decorate([
    computed
], Record.prototype, "isExpanded", null);
__decorate([
    computed
], Record.prototype, "previousRecord", null);
__decorate([
    computed
], Record.prototype, "nextRecord", null);
__decorate([
    computed
], Record.prototype, "records", null);
__decorate([
    computed
], Record.prototype, "children", null);
__decorate([
    computed
], Record.prototype, "parent", null);
__decorate([
    computed
], Record.prototype, "level", null);
__decorate([
    computed
], Record.prototype, "dirty", null);
__decorate([
    computed
], Record.prototype, "cascadeParent", null);
__decorate([
    action
], Record.prototype, "set", null);
__decorate([
    action
], Record.prototype, "init", null);
__decorate([
    action
], Record.prototype, "tls", null);
__decorate([
    action
], Record.prototype, "reset", null);
__decorate([
    action
], Record.prototype, "save", null);
__decorate([
    action
], Record.prototype, "restore", null);
__decorate([
    action
], Record.prototype, "clear", null);
__decorate([
    action
], Record.prototype, "commit", null);
__decorate([
    action
], Record.prototype, "setState", null);
__decorate([
    action
], Record.prototype, "commitTls", null);
__decorate([
    action
], Record.prototype, "addField", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGEtc2V0L1JlY29yZC50c3giLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxNQUFNLEVBQ04sUUFBUSxFQUNSLEdBQUcsRUFDSCxXQUFXLEVBQ1gsaUJBQWlCLEVBQ2pCLFVBQVUsRUFDVixXQUFXLEVBQ1gsR0FBRyxFQUNILElBQUksR0FDTCxNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLFFBQVEsTUFBTSxpQkFBaUIsQ0FBQztBQUN2QyxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxhQUFhLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQztBQUNoQyxPQUFPLEtBQTZCLE1BQU0sU0FBUyxDQUFDO0FBQ3BELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLHFCQUFxQixFQUNyQixjQUFjLEVBQ2QsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixvQkFBb0IsRUFDcEIsY0FBYyxFQUNkLGFBQWEsRUFDYixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFlBQVksRUFDWixVQUFVLEVBQ1YsU0FBUyxHQUNWLE1BQU0sU0FBUyxDQUFDO0FBQ2pCLE9BQU8sS0FBSyxnQkFBZ0IsTUFBTSwyQkFBMkIsQ0FBQztBQUU5RCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUU5QyxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQztBQUVyQzs7R0FFRztBQUNILE1BQU0sS0FBSyxHQUE2QixDQUFDLFFBQVEsQ0FBQyxFQUFDLEtBQWE7SUFDOUQsT0FBTyxJQUFJLEVBQUU7UUFDWCxN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OzBDQUFxQjtBQUVwQjtJQUFYLFVBQVU7MENBQXFCO0FBRXBCO0lBQVgsVUFBVTt5Q0FBb0I7QUFFbkI7SUFBWCxVQUFVO3dDQUFtQjtBQUVsQjtJQUFYLFVBQVU7dUNBQW1CO0FBRWxCO0lBQVgsVUFBVTtxQ0FBK0I7QUFHMUM7SUFEQyxRQUFRO2lDQWVSO0FBR0Q7SUFEQyxRQUFRO21DQU9SO0FBR0Q7SUFEQyxRQUFRO3VDQUdSO0FBR0Q7SUFEQyxRQUFROzZDQTJCUjtBQUdEO0lBREMsUUFBUTt3Q0FZUjtBQXFCRDtJQURDLFFBQVE7NENBYVI7QUFHRDtJQURDLFFBQVE7d0NBYVI7QUFHRDtJQURDLFFBQVE7cUNBV1I7QUFHRDtJQURDLFFBQVE7c0NBZVI7QUFHRDtJQURDLFFBQVE7b0NBY1I7QUFHRDtJQURDLFFBQVE7bUNBT1I7QUFHRDtJQURDLFFBQVE7bUNBZVI7QUFHRDtJQURDLFFBQVE7MkNBWVI7QUFzSEQ7SUFEQyxNQUFNO2lDQW1ETjtBQVlEO0lBREMsTUFBTTtrQ0FpQk47QUFvQkQ7SUFEQyxNQUFNO2lDQXFDTjtBQUdEO0lBREMsTUFBTTttQ0FlTjtBQUdEO0lBREMsTUFBTTtrQ0FJTjtBQUdEO0lBREMsTUFBTTtxQ0FRTjtBQUdEO0lBREMsTUFBTTttQ0FRTjtBQUdEO0lBREMsTUFBTTtvQ0ErQ047QUFHRDtJQURDLE1BQU07c0NBUU47QUFPRDtJQURDLE1BQU07dUNBa0JOO0FBT0Q7SUFEQyxNQUFNO3NDQWFOIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby9kYXRhLXNldC9SZWNvcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGFjdGlvbixcbiAgY29tcHV0ZWQsXG4gIGdldCxcbiAgaXNBcnJheUxpa2UsXG4gIGlzT2JzZXJ2YWJsZUFycmF5LFxuICBvYnNlcnZhYmxlLFxuICBydW5JbkFjdGlvbixcbiAgc2V0LFxuICB0b0pTLFxufSBmcm9tICdtb2J4JztcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UnO1xuaW1wb3J0IGlzT2JqZWN0IGZyb20gJ2xvZGFzaC9pc09iamVjdCc7XG5pbXBvcnQgaXNOaWwgZnJvbSAnbG9kYXNoL2lzTmlsJztcbmltcG9ydCBpc1N0cmluZyBmcm9tICdsb2Rhc2gvaXNTdHJpbmcnO1xuaW1wb3J0IGlzTnVtYmVyIGZyb20gJ2xvZGFzaC9pc051bWJlcic7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdsb2Rhc2gvaXNQbGFpbk9iamVjdCc7XG5pbXBvcnQgeyBnZXRDb25maWcgfSBmcm9tICdjaG9lcm9kb24tdWkvbGliL2NvbmZpZ3VyZSc7XG5pbXBvcnQgRGF0YVNldCBmcm9tICcuL0RhdGFTZXQnO1xuaW1wb3J0IEZpZWxkLCB7IEZpZWxkUHJvcHMsIEZpZWxkcyB9IGZyb20gJy4vRmllbGQnO1xuaW1wb3J0IHtcbiAgYXhpb3NDb25maWdBZGFwdGVyLFxuICBjaGVja0ZpZWxkVHlwZSxcbiAgY2hpbGRyZW5JbmZvRm9yRGVsZXRlLFxuICBmaW5kQmluZEZpZWxkcyxcbiAgZ2VuZXJhdGVEYXRhLFxuICBnZW5lcmF0ZUpTT05EYXRhLFxuICBnZW5lcmF0ZVJlc3BvbnNlRGF0YSxcbiAgZ2V0UmVjb3JkVmFsdWUsXG4gIGlzRGlydHlSZWNvcmQsXG4gIHByb2Nlc3NJbnRsRmllbGQsXG4gIHByb2Nlc3NUb0pTT04sXG4gIHByb2Nlc3NWYWx1ZSxcbiAgdXNlQ2FzY2FkZSxcbiAgdXNlTm9ybWFsLFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCAqIGFzIE9iamVjdENoYWluVmFsdWUgZnJvbSAnLi4vX3V0aWwvT2JqZWN0Q2hhaW5WYWx1ZSc7XG5pbXBvcnQgRGF0YVNldFNuYXBzaG90IGZyb20gJy4vRGF0YVNldFNuYXBzaG90JztcbmltcG9ydCBsb2NhbGVDb250ZXh0IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0JztcbmltcG9ydCB7IEJvb2xlYW5WYWx1ZSwgRGF0YVNldEV2ZW50cywgRmllbGRJZ25vcmUsIEZpZWxkVHlwZSwgUmVjb3JkU3RhdHVzIH0gZnJvbSAnLi9lbnVtJztcbmltcG9ydCBpc1NhbWUgZnJvbSAnLi4vX3V0aWwvaXNTYW1lJztcblxuLyoqXG4gKiDorrDlvZVJROeUn+aIkOWZqFxuICovXG5jb25zdCBJREdlbjogSXRlcmFibGVJdGVyYXRvcjxudW1iZXI+ID0gKGZ1bmN0aW9uKihzdGFydDogbnVtYmVyKSB7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgeWllbGQgKytzdGFydDtcbiAgfVxufSkoMTAwMCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZCB7XG4gIGlkOiBudW1iZXI7XG5cbiAgZGF0YVNldD86IERhdGFTZXQ7XG5cbiAgQG9ic2VydmFibGUgZmllbGRzOiBGaWVsZHM7XG5cbiAgbWVtbz86IG9iamVjdDtcblxuICBkYXRhU2V0U25hcHNob3Q6IHsgW2tleTogc3RyaW5nXTogRGF0YVNldFNuYXBzaG90IH0gPSB7fTtcblxuICBjYXNjYWRlUmVjb3Jkc01hcDogeyBba2V5OiBzdHJpbmddOiBSZWNvcmRbXSB9ID0ge307XG5cbiAgQG9ic2VydmFibGUgcHJpc3RpbmVEYXRhOiBvYmplY3Q7XG5cbiAgQG9ic2VydmFibGUgZGF0YTogb2JqZWN0O1xuXG4gIEBvYnNlcnZhYmxlIHN0YXR1czogUmVjb3JkU3RhdHVzO1xuXG4gIEBvYnNlcnZhYmxlIHNlbGVjdGFibGU6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgaXNTZWxlY3RlZDogYm9vbGVhbjtcblxuICBAb2JzZXJ2YWJsZSBpc0N1cnJlbnQ6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgaXNDYWNoZWQ6IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgZWRpdGluZz86IGJvb2xlYW47XG5cbiAgQG9ic2VydmFibGUgc3RhdGU6IHsgW2tleTogc3RyaW5nXTogYW55IH07XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBrZXkoKTogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICBpZiAodGhpcy5zdGF0dXMgIT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICAgIGNvbnN0IHsgcHJpbWFyeUtleSB9ID0gZGF0YVNldC5wcm9wcztcbiAgICAgICAgaWYgKHByaW1hcnlLZXkpIHtcbiAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmdldChwcmltYXJ5S2V5KTtcbiAgICAgICAgICBpZiAoaXNTdHJpbmcoa2V5KSB8fCBpc051bWJlcihrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaW5kZXgoKTogbnVtYmVyIHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIHJldHVybiBkYXRhU2V0LmluZGV4T2YodGhpcyk7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaXNSZW1vdmVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnN0YXR1cyA9PT0gUmVjb3JkU3RhdHVzLmRlbGV0ZTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgaXNJbmRldGVybWluYXRlKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgY29uc3QgeyBjaGVja0ZpZWxkIH0gPSBkYXRhU2V0LnByb3BzO1xuICAgICAgaWYgKGNoZWNrRmllbGQpIHtcbiAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzLmdldEZpZWxkKGNoZWNrRmllbGQpO1xuICAgICAgICBjb25zdCB0cnVlVmFsdWUgPSBmaWVsZCA/IGZpZWxkLmdldChCb29sZWFuVmFsdWUudHJ1ZVZhbHVlKSA6IHRydWU7XG4gICAgICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHRoaXM7XG4gICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgIGxldCBjaGVja2VkTGVuZ3RoID0gMDtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgY2hpbGRyZW4uc29tZShyZWNvcmQgPT4ge1xuICAgICAgICAgICAgICBpZiAocmVjb3JkLmlzSW5kZXRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChyZWNvcmQuZ2V0KGNoZWNrRmllbGQpID09PSB0cnVlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjaGVja2VkTGVuZ3RoICs9IDE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSkgfHxcbiAgICAgICAgICAgIChjaGVja2VkTGVuZ3RoID4gMCAmJiBjaGVja2VkTGVuZ3RoICE9PSBjaGlsZHJlbi5sZW5ndGgpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlzRXhwYW5kZWQoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgeyBkYXRhU2V0IH0gPSB0aGlzO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBjb25zdCB7IGV4cGFuZEZpZWxkIH0gPSBkYXRhU2V0LnByb3BzO1xuICAgICAgaWYgKGV4cGFuZEZpZWxkKSB7XG4gICAgICAgIGNvbnN0IGV4cGFuZGVkID0gdGhpcy5nZXQoZXhwYW5kRmllbGQpO1xuICAgICAgICBjb25zdCBmaWVsZCA9IHRoaXMuZ2V0RmllbGQoZXhwYW5kRmllbGQpO1xuICAgICAgICByZXR1cm4gZXhwYW5kZWQgPT09IChmaWVsZCA/IGZpZWxkLmdldChCb29sZWFuVmFsdWUudHJ1ZVZhbHVlKSA6IHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzZXQgaXNFeHBhbmRlZChleHBhbmQ6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgZXhwYW5kRmllbGQgfSA9IGRhdGFTZXQucHJvcHM7XG4gICAgICBpZiAoZXhwYW5kRmllbGQpIHtcbiAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzLmdldEZpZWxkKGV4cGFuZEZpZWxkKTtcbiAgICAgICAgdGhpcy5zZXQoXG4gICAgICAgICAgZXhwYW5kRmllbGQsXG4gICAgICAgICAgZmllbGRcbiAgICAgICAgICAgID8gZXhwYW5kXG4gICAgICAgICAgICAgID8gZmllbGQuZ2V0KEJvb2xlYW5WYWx1ZS50cnVlVmFsdWUpXG4gICAgICAgICAgICAgIDogZmllbGQuZ2V0KEJvb2xlYW5WYWx1ZS5mYWxzZVZhbHVlKVxuICAgICAgICAgICAgOiBleHBhbmQsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBwcmV2aW91c1JlY29yZCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcGFyZW50LCBkYXRhU2V0IH0gPSB0aGlzO1xuICAgIGxldCBjaGlsZHJlbjogUmVjb3JkW10gfCB1bmRlZmluZWQ7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW47XG4gICAgfSBlbHNlIGlmIChkYXRhU2V0KSB7XG4gICAgICBjaGlsZHJlbiA9IGRhdGFTZXQudHJlZURhdGE7XG4gICAgfVxuICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuW2NoaWxkcmVuLmluZGV4T2YodGhpcykgLSAxXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbmV4dFJlY29yZCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcGFyZW50LCBkYXRhU2V0IH0gPSB0aGlzO1xuICAgIGxldCBjaGlsZHJlbjogUmVjb3JkW10gfCB1bmRlZmluZWQ7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW47XG4gICAgfSBlbHNlIGlmIChkYXRhU2V0KSB7XG4gICAgICBjaGlsZHJlbiA9IGRhdGFTZXQudHJlZURhdGE7XG4gICAgfVxuICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgcmV0dXJuIGNoaWxkcmVuW2NoaWxkcmVuLmluZGV4T2YodGhpcykgKyAxXTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgcmVjb3JkcygpOiBSZWNvcmRbXSB7XG4gICAgY29uc3QgeyBkYXRhU2V0IH0gPSB0aGlzO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBjb25zdCB7IGNhc2NhZGVQYXJlbnQgfSA9IHRoaXM7XG4gICAgICBpZiAoY2FzY2FkZVBhcmVudCAmJiAhY2FzY2FkZVBhcmVudC5pc0N1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGNhc2NhZGVQYXJlbnQuZ2V0Q2FzY2FkZVJlY29yZHMoZGF0YVNldC5wYXJlbnROYW1lKSB8fCBbXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkYXRhU2V0LnJlY29yZHM7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgY2hpbGRyZW4oKTogUmVjb3JkW10gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgY29uc3QgeyBwYXJlbnRGaWVsZCwgaWRGaWVsZCB9ID0gZGF0YVNldC5wcm9wcztcbiAgICAgIGlmIChwYXJlbnRGaWVsZCAmJiBpZEZpZWxkKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5yZWNvcmRzLmZpbHRlcihyZWNvcmQgPT4ge1xuICAgICAgICAgIGNvbnN0IGNoaWxkUGFyZW50SWQgPSByZWNvcmQuZ2V0KHBhcmVudEZpZWxkKTtcbiAgICAgICAgICBjb25zdCBpZCA9IHRoaXMuZ2V0KGlkRmllbGQpO1xuICAgICAgICAgIHJldHVybiAhaXNOaWwoY2hpbGRQYXJlbnRJZCkgJiYgIWlzTmlsKGlkKSAmJiBjaGlsZFBhcmVudElkID09PSBpZDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPiAwID8gY2hpbGRyZW4gOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHBhcmVudCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgY29uc3QgeyBwYXJlbnRGaWVsZCwgaWRGaWVsZCB9ID0gZGF0YVNldC5wcm9wcztcbiAgICAgIGlmIChwYXJlbnRGaWVsZCAmJiBpZEZpZWxkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlY29yZHMuZmluZChyZWNvcmQgPT4ge1xuICAgICAgICAgIGNvbnN0IHBhcmVudElkID0gdGhpcy5nZXQocGFyZW50RmllbGQpO1xuICAgICAgICAgIGNvbnN0IGlkID0gcmVjb3JkLmdldChpZEZpZWxkKTtcbiAgICAgICAgICByZXR1cm4gIWlzTmlsKHBhcmVudElkKSAmJiAhaXNOaWwoaWQpICYmIHBhcmVudElkID09PSBpZDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGxldmVsKCk6IG51bWJlciB7XG4gICAgY29uc3QgeyBwYXJlbnQgfSA9IHRoaXM7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgcmV0dXJuIHBhcmVudC5sZXZlbCArIDE7XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkaXJ0eSgpOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGZpZWxkcywgc3RhdHVzLCBkYXRhU2V0LCBpc0N1cnJlbnQsIGRhdGFTZXRTbmFwc2hvdCB9ID0gdGhpcztcbiAgICBpZiAoc3RhdHVzID09PSBSZWNvcmRTdGF0dXMudXBkYXRlIHx8IFsuLi5maWVsZHMudmFsdWVzKCldLnNvbWUoKHsgZGlydHkgfSkgPT4gZGlydHkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IGRhdGFTZXQ7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoY2hpbGRyZW4pLnNvbWUoa2V5ID0+IHtcbiAgICAgICAgcmV0dXJuIGlzQ3VycmVudFxuICAgICAgICAgID8gY2hpbGRyZW5ba2V5XS5kaXJ0eVxuICAgICAgICAgIDogISFkYXRhU2V0U25hcHNob3Rba2V5XSAmJiBkYXRhU2V0U25hcHNob3Rba2V5XS5yZWNvcmRzLnNvbWUoaXNEaXJ0eVJlY29yZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjYXNjYWRlUGFyZW50KCk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBkYXRhU2V0IH0gPSB0aGlzO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBjb25zdCB7IHBhcmVudCwgcGFyZW50TmFtZSB9ID0gZGF0YVNldDtcbiAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50TmFtZSkge1xuICAgICAgICByZXR1cm4gcGFyZW50LmZpbmQoXG4gICAgICAgICAgcmVjb3JkID0+IChyZWNvcmQuZ2V0Q2FzY2FkZVJlY29yZHMocGFyZW50TmFtZSkgfHwgW10pLmluZGV4T2YodGhpcykgIT09IC0xLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZGF0YTogb2JqZWN0ID0ge30sIGRhdGFTZXQ/OiBEYXRhU2V0KSB7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgY29uc3QgaW5pdERhdGEgPSB0b0pTKGRhdGEpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgICAgdGhpcy5maWVsZHMgPSBvYnNlcnZhYmxlLm1hcDxzdHJpbmcsIEZpZWxkPigpO1xuICAgICAgdGhpcy5zdGF0dXMgPSBSZWNvcmRTdGF0dXMuYWRkO1xuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5pc0N1cnJlbnQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNDYWNoZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuaWQgPSBJREdlbi5uZXh0KCkudmFsdWU7XG4gICAgICB0aGlzLmRhdGEgPSBpbml0RGF0YTtcbiAgICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICAgIHRoaXMuZGF0YVNldCA9IGRhdGFTZXQ7XG4gICAgICAgIGNvbnN0IHsgZmllbGRzIH0gPSBkYXRhU2V0O1xuICAgICAgICBpZiAoZmllbGRzKSB7XG4gICAgICAgICAgdGhpcy5pbml0RmllbGRzKGZpZWxkcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGQgPSB0aGlzLnByb2Nlc3NEYXRhKGluaXREYXRhKTtcbiAgICAgIHRoaXMucHJpc3RpbmVEYXRhID0gZDtcbiAgICAgIHRoaXMuZGF0YSA9IGQ7XG4gICAgfSk7XG4gIH1cblxuICB0b0RhdGEoXG4gICAgbmVlZElnbm9yZT86IGJvb2xlYW4sXG4gICAgbm9DYXNjYWRlPzogYm9vbGVhbixcbiAgICBpc0Nhc2NhZGVTZWxlY3Q/OiBib29sZWFuLFxuICAgIGFsbDogYm9vbGVhbiA9IHRydWUsXG4gICk6IGFueSB7XG4gICAgY29uc3QgeyBzdGF0dXMsIGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgY29uc3QgZGF0YVRvSlNPTiA9IGRhdGFTZXQgJiYgZGF0YVNldC5kYXRhVG9KU09OO1xuICAgIGNvbnN0IGNhc2NhZGUgPSBub0Nhc2NhZGUgPT09IHVuZGVmaW5lZCAmJiBkYXRhVG9KU09OID8gdXNlQ2FzY2FkZShkYXRhVG9KU09OKSA6ICFub0Nhc2NhZGU7XG4gICAgY29uc3Qgbm9ybWFsID0gYWxsIHx8IChkYXRhVG9KU09OICYmIHVzZU5vcm1hbChkYXRhVG9KU09OKSk7XG4gICAgbGV0IGRpcnR5ID0gc3RhdHVzICE9PSBSZWNvcmRTdGF0dXMuc3luYztcbiAgICBjb25zdCBqc29uID0gdGhpcy5ub3JtYWxpemVEYXRhKG5lZWRJZ25vcmUpO1xuICAgIGlmIChjYXNjYWRlICYmIHRoaXMubm9ybWFsaXplQ2FzY2FkZURhdGEoanNvbiwgbm9ybWFsLCBpc0Nhc2NhZGVTZWxlY3QpKSB7XG4gICAgICBkaXJ0eSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAuLi5qc29uLFxuICAgICAgX19kaXJ0eTogZGlydHksXG4gICAgfTtcbiAgfVxuXG4gIHRvSlNPTkRhdGEobm9DYXNjYWRlPzogYm9vbGVhbiwgaXNDYXNjYWRlU2VsZWN0PzogYm9vbGVhbik6IGFueSB7XG4gICAgY29uc3QgeyBzdGF0dXMgfSA9IHRoaXM7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnRoaXMudG9EYXRhKHRydWUsIG5vQ2FzY2FkZSwgaXNDYXNjYWRlU2VsZWN0LCBmYWxzZSksXG4gICAgICBfX2lkOiB0aGlzLmlkLFxuICAgICAgW2dldENvbmZpZygnc3RhdHVzS2V5JyldOiBnZXRDb25maWcoJ3N0YXR1cycpW1xuICAgICAgICBzdGF0dXMgPT09IFJlY29yZFN0YXR1cy5zeW5jID8gUmVjb3JkU3RhdHVzLnVwZGF0ZSA6IHN0YXR1c1xuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgdmFsaWRhdGUoYWxsPzogYm9vbGVhbiwgbm9DYXNjYWRlPzogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHsgZGF0YVNldFNuYXBzaG90LCBpc0N1cnJlbnQsIGRhdGFTZXQsIHN0YXR1cywgZmllbGRzIH0gPSB0aGlzO1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgICAuLi5bLi4uZmllbGRzLnZhbHVlcygpXS5tYXAoZmllbGQgPT5cbiAgICAgICAgYWxsIHx8IHN0YXR1cyAhPT0gUmVjb3JkU3RhdHVzLnN5bmMgPyBmaWVsZC5jaGVja1ZhbGlkaXR5KCkgOiB0cnVlLFxuICAgICAgKSxcbiAgICAgIC4uLihub0Nhc2NhZGVcbiAgICAgICAgPyBbXVxuICAgICAgICA6IE9iamVjdC5rZXlzKGRhdGFTZXRTbmFwc2hvdCkubWFwKGtleSA9PlxuICAgICAgICAgICAgKGlzQ3VycmVudCAmJiBkYXRhU2V0XG4gICAgICAgICAgICAgID8gZGF0YVNldC5jaGlsZHJlbltrZXldXG4gICAgICAgICAgICAgIDogbmV3IERhdGFTZXQoKS5yZXN0b3JlKGRhdGFTZXRTbmFwc2hvdFtrZXldKVxuICAgICAgICAgICAgKS52YWxpZGF0ZShhbGwpLFxuICAgICAgICAgICkpLFxuICAgIF0pLnRoZW4ocmVzdWx0cyA9PiByZXN1bHRzLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQpKTtcbiAgfVxuXG4gIGdldEZpZWxkKGZpZWxkTmFtZT86IHN0cmluZyk6IEZpZWxkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoZmllbGROYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5maWVsZHMuZ2V0KGZpZWxkTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2FzY2FkZVJlY29yZHMoZmllbGROYW1lPzogc3RyaW5nKTogUmVjb3JkW10gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICBpZiAoZmllbGROYW1lICYmIGRhdGFTZXQpIHtcbiAgICAgIGNvbnN0IGNoaWxkRGF0YVNldCA9IGRhdGFTZXQuY2hpbGRyZW5bZmllbGROYW1lXTtcbiAgICAgIGlmIChjaGlsZERhdGFTZXQpIHtcbiAgICAgICAgaWYgKGRhdGFTZXQuY3VycmVudCA9PT0gdGhpcykge1xuICAgICAgICAgIHJldHVybiBjaGlsZERhdGFTZXQuc2xpY2UoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzbmFwc2hvdCA9IHRoaXMuZGF0YVNldFNuYXBzaG90W2ZpZWxkTmFtZV07XG4gICAgICAgIGlmIChzbmFwc2hvdCkge1xuICAgICAgICAgIHJldHVybiBzbmFwc2hvdC5yZWNvcmRzLmZpbHRlcihyID0+IHIuc3RhdHVzICE9PSBSZWNvcmRTdGF0dXMuZGVsZXRlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYXNjYWRlUmVjb3JkcyA9IHRoaXMuY2FzY2FkZVJlY29yZHNNYXBbZmllbGROYW1lXTtcbiAgICAgICAgaWYgKGNhc2NhZGVSZWNvcmRzKSB7XG4gICAgICAgICAgcmV0dXJuIGNhc2NhZGVSZWNvcmRzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmdldChmaWVsZE5hbWUpO1xuICAgICAgICBpZiAoaXNPYnNlcnZhYmxlQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICBjb25zdCByZWNvcmRzID0gY2hpbGREYXRhU2V0LnByb2Nlc3NEYXRhKGRhdGEpO1xuICAgICAgICAgIHRoaXMuY2FzY2FkZVJlY29yZHNNYXBbZmllbGROYW1lXSA9IHJlY29yZHM7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQoZmllbGROYW1lPzogc3RyaW5nKTogYW55IHtcbiAgICByZXR1cm4gZ2V0UmVjb3JkVmFsdWUuY2FsbChcbiAgICAgIHRoaXMsXG4gICAgICB0aGlzLmRhdGEsXG4gICAgICAoY2hpbGQsIGNoZWNrRmllbGQpID0+IGNoaWxkLmdldChjaGVja0ZpZWxkKSxcbiAgICAgIGZpZWxkTmFtZSxcbiAgICApO1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXQoaXRlbTogc3RyaW5nIHwgb2JqZWN0LCB2YWx1ZT86IGFueSk6IFJlY29yZCB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICBsZXQgZmllbGROYW1lOiBzdHJpbmcgPSBpdGVtO1xuICAgICAgY29uc3Qgb2xkTmFtZSA9IGZpZWxkTmFtZTtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5nZXRGaWVsZChmaWVsZE5hbWUpIHx8IHRoaXMuYWRkRmllbGQoZmllbGROYW1lKTtcbiAgICAgIGNoZWNrRmllbGRUeXBlKHZhbHVlLCBmaWVsZCk7XG4gICAgICBjb25zdCBiaW5kID0gZmllbGQuZ2V0KCdiaW5kJyk7XG4gICAgICBpZiAoYmluZCkge1xuICAgICAgICBmaWVsZE5hbWUgPSBiaW5kO1xuICAgICAgfVxuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0b0pTKHRoaXMuZ2V0KGZpZWxkTmFtZSkpO1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSBwcm9jZXNzVmFsdWUodmFsdWUsIGZpZWxkKTtcbiAgICAgIGlmICghaXNTYW1lKG5ld1ZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZHMgfSA9IHRoaXM7XG4gICAgICAgIE9iamVjdENoYWluVmFsdWUuc2V0KHRoaXMuZGF0YSwgZmllbGROYW1lLCBuZXdWYWx1ZSwgZmllbGRzKTtcbiAgICAgICAgY29uc3QgcHJpc3RpbmVWYWx1ZSA9IHRvSlModGhpcy5nZXRQcmlzdGluZVZhbHVlKGZpZWxkTmFtZSkpO1xuICAgICAgICBpZiAoaXNTYW1lKHByaXN0aW5lVmFsdWUsIG5ld1ZhbHVlKSkge1xuICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gUmVjb3JkU3RhdHVzLnVwZGF0ZSAmJiBbLi4uZmllbGRzLnZhbHVlcygpXS5ldmVyeShmID0+ICFmLmRpcnR5KSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBSZWNvcmRTdGF0dXMuc3luYztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5zeW5jKSB7XG4gICAgICAgICAgdGhpcy5zdGF0dXMgPSBSZWNvcmRTdGF0dXMudXBkYXRlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICAgICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgICAgICBkYXRhU2V0LmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLnVwZGF0ZSwge1xuICAgICAgICAgICAgZGF0YVNldCxcbiAgICAgICAgICAgIHJlY29yZDogdGhpcyxcbiAgICAgICAgICAgIG5hbWU6IG9sZE5hbWUsXG4gICAgICAgICAgICB2YWx1ZTogbmV3VmFsdWUsXG4gICAgICAgICAgICBvbGRWYWx1ZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCB7IGNoZWNrRmllbGQgfSA9IGRhdGFTZXQucHJvcHM7XG4gICAgICAgICAgaWYgKGNoZWNrRmllbGQgJiYgKGNoZWNrRmllbGQgPT09IGZpZWxkTmFtZSB8fCBjaGVja0ZpZWxkID09PSBvbGROYW1lKSkge1xuICAgICAgICAgICAgY29uc3QgeyBjaGlsZHJlbiB9ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKHJlY29yZCA9PiByZWNvcmQuc2V0KGZpZWxkTmFtZSwgdmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZpbmRCaW5kRmllbGRzKGZpZWxkLCB0aGlzLmZpZWxkcykuZm9yRWFjaChvbmVGaWVsZCA9PiB7XG4gICAgICAgIC8vIG9uZUZpZWxkLmRpcnR5ID0gZmllbGQuZGlydHksXG4gICAgICAgIG9uZUZpZWxkLnZhbGlkYXRvci5yZXNldCgpO1xuICAgICAgICBvbmVGaWVsZC5jaGVja1ZhbGlkaXR5KCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QoaXRlbSkpIHtcbiAgICAgIE9iamVjdC5rZXlzKGl0ZW0pLmZvckVhY2goa2V5ID0+IHRoaXMuc2V0KGtleSwgaXRlbVtrZXldKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZ2V0UHJpc3RpbmVWYWx1ZShmaWVsZE5hbWU/OiBzdHJpbmcpOiBhbnkge1xuICAgIHJldHVybiBnZXRSZWNvcmRWYWx1ZS5jYWxsKFxuICAgICAgdGhpcyxcbiAgICAgIHRoaXMucHJpc3RpbmVEYXRhLFxuICAgICAgKGNoaWxkLCBjaGVja0ZpZWxkKSA9PiBjaGlsZC5nZXRQcmlzdGluZVZhbHVlKGNoZWNrRmllbGQpLFxuICAgICAgZmllbGROYW1lLFxuICAgICk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGluaXQoaXRlbTogc3RyaW5nIHwgb2JqZWN0LCB2YWx1ZT86IGFueSk6IFJlY29yZCB7XG4gICAgY29uc3QgeyBmaWVsZHMsIHByaXN0aW5lRGF0YSwgZGF0YSB9ID0gdGhpcztcbiAgICBpZiAoaXNTdHJpbmcoaXRlbSkpIHtcbiAgICAgIGxldCBmaWVsZE5hbWU6IHN0cmluZyA9IGl0ZW07XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuZ2V0RmllbGQoZmllbGROYW1lKSB8fCB0aGlzLmFkZEZpZWxkKGZpZWxkTmFtZSk7XG4gICAgICBjb25zdCBiaW5kID0gZmllbGQuZ2V0KCdiaW5kJyk7XG4gICAgICBpZiAoYmluZCkge1xuICAgICAgICBmaWVsZE5hbWUgPSBiaW5kO1xuICAgICAgfVxuICAgICAgT2JqZWN0Q2hhaW5WYWx1ZS5zZXQocHJpc3RpbmVEYXRhLCBmaWVsZE5hbWUsIHZhbHVlLCBmaWVsZHMpO1xuICAgICAgT2JqZWN0Q2hhaW5WYWx1ZS5zZXQoZGF0YSwgZmllbGROYW1lLCB2YWx1ZSwgZmllbGRzKTtcbiAgICAgIGZpZWxkLmNvbW1pdCgpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChpdGVtKSkge1xuICAgICAgT2JqZWN0LmtleXMoaXRlbSkuZm9yRWFjaChrZXkgPT4gdGhpcy5pbml0KGtleSwgaXRlbVtrZXldKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2xvbmUoKTogUmVjb3JkIHtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgY29uc3QgY2xvbmVEYXRhID0gdGhpcy50b0RhdGEoKTtcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgY29uc3QgeyBwcmltYXJ5S2V5IH0gPSBkYXRhU2V0LnByb3BzO1xuICAgICAgaWYgKHByaW1hcnlLZXkpIHtcbiAgICAgICAgZGVsZXRlIGNsb25lRGF0YVtwcmltYXJ5S2V5XTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmVjb3JkKGNsb25lRGF0YSwgZGF0YVNldCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVjb3JkKGNsb25lRGF0YSk7XG4gIH1cblxuICByZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbLi4udGhpcy5maWVsZHMudmFsdWVzKCldLm1hcChmaWVsZCA9PiBmaWVsZC5yZWFkeSgpKSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGFzeW5jIHRscyhuYW1lPzogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdGxzS2V5ID0gZ2V0Q29uZmlnKCd0bHNLZXknKTtcbiAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHRoaXM7XG4gICAgaWYgKGRhdGFTZXQgJiYgbmFtZSkge1xuICAgICAgY29uc3QgdGxzRGF0YSA9IHRoaXMuZ2V0KHRsc0tleSkgfHwge307XG4gICAgICBpZiAoIShuYW1lIGluIHRsc0RhdGEpKSB7XG4gICAgICAgIGNvbnN0IHsgYXhpb3MsIGxhbmcgfSA9IGRhdGFTZXQ7XG4gICAgICAgIGNvbnN0IHsgcHJpbWFyeUtleSB9ID0gZGF0YVNldC5wcm9wcztcbiAgICAgICAgY29uc3QgbmV3Q29uZmlnID0gYXhpb3NDb25maWdBZGFwdGVyKFxuICAgICAgICAgICd0bHMnLFxuICAgICAgICAgIGRhdGFTZXQsXG4gICAgICAgICAge30sXG4gICAgICAgICAgcHJpbWFyeUtleSAmJiB7IGtleTogdGhpcy5nZXQocHJpbWFyeUtleSkgfSxcbiAgICAgICAgICB7IG5hbWUsIHJlY29yZDogdGhpcyB9LFxuICAgICAgICApO1xuICAgICAgICBpZiAobmV3Q29uZmlnLnVybCAmJiB0aGlzLnN0YXR1cyAhPT0gUmVjb3JkU3RhdHVzLmFkZCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGF4aW9zKG5ld0NvbmZpZyk7XG4gICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YUtleSA9IGdldENvbmZpZygnZGF0YUtleScpO1xuICAgICAgICAgICAgdGhpcy5jb21taXRUbHMoZ2VuZXJhdGVSZXNwb25zZURhdGEocmVzdWx0LCBkYXRhS2V5KVswXSwgbmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuY29tbWl0VGxzKFxuICAgICAgICAgICAgWy4uLnRoaXMuZmllbGRzLmVudHJpZXMoKV0ucmVkdWNlKChkYXRhLCBba2V5LCBmaWVsZF0pID0+IHtcbiAgICAgICAgICAgICAgaWYgKGZpZWxkLnR5cGUgPT09IEZpZWxkVHlwZS5pbnRsKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0ge1xuICAgICAgICAgICAgICAgICAgW2xhbmddOiB0aGlzLmdldChrZXkpLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9LCB7fSksXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIHJlc2V0KCk6IFJlY29yZCB7XG4gICAgY29uc3QgeyBzdGF0dXMsIGZpZWxkcywgZGF0YVNldCwgZGlydHkgfSA9IHRoaXM7XG4gICAgWy4uLmZpZWxkcy52YWx1ZXMoKV0uZm9yRWFjaChmaWVsZCA9PiBmaWVsZC5jb21taXQoKSk7XG4gICAgaWYgKHN0YXR1cyA9PT0gUmVjb3JkU3RhdHVzLnVwZGF0ZSB8fCBzdGF0dXMgPT09IFJlY29yZFN0YXR1cy5kZWxldGUpIHtcbiAgICAgIHRoaXMuc3RhdHVzID0gUmVjb3JkU3RhdHVzLnN5bmM7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgPT09IFJlY29yZFN0YXR1cy5kZWxldGUgfHwgZGlydHkpIHtcbiAgICAgIHRoaXMuZGF0YSA9IHRvSlModGhpcy5wcmlzdGluZURhdGEpO1xuICAgICAgdGhpcy5tZW1vID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKGRhdGFTZXQgJiYgIWRhdGFTZXQucmVzZXRJbkJhdGNoKSB7XG4gICAgICAgIGRhdGFTZXQuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMucmVzZXQsIHsgcmVjb3JkczogW3RoaXNdLCBkYXRhU2V0IH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIEBhY3Rpb25cbiAgc2F2ZSgpOiBSZWNvcmQge1xuICAgIHRoaXMubWVtbyA9IHRvSlModGhpcy5kYXRhKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIEBhY3Rpb25cbiAgcmVzdG9yZSgpOiBSZWNvcmQge1xuICAgIGNvbnN0IHsgbWVtbyB9ID0gdGhpcztcbiAgICBpZiAobWVtbykge1xuICAgICAgdGhpcy5zZXQobWVtbyk7XG4gICAgICB0aGlzLm1lbW8gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgQGFjdGlvblxuICBjbGVhcigpOiBSZWNvcmQge1xuICAgIHJldHVybiB0aGlzLnNldChcbiAgICAgIFsuLi50aGlzLmZpZWxkcy5rZXlzKCldLnJlZHVjZSgob2JqLCBrZXkpID0+IHtcbiAgICAgICAgb2JqW2tleV0gPSBudWxsO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgfSwge30pLFxuICAgICk7XG4gIH1cblxuICBAYWN0aW9uXG4gIGNvbW1pdChkYXRhPzogb2JqZWN0LCBkYXRhU2V0PzogRGF0YVNldCk6IFJlY29yZCB7XG4gICAgY29uc3QgeyBkYXRhU2V0U25hcHNob3QsIGZpZWxkcywgc3RhdHVzIH0gPSB0aGlzO1xuICAgIGlmIChkYXRhU2V0KSB7XG4gICAgICBjb25zdCB7IHJlY29yZHMgfSA9IGRhdGFTZXQ7XG4gICAgICBpZiAoc3RhdHVzID09PSBSZWNvcmRTdGF0dXMuZGVsZXRlKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gcmVjb3Jkcy5pbmRleE9mKHRoaXMpO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgZGF0YVNldC50b3RhbENvdW50IC09IDE7XG4gICAgICAgICAgcmVjb3Jkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXR1cyA9PT0gUmVjb3JkU3RhdHVzLmFkZCkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHJlY29yZHMuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIGRhdGFTZXQudG90YWxDb3VudCArPSAxO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBjb25zdCBuZXdEYXRhID0gdGhpcy5wcm9jZXNzRGF0YShkYXRhLCB0cnVlKTtcbiAgICAgICAgdGhpcy5wcmlzdGluZURhdGEgPSBuZXdEYXRhO1xuICAgICAgICBPYmplY3Qua2V5cyhuZXdEYXRhKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBuZXdEYXRhW2tleV07XG4gICAgICAgICAgaWYgKHRoaXMuZ2V0KGtleSkgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICBzZXQodGhpcy5kYXRhLCBrZXksIG5ld0RhdGFba2V5XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc25hcFNob3J0cyA9IE9iamVjdC5rZXlzKGRhdGFTZXRTbmFwc2hvdCk7XG4gICAgICAgIGlmIChzbmFwU2hvcnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGlzQ3VycmVudCA9IGRhdGFTZXQuY3VycmVudCA9PT0gdGhpcztcbiAgICAgICAgICBjb25zdCBkcyA9IG5ldyBEYXRhU2V0KCk7XG4gICAgICAgICAgc25hcFNob3J0cy5mb3JFYWNoKFxuICAgICAgICAgICAga2V5ID0+XG4gICAgICAgICAgICAgIChkYXRhU2V0U25hcHNob3Rba2V5XSA9IChpc0N1cnJlbnRcbiAgICAgICAgICAgICAgICA/IGRhdGFTZXQuY2hpbGRyZW5ba2V5XVxuICAgICAgICAgICAgICAgIDogZHMucmVzdG9yZShkYXRhU2V0U25hcHNob3Rba2V5XSlcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5jb21taXREYXRhKGRhdGFba2V5XSB8fCBbXSlcbiAgICAgICAgICAgICAgICAuc25hcHNob3QoKSksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBbLi4uZmllbGRzLnZhbHVlcygpXS5mb3JFYWNoKGZpZWxkID0+IGZpZWxkLmNvbW1pdCgpKTtcbiAgICB0aGlzLnN0YXR1cyA9IFJlY29yZFN0YXR1cy5zeW5jO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgQGFjdGlvblxuICBzZXRTdGF0ZShpdGVtOiBzdHJpbmcgfCBvYmplY3QsIHZhbHVlPzogYW55KSB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICBzZXQodGhpcy5zdGF0ZSwgaXRlbSwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdChpdGVtKSkge1xuICAgICAgc2V0KHRoaXMuc3RhdGUsIGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGdldFN0YXRlKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGdldCh0aGlzLnN0YXRlLCBrZXkpO1xuICB9XG5cbiAgQGFjdGlvblxuICBwcml2YXRlIGNvbW1pdFRscyhkYXRhID0ge30sIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHsgZGF0YVNldCB9ID0gdGhpcztcbiAgICBjb25zdCBsYW5nID0gZGF0YVNldCA/IGRhdGFTZXQubGFuZyA6IGxvY2FsZUNvbnRleHQubG9jYWxlLmxhbmc7XG4gICAgY29uc3QgdGxzS2V5ID0gZ2V0Q29uZmlnKCd0bHNLZXknKTtcbiAgICBjb25zdCB2YWx1ZXM6IG9iamVjdCA9IHt9O1xuICAgIGlmICghKG5hbWUgaW4gZGF0YSkpIHtcbiAgICAgIGRhdGFbbmFtZV0gPSB7fTtcbiAgICB9XG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkYXRhW2tleV07XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuZ2V0RmllbGQoa2V5KTtcbiAgICAgIGlmIChmaWVsZCAmJiBmaWVsZC5kaXJ0eSkge1xuICAgICAgICB2YWx1ZXNbYCR7dGxzS2V5fS4ke2tleX0uJHtsYW5nfWBdID0gdGhpcy5nZXQoa2V5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5pdChgJHt0bHNLZXl9LiR7a2V5fWAsIHZhbHVlKTtcbiAgICB9KTtcbiAgICB0aGlzLnNldCh2YWx1ZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0RmllbGRzKGZpZWxkczogRmllbGRzKSB7XG4gICAgWy4uLmZpZWxkcy5rZXlzKCldLmZvckVhY2goa2V5ID0+IHRoaXMuYWRkRmllbGQoa2V5KSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHByaXZhdGUgYWRkRmllbGQobmFtZTogc3RyaW5nLCBmaWVsZFByb3BzOiBGaWVsZFByb3BzID0ge30pOiBGaWVsZCB7XG4gICAgY29uc3QgeyBkYXRhU2V0IH0gPSB0aGlzO1xuICAgIHJldHVybiBwcm9jZXNzSW50bEZpZWxkKFxuICAgICAgbmFtZSxcbiAgICAgIGZpZWxkUHJvcHMsXG4gICAgICAobGFuZ05hbWUsIGxhbmdQcm9wcykgPT4ge1xuICAgICAgICBjb25zdCBmaWVsZCA9IG5ldyBGaWVsZCh7IC4uLmxhbmdQcm9wcywgbmFtZTogbGFuZ05hbWUgfSwgZGF0YVNldCwgdGhpcyk7XG4gICAgICAgIHRoaXMuZmllbGRzLnNldChsYW5nTmFtZSwgZmllbGQpO1xuICAgICAgICByZXR1cm4gZmllbGQ7XG4gICAgICB9LFxuICAgICAgZGF0YVNldCxcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBwcm9jZXNzRGF0YShkYXRhOiBvYmplY3QgPSB7fSwgbmVlZE1lcmdlPzogYm9vbGVhbik6IG9iamVjdCB7XG4gICAgY29uc3QgeyBmaWVsZHMgfSA9IHRoaXM7XG4gICAgY29uc3QgbmV3RGF0YSA9IHsgLi4uZGF0YSB9O1xuICAgIFsuLi5maWVsZHMuZW50cmllcygpXS5mb3JFYWNoKChbZmllbGROYW1lLCBmaWVsZF0pID0+IHtcbiAgICAgIGxldCB2YWx1ZSA9IE9iamVjdENoYWluVmFsdWUuZ2V0KGRhdGEsIGZpZWxkTmFtZSk7XG4gICAgICBjb25zdCBiaW5kID0gZmllbGQuZ2V0KCdiaW5kJyk7XG4gICAgICBjb25zdCB0eXBlID0gZmllbGQuZ2V0KCd0eXBlJyk7XG4gICAgICBjb25zdCB0cmFuc2Zvcm1SZXNwb25zZSA9IGZpZWxkLmdldCgndHJhbnNmb3JtUmVzcG9uc2UnKTtcbiAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgIGZpZWxkTmFtZSA9IGJpbmQ7XG4gICAgICAgIGNvbnN0IGJpbmRWYWx1ZSA9IE9iamVjdENoYWluVmFsdWUuZ2V0KGRhdGEsIGZpZWxkTmFtZSk7XG4gICAgICAgIGlmIChpc05pbCh2YWx1ZSkgJiYgIWlzTmlsKGJpbmRWYWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IGJpbmRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgdHlwZSA9PT0gRmllbGRUeXBlLmJvb2xlYW4pIHtcbiAgICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc2Zvcm1SZXNwb25zZSkge1xuICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVJlc3BvbnNlKHZhbHVlLCBkYXRhKTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gcHJvY2Vzc1ZhbHVlKHZhbHVlLCBmaWVsZCk7XG4gICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAobmVlZE1lcmdlICYmIGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMuZ2V0KGZpZWxkTmFtZSk7XG4gICAgICAgIGlmIChpc09iamVjdChvbGRWYWx1ZSkpIHtcbiAgICAgICAgICB2YWx1ZSA9IG1lcmdlKG9sZFZhbHVlLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIE9iamVjdENoYWluVmFsdWUuc2V0KG5ld0RhdGEsIGZpZWxkTmFtZSwgdmFsdWUsIGZpZWxkcyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIG5ld0RhdGE7XG4gIH1cblxuICBwcml2YXRlIG5vcm1hbGl6ZURhdGEobmVlZElnbm9yZT86IGJvb2xlYW4pIHtcbiAgICBjb25zdCB7IGZpZWxkcyB9ID0gdGhpcztcbiAgICBjb25zdCBqc29uOiBhbnkgPSB0b0pTKHRoaXMuZGF0YSk7XG4gICAgY29uc3Qgb2JqZWN0RmllbGRzTGlzdDogRmllbGRbXVtdID0gW107XG4gICAgY29uc3Qgbm9ybWFsRmllbGRzOiBGaWVsZFtdID0gW107XG4gICAgY29uc3QgaWdub3JlRmllbGROYW1lczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG4gICAgWy4uLmZpZWxkcy5rZXlzKCldLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnN0IGZpZWxkID0gdGhpcy5nZXRGaWVsZChrZXkpO1xuICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGNvbnN0IGlnbm9yZSA9IGZpZWxkLmdldCgnaWdub3JlJyk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBuZWVkSWdub3JlICYmXG4gICAgICAgICAgKGlnbm9yZSA9PT0gRmllbGRJZ25vcmUuYWx3YXlzIHx8IChpZ25vcmUgPT09IEZpZWxkSWdub3JlLmNsZWFuICYmICFmaWVsZC5kaXJ0eSkpXG4gICAgICAgICkge1xuICAgICAgICAgIGlnbm9yZUZpZWxkTmFtZXMuYWRkKGtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgdHlwZSA9IGZpZWxkLmdldCgndHlwZScpO1xuICAgICAgICAgIGlmICh0eXBlID09PSBGaWVsZFR5cGUub2JqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCBsZXZlbCA9IGtleS5zcGxpdCgnLicpLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBvYmplY3RGaWVsZHNMaXN0W2xldmVsXSA9IChvYmplY3RGaWVsZHNMaXN0W2xldmVsXSB8fCBbXSkuY29uY2F0KGZpZWxkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9ybWFsRmllbGRzLnB1c2goZmllbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIFsuLi5vYmplY3RGaWVsZHNMaXN0LCBub3JtYWxGaWVsZHNdLmZvckVhY2goaXRlbXMgPT4ge1xuICAgICAgaWYgKGl0ZW1zKSB7XG4gICAgICAgIGl0ZW1zLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgbmFtZSB9ID0gZmllbGQ7XG4gICAgICAgICAgbGV0IHZhbHVlID0gT2JqZWN0Q2hhaW5WYWx1ZS5nZXQoanNvbiwgbmFtZSk7XG4gICAgICAgICAgY29uc3QgYmluZCA9IGZpZWxkLmdldCgnYmluZCcpO1xuICAgICAgICAgIGNvbnN0IG11bHRpcGxlID0gZmllbGQuZ2V0KCdtdWx0aXBsZScpO1xuICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybVJlcXVlc3QgPSBmaWVsZC5nZXQoJ3RyYW5zZm9ybVJlcXVlc3QnKTtcbiAgICAgICAgICBpZiAoYmluZCkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmdldChiaW5kKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzU3RyaW5nKG11bHRpcGxlKSAmJiBpc0FycmF5TGlrZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKHByb2Nlc3NUb0pTT04pLmpvaW4obXVsdGlwbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHJhbnNmb3JtUmVxdWVzdCkge1xuICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1SZXF1ZXN0KHZhbHVlLCB0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIE9iamVjdENoYWluVmFsdWUuc2V0KGpzb24sIG5hbWUsIHByb2Nlc3NUb0pTT04odmFsdWUpLCBmaWVsZHMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZ25vcmVGaWVsZE5hbWVzLmFkZChuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIFsuLi5pZ25vcmVGaWVsZE5hbWVzXS5mb3JFYWNoKGtleSA9PiBPYmplY3RDaGFpblZhbHVlLnJlbW92ZShqc29uLCBrZXkpKTtcbiAgICByZXR1cm4ganNvbjtcbiAgfVxuXG4gIHByaXZhdGUgbm9ybWFsaXplQ2FzY2FkZURhdGEoXG4gICAganNvbjogYW55LFxuICAgIG5vcm1hbD86IGJvb2xlYW4sXG4gICAgaXNTZWxlY3Q/OiBib29sZWFuLFxuICApOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IGRhdGFTZXRTbmFwc2hvdCwgZGF0YVNldCwgaXNDdXJyZW50LCBzdGF0dXMsIGZpZWxkcyB9ID0gdGhpcztcbiAgICBjb25zdCBpc0RlbGV0ZSA9IHN0YXR1cyA9PT0gUmVjb3JkU3RhdHVzLmRlbGV0ZTtcbiAgICBpZiAoZGF0YVNldCkge1xuICAgICAgbGV0IGRpcnR5ID0gZmFsc2U7XG4gICAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSBkYXRhU2V0O1xuICAgICAgaWYgKGlzRGVsZXRlKSB7XG4gICAgICAgIGNoaWxkcmVuSW5mb0ZvckRlbGV0ZShqc29uLCBjaGlsZHJlbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoY2hpbGRyZW4pO1xuICAgICAgICBpZiAoa2V5cykge1xuICAgICAgICAgIGtleXMuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNuYXBzaG90ID0gZGF0YVNldFNuYXBzaG90W25hbWVdO1xuICAgICAgICAgICAgY29uc3QgY2hpbGQgPSBpc0N1cnJlbnQgPyBjaGlsZHJlbltuYW1lXSA6IHNuYXBzaG90ICYmIG5ldyBEYXRhU2V0KCkucmVzdG9yZShzbmFwc2hvdCk7XG4gICAgICAgICAgICBpZiAoY2hpbGQpIHtcbiAgICAgICAgICAgICAgY29uc3QganNvbkFycmF5ID1cbiAgICAgICAgICAgICAgICBub3JtYWwgfHwgdXNlTm9ybWFsKGNoaWxkLmRhdGFUb0pTT04pXG4gICAgICAgICAgICAgICAgICA/IGdlbmVyYXRlRGF0YShjaGlsZClcbiAgICAgICAgICAgICAgICAgIDogZ2VuZXJhdGVKU09ORGF0YShjaGlsZCwgaXNTZWxlY3QpO1xuICAgICAgICAgICAgICBpZiAoanNvbkFycmF5LmRpcnR5KSB7XG4gICAgICAgICAgICAgICAgZGlydHkgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIE9iamVjdENoYWluVmFsdWUuc2V0KGpzb24sIG5hbWUsIGpzb25BcnJheS5kYXRhLCBmaWVsZHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZGlydHk7XG4gICAgfVxuICB9XG59XG4iXSwidmVyc2lvbiI6M30=