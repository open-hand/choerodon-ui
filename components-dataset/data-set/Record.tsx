import {
  _isComputingDerivation,
  action,
  computed,
  IComputedValue,
  IMapEntry,
  isArrayLike,
  isObservableArray,
  isObservableObject,
  observable,
  ObservableMap,
  runInAction,
  toJS,
} from 'mobx';
import raf from 'raf';
import merge from 'lodash/merge';
import isObject from 'lodash/isObject';
import pick from 'lodash/pick';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import isPlainObject from 'lodash/isPlainObject';
import { isSame, warning } from '../utils';
import DataSet, { addDataSetField, RecordValidationErrors } from './DataSet';
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
  getOrderFields,
  getRecordDynamicProps,
  getRecordValue,
  getSortedFields,
  getUniqueKeysAndPrimaryKey,
  isDirtyRecord,
  processIntlField,
  processToJSON,
  processValue,
  sortTree,
  useCascade,
  useDirtyField,
  useNormal,
  useSelected,
  findMinOrMaxFields,
} from './utils';
import * as ObjectChainValue from '../object-chain-value';
import DataSetSnapshot from './DataSetSnapshot';
import { BooleanValue, DataSetEvents, DataSetSelection, FieldIgnore, FieldType, RecordStatus } from './enum';
import { treeReduce } from '../tree-helper';
import { iteratorReduce, iteratorSome } from '../iterator-helper';
import ValidationResult from '../validator/ValidationResult';
import { AttachmentCache } from '../stores/AttachmentStore';

/**
 * 记录ID生成器
 */
const IDGen: IterableIterator<number> = (function* (start: number) {
  while (true) {
    yield ++start;
  }
})(1000);

export const EXPANDED_KEY = '__EXPANDED_KEY__';  // TODO:Symbol
const SELECTABLE_KEY = '__SELECTABLE_KEY__';  // TODO:Symbol
const DISABLED_KEY = '__DISABLED_KEY__';  // TODO:Symbol
const SELECT_KEY = '__SELECT_KEY__';  // TODO:Symbol
const UNSELECT_KEY = '__UNSELECT_KEY__';  // TODO:Symbol
const SELECT_TIMESTAMP = '__TIMESTAMP__';  // TODO:Symbol

function initRecordField(record: Record, name: string, fieldProps?: FieldProps): [Field, Map<string, Field> | undefined] {
  const { dataSet } = record;
  return processIntlField(
    name,
    (langProps: FieldProps) => new Field(langProps, dataSet, record),
    fieldProps,
    dataSet,
  );
}

function initRecordData(initData: object, dataSet: DataSet) {
  const { childrenField } = dataSet.props;
  return observable.object(initData, childrenField && initData[childrenField] ? { [childrenField]: observable.ref } : undefined);
}

export interface RecordBaseProps {
  disabled?: boolean | undefined;
  selectable?: boolean | undefined;
  defaultSelected?: boolean | undefined;
  defaultExpanded?: boolean | undefined;
}

export type RecordDynamicProps = { [P in keyof RecordBaseProps]: (record: Record) => RecordBaseProps[P]; }

export interface RecordProps extends RecordBaseProps {
  dynamicProps?: Partial<RecordDynamicProps>;
}

export default class Record {
  id: number;

  dataSet: DataSet;

  @computed
  get fields(): Fields {
    warning(false, 'If you only want to get some property from dataSet field or calculated by `dynamicProps` or `computedProps`. Don\'t to iterate fields from `record.fields`, please use `dataSet.fields` instead. And then use `dsField.get(someProp, record)` to get the property which you needed.');
    const fields = new Map();
    this.dataSet.fields.forEach((_, name) => {
      const tempField = this.getField(name);
      if (tempField) {
        fields.set(name, tempField);
      }
    });
    return observable.map(fields);
  }

  @observable ownerFields: Fields;

  tempFields?: Map<string, Field>;

  memo?: object;

  private prepareForReport?: { result: RecordValidationErrors[], timeout?: number } | undefined;

  dataSetSnapshot?: { [key: string]: DataSetSnapshot } | undefined;

  cascadeRecordsMap?: { [key: string]: Record[] } | undefined;

  cascading?: { [key: string]: boolean } | undefined;

  validating?: boolean | undefined;

  @observable data: object;

