import { action, computed, get, IReactionDisposer, isArrayLike, observable, runInAction, set, toJS } from 'mobx';
import axiosStatic, { AxiosInstance, AxiosRequestConfig } from 'axios';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import defer from 'lodash/defer';
import debounce from 'lodash/debounce';
import axios from '../axios';
import Record from './Record';
import Field, { FieldProps, Fields } from './Field';
import warning from 'choerodon-ui/lib/_util/warning';
import {
  append,
  axiosAdapter,
  checkParentByInsert,
  doExport,
  findBindFieldBy,
  generateJSONData,
  generateResponseData,
  getFieldSorter,
  getOrderFields,
  prepareForSubmit,
  prepareSubmitData,
  sortTree,
} from './utils';
import EventManager from '../_util/EventManager';
import DataSetSnapshot from './DataSetSnapshot';
import confirm from '../modal/confirm';
import { DataSetEvents, DataSetSelection, DataSetStatus, FieldType, RecordStatus, SortOrder } from './enum';
import { Lang } from '../locale-context/enum';
import Message from '../message';
import exception from '../_util/exception';
import { $l } from '../locale-context';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import { getConfig } from 'choerodon-ui/lib/configure';
import Transport, { TransportProps } from './Transport';

export type DataSetChildren = { [key: string]: DataSet };

export type Events = { [key: string]: Function };

export interface DataSetProps {
  /**
   * 唯一标识
   * @see children
   */
  id?: string,
  /**
   * 对应后台ds的name，用于自动生成约定的submitUrl, queryUrl, tlsUrl，也可用于级联
   * @see children
   */
  name?: string,
  /**
   * 主键字段名，一般用作级联行表的查询字段
   */
  primaryKey?: string,
  /**
   * 语言
   */
  lang?: Lang,
  /**
   * 字段组
   */
  fields?: FieldProps[];
  /**
   * 查询字段组
   */
  queryFields?: FieldProps[];
  /**
   * 事件
   */
  events?: Events;
  /**
   * 初始化数据
   */
  data?: object[];
  /**
   * 初始化后自动查询
   * @default false
   */
  autoQuery?: boolean;
  /**
   * 初始化时，如果没有记录且autoQuery为false，则自动创建记录
   * @default false;
   */
  autoCreate?: boolean;
  /**
   * 自动定位到第一条
   * @default true;
   */
  autoLocateFirst?: boolean;
  /**
   * 选择的模式
   * @default "multiple"
   */
  selection?: DataSetSelection | false;
  /**
   * 查询前，当有记录更改过时，是否警告提示
   * @default true
   */
  modifiedCheck?: boolean;
  /**
   * 分页大小
   * @default 10
   */
  pageSize?: number;
  /**
   * 前端分页、后端分页还是不分页
   */
  paging?: boolean;
  /**
   * 查询返回的json中对应的数据的key
   * @default "rows"
   */
  dataKey?: string;
  /**
   * 查询返回的json中对应的总数的key
   * @default "total"
   */
  totalKey?: string;
  /**
   * 查询条件数据源
   */
  queryDataSet?: DataSet;
  /**
   * 查询参数
   */
  queryParameter?: object;
  /**
   * 查询请求的url
   */
  queryUrl?: string;
  /**
   * 记录提交请求的url
   */
  submitUrl?: string;
  /**
   * 多语言查询请求的url
   */
  tlsUrl?: string;
  /**
   * 远程校验查询请求的url。如唯一性校验。
   */
  validateUrl?: string;
  /**
   * 导出请求的url
   */
  exportUrl?: string;
  /**
   * 自定义CRUD的请求配置
   */
  transport?: TransportProps;
  /**
   * 级联行数据集, 当为数组时，数组成员必须是有name属性的DataSet
   * @example
   * { name_1: 'ds-id-1', name_2: 'ds-id-2' }
   * { name_1: ds1, name_2: ds2 }
   * [ds1, ds2]
   */
  children?: { [key: string]: (string | DataSet) } | DataSet [];
  /**
   * 树形数据当前节点id字段名
   */
  idField?: string;
  /**
   * 树形数据当前父节点id字段名
   */
  parentField?: string;
  /**
   * 树形数据标记节点是否展开的字段名
   */
  expandField?: string;
  /**
   * 树形数据标记节点是否为选中的字段名，在展开按钮后面会显示checkbox
   */
  checkField?: string;
  /**
   * 缓存选中记录，使切换分页时仍保留选中状态。
   * 当设置了primaryKey或有字段设置了unique才起作用。
   * @default true
   */
  cacheSelection?: boolean;
  /**
   * 覆盖默认axios
   */
  axios?: AxiosInstance;
}

export default class DataSet extends EventManager {

  static defaultProps: DataSetProps = {
    autoCreate: false,
    autoQuery: false,
    autoLocateFirst: true,
    selection: DataSetSelection.multiple,
    modifiedCheck: true,
    pageSize: 10,
    paging: true,
    // dataKey: 'rows',
    // totalKey: 'total',
  };

  id?: string;

  @observable name?: string;

  @computed
  get axios(): AxiosInstance {
    return this.props.axios || getConfig('axios') || axios;
  }

  @observable fields: Fields;

  parent?: DataSet;

  tlsRecord?: Record;

  children: DataSetChildren = {};

  originalData: Record[] = [];

  queryParameter: object;

  pending?: Promise<any>;

  isFilteredByQueryFields: boolean = false;

  reaction: IReactionDisposer;

  @computed
  get lang(): Lang | undefined {
    return get(this.props, 'lang');
  }

  set lang(lang: Lang | undefined) {
    runInAction(() => {
      set(this.props, 'lang', lang);
    });
  }

  get queryDataSet(): DataSet | undefined {
    return get(this.props, 'queryDataSet');
  }

