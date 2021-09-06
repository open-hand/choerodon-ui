import { action, computed, isArrayLike, isObservableArray, isObservableObject, observable, ObservableMap, runInAction, toJS } from 'mobx';
import merge from 'lodash/merge';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet, { addRecordField, RecordValidationErrors } from './DataSet';
import Field, { FieldProps, Fields } from './Field';
import {
  axiosConfigAdapter,
  checkFieldType,
  childrenInfoForDelete,
  findBindField,
  findBindFields,
  findBindTargetFields,
  generateData,
  generateJSONData,
  generateResponseData,
  getChainFieldName,
  getIf,
  getRecordValue,
  getSortedFields,
  getUniqueKeysAndPrimaryKey,
  isDirtyRecord,
  processToJSON,
  processValue,
  useCascade,
  useDirtyField,
  useNormal,
  useSelected,
} from './utils';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import DataSetSnapshot from './DataSetSnapshot';
import { BooleanValue, DataSetEvents, DataSetSelection, FieldIgnore, FieldType, RecordStatus } from './enum';
import isSame from '../_util/isSame';
import { treeReduce } from '../_util/treeUtils';

/**
 * 记录ID生成器
 */
const IDGen: IterableIterator<number> = (function* (start: number) {
  while (true) {
    yield ++start;
  }
})(1000);

const EXPANDED_KEY = '__EXPANDED_KEY__';  // TODO:Symbol
const SELECTABLE_KEY = '__SELECTABLE_KEY__';  // TODO:Symbol
const SELECT_KEY = '__SELECT_KEY__';  // TODO:Symbol
const UNSELECT_KEY = '__UNSELECT_KEY__';  // TODO:Symbol

export default class Record {
  id: number;

  dataSet?: DataSet;

  @observable fields: Fields;

  memo?: object;

  prepareForReport?: { result?: boolean, timeout?: number } | undefined;

  dataSetSnapshot?: { [key: string]: DataSetSnapshot } | undefined;

  cascadeRecordsMap?: { [key: string]: Record[] } | undefined;

  cascading?: { [key: string]: boolean } | undefined;

  validating?: boolean | undefined;

  @observable data: object;

  @observable dirtyData?: ObservableMap<string, any> | undefined;

  @computed
  get pristineData(): object {
    const { dirtyData } = this;
    const data = toJS(this.data);
    if (dirtyData) {
      [...dirtyData.entries()].forEach(([key, value]) => ObjectChainValue.set(data, key, value));
    }
    return data;
  }

  set pristineData(data: object) {
    runInAction(() => {
      const { dirtyData } = this;
      if (dirtyData) {
        const dirtyKeys = [...dirtyData.keys()];
        const newData = {};
        if (dirtyKeys.length) {
          dirtyKeys.forEach((key) => {
            const item = ObjectChainValue.get(this.data, key);
            ObjectChainValue.set(newData, key, item);
            const newItem = ObjectChainValue.get(data, key);
            if (isSame(item, newItem)) {
              dirtyData.delete(key);
            } else {
              dirtyData.set(key, newItem);
            }
          });
        }
        this.data = merge({}, data, newData);
      } else {
        this.data = data;
      }
    });
  }

  @observable status: RecordStatus;

  get selectable(): boolean {
    return this.getState(SELECTABLE_KEY);
  }

  set selectable(selectable: boolean) {
    runInAction(() => {
      if (!selectable) {
        this.isSelected = false;
      }
      this.setState(SELECTABLE_KEY, selectable);
    });
  }