  @observable dirtyData?: ObservableMap<string, any> | undefined;

  @observable validationErrors?: ObservableMap<string, ValidationResult[]>;

  @observable lookupTokens?: ObservableMap<string, string | undefined> | undefined;

  @observable attachmentCaches?: ObservableMap<string, AttachmentCache>;

  computedFieldProps?: Map<string | symbol, IComputedValue<any>>;

  lastDynamicFieldProps?: Map<string, { [key: string]: any } | undefined>;

  @computed
  get pristineData(): object {
    const { dirtyData } = this;
    const data = toJS(this.data);
    if (dirtyData) {
      dirtyData.forEach((value, key) => ObjectChainValue.set(data, key, value));
    }
    return data;
  }

  set pristineData(data: object) {
    runInAction(() => {
      const { dirtyData, dataSet } = this;
      if (dirtyData) {
        const newData = {};
        if (dirtyData.size) {
          dirtyData.forEach((_, key) => {
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
        this.data = initRecordData(merge({}, data, newData), dataSet);
      } else {
        this.data = initRecordData(data, dataSet);
      }
    });
  }

  @observable status: RecordStatus;

  get selectedTimestamp(): number | undefined {
    return this.getState(SELECT_TIMESTAMP);
  }

  set selectedTimestamp(timestamp: number | undefined) {
    this.setState(SELECT_TIMESTAMP, timestamp);
  }

  get selectable(): boolean {
    const $selectable = this.getState(SELECTABLE_KEY);
    if ($selectable !== undefined) {
      return $selectable;
    }
    return getRecordDynamicProps(this, 'selectable', true);
  }

  set selectable(selectable: boolean) {
    this.setState(SELECTABLE_KEY, selectable);
  }

  get disabled(): boolean {
    const $disabled = this.getState(DISABLED_KEY);
    if ($disabled !== undefined) {
      return $disabled;
    }
    return getRecordDynamicProps(this, 'disabled', false);
  }

  set disabled(selectable: boolean) {
    this.setState(DISABLED_KEY, selectable);
  }

  get isDataSetInAllPageSelection(): boolean {
    return this.dataSet.isAllPageSelection;
  }

  @computed
  get isSelected(): boolean {
    if (this.isDataSetInAllPageSelection) {
      return !this.getState(UNSELECT_KEY);
    }
    const $isSelected = this.getState(SELECT_KEY);
    if ($isSelected !== undefined) {
      return $isSelected;
    }
    return getRecordDynamicProps(this, 'defaultSelected', false);
  }

  set isSelected(isSelected: boolean) {
    if (isSelected !== this.isSelected) {
      const newState: object = {
        [SELECT_TIMESTAMP]: isSelected ? Date.now() : undefined,
      };
      if (this.isDataSetInAllPageSelection) {
        newState[UNSELECT_KEY] = !isSelected;
      } else {
        newState[SELECT_KEY] = isSelected;
      }
      this.setState(newState);
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
      const { primaryKey } = this.dataSet.props;
      if (primaryKey) {
        const key = this.get(primaryKey);
        if (isString(key) || isNumber(key)) {
          return key;
        }
      }
    }
    return this.id;
  }

  @computed
  get index(): number {
    return this.dataSet.indexOf(this);
  }

  @computed
  get indexInParent(): number {
    const { parent } = this;
    if (parent && parent.children) {
      return parent.children.indexOf(this);
    }
    return this.dataSet.treeRecords.indexOf(this);
  }

  get isRemoved(): boolean {
    return this.status === RecordStatus.delete;
  }

  get isNew(): boolean {
    return this.status === RecordStatus.add;
  }

  @computed
  get isSelectionIndeterminate(): boolean {
    if (this.dataSet.selection === DataSetSelection.multiple) {
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
    const { checkField } = dataSet.props;
    if (checkField) {
      const field = dataSet.getField(checkField);
      const trueValue = field ? field.get(BooleanValue.trueValue, this) : true;
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
    return false;
  }

  @computed
  get isExpanded(): boolean {
    const { dataSet } = this;
    const { expandField } = dataSet.props;
    if (expandField) {
      const expanded = this.get(expandField);
      const field = dataSet.getField(expandField);
      return expanded === (field ? field.get(BooleanValue.trueValue, this) : true);
    }
    const $expanded = this.getState(EXPANDED_KEY);
    if ($expanded !== undefined) {
      return $expanded;
    }
    return getRecordDynamicProps(this, 'defaultExpanded', false);
  }

  set isExpanded(expand: boolean) {
    const { dataSet } = this;
    const { expandField } = dataSet.props;
    if (expandField) {
      const field = dataSet.getField(expandField);
      this.set(
        expandField,
        field
          ? field.get(expand ? BooleanValue.trueValue : BooleanValue.falseValue, this)
          : expand,
      );
    } else {
      this.setState(EXPANDED_KEY, expand);
    }
  }

  @computed
  get previousRecord(): Record | undefined {
    const { parent } = this;
    const children = parent ? parent.children : this.dataSet.treeData;
    if (children) {
      return children[children.indexOf(this) - 1];
    }
    return undefined;
  }

  @computed
  get nextRecord(): Record | undefined {
    const { parent } = this;
    const children = parent ? parent.children : this.dataSet.treeData;
    if (children) {
      return children[children.indexOf(this) + 1];
    }
    return undefined;
  }

  @computed
  get records(): Record[] {
    const { dataSet } = this;
    const { cascadeParent } = this;
    if (cascadeParent && !cascadeParent.isCurrent) {
      return cascadeParent.getCascadeRecordsIncludeDelete(dataSet.parentName) || [];
    }
    return dataSet.records;
  }

  @observable children?: Record[] | undefined;

  @observable parent?: Record | undefined;

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
    const path = [this, ...this.parents];
    path.reverse();
    return path;
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
    return Object.keys(this.dataSet.children).some(key => (this.getCascadeRecordsIncludeDelete(key) || []).some(isDirtyRecord));
  }

  @computed
  get cascadeParent(): Record | undefined {
    const { parent, parentName } = this.dataSet;
    if (parent && parentName) {
      return parent.cascadeRecords.find(
        record => (record.getCascadeRecordsIncludeDelete(parentName) || []).indexOf(this) !== -1,
      );
    }
    return undefined;
  }

  constructor(data: object = {}, dataSet: DataSet = new DataSet(), status: RecordStatus = RecordStatus.add) {
    runInAction(() => {
      this.dataSet = dataSet;
      this.ownerFields = observable.map();
      this.status = status;
      this.id = IDGen.next().value;
      const initData = isObservableObject(data) ? toJS(data) : data;
      this.data = initRecordData(initData, dataSet);
      this.processData(initData);
      raf(() => {
        dataSet.fields.forEach(field => field.processForLookupAndLovConfig(this));
      });
    });
  }

  @action
  processTreeLevel(props: { dataSet: DataSet; value: any; fieldName: string; }) {
    const { dataSet, value, fieldName } = props;
    const { parentField, idField, childrenField } = dataSet.props;
    if (!childrenField && parentField && idField) {
      if (fieldName === parentField) {
        const { parent } = this;
        if (parent) {
          const oldChildren = parent.children;
          if (oldChildren) {
            const oldIndex = oldChildren.indexOf(this);
            if (oldIndex !== -1) {
              oldChildren.splice(oldIndex, 1);
            }
            if (!oldChildren.length) {
              parent.children = undefined;
            }
          }
        }
        const newParent = dataSet.find(r => r.get(idField) === value);
        this.parent = newParent;
        if (newParent) {
          const { children } = newParent;
          if (children) {
            children.push(this);
            if (children.length > 1) {
              const orderFields = getOrderFields(dataSet);
              if (orderFields.length > 0) {
                newParent.children = sortTree(children, orderFields);
              }
            }
          } else {
            newParent.children = [this];
          }
        }
      }
    }
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
    all = true,
  ): any {
    if (_isComputingDerivation && _isComputingDerivation()) {
      warning(false, 'Please do not use the `record.toData` method to get the value during the rendering phase, please use `record.get` instead.');
    }
    const { status, dataSet } = this;
    const { dataToJSON, fields } = dataSet;
    const cascade = noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
    const normal = all || (dataToJSON && useNormal(dataToJSON));
    let dirty = status !== RecordStatus.sync;
    const childrenKeys: string[] | undefined = cascade ? Object.keys(dataSet.children) : undefined;
    const jsonFieldKeys: string[] | undefined = childrenKeys && iteratorReduce<IMapEntry<string, Field>, string[]>(fields.entries(), (fieldKeys, [key, field]) => {
      if (field.get('type', this) === FieldType.json && childrenKeys.some(childKey => key === childKey || childKey.startsWith(`${key}.`))) {
        fieldKeys.push(key);
      }
      return fieldKeys;
    }, []);
    const json = this.normalizeData(needIgnore, jsonFieldKeys);
    if (cascade && this.normalizeCascadeData(json, normal, isCascadeSelect)) {
      dirty = true;
    }
    if (jsonFieldKeys) {
      jsonFieldKeys.forEach(key => ObjectChainValue.set(json, key, JSON.stringify(ObjectChainValue.get(json, key)), fields, this));
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
    const { status, dataSet } = this;
    return {
      ...this.toData(true, noCascade, isCascadeSelect, false),
      __id: this.id,
      [dataSet.getConfig('statusKey')]: dataSet.getConfig('status')[status === RecordStatus.sync ? RecordStatus.update : status],
    };
  }

  validate(all?: boolean, noCascade?: boolean): Promise<boolean> {
    const { dataSet } = this;
    this.validating = true;
    const promises: Promise<boolean>[] = [];
    if (all || this.status !== RecordStatus.sync) {
      dataSet.fields.forEach(field => promises.push(field.checkValidity(this)));
    }
    if (!noCascade) {
      const { children } = dataSet;
      const childrenKeys = Object.keys(children);
      if (childrenKeys.length) {
        const { dataSetSnapshot, isCurrent } = this;
        childrenKeys.forEach((key) => {
          const snapshot = dataSetSnapshot && dataSetSnapshot[key];
          const ds = children[key];
          const child = isCurrent ? ds : snapshot && new DataSet(undefined, dataSet.context).restore(snapshot);
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
        if (!dataSet.validating) {
          dataSet.reportValidity({ record: this, errors: this.getValidationErrors(), valid });
        }
        delete this.validating;
        return valid;
      }).catch((error) => {
        delete this.validating;
        throw error;
      });
  }

  cancelReportValidity() {
    const { prepareForReport } = this;
    if (prepareForReport && prepareForReport.timeout) {
      window.clearTimeout(prepareForReport.timeout);
    }
  }

  reportValidity(result: RecordValidationErrors, fromField?: boolean) {
    const { dataSet } = this;
    if (!dataSet.validating) {
      const prepareForReport = getIf<Record, { result: RecordValidationErrors[]; timeout?: number; valid: boolean }>(this, 'prepareForReport', {
        result: [],
        valid: true,
      });
      if (!result.valid) {
        prepareForReport.valid = false;
        prepareForReport.result.push(result);
      }
      if (prepareForReport.timeout) {
        window.clearTimeout(prepareForReport.timeout);
      }
      prepareForReport.timeout = window.setTimeout(() => {
        dataSet.reportValidity({ record: this, errors: prepareForReport.result, valid: prepareForReport.valid }, fromField);
        delete this.prepareForReport;
      }, 200);
    }
  }

  getValidationErrors(): RecordValidationErrors[] {
    const { validationErrors } = this;
    const results: RecordValidationErrors[] = [];
    if (validationErrors) {
      validationErrors.forEach((errors, fieldName) => {
        const field = this.ownerFields.get(fieldName) || this.dataSet.getField(fieldName);
        if (field && errors.length) {
          results.push({
            field,
            errors,
            valid: false,
          });
        }
      });
    }
    return results;
  }

  @action
  addField(name: string, fieldProps?: FieldProps): Field {
    const { dataSet, ownerFields } = this;
    if (!dataSet.getField(name)) {
      dataSet.addField(name, fieldProps);
    }
    const oldField = ownerFields.get(name);
    if (oldField) {
      return oldField.replace(fieldProps);
    }
    const [field, intlFields] = initRecordField(this, name, fieldProps);
    ownerFields.set(name, field);
    if (intlFields) {
      ownerFields.merge(intlFields);
    }
    return field;
  }

  getField(fieldName?: string): Field | undefined {
    if (fieldName) {
      warning(false, 'If you only want to get some property from dataSet field or calculated by `dynamicProps` or `computedProps`. Don\'t to get field from `record.getField`, please use `dataSet.getField` instead. And then use `dsField.get(someProp, record)` to get the property which you needed.');

      {
        const field = this.ownerFields.get(fieldName);
        if (field) {
          return field;
        }
      }
      const tempFields = getIf<Record, Map<string, Field>>(this, 'tempFields', () => new Map());
      {
        const field = tempFields.get(fieldName);
        if (field) {
          return field;
        }
      }
      const field = new Field({ name: fieldName }, this.dataSet, this);
      tempFields.set(fieldName, field);
      return field;
    }
  }

  getCascadeRecordsIncludeDelete(fieldName?: string): Record[] | undefined {
    if (fieldName) {
      const childDataSet = this.dataSet.children[fieldName];
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
      const { dataSet } = this;
      const oldName: string = item;
      const fieldName: string = getChainFieldName(this, oldName);
      const field = dataSet.getField(oldName) || dataSet.getField(fieldName) || findBindField(oldName, fieldName, this) || addDataSetField(dataSet, oldName);
      checkFieldType(value, field, this);
      const oldValue = toJS(this.get(fieldName));
      const newValue = processValue(value, field, this);
      const newValueForCompare = processToJSON(newValue, field, this);
      const { fields } = dataSet;
      if (!isSame(processToJSON(oldValue, field, this), newValueForCompare)) {
        ObjectChainValue.set(this.data, fieldName, newValue, fields, this);
        const dirtyData = getIf<Record, ObservableMap<string, any>>(this, 'dirtyData', () => observable.map<string, any>());
        if (!(dirtyData.has(fieldName))) {
          dirtyData.set(fieldName, oldValue);
          if (this.status === RecordStatus.sync) {
            this.status = RecordStatus.update;
            if (this.isCached && dataSet.cacheModifiedKeys) {
              dataSet.cachedModified.push(this);
            }
          }
        } else if (isSame(processToJSON(dirtyData.get(fieldName), field, this), newValueForCompare)) {
          dirtyData.delete(fieldName);
          if (this.status === RecordStatus.update && dirtyData.size === 0) {
            this.status = RecordStatus.sync;
            if (this.isCached) {
              if (!dataSet.cacheSelectionKeys || !this.isSelected) {
                this.isCached = false;
              }
              const { cachedModified } = dataSet;
              const cachedIndex = cachedModified.indexOf(this);
              if (cachedIndex > -1) {
                cachedModified.splice(cachedIndex, 1);
              }
            }
          }
        }
        dataSet.fireEvent(DataSetEvents.update, {
          dataSet,
          record: this,
          name: oldName,
          value: newValue,
          oldValue,
        });
        const { checkField, treeCheckStrictly } = dataSet.props;
        if (treeCheckStrictly !== true && checkField && fieldName === getChainFieldName(this, checkField)) {
          const { children } = this;
          if (children) {
            children.forEach(record => record.set(fieldName, value));
          }
        }
        this.processTreeLevel({
          dataSet,
          value: newValue,
          fieldName: oldName,
        });
      }
      [
        field,
        ...findBindFields(field, fields, true, this),
        ...findBindTargetFields(field, fields, true, this),
        ...findMinOrMaxFields(field, fields, this),
      ].forEach((oneField) => (
        oneField.checkValidity(this)
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
      if (dirtyData) {
        if (dirtyData.has(chainFieldName)) {
          return dirtyData.get(chainFieldName);
        }
        let v;
        const has = iteratorSome(dirtyData.entries(), ([key, value]) => {
          if (chainFieldName.startsWith(`${key}.`)) {
            v = ObjectChainValue.get(value, chainFieldName.replace(`${key}.`, ''));
            return true;
          }
          return false;
        });
        if (has) {
          return v;
        }
      }
      return this.get(chainFieldName);
    }
  }

  @action
  init(item: string | object, value?: any): Record {
    const { data, dirtyData } = this;
    if (isString(item)) {
      const { dataSet } = this;
      const oldName: string = item;
      const fieldName: string = getChainFieldName(this, oldName);
      const field = dataSet.getField(oldName) || dataSet.getField(fieldName) || findBindField(oldName, fieldName, this) || addDataSetField(dataSet, fieldName);
      const newValue = processValue(value, field, this);
      if (dirtyData) {
        dirtyData.delete(fieldName);
      }
      ObjectChainValue.set(data, fieldName, newValue, dataSet.fields, this);
      field.commit(this);
      this.processTreeLevel({
        dataSet,
        value: newValue,
        fieldName: oldName,
      });
    } else if (isPlainObject(item)) {
      Object.keys(item).forEach(key => this.init(key, item[key]));
    }
    return this;
  }

  clone(): Record {
    const { dataSet } = this;
    const cloneData = this.toData();
    const { primaryKey } = dataSet.props;
    if (primaryKey) {
      delete cloneData[primaryKey];
    }
    return new Record(cloneData, dataSet);
  }

  ready(): Promise<any> {
    return Promise.resolve(true);
    // return Promise.all([...this.fields.values()].map(field => field.ready()));
  }

  @action
  async tls(name?: string): Promise<void> {
    const { dataSet } = this;
    const tlsKey = dataSet.getConfig('tlsKey');
    if (name) {
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
            const dataKey = dataSet.getConfig('dataKey');
            this.commitTls(generateResponseData(result, dataKey)[0], name);
          }
        } else {
          this.commitTls(
            iteratorReduce(dataSet.fields.entries(), (data, [key, field]) => {
              if (field.get('type', this) === FieldType.intl) {
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
    this.cancelReportValidity();
    const { status, dataSet, dirty, isRemoved, validationErrors } = this;
    let hasError = false;
    if (validationErrors && validationErrors.size > 0) {
      hasError = true;
      validationErrors.clear();
    }
    dataSet.fields.forEach(field => field.commit(this));
    if (status === RecordStatus.update || isRemoved) {
      this.status = RecordStatus.sync;
    }
    if (hasError || isRemoved || dirty) {
      this.data = initRecordData(toJS(this.pristineData), dataSet);
      this.dirtyData = undefined;
      this.memo = undefined;
      if (!dataSet.resetInBatch) {
        dataSet.fireEvent(DataSetEvents.reset, { records: [this], dataSet, record: this });
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
    this.dataSet.fields.forEach((_, key) => this.set(key, null));
    return this;
  }

  @action
  commit(data?: object, dataSet?: DataSet): Record {
    if (dataSet) {
      const { records } = this;
      if (this.isRemoved) {
        {
          const index = records.indexOf(this);
          if (index !== -1) {
            if (dataSet.records === records) {
              dataSet.totalCount -= 1;
            }
            records.splice(index, 1);
          }
        }
        const { parent } = this;
        if (parent) {
          const { children } = parent;
          if (children) {
            const index = children.indexOf(this);
            if (index !== -1) {
              children.splice(index, 1);
            }
            if (!children.length) {
              parent.children = undefined;
            }
          }
          this.parent = undefined;
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
        this.data = initRecordData(data, dataSet);
        this.processData(data, true);
        const { children } = dataSet;
        const keys = Object.keys(children);
        if (keys.length) {
          const { isCurrent } = this;
          const tmpDs = new DataSet(undefined, dataSet.context);
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
      dataSet.fields.forEach(field => field.commit(this));
    }
    this.dirtyData = undefined;
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
    const { dataSet } = this;
    const tlsKey = dataSet.getConfig('tlsKey');
    if (!(name in data)) {
      data[name] = {};
    }
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const field = dataSet.getField(key);
      if (field) {
        const transformResponse = field.get('transformResponse', this);
        if (transformResponse) {
          const originValue = { ...value };
          Object.keys(value).forEach((language) => {
            value[language] = transformResponse(value[language], originValue);
          });
        }
      }
      ObjectChainValue.set(this.data, key, value[dataSet.lang]);
      ObjectChainValue.set(this.data, `${tlsKey}.${key}`, value);
    });
  }

  processFieldValue(fieldName: string, field: Field, fields: Fields, newData: object, data: object, needMerge?: boolean) {
    let value = ObjectChainValue.get(newData, fieldName);
    const chainFieldName = getChainFieldName(this, fieldName);
    const transformResponse = field.get('transformResponse', this);
    if (chainFieldName !== fieldName) {
      const bindValue = ObjectChainValue.get(newData, chainFieldName);
      if (isNil(value) && !isNil(bindValue)) {
        value = bindValue;
      }
    }
    if (transformResponse) {
      value = transformResponse(value, data);
    }
    value = processValue(value, field, this, !needMerge && this.isNew);
    if (value === null) {
      value = undefined;
    }
    if (needMerge && isObject(value)) {
      const oldValue = ObjectChainValue.get(this.data, chainFieldName);
      if (isObject(oldValue)) {
        value = merge(oldValue, value);
      }
    }
    ObjectChainValue.set(newData, chainFieldName, value, fields, this);
    ObjectChainValue.set(this.data, chainFieldName, value, fields, this);
  }

  @action
  setValidationError(name: string, result: ValidationResult[]) {
    const validationErrors = getIf<Record, ObservableMap<string, ValidationResult[]>>(this, 'validationErrors', () => observable.map());
    const originalResult = validationErrors.get(name);
    if ((result && result.length) || (originalResult && originalResult.length)) {
      validationErrors.set(name, result);
    }
  }

  getValidationError(name: string): ValidationResult[] | undefined {
    const { validationErrors } = this;
    if (validationErrors) {
      return validationErrors.get(name);
    }
  }

  @action
  clearValidationError(name) {
    const { validationErrors } = this;
    if (validationErrors) {
      const errors = validationErrors.get(name);
      if (errors) {
        errors.some(error => {
          if (error.ruleName === 'uniqueError') {
            const { validationProps } = error;
            if (validationProps) {
              const { unique } = validationProps;
              if (isString(unique)) {
                this.dataSet.fields.forEach((field, fieldName) => {
                  if (
                    fieldName !== name &&
                    field.get('unique', this) === unique &&
                    !field.get('multiple', this) &&
                    !field.get('range', this)
                  ) {
                    this.clearValidationError(fieldName);
                  }
                });
              }
            }
            return true;
          }
          return false;
        });
      }
      return validationErrors.delete(name);
    }
  }

  private processData(data: object = {}, needMerge?: boolean): void {
    const newData = toJS(data, {
      detectCycles: true,
      exportMapsAsObjects: true,
      recurseEverything: true,
    });
    const fields = getSortedFields(this.dataSet);
    fields.forEach((field, fieldName) => this.processFieldValue(fieldName, field, fields, newData, data, needMerge));
  }

  private normalizeData(needIgnore?: boolean, jsonFields?: string[]) {
    const { dataSet } = this;
    const { fields, dataToJSON } = dataSet;
    const onlyDirtyField = needIgnore && dataToJSON ? useDirtyField(dataToJSON) : false;
    const neverKeys = onlyDirtyField ? getUniqueKeysAndPrimaryKey(dataSet) : [];
    const json: any = onlyDirtyField ? pick(this.data, neverKeys) : toJS(this.data);
    const fieldIgnore = onlyDirtyField ? FieldIgnore.clean : undefined;
    const objectFieldsList: Field[][] = [];
    const normalFields: Field[] = [];
    const ignoreFieldNames: Set<string> = new Set();
    fields.forEach((field, key) => {
      if (field && (!jsonFields || !jsonFields.includes(key))) {
        const ignore = field.get('ignore', this) || fieldIgnore;
        if (
          needIgnore &&
          !neverKeys.includes(key) &&
          (ignore === FieldIgnore.always || (ignore === FieldIgnore.clean && !field.isDirty(this)))
        ) {
          ignoreFieldNames.add(key);
        } else {
          const type = field.get('type', this);
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
          const bind = field.get('bind', this);
          const transformRequest = field.get('transformRequest', this);
          if (bind) {
            value = this.get(getChainFieldName(this, name));
          }
          const old = value;
          value = processToJSON(value, field, this);
          if (transformRequest) {
            // compatible old logic
            value = isString(field.get('multiple', this)) && isArrayLike(old) ?
              transformRequest(value, this) :
              processToJSON(transformRequest(old, this), field, this);
          }
          if (value !== undefined) {
            ObjectChainValue.set(json, name, value, fields, this);
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
    const { dataSetSnapshot, dataSet, isRemoved } = this;
    let dirty = false;
    const { children, fields } = dataSet;
    if (isRemoved) {
      childrenInfoForDelete(json, children);
    } else {
      const keys = Object.keys(children);
      if (keys.length) {
        const { isCurrent } = this;
        keys.forEach(name => {
          const snapshot = dataSetSnapshot && dataSetSnapshot[name];
          const child = (!isCurrent && snapshot && new DataSet(undefined, dataSet.context).restore(snapshot)) || children[name];
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
              ObjectChainValue.set(json, name, jsonArray.data, fields, this);
            }
          }
        });
      }
    }
    return dirty;
  }
}