  /**
   * 设置查询的DataSet.
   * @param {DataSet} ds DataSet.
   */
  set queryDataSet(ds: DataSet | undefined) {
    runInAction(() => {
      set(this.props, 'queryDataSet', ds);
      if (ds) {
        defer(() => {
          if (ds.length === 0) {
            ds.create();
          } else if (!ds.current) {
            ds.currentIndex = 0;
          }
        });
      }
    });
  }

  @computed
  get queryUrl(): string | undefined {
    return get(this.props, 'queryUrl') || (this.name && `/dataset/${this.name}/queries`);
  }

  /**
   * 设置提交的Url.
   * @param {String} url 提交的Url.
   */
  set queryUrl(url: string | undefined) {
    runInAction(() => {
      set(this.props, 'queryUrl', url);
    });
  }

  @computed
  get submitUrl(): string | undefined {
    return get(this.props, 'submitUrl') || (this.name && `/dataset/${this.name}/mutations`);
  }

  /**
   * 设置查询的Url.
   * @param {String} url 查询的Url.
   */
  set submitUrl(url: string | undefined) {
    runInAction(() => {
      set(this.props, 'submitUrl', url);
    });
  }

  @computed
  get tlsUrl(): string | undefined {
    return get(this.props, 'tlsUrl') || (this.name && `/dataset/${this.name}/languages`);
  }

  /**
   * 设置多语言的Url.
   * @param {String} url 多语言的Url.
   */
  set tlsUrl(url: string | undefined) {
    runInAction(() => {
      set(this.props, 'tlsUrl', url);
    });
  }

  @computed
  get validateUrl(): string | undefined {
    return get(this.props, 'validateUrl') || (this.name && `/dataset/${this.name}/validate`);
  }

  /**
   * 设置远程校验查询请求的url.
   * @param {String} url 远程校验查询请求的url.
   */
  set validateUrl(url: string | undefined) {
    runInAction(() => {
      set(this.props, 'validateUrl', url);
    });
  }

  @computed
  get exportUrl(): string | undefined {
    return get(this.props, 'exportUrl') || (this.name && `/dataset/${this.name}/export`);
  }

  /**
   * 设置导出请求的url.
   * @param {String} url 远程校验查询请求的url.
   */
  set exportUrl(url: string | undefined) {
    runInAction(() => {
      set(this.props, 'exportUrl', url);
    });
  }

  set transport(transport: Transport) {
    runInAction(() => {
      this.props.transport = transport instanceof Transport ? transport.props : transport;
    });
  }

  @computed
  get transport(): Transport {
    return new Transport(this.props.transport, this);
  }

  @observable props: DataSetProps;

  @observable data: Record[];

  @observable pageSize: number;

  @observable totalCount: number;

  @observable status: DataSetStatus;

  @observable currentPage: number;

  @observable selection: DataSetSelection | false;

  /**
   * 获取删除的记录集
   * @return 记录集
   */
  @observable destroyed: Record[];

  @observable cachedSelected: Record[];

  /**
   * 获取新建的记录集
   * @return 记录集
   */
  @computed
  get created(): Record[] {
    return this.data.filter(record => record.status === RecordStatus.add);
  }

  /**
   * 获取变更的记录集
   * @return 记录集
   */
  @computed
  get updated(): Record[] {
    return this.data.filter(record => record.status === RecordStatus.update);
  }

  /**
   * 获取选中的记录集
   * @return 记录集
   */
  @computed
  get selected(): Record[] {
    return this.currentSelected.concat(this.cachedSelected.filter(record => record.isSelected));
  }

  @computed
  get currentSelected(): Record[] {
    return this.data.filter(record => record.isSelected);
  }

  @computed
  get totalPage(): number {
    return this.paging ? Math.ceil(this.totalCount / this.pageSize) : 1;
  }

  @computed
  get currentIndex(): number {
    const { current, pageSize, currentPage } = this;
    if (current) {
      const index = this.indexOf(current);
      if (index !== -1) {
        return index + (currentPage - 1) * pageSize;
      }
    }
    return -1;
  }

  set currentIndex(index: number) {
    this.locate(index);
  }

  /**
   * 记录数
   */
  @computed
  get length(): number {
    return this.data.length;
  }

  get hasChildren(): boolean {
    return Object.keys(this.children).length > 0;
  }

  @computed
  get treeData(): Record[] {
    // const { data } = this;
    // const { idField, parentField } = this.props;
    // if (idField !== void 0 && parentField !== void 0) {
    //   const array: Record[] = [];
    //   const map1: { [key: string]: Record } = {};
    //   const map2: { [key: string]: Record } = {};
    //   data.forEach((record) => {
    //     const id = record.get(idField) || record.id;
    //     map1[id] = map2[id] = record;
    //   });
    //   runInAction(() => {
    //     for (const key of Object.keys(map2)) {
    //       const record = map2[key];
    //       const parent = map2[record.get(parentField)];
    //       if (parent) {
    //         record.parent = parent;
    //         if (!parent.children) {
    //           parent.children = [record];
    //         } else if (!~parent.children.indexOf(record)) {
    //           parent.children.push(record);
    //         }
    //         delete map1[key];
    //       }
    //     }
    //   });
    //   for (const key of Object.keys(map1)) {
    //     array.push(map2[key]);
    //   }
    //   const orderField = getOrderFields(this.fields)[0];
    //   if (orderField) {
    //     sortTree(array, orderField);
    //   }
    //   return array;
    // } else {
    //   return data;
    // }
    return sortTree(this.filter(record => !record.parent), getOrderFields(this.fields)[0]);
  }

  @computed
  get paging(): boolean {
    const { idField, parentField, paging } = this.props;
    return (parentField === void 0 || idField === void 0) && paging!;
  }

