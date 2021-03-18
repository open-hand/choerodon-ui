import { action, computed, isArrayLike, isObservableArray, isObservableObject, observable, ObservableMap, runInAction, set, toJS } from 'mobx';
import merge from 'lodash/merge';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from './DataSet';
import Field, { FieldProps, Fields } from './Field';
import {
  axiosConfigAdapter,
  checkFieldType,
  childrenInfoForDelete,
  findBindFields,
  generateData,
  generateJSONData,
  generateResponseData,
  getRecordValue,
  isDirtyRecord,
  processIntlField,
  processToJSON,
  processValue,
  useCascade,
  useNormal,
  useSelected,
} from './utils';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import DataSetSnapshot from './DataSetSnapshot';
import localeContext from '../locale-context';
import { BooleanValue, DataSetEvents, FieldIgnore, FieldType, RecordStatus } from './enum';
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

const EXPANDED_KEY = '__EXPANDED_KEY__';

export default class Record {
  id: number;

  dataSet?: DataSet;

  @observable fields: Fields;

  memo?: object;

  dataSetSnapshot: { [key: string]: DataSetSnapshot } = {};

  cascadeRecordsMap: { [key: string]: Record[] } = {};

  cascading = {};

  @observable data: object;

  @observable dirtyData: ObservableMap<string, any>;

  @computed
  get pristineData(): object {
    return [...this.dirtyData.entries()].reduce<object>((data, [key, value]) => {
      ObjectChainValue.set(data, key, value);
      return data;
    }, toJS(this.data));
  }

  set pristineData(data: object) {
    runInAction(() => {
      const { dirtyData } = this;
      const dirtyKeys = [...dirtyData.keys()];
      if (dirtyKeys.length) {
        const newData = {};
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
        this.data = merge({}, data, newData);
      } else {
        this.data = data;
      }
    });
  }

  @observable status: RecordStatus;

  @observable selectable: boolean;

  @observable isSelected: boolean;

  @observable isCurrent: boolean;

  @observable isCached: boolean;

  @observable editing?: boolean;

  @observable state: ObservableMap<string, any>;

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

  @computed
  get isRemoved(): boolean {
    return this.status === RecordStatus.delete;
  }