  get isDataSetInAllPageSelection(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      return dataSet.isAllPageSelection;
    }
    return false;
  }

  get isSelected(): boolean {
    if (this.isDataSetInAllPageSelection) {
      return !this.getState(UNSELECT_KEY);
    }
    return this.getState(SELECT_KEY);
  }

  set isSelected(isSelected: boolean) {
    if (this.isDataSetInAllPageSelection) {
      this.setState(UNSELECT_KEY, !isSelected);
    } else {
      this.setState(SELECT_KEY, isSelected);
    }
  }

  @observable isCurrent?: boolean;

  @observable isCached?: boolean;

  @observable editing?: boolean;

  @observable pending?: boolean;

  @observable childrenLoaded?: boolean;

  @observable state?: ObservableMap<string, any> | undefined;

  @computed
  get key(): string | number {
    if (!this.isNew) {
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

  @computed
  get index(): number {
    const { dataSet } = this;
    if (dataSet) {
      return dataSet.indexOf(this);
    }
    return -1;
  }

  @computed
  get indexInParent(): number {
    const { parent, dataSet } = this;
    if (parent && parent.children) {
      return parent.children.indexOf(this);
    }
    if (dataSet) {
      return dataSet.treeRecords.indexOf(this);
    }
    return -1;
  }

  get isRemoved(): boolean {
    return this.status === RecordStatus.delete;
  }

  get isNew(): boolean {
    return this.status === RecordStatus.add;
  }

  @computed
  get isSelectionIndeterminate(): boolean {
    const { dataSet } = this;
    if (dataSet && dataSet.selection === DataSetSelection.multiple) {
      const { children } = this;
      if (children) {
        let checkedLength = 0;
        return (
          children.some(record => {
            if (record.isSelectionIndeterminate) {
              return true;
            }
            if (record.isSelected) {
              checkedLength += 1;
            }
            return false;
          }) ||
          (checkedLength > 0 && checkedLength !== children.length)
        );
      }
    }
    return false;
  }

  @computed
  get isIndeterminate(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      const { checkField } = dataSet.props;
      if (checkField) {
        const field = this.getField(checkField);
        const trueValue = field ? field.get(BooleanValue.trueValue) : true;
        const { children } = this;
        if (children) {
          let checkedLength = 0;
          return (
            children.some(record => {
              if (record.isIndeterminate) {
                return true;
              }
              if (record.get(checkField) === trueValue) {
                checkedLength += 1;
              }
              return false;
            }) ||
            (checkedLength > 0 && checkedLength !== children.length)
          );
        }
      }
    }
    return false;
  }

  @computed
  get isExpanded(): boolean {
    const { dataSet } = this;
    if (dataSet) {
      const { expandField } = dataSet.props;
      if (expandField) {
        const expanded = this.get(expandField);
        const field = this.getField(expandField);
        return expanded === (field ? field.get(BooleanValue.trueValue) : true);
      }
    }
    return this.getState(EXPANDED_KEY);
  }

  set isExpanded(expand: boolean) {
    const { dataSet } = this;
    if (dataSet) {
      const { expandField } = dataSet.props;
      if (expandField) {
        const field = this.getField(expandField);
        this.set(
          expandField,
          field
            ? expand
            ? field.get(BooleanValue.trueValue)
            : field.get(BooleanValue.falseValue)
            : expand,
        );
      } else {
        this.setState(EXPANDED_KEY, expand);
      }
    }
  }

  @computed
  get previousRecord(): Record | undefined {
    const { parent, dataSet } = this;
    let children: Record[] | undefined;
    if (parent) {
      children = parent.children;
    } else if (dataSet) {
      children = dataSet.treeData;
    }
    if (children) {
      return children[children.indexOf(this) - 1];
    }
    return undefined;
  }

  @computed
  get nextRecord(): Record | undefined {
    const { parent, dataSet } = this;
    let children: Record[] | undefined;
    if (parent) {
      children = parent.children;
    } else if (dataSet) {
      children = dataSet.treeData;
    }
    if (children) {
      return children[children.indexOf(this) + 1];
    }
    return undefined;
  }

  @computed
  get records(): Record[] {
    const { dataSet } = this;
    if (dataSet) {
      const { cascadeParent } = this;
      if (cascadeParent && !cascadeParent.isCurrent) {
        return cascadeParent.getCascadeRecordsIncludeDelete(dataSet.parentName) || [];
      }
      return dataSet.records;
    }
    return [];
  }

  @computed
  get children(): Record[] | undefined {
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

  @computed
  get parent(): Record | undefined {
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

  @computed
  get parents(): Record[] {
    const { parent } = this;
    if (parent) {
      return [parent, ...parent.parents];
    }
    return [];
  }

  @computed
  get path(): Record[] {
    return [...this.parents, this];
  }

  get level(): number {
    const { parent } = this;
    if (parent) {
      return parent.level + 1;
    }
    return 0;
  }

  @computed
  get dirty(): boolean {
    const { status } = this;
    if (status === RecordStatus.update) {
      return true;
    }
    const { dirtyData } = this;
    if (dirtyData && dirtyData.size > 0) {
      return true;
    }
    const { dataSet } = this;
    if (dataSet) {
      const { children } = dataSet;
      return Object.keys(children).some(key => (this.getCascadeRecordsIncludeDelete(key) || []).some(isDirtyRecord));
    }
    return false;
  }

  @computed
  get cascadeParent(): Record | undefined {
    const { dataSet } = this;
    if (dataSet) {
      const { parent, parentName } = dataSet;
      if (parent && parentName) {
        return parent.cascadeRecords.find(
          record => (record.getCascadeRecordsIncludeDelete(parentName) || []).indexOf(this) !== -1,
        );
      }
    }
    return undefined;
  }

  constructor(data: object = {}, dataSet?: DataSet, status: RecordStatus = RecordStatus.add) {
    runInAction(() => {
      const initData = isObservableObject(data) ? toJS(data) : data;
      this.fields = observable.map<string, Field>();
      this.status = status;
      this.selectable = true;
      this.isSelected = false;
      this.id = IDGen.next().value;
      this.data = initData;
      if (dataSet) {
        this.dataSet = dataSet;
        const { fields } = dataSet;
        if (fields) {
          this.initFields(fields);
        }
      }
      this.processData(initData);
    });
  }

  /**
   * 转换成普通数据
   * 一般用于父级联数据源中的json类型字段
   * 禁止通过此方法获取某一个或几个字段值
   */
  toData(
    needIgnore?: boolean,
    noCascade?: boolean,
    isCascadeSelect?: boolean,
    all: boolean = true,
  ): any {
    const { status, dataSet, fields } = this;
    const dataToJSON = dataSet && dataSet.dataToJSON;
    const cascade = noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
    const normal = all || (dataToJSON && useNormal(dataToJSON));
    let dirty = status !== RecordStatus.sync;
    const childrenKeys: string[] | undefined = cascade && dataSet ? Object.keys(dataSet.children) : undefined;
    const jsonFieldKeys: string[] | undefined = childrenKeys && [...fields.entries()].reduce<string[]>((fieldKeys, [key, field]) => {
      if (field.type === FieldType.json && childrenKeys.some(childKey => key === childKey || childKey.startsWith(`${key}.`))) {
        fieldKeys.push(key);
      }
      return fieldKeys;
    }, []);
    const json = this.normalizeData(needIgnore, jsonFieldKeys);
    if (cascade && this.normalizeCascadeData(json, normal, isCascadeSelect)) {
      dirty = true;
    }
    if (jsonFieldKeys) {
      jsonFieldKeys.forEach(key => ObjectChainValue.set(json, key, JSON.stringify(ObjectChainValue.get(json, key)), fields));
    }
    return {
      ...json,
      __dirty: dirty,
    };
  }

  /**
   * 转换成用于提交的数据
   */
  toJSONData(noCascade?: boolean, isCascadeSelect?: boolean): any {
    const { status } = this;
    return {
      ...this.toData(true, noCascade, isCascadeSelect, false),
      __id: this.id,
      [getConfig('statusKey')]: getConfig('status')[
        status === RecordStatus.sync ? RecordStatus.update : status
        ],
    };
  }

  validate(all?: boolean, noCascade?: boolean): Promise<boolean> {
    const { dataSet } = this;
    this.validating = true;
    const promises: Promise<boolean>[] = [];
    if (all || this.status !== RecordStatus.sync) {
      [...this.fields.values()].forEach(field => promises.push(field.checkValidity(false)));
    }
    if (!noCascade && dataSet) {
      const childrenKeys = Object.keys(dataSet.children);
      if (childrenKeys.length) {
        const { dataSetSnapshot, isCurrent } = this;
        childrenKeys.forEach((key) => {
          const { children } = dataSet;
          const snapshot = dataSetSnapshot && dataSetSnapshot[key];
          const ds = children[key];
          const child = isCurrent ? ds : snapshot && new DataSet().restore(snapshot);
          if (child) {
            promises.push(child.validate());
          } else {
            const { dataToJSON } = ds;
            const cascade = noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
            ((useSelected(dataToJSON) ? this.getCascadeSelectedRecords(key) : this.getCascadeRecords(key)) || []).forEach(record =>
              promises.push(record.validate(false, !cascade)),
            );
          }
        });
      }
    }
    return Promise.all(promises)
      .then((results) => {
        const valid = results.every(result => result);
        this.reportValidity(valid);
        delete this.validating;
        return valid;
      }).catch((error) => {
        delete this.validating;
        throw error;
      });
  }

  reportValidity(result: boolean) {
    const { dataSet } = this;
    if (dataSet && !dataSet.validating) {
      const prepareForReport = getIf<Record, { result?: boolean, timeout?: number }>(this, 'prepareForReport', {});
      if (!result) {
        prepareForReport.result = result;
      }
      if (prepareForReport.timeout) {
        window.clearTimeout(prepareForReport.timeout);
      }
      prepareForReport.timeout = window.setTimeout(() => {
        dataSet.reportValidity(prepareForReport.result || true);
        delete this.prepareForReport;
      }, 200);
    }
  };

  getValidationErrors(): RecordValidationErrors[] {
    return [...this.fields.values()].reduce<RecordValidationErrors[]>((results, field) => {
      if (!field.valid) {
        results.push({
          field,
          errors: field.getValidationErrorValues(),
        });
      }
      return results;
    }, []);
  }

  getField(fieldName?: string): Field | undefined {
    if (fieldName) {
      return this.fields.get(fieldName);
    }
  }

  getCascadeRecordsIncludeDelete(fieldName?: string): Record[] | undefined {
    const { dataSet } = this;
    if (fieldName && dataSet) {
      const childDataSet = dataSet.children[fieldName];
      if (childDataSet) {
        if (this.isCurrent) {
          return childDataSet.records.slice();
        }
        const { dataSetSnapshot } = this;
        const snapshot = dataSetSnapshot && dataSetSnapshot[fieldName];
        if (snapshot) {
          return snapshot.records;
        }
        const cascadeRecordsMap = getIf<Record, { [key: string]: Record[] }>(this, 'cascadeRecordsMap', {});
        const cascadeRecords = cascadeRecordsMap[fieldName];
        if (cascadeRecords) {
          return cascadeRecords;
        }
        const data = this.get(fieldName);
        const cascading = getIf<Record, { [key: string]: boolean }>(this, 'cascading', {});
        if (!cascading[fieldName] && isObservableArray(data)) {
          cascading[fieldName] = true;
          const records = childDataSet.processData(data, this.isNew ? RecordStatus.add : RecordStatus.sync);
          delete cascading[fieldName];
          cascadeRecordsMap[fieldName] = records;
          return records;
        }
      }
    }
  }

  getCascadeRecords(fieldName?: string): Record[] | undefined {
    const records = this.getCascadeRecordsIncludeDelete(fieldName);
    if (records) {
      return records.filter(r => !r.isRemoved);
    }
  }

  getCascadeSelectedRecordsIncludeDelete(fieldName?: string): Record[] | undefined {
    const records = this.getCascadeRecordsIncludeDelete(fieldName);
    if (records) {
      return records.filter(r => r.isSelected);
    }
  }

  getCascadeSelectedRecords(fieldName?: string): Record[] | undefined {
    const records = this.getCascadeRecordsIncludeDelete(fieldName);
    if (records) {
      return records.filter(r => !r.isRemoved && r.isSelected);
    }
  }

  get(fieldName?: string | string []): any {
    return getRecordValue(
      this,
      (child, checkField) => child.get(checkField),
      fieldName,
    );
  }

  @action
  set(item: string | object, value?: any): Record {
    if (isString(item)) {
      const oldName: string = item;
      const fieldName: string = getChainFieldName(this, oldName);
      const field = this.getField(oldName) || this.getField(fieldName) || findBindField(oldName, fieldName, this) || addRecordField(this, oldName);
      checkFieldType(value, field);
      const oldValue = toJS(this.get(fieldName));
      const newValue = processValue(value, field);
      const newValueForCompare = processToJSON(newValue, field);
      if (!isSame(processToJSON(oldValue, field), newValueForCompare)) {
        const { fields } = this;
        ObjectChainValue.set(this.data, fieldName, newValue, fields);
        const dirtyData = getIf<Record, ObservableMap<string, any>>(this, 'dirtyData', () => observable.map<string, any>());
        if (!(dirtyData.has(fieldName))) {
          dirtyData.set(fieldName, oldValue);
          if (this.status === RecordStatus.sync) {
            this.status = RecordStatus.update;
          }
        } else if (isSame(processToJSON(dirtyData.get(fieldName), field), newValueForCompare)) {
          dirtyData.delete(fieldName);
          if (this.status === RecordStatus.update && dirtyData.size === 0 && [...fields.values()].every(f => !f.dirty)) {
            this.status = RecordStatus.sync;
          }
        }
        const { dataSet } = this;
        if (dataSet) {
          dataSet.fireEvent(DataSetEvents.update, {
            dataSet,
            record: this,
            name: oldName,
            value: newValue,
            oldValue,
          });
          const { checkField } = dataSet.props;
          if (checkField && fieldName === getChainFieldName(this, checkField)) {
            const { children } = this;
            if (children) {
              children.forEach(record => record.set(fieldName, value));
            }
          }
        }
      }
      const { fields } = this;
      [field, ...findBindFields(field, fields, true), ...findBindTargetFields(field, fields, true)].forEach((oneField) => (
        oneField.checkValidity(false)
      ));
    } else if (isPlainObject(item)) {
      Object.keys(item).forEach(key => this.set(key, item[key]));
    }
    return this;
  }

  getPristineValue(fieldName?: string): any {
    if (fieldName) {
      const chainFieldName = getChainFieldName(this, fieldName);
      const { dirtyData } = this;
      if (dirtyData && dirtyData.has(chainFieldName)) {
        return dirtyData.get(chainFieldName);
      }
      return this.get(chainFieldName);
    }
  }

  @action
  init(item: string | object, value?: any): Record {
    const { fields, data, dirtyData } = this;
    if (isString(item)) {
      const oldName: string = item;
      const fieldName: string = getChainFieldName(this, oldName);
      const field = this.getField(oldName) || this.getField(fieldName) || findBindField(oldName, fieldName, this) || addRecordField(this, fieldName);
      const newValue = processValue(value, field);
      if (dirtyData) {
        dirtyData.delete(fieldName);
      }
      ObjectChainValue.set(data, fieldName, newValue, fields);
      field.commit();
    } else if (isPlainObject(item)) {
      Object.keys(item).forEach(key => this.init(key, item[key]));
    }
    return this;
  }

  clone(): Record {
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

  ready(): Promise<any> {
    return Promise.resolve(true);
    // return Promise.all([...this.fields.values()].map(field => field.ready()));
  }

  @action
  async tls(name?: string): Promise<void> {
    const tlsKey = getConfig('tlsKey');
    const { dataSet } = this;
    if (dataSet && name) {
      const tlsData = this.get(tlsKey) || {};
      if (!(name in tlsData)) {
        const { axios, lang } = dataSet;
        const { primaryKey } = dataSet.props;
        const newConfig = axiosConfigAdapter(
          'tls',
          dataSet,
          {},
          primaryKey && { key: this.get(primaryKey) },
          { name, record: this },
        );
        if (newConfig.url && !this.isNew) {
          const result = await axios(newConfig);
          if (result) {
            const dataKey = getConfig('dataKey');
            this.commitTls(generateResponseData(result, dataKey)[0], name);
          }
        } else {
          this.commitTls(
            [...this.fields.entries()].reduce((data, [key, field]) => {
              if (field.type === FieldType.intl) {
                data[key] = {
                  [lang]: this.get(key),
                };
              }
              return data;
            }, {}),
            name,
          );
        }
      }
    }
  }

  @action
  reset(): Record {
    const { status, fields, dataSet, dirty, isRemoved } = this;
    [...fields.values()].forEach(field => field.commit());
    if (status === RecordStatus.update || isRemoved) {
      this.status = RecordStatus.sync;
    }
    if (isRemoved || dirty) {
      this.data = toJS(this.pristineData);
      this.dirtyData = undefined;
      this.memo = undefined;
      if (dataSet && !dataSet.resetInBatch) {
        dataSet.fireEvent(DataSetEvents.reset, { records: [this], dataSet });
      }
    }
    return this;
  }

  @action
  save(): Record {
    this.memo = toJS(this.data);
    return this;
  }

  @action
  restore(): Record {
    const { memo } = this;
    if (memo) {
      this.set(memo);
      this.memo = undefined;
    }
    return this;
  }

  @action
  clear(): Record {
    return this.set(
      [...this.fields.keys()].reduce((obj, key) => {
        obj[key] = null;
        return obj;
      }, {}),
    );
  }

  @action
  commit(data?: object, dataSet?: DataSet): Record {
    if (dataSet) {
      const { records } = this;
      if (this.isRemoved) {
        const index = records.indexOf(this);
        if (index !== -1) {
          if (dataSet.records === records) {
            dataSet.totalCount -= 1;
          }
          records.splice(index, 1);
        }
        return this;
      }
      if (this.isNew) {
        const index = records.indexOf(this);
        if (index !== -1 && dataSet.records === records) {
          dataSet.totalCount += 1;
        }
      }
      if (data) {
        this.data = data;
        this.processData(data, true);
        const { children } = dataSet;
        const keys = Object.keys(children);
        if (keys.length) {
          const { isCurrent } = this;
          const tmpDs = new DataSet();
          const dataSetSnapshot = getIf<Record, { [key: string]: DataSetSnapshot }>(this, 'dataSetSnapshot', {});
          keys.forEach(key => {
            const snapshot = dataSetSnapshot[key];
            const ds = children[key];
            const child = isCurrent
              ? ds
              : snapshot && tmpDs.restore(snapshot);
            if (child) {
              dataSetSnapshot[key] = child.commitData(data[key] || []).snapshot();
            } else {
              const cascadeRecords = this.getCascadeRecordsIncludeDelete(key);
              if (cascadeRecords) {
                cascadeRecords.forEach(r => r.commit(omit(r.toData(), ['__dirty']), ds));
              }
            }
          });
        }
      }
    }
    this.dirtyData = undefined;
    [...this.fields.values()].forEach(field => field.commit());
    this.status = RecordStatus.sync;
    return this;
  }

  @action
  setState(item: string | object, value?: any) {
    const state = getIf<Record, ObservableMap<string, any>>(this, 'state', () => observable.map<string, any>());
    if (isString(item)) {
      state.set(item, value);
    } else if (isPlainObject(item)) {
      state.merge(item);
    }
    return this;
  }

  getState(key: string) {
    const { state } = this;
    return state && state.get(key);
  }

  treeReduce<U>(
    fn: (previousValue: U, record: Record) => U,
    initialValue: U,
  ): U {
    return treeReduce<U, Record>([this], fn, initialValue);
  }

  @action
  private commitTls(data = {}, name: string) {
    const tlsKey = getConfig('tlsKey');
    if (!(name in data)) {
      data[name] = {};
    }
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const field = this.getField(key);
      if (field) {
        const transformResponse = field.get('transformResponse');
        if (transformResponse) {
          const originValue = { ...value };
          Object.keys(value).forEach((language) => {
            value[language] = transformResponse(value[language], originValue);
          });
        }
      }
      ObjectChainValue.set(this.data, `${tlsKey}.${key}`, value);
    });
  }

  private initFields(fields: Fields) {
    [...fields.keys()].forEach((key) => addRecordField(this, key));
  }

  @action
  addField(name: string, fieldProps: FieldProps = {}): Field {
    const old = this.fields.get(name);
    const field = addRecordField(this, name, fieldProps);
    if (!old) {
      const data = toJS(this.data);
      const newData = { ...data };
      this.processFieldValue(name, field, this.fields, newData, data);
    }
    return field;
  }

  private processFieldValue(fieldName: string, field: Field, fields: Fields, newData: object, data: object, needMerge?: boolean) {
    let value = ObjectChainValue.get(newData, fieldName);
    const chainFieldName = getChainFieldName(this, fieldName);
    const transformResponse = field.get('transformResponse');
    if (chainFieldName !== fieldName) {
      const bindValue = ObjectChainValue.get(newData, chainFieldName);
      if (isNil(value) && !isNil(bindValue)) {
        value = bindValue;
      }
    }
    if (transformResponse) {
      value = transformResponse(value, data);
    }
    value = processValue(value, field, !needMerge && this.isNew);
    if (value === null) {
      value = undefined;
    }
    if (needMerge && isObject(value)) {
      const oldValue = ObjectChainValue.get(this.data, chainFieldName);
      if (isObject(oldValue)) {
        value = merge(oldValue, value);
      }
    }
    ObjectChainValue.set(newData, chainFieldName, value, fields);
    ObjectChainValue.set(this.data, chainFieldName, value, fields);
  }

  private processData(data: object = {}, needMerge?: boolean): void {
    const newData = { ...data };
    const { fields } = this;
    getSortedFields(fields).forEach(([fieldName, field]) => this.processFieldValue(fieldName, field, fields, newData, data, needMerge));
  }

  private normalizeData(needIgnore?: boolean, jsonFields?: string[]) {
    const { fields, dataSet } = this;
    const dataToJSON = dataSet && dataSet.dataToJSON;
    const onlyDirtyField = needIgnore && dataToJSON ? useDirtyField(dataToJSON) : false;
    const neverKeys = onlyDirtyField ? getUniqueKeysAndPrimaryKey(dataSet) : [];
    const json: any = onlyDirtyField ? {} : toJS(this.data);
    const fieldIgnore = onlyDirtyField ? FieldIgnore.clean : undefined;
    const objectFieldsList: Field[][] = [];
    const normalFields: Field[] = [];
    const ignoreFieldNames: Set<string> = new Set();
    [...fields.entries()].forEach(([key, field]) => {
      if (field && (!jsonFields || !jsonFields.includes(key))) {
        const ignore = field.get('ignore') || fieldIgnore;
        if (
          needIgnore &&
          !neverKeys.includes(key) &&
          (ignore === FieldIgnore.always || (ignore === FieldIgnore.clean && !field.dirty))
        ) {
          ignoreFieldNames.add(key);
        } else {
          const type = field.get('type');
          if (type === FieldType.object) {
            const level = key.split('.').length - 1;
            objectFieldsList[level] = (objectFieldsList[level] || []).concat(field);
          } else {
            normalFields.push(field);
          }
        }
      }
    });
    [...objectFieldsList, normalFields].forEach(items => {
      if (items) {
        items.forEach(field => {
          const { name } = field;
          let value = ObjectChainValue.get(onlyDirtyField ? { ...this.data, ...json } : json, name);
          const bind = field.get('bind');
          const transformRequest = field.get('transformRequest');
          if (bind) {
            value = this.get(getChainFieldName(this, name));
          }
          const old = value;
          value = processToJSON(value, field);
          if (transformRequest) {
            // compatible old logic
            value = isString(field.get('multiple')) && isArrayLike(old) ?
              transformRequest(value, this) :
              processToJSON(transformRequest(old, this), field);
          }
          if (value !== undefined) {
            ObjectChainValue.set(json, name, value, fields);
          } else {
            ignoreFieldNames.add(name);
          }
        });
      }
    });
    [...ignoreFieldNames].forEach(key => ObjectChainValue.remove(json, key));
    return json;
  }

  private normalizeCascadeData(
    json: any,
    normal?: boolean,
    isSelect?: boolean,
  ): boolean | undefined {
    const { dataSetSnapshot, dataSet, fields, isRemoved } = this;
    if (dataSet) {
      let dirty = false;
      const { children } = dataSet;
      if (isRemoved) {
        childrenInfoForDelete(json, children);
      } else {
        const keys = Object.keys(children);
        if (keys.length) {
          const { isCurrent } = this;
          keys.forEach(name => {
            const snapshot = dataSetSnapshot && dataSetSnapshot[name];
            const child = (!isCurrent && snapshot && new DataSet().restore(snapshot)) || children[name];
            if (child) {
              const { dataToJSON } = child;
              const records = this.getCascadeRecordsIncludeDelete(name);
              const selected = isSelect || useSelected(dataToJSON) ? this.getCascadeSelectedRecordsIncludeDelete(name) : records;
              const jsonArray = normal || useNormal(dataToJSON)
                ? records && generateData(records)
                : selected && generateJSONData(child, selected);
              if (jsonArray) {
                if (jsonArray.dirty) {
                  dirty = true;
                }
                ObjectChainValue.set(json, name, jsonArray.data, fields);
              }
            }
          });
        }
      }
      return dirty;
    }
  }
}