  set paging(paging) {
    runInAction(() => {
      this.props.paging = paging;
    });
  }

  /**
   * 获取当前索引的记录
   * @return record 记录
   */
  @computed
  get current(): Record | undefined {
    return this.data.find(record => record.isCurrent) || this.cachedSelected.find(record => record.isCurrent);
  }

  /**
   * 将记录设定为当前索引
   * @param record 记录
   */
  set current(record: Record | undefined) {
    const currentRecord = this.current;
    if (currentRecord !== record && (!record || !record.isCached)) {
      runInAction(() => {
        if (currentRecord) {
          currentRecord.isCurrent = false;
        }
        if (record && record.dataSet === this) {
          record.isCurrent = true;
        }
        this.fireEvent(DataSetEvents.indexChange, { dataSet: this, record, previous: currentRecord });
      });
    }
  }

  @computed
  get uniqueKeys(): string[] | undefined {
    const { primaryKey } = this.props;
    if (primaryKey) {
      return [primaryKey];
    } else {
      const keys: string[] = [];
      for (const [key, field] of this.fields.entries()) {
        if (field.get('unique')) {
          keys.push(key);
        }
      }
      if (keys.length) {
        return keys;
      }
    }
  }

  @computed
  get cacheSelectionKeys(): string[] | undefined {
    const { cacheSelection, selection } = this.props;
    if (cacheSelection && selection === DataSetSelection.multiple) {
      return this.uniqueKeys;
    }
  }

  /**
   * 获取所有记录包括缓存的选择记录
   * @param index 索引
   * @returns {Record}
   */
  @computed
  get all(): Record[] {
    return this.data.concat(this.cachedSelected.slice()).concat(this.destroyed.slice());
  }

  private inBatchSelection: boolean = false;

  private syncChildrenRemote = debounce((remoteKeys: string[], current: Record) => {
    const { children } = this;
    remoteKeys.forEach(childName => this.syncChild(children[childName], current, childName));
  }, 300);

  constructor(props?: DataSetProps) {
    super();
    runInAction(() => {
      this.props = props = { ...DataSet.defaultProps, dataKey: getConfig('dataKey'), totalKey: getConfig('totalKey'), ...props } as DataSetProps;
      const {
        data, fields, queryFields, queryDataSet, autoQuery, autoCreate, pageSize,
        selection, events, id, name, children, queryParameter = {},
      } = props;
      this.name = name;
      this.data = [];
      this.fields = observable.map<string, Field>();
      this.totalCount = 0;
      this.status = DataSetStatus.ready;
      this.currentPage = 1;
      this.destroyed = [];
      this.cachedSelected = [];
      this.queryParameter = queryParameter;
      this.pageSize = pageSize!;
      this.selection = selection!;
      this.processListener();
      if (id) {
        this.id = id;
      }
      if (children) {
        this.initChildren(children);
      }
      if (events) {
        this.initEvents(events);
      }
      if (fields) {
        this.initFields(fields);
      }
      this.initQueryDataSet(queryDataSet, queryFields);
      if (data) {
        const { length } = data;
        if (length) {
          this.loadData(data, length);
        }
      }
      // ssr do not auto query
      if (autoQuery && typeof window !== 'undefined') {
        this.query();
      } else if (autoCreate && this.length === 0) {
        this.create();
      }
    });
  }

  processListener() {
    this.addEventListener(DataSetEvents.indexChange, this.handleCascade);
    // let previous;
    // this.reaction = reaction(
    //   () => this.current,
    //   record => (this.fireEvent(DataSetEvents.indexChange, { dataSet: this, record, previous }, previous = record)),
    // );
  }

  destroy() {
    // this.reaction();
    this.clear();
  }

  snapshot(): DataSetSnapshot {
    return new DataSetSnapshot(this);
  }

  @action
  restore(snapshot: DataSetSnapshot): DataSet {
    Object.assign(this, snapshot);
    return this;
  }

  toData(): object[] {
    return this.data.map(record => record.toData());
  }

  toJSONData(isSelected?: boolean, noCascade?: boolean): object[] {
    const data: object[] = [];
    (isSelected ? this.selected : this.data.concat(this.destroyed)).forEach(record => generateJSONData(data, record, noCascade));
    return data;
  }

  /**
   * 等待选中或者所有记录准备就绪
   * @param isSelect 如果为true，则只等待选中的记录
   * @returns Promise
   */
  async ready(isSelect?: boolean): Promise<any> {
    const { pending } = this;
    const result = await Promise.all([
      pending,
      ...(isSelect ? this.selected : this.data).map(record => record.ready()),
      ...Array.from(this.fields.values()).map(field => field.ready()),
    ]);
    if (this.pending && this.pending !== pending) {
      return this.ready(isSelect);
    }
    return result;
  }

  /**
   * 查询记录
   * @param page 页码
   * @return Promise
   */
  query(page?: number): Promise<any> {
    this.pending = new Promise(async (resolve, reject) => {
      try {
        const data = await this.read(page);
        this.loadDataFromResponse(data);
        resolve(data);
      } catch (e) {
        reject(e);
      } finally {
        this.pending = void 0;
      }
    });
    return this.pending;
  }

  /**
   * 将数据集中的增删改的记录进行远程提交
   * @param isSelect 如果为true，则只提交选中记录
   * @param noCascade 如果为true，则不提交级联数据
   * @return Promise
   */
  async submit(isSelect?: boolean, noCascade?: boolean): Promise<any> {
    await this.ready(isSelect);
    if (await this.validate(isSelect, noCascade)) {
      return this.write(isSelect ? this.selected : this.data.concat(this.destroyed), noCascade);
    }
    return false;
  }

