import { action, computed, isArrayLike, isObservableArray, observable, runInAction, set, toJS } from 'mobx';
import cloneDeep from 'lodash/cloneDeep';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from './DataSet';
import Field, { FieldProps, Fields } from './Field';
import {
  checkFieldType,
  childrenInfoForDelete,
  findBindFields,
  getOrderFields,
  getRecordValue,
  isSame,
  mergeTlsFields,
  processToJSON,
  processValue,
  sortTree,
} from './utils';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import DataSetSnapshot from './DataSetSnapshot';
import localeContext from '../locale-context';
import { BooleanValue, DataSetEvents, FieldIgnore, FieldType, RecordStatus } from './enum';
import { Supports } from '../locale-context/supports';

/**
 * 记录ID生成器
 */
const IDGen: IterableIterator<number> = function* (start: number) {
  while (true) {
    yield ++start;
  }
}(1000);

export default class Record {

  id: number;

  @computed
  get key(): string | number {
    if (this.status !== RecordStatus.add) {
      const { dataSet } = this;
      if (dataSet && dataSet.uniqueKeys) {
        const key = this.get(dataSet.uniqueKeys[0]);
        if (isString(key) || isNumber(key)) {
          return key;
        }
      }
    }
    return this.id;
  }

  dataSet?: DataSet;

  @observable fields: Fields;

  initData?: object;
  pristineData: object;

  dataSetSnapshot: { [key: string]: DataSetSnapshot } = {};

  localeSupports?: Supports;

  @observable tlsDataSet?: DataSet;

  pending?: Promise<boolean>;

  @observable data: object;

  @observable status: RecordStatus;

  @observable selectable: boolean;

  @observable isSelected: boolean;

  @observable isCurrent: boolean;

  @observable isCached: boolean;

  @observable editing?: boolean;

  @computed
  get index(): number {
    const { dataSet } = this;
    if (dataSet) {
      return dataSet.indexOf(this);
    }
    return -1;
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
          return children.some(record => {
            if (record.isIndeterminate) {
              return true;
            }
            if (record.get(checkField) === trueValue) {
              checkedLength += 1;
            }
            return false;
          }) || (checkedLength > 0 && checkedLength !== children.length);
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
    return false;
  }