  @computed
  get isNew(): boolean {
    return this.status === RecordStatus.add;
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

  @computed
  get level(): number {
    const { parent } = this;
    if (parent) {
      return parent.level + 1;
    }
    return 0;
  }

  @computed
  get dirty(): boolean {
    const { fields, status, dataSet, dirtyData } = this;
    if (status === RecordStatus.update || dirtyData.size > 0 || [...fields.values()].some(({ dirty }) => dirty)) {
      return true;
    }
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

  constructor(data: object = {}, dataSet?: DataSet) {
    runInAction(() => {
      const initData = isObservableObject(data) ? toJS(data) : data;
      this.state = observable.map<string, any>();
      this.fields = observable.map<string, Field>();
      this.status = RecordStatus.add;
      this.selectable = true;
      this.isSelected = false;
      this.isCurrent = false;
      this.isCached = false;
      this.id = IDGen.next().value;
      this.data = initData;
      this.dirtyData = observable.map<string, any>();
      if (dataSet) {
        this.dataSet = dataSet;
        const { fields } = dataSet;
        if (fields) {
          this.initFields(fields);
        }
      }
      this.data = this.processData(initData);
    });
  }

  toData(
    needIgnore?: boolean,
    noCascade?: boolean,
    isCascadeSelect?: boolean,
    all: boolean = true,
  ): any {
    const { status, dataSet } = this;
    const dataToJSON = dataSet && dataSet.dataToJSON;
    const cascade = noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
    const normal = all || (dataToJSON && useNormal(dataToJSON));
    let dirty = status !== RecordStatus.sync;
    const json = this.normalizeData(needIgnore);
    if (cascade && this.normalizeCascadeData(json, normal, isCascadeSelect)) {
      dirty = true;
    }
    return {
      ...json,
      __dirty: dirty,
    };
  }

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
    const { dataSetSnapshot, dataSet, status, fields } = this;
    return Promise.all([
      ...[...fields.values()].map(field =>
        all || status !== RecordStatus.sync ? field.checkValidity() : true,
      ),
      ...(!noCascade && dataSet ? Object.keys(dataSet.children).map((key) => {
        const { children } = dataSet;
        const snapshot = dataSetSnapshot[key];
        const ds = children[key];
        const child = dataSet.current === this ? ds : snapshot && new DataSet().restore(snapshot);
        if (child) {
          return child.validate();
        }
        const { dataToJSON } = ds;
        const cascade = noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
        return ((useSelected(dataToJSON) ? this.getCascadeSelectedRecords(key) : this.getCascadeRecords(key)) || []).map(record =>
          record.validate(false, !cascade),
        );
      }) : []),
    ]).then(results => results.every(result => result));
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
        if (dataSet.current === this) {
          return childDataSet.records.slice();
        }
        const snapshot = this.dataSetSnapshot[fieldName];
        if (snapshot) {
          return snapshot.records;
        }
        const cascadeRecords = this.cascadeRecordsMap[fieldName];
        if (cascadeRecords) {
          return cascadeRecords;
        }
        const data = this.get(fieldName);
        if (!this.cascading[fieldName] && isObservableArray(data)) {
          this.cascading[fieldName] = true;
          const records = childDataSet.processData(data);
          this.cascading[fieldName] = false;
          this.cascadeRecordsMap[fieldName] = records;
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

  get(fieldName?: string): any {
    return getRecordValue.call(
      this,
      this.data,
      (child, checkField) => child.get(checkField),
      fieldName,
    );
  }

  @action
  set(item: string | object, value?: any): Record {
    if (isString(item)) {
      let fieldName: string = item;
      const oldName = fieldName;
      const field = this.getField(fieldName) || this.addField(fieldName);
      checkFieldType(value, field);
      const bind = field.get('bind');
      if (bind) {
        fieldName = bind;
      }
      const oldValue = toJS(this.get(fieldName));
      const newValue = processValue(value, field);
      if (!isSame(processToJSON(oldValue), processToJSON(newValue))) {
        const { fields } = this;
        ObjectChainValue.set(this.data, fieldName, newValue, fields);
        if (!(this.dirtyData.has(fieldName))) {
          this.dirtyData.set(fieldName, oldValue);
          if (this.status === RecordStatus.sync) {
            this.status = RecordStatus.update;
          }
        } else if (isSame(toJS(this.dirtyData.get(fieldName)), newValue)) {
          this.dirtyData.delete(fieldName);
          if (this.status === RecordStatus.update && this.dirtyData.size === 0 && [...fields.values()].every(f => !f.dirty)) {
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
    } else if (isPlainObject(item)) {
      Object.keys(item).forEach(key => this.set(key, item[key]));
    }
    return this;
  }

  getPristineValue(fieldName?: string): any {
    return fieldName && this.dirtyData.has(fieldName) ? this.dirtyData.get(fieldName) : this.get(fieldName);
  }

  @action
  init(item: string | object, value?: any): Record {
    const { fields, data, dirtyData } = this;
    if (isString(item)) {
      let fieldName: string = item;
      const field = this.getField(fieldName) || this.addField(fieldName);
      const newValue = processValue(value, field);
      const bind = field.get('bind');
      if (bind) {
        fieldName = bind;
      }

      dirtyData.delete(fieldName);
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
    return Promise.all([...this.fields.values()].map(field => field.ready()));
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
      this.dirtyData.clear();
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
    const { dataSetSnapshot, fields, isRemoved, records, isNew } = this;
    if (dataSet) {
      if (isRemoved) {
        const index = records.indexOf(this);
        if (index !== -1) {
          if (dataSet.records === records) {
            dataSet.totalCount -= 1;
          }
          records.splice(index, 1);
        }
        return this;
      }
      if (isNew) {
        const index = records.indexOf(this);
        if (index !== -1 && dataSet.records === records) {
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
        const { children } = dataSet;
        const keys = Object.keys(children);
        if (keys.length) {
          const isCurrent = dataSet.current === this;
          const tmpDs = new DataSet();
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
    [...fields.values()].forEach(field => field.commit());
    this.status = RecordStatus.sync;
    return this;
  }

  @action
  setState(item: string | object, value?: any) {
    if (isString(item)) {
      this.state.set(item, value);
    } else if (isPlainObject(item)) {
      this.state.merge(item);
    }
    return this;
  }

  getState(key: string) {
    return this.state.get(key);
  }

  treeReduce<U>(
    fn: (previousValue: U, record: Record) => U,
    initialValue: U,
  ): U {
    return treeReduce<U, Record>([this], fn, initialValue);
  }

  @action
  private commitTls(data = {}, name: string) {
    const { dataSet } = this;
    const lang = dataSet ? dataSet.lang : localeContext.locale.lang;
    const tlsKey = getConfig('tlsKey');
    const values: object = {};
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

  private initFields(fields: Fields) {
    [...fields.keys()].forEach(key => this.addField(key));
  }

  @action
  private addField(name: string, fieldProps: FieldProps = {}): Field {
    const { dataSet } = this;
    fieldProps.name = name;
    return processIntlField(
      name,
      fieldProps,
      (langName, langProps) => {
        const field = new Field(langProps, dataSet, this);
        this.fields.set(langName, field);
        return field;
      },
      dataSet,
    );
  }

  private processData(data: object = {}, needMerge?: boolean): object {
    const { fields } = this;
    const newData = { ...data };
    [...fields.entries()].forEach(([fieldName, field]) => {
      let value = ObjectChainValue.get(newData, fieldName);
      const bind = field.get('bind');
      const transformResponse = field.get('transformResponse');
      if (bind) {
        fieldName = bind;
        const bindValue = ObjectChainValue.get(data, fieldName);
        if (isNil(value) && !isNil(bindValue)) {
          value = bindValue;
        }
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

  private normalizeData(needIgnore?: boolean) {
    const { fields } = this;
    const json: any = toJS(this.data);
    const objectFieldsList: Field[][] = [];
    const normalFields: Field[] = [];
    const ignoreFieldNames: Set<string> = new Set();
    [...fields.keys()].forEach(key => {
      const field = this.getField(key);
      if (field) {
        const ignore = field.get('ignore');
        if (
          needIgnore &&
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
        const isCurrent = dataSet.current === this;
        Object.keys(children).forEach(name => {
          const snapshot = dataSetSnapshot[name];
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
      return dirty;
    }
  }
}