  /**
   * 导出数据
   * @param object columns 导出的列
   */
  async export(columns: any = {}): Promise<void> {
    const { parent, exportUrl } = this;
    if (exportUrl && this.checkReadable(parent) && await this.ready()) {
      const params = await this.generateQueryParameter();
      params._HAP_EXCEL_EXPORT_COLUMNS = columns;
      this.fireEvent(DataSetEvents.export, { dataSet: this, params });
      doExport(append(exportUrl, { total: this.totalCount, _r: Date.now(), ...this.generateOrderQueryString() }), JSON.stringify(params));
    }
  }

  /**
   * 重置更改
   */
  @action
  reset(): DataSet {
    this.data = this.originalData.map(record => record.reset());
    this.destroyed = [];
    return this;
  }

  /**
   * 定位到指定页码，如果paging为true或`server`，则做远程查询
   * @param page 页码
   * @return Promise
   */
  page(page: number): Promise<any> {
    if (page > 0 && this.paging) {
      return this.locate((page - 1) * this.pageSize + this.created.length - this.destroyed.length);
    }
    return Promise.reject('page rejected');
  }

  /**
   * 定位记录
   * @param index 索引
   * @return Promise
   */
  async locate(index: number): Promise<Record | undefined> {
    const { paging, pageSize, totalCount } = this;
    const { modifiedCheck } = this.props;
    let currentRecord = this.findInAllPage(index);
    if (currentRecord) {
      this.current = currentRecord;
      return currentRecord;
    } else if (paging === true) {
      if (index >= 0 && index < totalCount + this.created.length - this.destroyed.length) {
        if (
          !modifiedCheck
          || !this.isModified()
          || await confirm($l('DataSet', 'unsaved_data_confirm')) !== 'cancel'
        ) {
          await this.query(Math.floor(index / pageSize) + 1);
          currentRecord = this.findInAllPage(index);
          if (currentRecord) {
            this.current = currentRecord;
            return currentRecord;
          }
        }
      }
    }
    return Promise.reject('locate canceled');
  }

  /**
   * 定位到第一条记录
   * @return Promise
   */
  first(): Promise<Record | undefined> {
    return this.locate(0);
  }

  /**
   * 定位到最后一条记录
   * @return Promise
   */
  last(): Promise<Record | undefined> {
    return this.locate((this.paging ? this.totalCount : this.length) - 1);
  }

  /**
   * 定位到当前记录的上一条记录
   * 若当前页中当前记录为第一条记录且有上一页，则会查询上一页并定位到上一页的最后一条记录
   * @return Promise
   */
  pre(): Promise<Record | undefined> {
    return this.locate(this.currentIndex - 1);
  }

  /**
   * 定位到当前记录的下一条记录
   * 若当前页中当前记录为最后一条记录且有下一页，则会查询下一页并定位到下一页的第一条记录
   * @return Promise
   */
  next(): Promise<Record | undefined> {
    return this.locate(this.currentIndex + 1);
  }

  /**
   * 定位到首页
   * @return Promise
   */
  firstPage(): Promise<any> {
    return this.page(1);
  }

  /**
   * 定位到上一页
   * @return Promise
   */
  prePage(): Promise<any> {
    return this.page(this.currentPage - 1);
  }

  /**
   * 定位到下一页
   * @return Promise
   */
  nextPage(): Promise<any> {
    return this.page(this.currentPage + 1);
  }

  /**
   * 定位到尾页
   * @return Promise
   */
  lastPage(): Promise<any> {
    return this.page(this.totalPage);
  }

  /**
   * 创建一条记录
   * @param data 数据对象
   * @param dataIndex 记录所在的索引
   * @return 新建的记录
   */
  create(data: object = {}, dataIndex?: number): Record {
    if (data === null) {
      data = {};
    }
    for (const [name, field] of this.fields.entries()) {
      const defaultValue = field.get('defaultValue');
      const value = ObjectChainValue.get(data, name);
      if (value === void 0 && defaultValue !== void 0) {
        ObjectChainValue.set(data, name, toJS(defaultValue));
      }
    }
    const record = this.current = new Record(data, this);
    if (isNumber(dataIndex)) {
      this.splice(dataIndex, 0, record);
    } else {
      this.push(record);
    }
    this.fireEvent(DataSetEvents.create, { dataSet: this, record });
    return record;
  }

  /**
   * 立即删除记录
   * @param records 记录或者记录数组，默认当前记录
   * @return Promise
   */
  async delete(records?: Record | Record[]): Promise<any> {
    if (records) {
      records = ([] as Record[]).concat(records);
      if (records.length > 0 && await confirm($l('DataSet', 'delete_selected_row_confirm')) !== 'cancel') {
        this.remove(records);
        return this.write(this.destroyed);
      }
    }
  }

  /**
   * 临时删除记录
   * @param records 记录或者记录数组
   * @return Promise
   */
  @action
  remove(records?: Record | Record[]): void {
    if (records) {
      const { current, currentIndex } = this;
      ([] as Record[]).concat(records).forEach((record) => {
        const index = this.indexOf(record);
        if (index !== -1) {
          this.splice(index, 1);
        }
      });
      if (!this.current) {
        const record = this.get(currentIndex) || this.get(this.length - 1);
        if (record) {
          record.isCurrent = true;
        }
        if (current !== record) {
          this.fireEvent(DataSetEvents.indexChange, { dataSet: this, record, previous: current });
        }
      }
    }
  }

  /**
   * 将若干数据记录插入记录堆栈顶部
   * @param records 数据集
   * @return 堆栈数量
   */
  @action
  push(...records: Record[]): number {
    checkParentByInsert(this);
    return this.data.push(...this.transferRecords(records));
  }

  /**
   * 将若干数据记录插入记录堆栈底部
   * @param records 数据集
   * @return 堆栈数量
   */
  @action
  unshift(...records: Record[]): number {
    checkParentByInsert(this);
    return this.data.unshift(...this.transferRecords(records));
  }