  set isExpanded(expand: boolean) {
    const { dataSet } = this;
    if (dataSet) {
      const { expandField } = dataSet.props;
      if (expandField) {
        const field = this.getField(expandField);
        this.set(expandField, field ? expand ? field.get(BooleanValue.trueValue) : field.get(BooleanValue.falseValue) : expand);
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
  }

  @computed
  get children(): Record[] | undefined {
    const { dataSet } = this;
    if (dataSet) {
      const { parentField, idField } = dataSet.props;
      if (parentField && idField) {
        const children = sortTree(dataSet.filter(record => {
          const childParentId = record.get(parentField);
          const id = this.get(idField);
          return !isNil(childParentId) && !isNil(id) && childParentId === id;
        }), getOrderFields(this.fields)[0]);
        return children.length > 0 ? children : void 0;
      }
    }
  }

  @computed
  get parent(): Record | undefined {
    const { dataSet } = this;
    if (dataSet) {
      const { parentField, idField } = dataSet.props;
      if (parentField && idField) {
        return dataSet.find(record => {
          const parentId = this.get(parentField);
          const id = record.get(idField);
          return !isNil(parentId) && !isNil(id) && parentId === id;
        });
      }
    }
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
    const { fields } = this;
    for (const field of fields.values()) {
      if (field.dirty) {
        return true;
      }
    }
    return false;
  }

  @computed
  get cascadeParent(): Record | undefined {
    const { dataSet } = this;
    if (dataSet) {
      const { parent } = dataSet;
      if (parent) {
        const { children } = parent;
        const name = Object.keys(children).find(key => children[key] === dataSet);
        if (name) {
          return parent.find(record => (record.getCascadeRecords(name) || []).indexOf(this) !== -1);
        }
      }
    }
  }

  constructor(data: object = {}, dataSet?: DataSet) {
    runInAction(() => {
      this.fields = observable.map<string, Field>();
      this.status = RecordStatus.add;
      this.selectable = true;
      this.isSelected = false;
      this.isCurrent = false;
      this.isCached = false;
      this.id = IDGen.next().value;
      if (dataSet) {
        this.dataSet = dataSet;
        const { fields } = dataSet;
        if (fields) {
          this.initFields(fields);
        }
      }
      this.initData = toJS(data);
      this.data = this.pristineData = this.processData(this.initData);
      delete this.initData;
    });
  }

  toData(): object {
    const json = this.normalizeData();
    const tls = this.normalizeTls(true);
    if (tls) {
      json.__tls = tls;
    }
    this.normalizeCascadeData(json, true);
    return json;
  }

  toJSONData(noCascade?: boolean): any {
    const { status } = this;
    let dirty = status !== RecordStatus.sync;
    const json = this.normalizeData(true);
    const tls = this.normalizeTls();
    if (tls) {
      dirty = true;
      json.__tls = tls;
    }
    if (!noCascade && this.normalizeCascadeData(json)) {
      dirty = true;
    }
    return {
      ...json,
      __id: this.id,
      [getConfig('statusKey')]: status === RecordStatus.sync ? RecordStatus.update : status,
      __dirty: dirty,
    };
  }

  validate(all?: boolean, noCascade?: boolean): Promise<boolean> {
    const { dataSetSnapshot, isCurrent, dataSet, status, fields } = this;
    return Promise.all([
      ...Array.from(fields.values()).map(field => (
        all || status !== RecordStatus.sync ? field.checkValidity() : true
      )),
      ...(
        noCascade
          ? []
          : Object.keys(dataSetSnapshot).map(key => (
            isCurrent && dataSet ? dataSet.children[key] : new DataSet().restore(dataSetSnapshot[key])
          ).validate(all))
      ),
    ])
      .then(results => results.every(result => result));
  }

  getField(fieldName?: string): Field | undefined {
    if (fieldName) {
      return this.fields.get(fieldName);
    }
  }

  getCascadeRecords(fieldName?: string): Record[] | undefined {
    const { dataSet } = this;
    if (fieldName && dataSet) {
      const childDataSet = dataSet.children[fieldName];
      if (childDataSet) {
        const snapshot = this.dataSetSnapshot[fieldName];
        if (snapshot) {
          const isCurrent = dataSet.current === this;
          return (isCurrent ? childDataSet : (new DataSet()).restore(snapshot)).slice();
        } else {
          const data = this.get(fieldName);
          if (isObservableArray(data)) {
            const newSnapshot = childDataSet.snapshot();
            this.dataSetSnapshot[fieldName] = childDataSet.loadData(data.slice()).snapshot();
            const records = childDataSet.slice();
            childDataSet.restore(newSnapshot);
            return records;
          }
        }
      }
    }
  }

  get(fieldName?: string): any {
    return getRecordValue.call(this, this.data, (child, checkField) => child.get(checkField), fieldName);
  }

  getPristineValue(fieldName?: string): any {
    return getRecordValue.call(this, this.pristineData, (child, checkField) => child.getPristineValue(checkField), fieldName);
  }

  @action
  set(item: string | object, value: any): Record {
    if (isString(item)) {
      let fieldName: string = item;
      const oldName = fieldName;
      const field = this.getField(fieldName);
      if (field) {
        checkFieldType(value, field);
        const bind = field.get('bind');
        if (bind) {
          fieldName = bind;
        }
      }
      const oldValue = toJS(this.get(fieldName));
      const newValue = processValue(value, field);
      if (!isSame(newValue, oldValue)) {
        const { fields } = this;
        ObjectChainValue.set(this.data, fieldName, newValue, fields);
        const pristineValue = this.getPristineValue(fieldName);
        if (isSame(pristineValue, newValue)) {
          if (field && field.dirty) {
            field.dirty = false;
            if (this.status === RecordStatus.update && Array.from(fields.values()).every(f => !f.dirty)) {
              this.status = RecordStatus.sync;
            }
          }
        } else {
          if (field) {
            field.dirty = true;
          }
          if (this.status === RecordStatus.sync) {
            this.status = RecordStatus.update;
          }
        }
        const { dataSet, tlsDataSet } = this;
        if (dataSet) {
          if (tlsDataSet) {
            const { lang = localeContext.locale.lang } = dataSet;
            const { current } = tlsDataSet;
            if (current && current.get(fieldName)) {
              current.set(`${fieldName}.${lang}`, newValue);
            }
          }
          dataSet.fireEvent(DataSetEvents.update, { dataSet, record: this, name: oldName, value: newValue, oldValue });
          const { checkField } = dataSet.props;
          if (checkField && (checkField === fieldName || checkField === oldName)) {
            const { children } = this;
            if (children) {
              children.forEach(record => record.set(fieldName, value));
            }
          }
        }
      }
      if (field) {
        findBindFields(field, this.fields).forEach(oneField => (
          // oneField.dirty = field.dirty,
          oneField.validator.reset(), oneField.checkValidity()
        ));
      }
    } else if (isPlainObject(item)) {
      Object.keys(item).forEach(key => this.set(key, item[key]));
    }
    return this;
  }

  clone(): Record {
    const { dataSet } = this;
    const cloneData = cloneDeep(toJS(this.data));
    if (dataSet) {
      const { primaryKey, tlsUrl } = dataSet.props;
      if (primaryKey) {
        delete cloneData[primaryKey];
      }
      const clone = new Record(cloneData, dataSet);
      if (tlsUrl && primaryKey) {
        this.tls().then((locales) => {
          if (locales) {
            const record = locales[0];
            this.mergeLocaleData(record);
            clone.tlsDataSet = new DataSet({
              fields: mergeTlsFields(this.fields, localeContext.supports, Object.keys(record)),
            });
            clone.tlsDataSet.tlsRecord = clone;
            clone.tlsDataSet.create(record);
            if (dataSet) {
              const { lang = localeContext.locale.lang } = dataSet;
              Object.keys(record).forEach(fieldName => clone.set(fieldName, record[fieldName][lang]));
            }
          }
        });
        clone.localeSupports = this.localeSupports;
      }
      return clone;
    } else {
      return new Record(cloneData);
    }
  }

  async ready(): Promise<any> {
    const { pending } = this;
    const result = await Promise.all([pending, ...Array.from(this.fields.values()).map(field => field.ready())]);
    if (this.pending && this.pending !== pending) {
      return this.ready();
    }
    return result;
  }

  mergeLocaleData(record) {
    const { dataSet } = this;
    if (record && dataSet) {
      const { lang = localeContext.locale.lang } = dataSet;
      Object.keys(record).forEach((name) => {
        const field = this.getField(name);
        if (field && field.dirty) {
          record[name][lang] = this.get(name);
        }
      });
    }
  };

  @action
  async tls(name?: string): Promise<any> {
    const { supports } = localeContext;
    const { dataSet } = this;
    if (dataSet) {
      const { tlsUrl, lang = localeContext.locale.lang } = dataSet;
      const { primaryKey, dataKey } = dataSet.props;
      if (!this.tlsDataSet) {

        warning(!!primaryKey, 'If you want to use IntlField, please set `primaryKey` for dataSet.');
        warning(!!tlsUrl, 'If you want to use IntlField, please set `tlsUrl` for dataSet.');

        if (tlsUrl && primaryKey) {
          this.tlsDataSet = new DataSet({
            data: name ? [{ [name]: { [lang]: this.get(name) } }] : void 0,
            queryUrl: tlsUrl,
            queryParameter: {
              key: this.get(primaryKey),
            },
            fields: name ? mergeTlsFields(this.fields, supports, [name]) : void 0,
            events: {
              [DataSetEvents.beforeLoad]: ({ data: [record] }) => {
                if (this.tlsDataSet) {
                  this.tlsDataSet.initFields(mergeTlsFields(this.fields, supports, Object.keys(record)));
                }
                this.mergeLocaleData(record);
                Object.keys(record).forEach(fieldName => this.set(fieldName, record[fieldName][lang]));
              },
            },
          });
          this.tlsDataSet.tlsRecord = this;
        }
      } else if (name) {
        mergeTlsFields(this.fields, supports, [name]).forEach((field) => (
          field.name && this.tlsDataSet && this.tlsDataSet.addField(field.name, field)
        ));
      }
      if (this.tlsDataSet) {
        if (this.status !== RecordStatus.add && this.localeSupports !== supports) {
          this.localeSupports = supports;
          const data = await this.tlsDataSet.query();
          return data[dataKey!];
        } else {
          const { current } = this.tlsDataSet;
          if (current) {
            return [cloneDeep(toJS(current.data))];
          }
        }
      }
    }
  }

  @action
  reset(): Record {
    const { status, fields } = this;
    Array.from(fields.values()).forEach(field => field.commit());
    this.data = this.pristineData;
    if (this.tlsDataSet) {
      this.tlsDataSet.reset();
    }
    if (status === RecordStatus.update || status === RecordStatus.delete) {
      this.status = RecordStatus.sync;
    }
    return this;
  }

  @action
  commit(data?: object, dataSet?: DataSet): Record {
    const { dataSetSnapshot, fields } = this;
    if (dataSet) {
      let { totalCount, destroyed } = dataSet;
      if (this.status === RecordStatus.add && dataSet.indexOf(this) !== -1) {
        totalCount += 1;
      } else if (this.status === RecordStatus.delete) {
        const index = destroyed.indexOf(this);
        if (index !== -1) {
          destroyed.splice(index, 1);
          totalCount -= 1;
        }
      }
      dataSet.totalCount = totalCount;
      if (data) {
        const newData = this.pristineData = this.processData(data);
        Object.keys(newData).forEach((key) => {
          const newValue = newData[key];
          if (this.get(key) !== newValue) {
            set(this.data, key, newData[key]);
          }
        });
        const snapShorts = Object.keys(dataSetSnapshot);
        if (snapShorts.length) {
          const isCurrent = dataSet.current === this;
          const ds = new DataSet();
          snapShorts.forEach(key => (
            dataSetSnapshot[key] = (isCurrent ? dataSet.children[key] : ds.restore(dataSetSnapshot[key]))
              .commitData(data[key] || []).snapshot()
          ));
        }
      }
    }
    if (this.tlsDataSet) {
      const { current } = this.tlsDataSet;
      if (current) {
        current.commit();
      }
    }
    Array.from(fields.values()).forEach(field => field.commit());
    this.status = RecordStatus.sync;
    return this;
  }

  private initFields(fields: Fields) {
    Array.from(fields.keys()).forEach(key => this.addField(key));
  }

  @action
  private addField(name: string, props: FieldProps = {}): Field | undefined {
    const field = new Field({ ...props, name }, this.dataSet, this);
    this.fields.set(name, field);
    return field;
  }

  private processData(data: object = {}): object {
    const { fields } = this;
    for (let [fieldName, field] of fields.entries()) {
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
      if (value === void 0 && type === FieldType.boolean) {
        value = false;
      }
      if (transformResponse) {
        value = transformResponse(value);
      }
      value = processValue(value, field);
      if (value === null) {
        value = void 0;
      }
      ObjectChainValue.set(data, fieldName, value, fields);
    }
    return data;
  }

  private normalizeData(needIgnore?: boolean) {
    const { fields } = this;
    const json: any = toJS(this.data);
    Array.from(fields.keys()).forEach((key) => {
      let value = ObjectChainValue.get(json, key);
      const field = this.getField(key);
      if (field) {
        const ignore = field.get('ignore');
        if (needIgnore && (ignore === FieldIgnore.always || (ignore === FieldIgnore.clean && !field.dirty))) {
          delete json[key];
          return;
        }
        const bind = field.get('bind');
        const multiple = field.get('multiple');
        const type = field.get('type');
        const transformRequest = field.get('transformRequest');
        if (bind) {
          value = this.get(bind);
        }
        if (type === FieldType.object) {
          return;
        } else if (isString(multiple) && isArrayLike(value)) {
          value = value.map(processToJSON).join(multiple);
        }
        if (transformRequest) {
          value = transformRequest(value);
        }
      }
      if (value !== void 0) {
        ObjectChainValue.set(json, key, processToJSON(value), fields);
      } else {
        ObjectChainValue.remove(json, key);
      }
    });
    return json;
  }

  private normalizeTls(all?: boolean) {
    if (this.tlsDataSet) {
      const { current } = this.tlsDataSet;
      if (current) {
        if (all) {
          return current.toData();
        } else {
          const tls: any = current.toJSONData();
          if (tls.__dirty) {
            delete tls.__id;
            delete tls[getConfig('statusKey')];
            delete tls.__dirty;
            return tls;
          }
        }
      }
    }
  }

  private normalizeCascadeData(json: any, all?: boolean) {
    const { dataSetSnapshot, dataSet, isCurrent, status, fields } = this;
    const isDelete = status === RecordStatus.delete;
    if (dataSet) {
      let dirty = false;
      const { children } = dataSet;
      if (isDelete) {
        childrenInfoForDelete(json, children);
      } else {
        const keys = Object.keys(children);
        if (keys) {
          keys.forEach((name) => {
            const child = isCurrent ? children[name] : new DataSet().restore(dataSetSnapshot[name]);
            const jsonArray = all ? child.toData() : child.toJSONData();
            if (jsonArray.length > 0) {
              dirty = true;
            }
            ObjectChainValue.set(json, name, jsonArray, fields);
          });
        }
      }
      return dirty;
    }
  }
}