  /**
   * 从记录堆栈顶部获取记录
   * @return 记录
   */
  @action
  pop(): Record | undefined {
    return this.deleteRecord(this.data.pop());
  }

  /**
   * 从记录堆栈底部获取记录
   * @return 记录
   */
  @action
  shift(): Record | undefined {
    return this.deleteRecord(this.data.shift());
  }

  /**
   * 删除指定索引的若干记录，并可插入若干新记录
   * @param from 索引开始的位置
   * @default 0
   * @param deleteCount 删除的数量
   * @default 0
   * @param records 插入的若干新记录
   * @return 被删除的记录集
   */
  @action
  splice(from: number, deleteCount: number, ...records: Record[]): (Record | undefined)[] {
    checkParentByInsert(this);
    return this.data.splice(from, deleteCount, ...this.transferRecords(records)).map(this.deleteRecord, this);
  }

  /**
   * 截取指定索引范围的记录集，不改变原记录堆栈
   * @param start 开始索引
   * @default 0
   * @param end 结束索引
   * @default 记录堆栈长度
   * @return 被删除的记录集
   */
  slice(start: number = 0, end: number = this.length): Record[] {
    return this.data.slice(start, end);
  }

  /**
   * 获取记录所在的索引
   * @param record 记录
   * @return 索引
   */
  indexOf(record: Record): number {
    return this.data.indexOf(record);
  }

  /**
   * 根据函数查找记录
   * @param fn 查询函数
   * @returns 记录
   */
  find(fn: (record: Record, index: number, array: Record[]) => boolean): Record | undefined {
    return this.data.find(fn);
  }

  /**
   * 根据函数查找记录所在的索引
   * @param fn 查询函数
   * @returns 索引
   */
  findIndex(fn: (record: Record, index: number, array: Record[]) => boolean): number {
    return this.data.findIndex(fn);
  }

  /**
   * 根据函数遍历
   * @param fn 遍历函数
   * @param thisArg this对象
   */
  forEach(fn: (record: Record, index: number, array: Record[]) => void, thisArg?: any): void {
    this.data.forEach(fn, thisArg);
  }

  /**
   * 根据函数遍历并输出新数组
   * @param fn 遍历函数
   * @param thisArg this对象
   * @returns 输出新数组
   */
  map<U>(fn: (record: Record, index: number, array: Record[]) => U, thisArg?: any): U[] {
    return this.data.map(fn, thisArg);
  }

  /**
   * 根据函数遍历，当有返回值为true时，输出true
   * @param fn 遍历函数
   * @param thisArg this对象
   * @returns boolean
   */
  some(fn: (record: Record, index: number, array: Record[]) => boolean, thisArg?: any): boolean {
    return this.data.some(fn, thisArg);
  }

  /**
   * 根据函数遍历，当有返回值为false时，输出false
   * @param fn 遍历函数
   * @param thisArg this对象
   * @returns boolean
   */
  every(fn: (record: Record, index: number, array: Record[]) => boolean, thisArg?: any): boolean {
    return this.data.every(fn, thisArg);
  }

  /**
   * 根据函数过滤并返回记录集
   * @param fn 过滤函数
   * @param thisArg this对象
   * @returns {Record[]}
   */
  filter(fn: (record: Record, index: number, array: Record[]) => boolean, thisArg?: any): Record[] {
    return this.data.filter(fn, thisArg);
  }

  /**
   * 服务端排序
   * @param fieldName
   */
  @action
  sort(fieldName: string): void {
    const field = this.getField(fieldName);
    if (field) {
      const currents = getOrderFields(this.fields);
      currents.forEach((current) => {
        if (current !== field) {
          current.order = void 0;
        }
      });
      if (!field.order || field.order === SortOrder.desc) {
        field.order = SortOrder.asc;
      } else {
        field.order = SortOrder.desc;
      }
      if (this.paging && this.transport.read) {
        this.query();
      } else {
        this.data = this.data.sort(getFieldSorter(field));
      }
    }
  }

  /**
   * 选中记录
   * @param recordOrIndex 记录或记录索引
   */
  @action
  select(recordOrIndex: Record | number): void {
    const { selection } = this;
    if (selection) {
      let record: Record | undefined = recordOrIndex as Record;
      if (isNumber(recordOrIndex)) {
        record = this.get(recordOrIndex as number);
      }
      if (record && record.selectable && !record.isSelected) {
        let previous: Record | undefined;
        runInAction(() => {
          if (selection === DataSetSelection.single) {
            this.selected.forEach((selected: Record) => (selected.isSelected = false, previous = selected));
          }
          if (record) {
            record.isSelected = true;
          }
        });
        if (!this.inBatchSelection) {
          this.fireEvent(DataSetEvents.select, { dataSet: this, record, previous });
        }
      }
    }
  }

  /**
   * 取消选中记录
   * @param recordOrIndex 记录或记录索引
   */
  @action
  unSelect(recordOrIndex: Record | number): void {
    if (this.selection) {
      let record: Record | undefined = recordOrIndex as Record;
      if (isNumber(recordOrIndex)) {
        record = this.get(recordOrIndex as number);
      }
      if (record && record.selectable && record.isSelected) {
        record.isSelected = false;
        if (!this.inBatchSelection) {
          const cachedIndex = this.cachedSelected.indexOf(record);
          if (cachedIndex !== -1) {
            this.cachedSelected.splice(cachedIndex, 1);
          }
          this.fireEvent(DataSetEvents.unSelect, { dataSet: this, record });
        }
      }
    }
  }

  /**
   * 全选
   */
  @action
  selectAll(filter?: (record: Record) => boolean): void {
    const { selection } = this;
    if (selection) {
      this.inBatchSelection = true;
      if (selection === DataSetSelection.single) {
        if (!this.currentSelected.length) {
          this.select(filter ? this.filter(filter)[0] : 0);
        }
      } else {
        this.data.forEach((record) => {
          if (!filter || filter(record) !== false) {
            this.select(record);
          }
        });
      }

      this.fireEvent(DataSetEvents.selectAll, { dataSet: this });
      this.inBatchSelection = false;
    }
  }

  /**
   * 取消全选
   */
  @action
  unSelectAll(): void {
    if (this.selection) {
      this.inBatchSelection = true;
      this.currentSelected.forEach((record) => {
        this.unSelect(record);
      });
      this.fireEvent(DataSetEvents.unSelectAll, { dataSet: this });
      this.inBatchSelection = false;
    }
  }

  @action
  clearCachedSelected(): void {
    this.cachedSelected = [];
  }

  /**
   * 获取指定索引的记录
   * @param index 索引
   * @returns {Record}
   */
  get(index: number): Record | undefined {
    return this.data.length ? this.data[index] : void 0;
  }

  /**
   * 判断是否有新增、变更或者删除的记录
   * @return true | false
   */
  isModified(): boolean {
    return this.destroyed.length !== 0 ||
      this.data.some(
        record => record.status === RecordStatus.update || record.status === RecordStatus.add,
      );
  }

  /**
   * 获取指定分页的记录集
   * @param page 如果page为空或者paging为server，则获取当前分页的记录集
   * @return 记录集
   */

  /**
   * 根据记录ID查找记录
   * @param id 记录ID
   * @return 记录
   */
  findRecordById(id: number | string): Record | undefined {
    return this.data.concat(this.destroyed).find(record => String(record.id) === String(id));
  }

  /**
   * 校验数据记录是否有效
   * @param isSelected 是否只校验选中记录
   * @param noCascade 是否级联校验
   * @return true | false
   */
  validate(isSelected?: boolean, noCascade?: boolean): Promise<boolean> {
    return Promise.all((isSelected ? this.selected : this.data).map(record => record.validate(noCascade)))
      .then(results => results.every(result => result));
  }

  /**
   * 根据字段名获取字段
   * @param fieldName 字段名
   * @returns 字段
   */
  getField(fieldName?: string): Field | undefined {
    if (fieldName) {
      return this.fields.get(fieldName);
    }
  }

  /**
   * 获取分组字段名
   * @returns 字段名列表
   */
  getGroups(): string [] {
    return Array.from(this.fields.entries()).reduce((arr: string[], [name, field]) => {
      const group = field.get('group');
      if (isNumber(group)) {
        arr[group as number] = name;
      } else if (group === true && !arr[0]) {
        arr[0] = name;
      }
      return arr;
    }, []).filter(group => group !== void 0);
  }

  initFields(fields: FieldProps[]): void {
    fields.forEach((field) => {
      const { name } = field;
      if (name) {
        this.addField(name, field);
      } else {
        warning(false, 'DataSet create field failed. Please check if property name is exists on field.');
      }
    });
  }

  /*
   * 增加新字段
   * @param fieldName 字段名
   * @param props 字段属性
   * @return 新增字段
   */
  @action
  addField(fieldName: string, props: FieldProps = {}): Field {
    const field = new Field(props, this);
    this.fields.set(fieldName, field);
    return field;
  }

  @action
  commitData(allData: any[], total?: number): DataSet {
    if (allData.length) {
      allData.forEach(data => {
        const record = this.findRecordById(data.__id);
        if (record) {
          record.commit(data, this);
        }
      });
      if (isNumber(total)) {
        this.totalCount = total;
      }
      this.originalData = this.data.slice();
    } else if (this.length || this.destroyed.length) {
      warning(false, `The primary key which generated by database is not exists in each created records,
because of no data \`${this.props.dataKey}\` from the response by \`submit\` or \`delete\` method.
Then the query method will be auto invoke.`);
      this.query();
    }
    return this;
  }

  /**
   * 数据集头行级联绑定
   * @param ds 头数据集
   * @param name 头数据集字段名
   */
  bind(ds: DataSet, name: string) {
    if (!name) {
      warning(false, 'DataSet: cascade binding need a name');
      return;
    }
    if (ds.children[name]) {
      warning(false, `DataSet: duplicate cascade binding of name<${name}>`);
      return;
    }
    ds.children[name] = this;
    this.parent = ds;
    const { current } = ds;
    if (current) {
      ds.syncChild(this, current, name);
    }
  }

  /**
   * 设置查询的参数.
   * @param {string} para 参数名.
   * @param {any} value 参数值.
   */
  setQueryParameter(para: string, value: any) {
    this.queryParameter[para] = value;
  }

  @action
  loadData(allData: object[] = [], total?: number): DataSet {
    this.storeSelected();
    const { paging, pageSize, props: { autoLocateFirst } } = this;
    allData = paging ? allData.slice(0, pageSize) : allData;
    this.fireEvent(DataSetEvents.beforeLoad, { dataSet: this, data: allData });
    this.data = this.originalData = allData.map(data => {
      const record = new Record(data, this);
      record.status = RecordStatus.sync;
      return record;
    });
    this.destroyed = [];
    if (total !== void 0 && paging === true) {
      this.totalCount = total;
    } else {
      this.totalCount = allData.length;
    }
    this.releaseCachedSelected();
    const nextRecord = autoLocateFirst && this.get(0);
    if (nextRecord) {
      nextRecord.isCurrent = true;
    }
    this.fireEvent(DataSetEvents.indexChange, { dataSet: this, record: nextRecord });
    this.fireEvent(DataSetEvents.load, { dataSet: this });
    return this;
  }

  private deleteRecord(record?: Record): Record | undefined {
    if (record) {
      record.isSelected = false;
      record.isCurrent = false;
      const { selected, destroyed } = this;
      const index = selected.indexOf(record);
      if (index !== -1) {
        selected.splice(index, 1);
      }
      if (record.status !== RecordStatus.add && record.status !== RecordStatus.delete) {
        record.status = RecordStatus.delete;
        destroyed.push(record);
      }
    }
    return record;
  }

  private findInAllPage(index: number): Record | undefined {
    const { paging } = this;
    if (paging === true) {
      index = this.getIndexInCurrentPage(index);
    }
    return this.data[index];
  }

  private getIndexInCurrentPage(index: number = this.currentIndex): number {
    const { currentPage, pageSize } = this;
    return index - (currentPage - 1) * pageSize;
  }

  private transferRecords(records: Record[]): Record[] {
    return records.map((record) => {
      const { dataSet } = record;
      if (dataSet === this) {
        const { data } = this;
        const index = data.indexOf(record);
        if (index !== -1) {
          data.splice(index, 1);
        }
        return record;
      } else {
        if (dataSet) {
          dataSet.remove(record);
          record = new Record(record.data, this);
        }
        record.dataSet = this;
        record.status = RecordStatus.add;
        return record;
      }
    });
  }

  private initChildren(children: { [key: string]: (string | DataSet) } | DataSet []): void {
    if (isArray(children)) {
      children.forEach((childDs) => {
        if (childDs instanceof DataSet) {
          const { name } = childDs;
          if (name) {
            childDs.bind(this, name);
          } else {
            warning(false, 'cascade DataSet need a name');
          }
        }
      });
    } else {
      Object.keys(children as DataSetChildren).forEach((childName) => {
        const child = children[childName];
        if (child instanceof DataSet) {
          child.bind(this, childName);
        } else {
          warning(false, `cascade child<${childName}> must be instance of DataSet.`);
        }
      });
    }
  }

  private initQueryDataSet(queryDataSet?: DataSet, queryFields?: FieldProps[]) {
    if (queryFields) {
      queryDataSet = new DataSet({
        fields: queryFields,
      });
    }
    if (queryDataSet) {
      this.queryDataSet = queryDataSet;
    }
  }

  private initEvents(events: Events): void {
    Object.keys(events).forEach(event => this.addEventListener(event, events[event]));
  }

  private loadDataFromResponse(resp: any): DataSet {
    if (resp) {
      const { dataKey, totalKey } = this.props;
      const data: object[] = generateResponseData(resp, dataKey);
      const total: number | undefined = resp[totalKey!];
      this.loadData(data, total);
    }
    return this;
  }

  // private groupData(allData: object[]): object[] {
  //   return this.getGroups().reverse()
  //     .reduce((arr, name) => arr.sort(
  //       (item1, item2) => String(item1[name]).localeCompare(String(item2[name])),
  //     ), allData);
  // }

  private async write(records: Record[], noCascade?: boolean): Promise<any> {
    if (records.length) {
      const [created, updated, destroyed, cascade] = prepareSubmitData(records, noCascade);
      const { transport } = this;
      const axiosConfigs: AxiosRequestConfig[] = [];
      const submitData: object[] = [
        ...prepareForSubmit('create', created, transport, axiosConfigs, this),
        ...prepareForSubmit('update', updated, transport, axiosConfigs, this),
        ...prepareForSubmit('destroy', destroyed, transport, axiosConfigs, this),
        ...cascade,
      ];
      prepareForSubmit('submit', submitData, transport, axiosConfigs, this);
      if (axiosConfigs.length) {
        try {
          this.changeSubmitStatus(DataSetStatus.submitting);
          const submitEventResult = await this.fireEvent(DataSetEvents.submit, {
            dataSet: this,
            data: [...created, ...updated, ...destroyed, ...cascade],
          });
          if (submitEventResult) {
            this.pending = axiosStatic.all(axiosConfigs.map(config => this.axios(config)));
            const result: any[] = await this.pending;
            return this.handleSubmitSuccess(result);
          }
        } catch (e) {
          this.handleSubmitFail(e);
          throw e;
        } finally {
          this.changeSubmitStatus(DataSetStatus.ready);
          this.pending = void 0;
        }
      }
    }
  }

  private async read(page: number = 1): Promise<any> {
    if (this.checkReadable(this.parent)) {
      try {
        const { transport: { read = {}, adapter } } = this;
        this.changeStatus(DataSetStatus.loading);
        const params = await this.generateQueryParameter();
        const newConfig = axiosAdapter(read, this, params, this.generateQueryString(page));
        const adapterConfig = adapter(newConfig, 'read') || newConfig;
        if (adapterConfig.url) {
          const queryEventResult = await this.fireEvent(DataSetEvents.query, {
            dataSet: this, params: adapterConfig.data || adapterConfig.params,
          });
          if (queryEventResult) {
            const result = await this.axios(adapterConfig);
            runInAction(() => {
              this.currentPage = page;
            });
            return result;
          }
        }
      } catch (e) {
        this.handleLoadFail(e);
        throw e;
      } finally {
        this.changeStatus(DataSetStatus.ready);
      }
    }
  }

  @action
  private storeSelected() {
    if (this.cacheSelectionKeys) {
      this.cachedSelected = [
        ...this.cachedSelected.filter(record => record.isSelected),
        ...this.currentSelected.map(record => (record.isCurrent = false, record.isCached = true, record)),
      ];
    }
  }

  @action
  private releaseCachedSelected() {
    const { cacheSelectionKeys, cachedSelected } = this;
    if (cacheSelectionKeys) {
      this.data.forEach(record => {
        const index = cachedSelected.findIndex(cached => cacheSelectionKeys.every(key => record.get(key) === cached.get(key)));
        if (index !== -1) {
          record.isSelected = true;
          cachedSelected.splice(index, 1);
        }
      });
    }
  }

  @action
  private changeStatus(status: DataSetStatus) {
    this.status = status;
  }

  @action
  private changeSubmitStatus(status: DataSetStatus) {
    this.status = status;
    Object.values(this.children).forEach(ds => {
      if (ds instanceof DataSet) {
        ds.changeSubmitStatus(status);
      }
    });
  }

  private handleCascade({ dataSet, record, previous }: { dataSet: DataSet, record?: Record, previous?: Record }) {
    if (dataSet.hasChildren) {
      dataSet.syncChildren(record, previous);
    }
  }

  private handleLoadFail(e) {
    this.fireEvent(DataSetEvents.loadFailed, { dataSet: this });
    Message.error(exception(e, $l('DataSet', 'query_failure')));
  }

  private handleSubmitSuccess(resp: any[]) {
    const { dataKey, totalKey } = this.props;
    const data: object[] = [];
    let total = void 0;
    resp.forEach((item) => {
      data.push(...generateResponseData(item, dataKey));
      if (totalKey && isObject(item) && totalKey in item) {
        total = item[totalKey];
      }
    });
    const result = dataKey ? {
      [dataKey]: data,
      [totalKey!]: total,
      success: true,
    } : data;
    this.fireEvent(DataSetEvents.submitSuccess, { dataSet: this, data: result });
    this.commitData(data, total);
    Message.success($l('DataSet', 'submit_success'));
    return result;
  }

  private handleSubmitFail(e) {
    this.fireEvent(DataSetEvents.submitFailed, { dataSet: this });
    Message.error(exception(e, $l('DataSet', 'submit_failure')));
  }

  private syncChildren(current?: Record, previous?: Record) {
    const { children } = this;
    const keys: string[] = Object.keys(children);
    const remoteKeys: string[] = [];
    keys.forEach((childName) => {
      const ds = children[childName];
      if (previous && ds.status === DataSetStatus.ready && previous.dataSetSnapshot[childName]) {
        previous.dataSetSnapshot[childName] = ds.snapshot();
      }
      if (current) {
        const snapshot = current.dataSetSnapshot[childName];
        if (snapshot instanceof DataSetSnapshot) {
          ds.restore(snapshot);
        } else {
          if (!this.syncChild(ds, current, childName, true)) {
            ds.loadData([]);
            remoteKeys.push(childName);
          }
        }
      } else {
        ds.loadData([]);
      }
    });
    if (current && remoteKeys.length) {
      this.syncChildrenRemote(remoteKeys, current);
    }
  };

  @action
  private syncChild(ds: DataSet, currentRecord: Record, childName: string, onlyClient?: boolean): boolean {
    const childRecords = currentRecord.get(childName);
    if (currentRecord.status === RecordStatus.add || isArrayLike(childRecords)) {
      ds.clearCachedSelected();
      ds.loadData(childRecords ? childRecords.slice() : []);
      if (currentRecord.status === RecordStatus.add) {
        ds.forEach(record => record.status = RecordStatus.add);
      }
      currentRecord.dataSetSnapshot[childName] = ds.snapshot();
      return true;
    } else if (!onlyClient) {
      const oldSnapshot = ds.snapshot();
      ds.read(1).then((resp) => {
        const { current } = this;
        if (current !== currentRecord) {
          ds = new DataSet().restore(oldSnapshot);
        }
        ds.clearCachedSelected();
        currentRecord.dataSetSnapshot[childName] = ds.loadDataFromResponse(resp).snapshot();
      });
    }
    return false;
  }

  private checkReadable(parent) {
    if (parent) {
      const { current } = parent;
      if (!current || current.status === RecordStatus.add) {
        return false;
      }
    }
    return true;
  }

  private generatePageQueryString(page: number) {
    const { paging, pageSize } = this;
    if (paging === true) {
      const generatePageQuery = getConfig('generatePageQuery');
      if (generatePageQuery) {
        return generatePageQuery({ pageSize, page });
      }
      return { page, pagesize: pageSize };
    }
    return {};
  }

  private generateOrderQueryString() {
    const { fields } = this;
    const orderField = getOrderFields(fields)[0];
    if (orderField) {
      const param = { sortname: orderField.name, sortorder: orderField.order };
      if (orderField.type === FieldType.object) {
        const bindField = findBindFieldBy(orderField, this.fields, 'valueField');
        if (bindField) {
          param.sortname = bindField.name;
        }
      }
      return param;
    }
    return {};
  }

  private generateQueryString(page: number) {
    return { ...this.generatePageQueryString(page), ...this.generateOrderQueryString() };
  }

  private async generateQueryParameter(): Promise<any> {
    const { parent, queryDataSet } = this;
    let parentParam = {};
    if (parent) {
      const { props: { primaryKey }, current } = parent;
      if (current) {
        if (primaryKey) {
          parentParam[primaryKey] = current.get(primaryKey);
        } else {
          parentParam = current.toData();
        }
      }
    }
    if (queryDataSet) {
      await queryDataSet.ready();
      if (!await queryDataSet.validate()) {
        throw new Error($l('DataSet', 'invalid_query_dataset'));
      }
    }
    let data: any = {};
    this.isFilteredByQueryFields = false;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        data = current.toJSONData();
        this.isFilteredByQueryFields = data.__dirty;
        delete data.__dirty;
        delete data.__id;
        delete data.__status;
      }
    }
    data = {
      ...data,
      ...this.queryParameter,
      ...parentParam,
    };
    return Object.keys(data).reduce((p, key) => {
      const value = data[key];
      if (!isEmpty(value)) {
        p[key] = value;
      }
      return p;
    }, {});
  }
}
