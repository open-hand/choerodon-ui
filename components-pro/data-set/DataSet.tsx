import { ReactNode } from 'react';
import { action, computed, get, IReactionDisposer, isArrayLike, observable, runInAction, set, toJS } from 'mobx';
import axiosStatic, { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import unionBy from 'lodash/unionBy';
import omit from 'lodash/omit';
import flatMap from 'lodash/flatMap';
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import defer from 'lodash/defer';
import debounce from 'lodash/debounce';
import warning from 'choerodon-ui/lib/_util/warning';
import { getConfig } from 'choerodon-ui/lib/configure';
import localeContext, { $l } from '../locale-context';
import axios from '../axios';
import Record from './Record';
import Field, { FieldProps, Fields } from './Field';
import {
  adapterDataToJSON,
  arrayMove,
  axiosConfigAdapter,
  checkParentByInsert,
  doExport,
  findBindFieldBy,
  findRootParent,
  fixAxiosConfig,
  generateData,
  generateJSONData,
  generateResponseData,
  getFieldSorter,
  getOrderFields,
  getSpliceRecord,
  getSplitValue,
  isDirtyRecord,
  prepareForSubmit,
  prepareSubmitData,
  processExportValue,
  processIntlField,
  sliceTree,
  sortTree,
  useCascade,
  useSelected,
  normalizeGroups,
  exportExcel,
} from './utils';
import EventManager from '../_util/EventManager';
import DataSetSnapshot from './DataSetSnapshot';
import confirm from '../modal/confirm';
import { DataSetEvents, DataSetSelection, DataSetExportStatus, DataSetStatus, DataToJSON, ExportMode, FieldType, RecordStatus, SortOrder } from './enum';
import { Lang } from '../locale-context/enum';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import Transport, { TransportProps } from './Transport';
import PromiseQueue from '../_util/PromiseQueue';
import { ModalProps } from '../modal/Modal';
import { confirmProps } from '../modal/utils';
import DataSetRequestError from './DataSetRequestError';
import defaultFeedback, { FeedBack } from './FeedBack';

export type DataSetChildren = { [key: string]: DataSet };

export type Events = { [key: string]: Function };

export type Group = { name: string, value: any, records: Record[], subGroups: Group[] };

export interface DataSetProps {
  /**
   * 唯一标识
   * @see children
   */
  id?: string;
  /**
   * 对应后台ds的name，用于自动生成约定的submitUrl, queryUrl, tlsUrl，也可用于级联
   * @see children
   */
  name?: string;
  /**
   * 主键字段名，一般用作级联行表的查询字段
   */
  primaryKey?: string;
  /**
   * 语言
   */
  lang?: Lang;
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
   * 提交成功后响应的数据不符合回写条件时自动查询
   * @default true
   */
  autoQueryAfterSubmit?: boolean;
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
   * 自动定位到新建记录
   * @default true;
   */
  autoLocateAfterCreate?: boolean;
  /**
   * 当前记录被删除时自动定位其他记录
   * @default true;
   */
  autoLocateAfterRemove?: boolean;
  /**
   * 查询时是否校验查询字段或查询数据集
   * @default false;
   */
  validateBeforeQuery?: boolean;
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
   * 查询前，当有记录更改过时， 提示信息或弹窗的属性 modifiedCheckMessage
   * @default
   */
  modifiedCheckMessage?: ReactNode | ModalProps & confirmProps,
  /**
   * 分页大小
   * @default 10
   */
  pageSize?: number;
  /**
   * 前端分页、后端分页还是不分页
   */
  paging?: boolean | 'server';
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
   * 导出模式
   */
  exportMode?: ExportMode;
  /**
   * 自定义CRUD的请求配置
   */
  transport?: TransportProps;
  /**
   * 查询和提交数据的反馈配置
   */
  feedback?: TransportProps;
  /**
   * 级联行数据集, 当为数组时，数组成员必须是有name属性的DataSet
   * @example
   * { name_1: 'ds-id-1', name_2: 'ds-id-2' }
   * { name_1: ds1, name_2: ds2 }
   * [ds1, ds2]
   */
  children?: { [key: string]: string | DataSet } | DataSet[];
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
  /**
   * 数据转为json的方式
   * dirty - 只转换变更的数据，包括本身无变更但级联有变更的数据
   * selected - 只转换选中的数据，无关数据的变更状态
   * all - 转换所有数据
   * normal - 转换所有数据，且不会带上__status, __id等附加字段
   * dirty-self - 同dirty， 但不转换级联数据
   * selected-self - 同selected， 但不转换级联数据
   * all-self - 同all， 但不转换级联数据
   * normal-self - 同normal， 但不转换级联数据
   * @default dirty
   */
  dataToJSON?: DataToJSON;
  /**
   * 级联查询参数
   */
  cascadeParams?: (parent: Record, primaryKey?: string) => object;
}

export default class DataSet extends EventManager {
  static defaultProps: DataSetProps = {
    autoCreate: false,
    autoQuery: false,
    autoQueryAfterSubmit: true,
    autoLocateFirst: true,
    autoLocateAfterCreate: true,
    autoLocateAfterRemove: true,
    validateBeforeQuery: true,
    selection: DataSetSelection.multiple,
    modifiedCheck: true,
    pageSize: 10,
    paging: true,
    dataToJSON: DataToJSON.dirty,
    cascadeParams(parent, primaryKey) {
      if (primaryKey) {
        return { [primaryKey]: parent.get(primaryKey) };
      }
      return omit(parent.toData(), ['__dirty']);
    },
  };

  id?: string;

  children: DataSetChildren = {};

  queryParameter: object;

  pending: PromiseQueue = new PromiseQueue();

  reaction: IReactionDisposer;

  originalData: Record[] = [];

  resetInBatch: boolean = false;

  @observable parent?: DataSet;

  @observable name?: string;

  @observable parentName?: string;

  @observable records: Record[];

  @observable fields: Fields;

  @observable props: DataSetProps;

  @observable pageSize: number;

  @observable totalCount: number;

  @observable status: DataSetStatus;

  @observable exportStatus: DataSetExportStatus | undefined;

  @observable currentPage: number;

  @observable selection: DataSetSelection | false;

  @observable cachedSelected: Record[];

  @observable dataToJSON: DataToJSON;

  @computed
  get cascadeRecords(): Record[] {
    const { parent, parentName } = this;
    if (parent && parentName) {
      return parent.cascadeRecords.reduce<Record[]>((array, record) => array.concat(...(record.getCascadeRecordsIncludeDelete(parentName) || [])), []);
    }
    return this.records;
  }

  @computed
  get axios(): AxiosInstance {
    return this.props.axios || getConfig('axios') || axios;
  }

  @computed
  get dataKey(): string {
    const { dataKey = getConfig('dataKey') } = this.props;
    return dataKey;
  }

  @computed
  get totalKey(): string {
    return this.props.totalKey || getConfig('totalKey');
  }

  @computed
  get lang(): Lang {
    return get(this.props, 'lang') || localeContext.locale.lang;
  }

  set lang(lang: Lang) {
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
        // 初始化时如果直接执行create，mobx会报错，所以使用了defer
        ds.pending.add(
          new Promise<void>(reslove => {
            defer(() => {
              if (ds.records.length === 0) {
                ds.create();
              } else if (!ds.current) {
                ds.first();
              }
              reslove();
            });
          }),
        );
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

  /**
   * 服务端导出还是客户端导出
   */
  get exportMode(): ExportMode {
    return this.props.exportMode || getConfig('exportMode') || ExportMode.server;
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

  @computed
  get feedback(): FeedBack {
    return {
      ...getConfig('feedback'),
      ...this.props.feedback,
    };
  }

  @computed
  get data(): Record[] {
    return this.records.filter(record => !record.isRemoved);
  }

  set data(records: Record[]) {
    this.loadData(records);
  }

  @computed
  get dirtyRecords(): [Record[], Record[], Record[]] {
    const created: Record[] = [];
    const updated: Record[] = [];
    const destroyed: Record[] = [];
    this.all.forEach(record => {
      switch (record.status) {
        case RecordStatus.add:
          created.push(record);
          break;
        case RecordStatus.update:
          updated.push(record);
          break;
        case RecordStatus.delete:
          destroyed.push(record);
          break;
        default: {
          if (record.dirty) {
            updated.push(record);
          }
        }
      }
    });
    return [created, updated, destroyed];
  }

  /**
   * 获取新建的记录集
   * @return 记录集
   */
  @computed
  get created(): Record[] {
    return this.dirtyRecords[0];
  }

  /**
   * 获取变更的记录集
   * @return 记录集
   */
  @computed
  get updated(): Record[] {
    return this.dirtyRecords[1];
  }

  /**
   * 获取删除的记录集
   * @return 记录集
   */
  @computed
  get destroyed(): Record[] {
    return this.dirtyRecords[2];
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
    return this.records.filter(record => record.isSelected);
  }

  @computed
  get totalPage(): number {
    return this.paging ? Math.ceil(this.totalCount / this.pageSize) : 1;
  }

  // 如果paging为server 返回root父节点的排序

  @computed
  get currentIndex(): number {
    const { current, pageSize, currentPage } = this;
    if (current) {
      const index = this.indexOf(current);
      if (index !== -1) {
        if (this.paging === 'server') {
          const currentParent = findRootParent(current);
          return this.treeData.findIndex((item) => item.index === currentParent.index);
        }
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
  get treeRecords(): Record[] {
    return sortTree(this.records.filter(record => !record.parent), getOrderFields(this.fields)[0]);
  }

  @computed
  get treeData(): Record[] {
    return sortTree(this.filter(record => !record.parent), getOrderFields(this.fields)[0]);
  }

  @computed
  get paging(): boolean | 'server' {
    const { idField, parentField, paging } = this.props;
    return (paging === `server`) && parentField && idField ? paging : (parentField === undefined || idField === undefined) && !!paging!;
  }

  @computed
  get groups() {
    return [...this.fields.entries()]
      .reduce<string[]>((arr, [name, field]) => {
        const group = field.get('group');
        if (isNumber(group)) {
          arr[group as number] = name;
        } else if (group === true && !arr[0]) {
          arr[0] = name;
        }
        return arr;
      }, [])
      .filter(group => group !== undefined);
  }

  @computed
  get groupedRecords(): Group[] {
    const { groups, records } = this;
    return normalizeGroups(groups, records);
  }

  @computed
  get groupedTreeRecords(): Group[] {
    const { groups, treeRecords } = this;
    return normalizeGroups(groups, treeRecords);
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
    return (
      this.data.find(record => record.isCurrent) ||
      this.cachedSelected.find(record => record.isCurrent)
    );
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
        this.fireEvent(DataSetEvents.indexChange, {
          dataSet: this,
          record,
          previous: currentRecord,
        });
      });
    }
  }

  @computed
  get uniqueKeys(): string[] | undefined {
    const { primaryKey } = this.props;
    if (primaryKey) {
      return [primaryKey];
    }
    const keys: string[] = [];
    [...this.fields.entries()].forEach(([key, field]) => {
      if (field.get('unique')) {
        keys.push(key);
      }
    });
    if (keys.length) {
      return keys;
    }
    return undefined;
  }

  @computed
  get cacheSelectionKeys(): string[] | undefined {
    const { cacheSelection, selection } = this.props;
    if (cacheSelection && selection === DataSetSelection.multiple) {
      return this.uniqueKeys;
    }
    return undefined;
  }

  /**
   * 获取所有记录包括缓存的选择记录
   * @param index 索引
   * @returns {Record}
   */
  @computed
  get all(): Record[] {
    return this.records.concat(this.cachedSelected.slice());
  }

  @computed
  get dirty(): boolean {
    return this.records.some(isDirtyRecord);
  }

  private inBatchSelection: boolean = false;

  private syncChildrenRemote = debounce((remoteKeys: string[], current: Record) => {
    const { children } = this;
    remoteKeys.forEach(childName => this.syncChild(children[childName], current, childName));
  }, 300);

  constructor(props?: DataSetProps) {
    super();
    runInAction(() => {
      props = { ...DataSet.defaultProps, ...props } as DataSetProps;
      this.props = props;
      const {
        data,
        fields,
        queryFields,
        queryDataSet,
        autoQuery,
        autoCreate,
        pageSize,
        selection,
        events,
        id,
        name,
        children,
        queryParameter = {},
        dataToJSON,
      } = props;
      this.name = name;
      this.dataToJSON = dataToJSON!;
      this.records = [];
      this.fields = observable.map<string, Field>();
      this.totalCount = 0;
      this.status = DataSetStatus.ready;
      this.currentPage = 1;
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
      } else if (autoCreate && this.records.length === 0) {
        this.create();
      }
    });
  }

  processListener() {
    this.addEventListener(DataSetEvents.indexChange, this.handleCascade);
  }

  destroy() {
    this.clear();
  }

  snapshot(): DataSetSnapshot {
    return new DataSetSnapshot(this);
  }

  @action
  restore(snapshot: DataSetSnapshot): DataSet {
    if (snapshot.dataSet !== this) {
      this.events = {};
    } else if (snapshot.events) {
      this.events = snapshot.events;
    }
    this.records = snapshot.records;
    this.originalData = snapshot.originalData;
    this.totalCount = snapshot.totalCount;
    this.currentPage = snapshot.currentPage;
    this.pageSize = snapshot.pageSize;
    this.cachedSelected = snapshot.cachedSelected;
    this.dataToJSON = snapshot.dataToJSON;
    this.children = snapshot.children;
    this.current = snapshot.current;
    return this;
  }

  toData(): object[] {
    return generateData(this.records).data;
  }

  /**
   * 对应参数后续会废弃
   * @param isSelected
   * @param noCascade
   */
  toJSONData(isSelected?: boolean, noCascade?: boolean): object[] {
    const dataToJSON = adapterDataToJSON(isSelected, noCascade) || this.dataToJSON;
    const records = useSelected(dataToJSON) ? this.selected : this.records;
    return generateJSONData(this, records).data;
  }

  /**
   * 等待选中或者所有记录准备就绪
   * @returns Promise
   */
  ready(isSelect?: boolean): Promise<any> {
    return Promise.all([
      this.pending.ready(),
      ...(isSelect || useSelected(this.dataToJSON) ? this.selected : this.data).map(record =>
        record.ready(),
      ),
      ...[...this.fields.values()].map(field => field.ready()),
    ]);
  }

  /**
   * 查询记录
   * @param page 页码
   * @param params 查询参数
   * @return Promise
   */
  query(page?: number, params?: object): Promise<any> {
    return this.pending.add(this.doQuery(page, params));
  }

  /**
   * 查询更多记录，查询到的结果会拼接到原有数据之后
   * @param page 页码
   * @param params 查询参数
   * @return Promise
   */
  queryMore(page?: number, params?: object): Promise<any> {
    return this.pending.add(this.doQueryMore(page, params));
  }

  async doQuery(page, params?: object): Promise<any> {
    const data = await this.read(page, params);
    this.loadDataFromResponse(data);
    return data;
  }

  async doQueryMore(page, params?: object): Promise<any> {
    const data = await this.read(page, params);
    this.appendDataFromResponse(data);
    return data;
  }

  /**
   * TODO 参数废弃
   * 将数据集中的增删改的记录进行远程提交
   * @param isSelect 如果为true，则只提交选中记录
   * @param noCascade 如果为true，则不提交级联数据
   * @return Promise
   */
  async submit(isSelect?: boolean, noCascade?: boolean): Promise<any> {
    const dataToJSON = adapterDataToJSON(isSelect, noCascade) || this.dataToJSON;
    await this.ready();
    if (await this.validate()) {
      return this.pending.add(
        this.write(useSelected(dataToJSON) ? this.selected : this.records),
      );
    }
    return false;
  }

  /**
   * 导出数据
   * @param object columns 导出的列
   * @param number exportQuantity 导出数量
   */
  async export(columns: any = {}, exportQuantity: number = 0): Promise<void | any[]> {
    if (this.checkReadable(this.parent) && (await this.ready())) {
      const data = await this.generateQueryParameter();
      data._HAP_EXCEL_EXPORT_COLUMNS = columns;
      const { totalCount, totalKey } = this;
      const params = { _r: Date.now(), ...this.generateOrderQueryString() };
      ObjectChainValue.set(params, totalKey, totalCount);
      const newConfig = axiosConfigAdapter('exports', this, data, params);
      if (newConfig.url) {
        if (
          (await this.fireEvent(DataSetEvents.export, {
            dataSet: this,
            params: newConfig.params,
            data: newConfig.data,
          })) !== false
        ) {
          const ExportQuantity = exportQuantity > 1000 ? 1000 : exportQuantity;
          if (this.exportMode !== ExportMode.client) {
            doExport(this.axios.getUri(newConfig), newConfig.data, newConfig.method);
          } else {
            return this.doClientExport(data, ExportQuantity, false);
          }
        }
      } else {
        warning(false, 'Unable to execute the export method of dataset, please check the ');
      }
    }
  }


  /**
   * 可以把json数组通过ds配置转化成可以直接浏览的数据信息
   * @param result 需要转化内容
   * @param columnsExport 表头信息
   */
  displayDataTransform(result: any[], columnsExport) {
    const newResult: any[] = [];
    if (result && result.length > 0) {
      // check: 这里做性能优化去掉实例化为record 从demo来看没啥问题
      // toJS(this.processData(result)).map((item) => item.data);
      const processData = result
      processData.forEach((itemValue) => {
        const dataItem = {};
        const columnsExportkeys = Object.keys(columnsExport);
        for (let i = 0; i < columnsExportkeys.length; i += 1) {
          const firstRecord = this.records[0] || this;
          const exportField = firstRecord.getField(columnsExportkeys[i]);
          let processItemValue = getSplitValue(toJS(itemValue), columnsExportkeys[i]);
          // 处理bind 情况
          if (exportField && isNil(processItemValue) && exportField.get('bind')) {
            processItemValue = getSplitValue(
              getSplitValue(toJS(itemValue), exportField.get('bind')),
              columnsExportkeys[i],
              true,
            );
          }
          dataItem[columnsExportkeys[i]] = processExportValue(processItemValue, exportField);
        }
        newResult.push(dataItem);
      });
    }
    return newResult
  }

  /**
   * 客户端导出方法
   * @param data 表头数据
   * @param quantity 输入一次导出数量
   * @param isFile 是否导出为文件
   */
  @action
  private async doClientExport(data: any, quantity: number, isFile: boolean = true): Promise<any[] | void> {
    const columnsExport = data._HAP_EXCEL_EXPORT_COLUMNS;
    delete data._HAP_EXCEL_EXPORT_COLUMNS;
    const { totalCount } = this;
    runInAction(() => {
      this.exportStatus = DataSetExportStatus.start;
    })
    let newResult: any[] = [];
    if (totalCount > 0) {
      const queryTime = Math.ceil(totalCount / quantity)
      const queryExportList: AxiosPromise<any>[] = [];
      for (let i = 0; i < queryTime; i++) {
        const params = { ...this.generateQueryString(1 + i, quantity) };
        const newConfig = axiosConfigAdapter('read', this, data, params);
        queryExportList.push(this.axios(newConfig))
        runInAction(() => {
          this.exportStatus = DataSetExportStatus.exporting;
        })
      }
      return Promise.all(queryExportList).then((resultValue) => {
        const reducer = (accumulator: any[], currentValue: any[]) => [...accumulator, ...currentValue];
        const todataList = (item) => item ? item[this.dataKey] : []
        runInAction(() => {
          this.exportStatus = DataSetExportStatus.progressing;
        })
        const exportAlldate = resultValue.map(todataList).reduce(reducer);
        newResult = this.displayDataTransform(exportAlldate, columnsExport);
        newResult.unshift(columnsExport);
        runInAction(() => {
          this.exportStatus = DataSetExportStatus.success;
        })
        if (isFile) {
          exportExcel(newResult, this.name);
        } else {
          return newResult
        }
      }).catch(() => {
        runInAction(() => {
          this.exportStatus = DataSetExportStatus.failed;
        })
      })
    }
  }

  /**
   * 重置更改
   */
  @action
  reset(): DataSet {
    this.resetInBatch = true;
    this.records = this.originalData.map(record => record.reset());
    this.resetInBatch = false;
    if (this.props.autoCreate && this.records.length === 0) {
      this.create();
    }
    this.fireEvent(DataSetEvents.reset, { dataSet: this, records: this.records });
    return this;
  }

  /**
   * 定位到指定页码，如果paging为true或`server`，则做远程查询，约定当为Tree 状态的server时候 跳转到下一页也就是index为当前的index加上1
   * @param page 页码
   * @return Promise
   */
  page(page: number): Promise<any> {
    if (page > 0 && this.paging) {
      return this.locate((page - 1) * this.pageSize + this.created.length - this.destroyed.length);
    }
    warning(page > 0, 'Page number is incorrect.');
    warning(!!this.paging, 'Can not paging query util the property<paging> of DataSet is true or `server`.');
    return Promise.resolve();
  }

  /**
   * 定位记录
   * @param index 索引
   * @return Promise
   */
  async locate(index: number): Promise<Record | undefined> {
    const { paging, pageSize, totalCount } = this;
    const { modifiedCheck, modifiedCheckMessage, autoLocateFirst } = this.props;
    let currentRecord = this.findInAllPage(index);
    if (currentRecord) {
      this.current = currentRecord;
      return currentRecord;
    }
    if (paging === true || paging === 'server') {
      if (index >= 0 && index < totalCount + this.created.length - this.destroyed.length) {
        if (
          !modifiedCheck ||
          !this.dirty ||
          (await confirm(modifiedCheckMessage || $l('DataSet', 'unsaved_data_confirm'))) !== 'cancel'
        ) {
          await this.query(Math.floor(index / pageSize) + 1);
          currentRecord = this.findInAllPage(index);
          if (currentRecord) {
            this.current = autoLocateFirst ? currentRecord : undefined;
            return currentRecord;
          }
        }
      }
    }
    warning(false, 'Located index of Record is out of boundary.');
    return Promise.resolve(undefined);
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
  @action
  create(data: object = {}, dataIndex?: number): Record {
    if (data === null) {
      data = {};
    }
    const record = new Record(data, this);
    [...record.fields.entries()].forEach(([name, field]) => {
      const defaultValue = field.get('defaultValue');
      const value = ObjectChainValue.get(data, name);
      if (value === undefined && defaultValue !== undefined) {
        record.init(name, toJS(defaultValue));
      }
    });
    if (isNumber(dataIndex)) {
      this.splice(dataIndex, 0, record);
    } else {
      this.push(record);
    }
    if (this.props.autoLocateAfterCreate) {
      this.current = record;
    }
    this.fireEvent(DataSetEvents.create, { dataSet: this, record });
    return record;
  }

  /**
   * 立即删除记录
   * @param records 记录或者记录数组，默认当前记录
   * @param confirmMessage 提示信息或弹窗的属性
   * @return Promise
   */
  async delete(
    records?: Record | Record[],
    confirmMessage?: ReactNode | ModalProps & confirmProps,
  ): Promise<any> {
    if (records) {
      records = ([] as Record[]).concat(records);
      if (
        records.length > 0 &&
        (await this.fireEvent(DataSetEvents.beforeDelete, { dataSet: this, records })) !== false &&
        (confirmMessage === false || (await confirm(confirmMessage && confirmMessage !== true ? confirmMessage : $l('DataSet', 'delete_selected_row_confirm'))) !== 'cancel')
      ) {
        this.remove(records);
        return this.pending.add(this.write(this.destroyed, true));
      }
    }
  }

  /**
   * 临时删除记录
   * @param records 记录或者记录数组
   */
  @action
  remove(records?: Record | Record[]): void {
    if (records) {
      const data = isArrayLike(records) ? records.slice() : [records];
      if (data.length && this.fireEventSync(DataSetEvents.beforeRemove, { dataSet: this, records: data }) !== false) {
        const { current } = this;
        data.forEach(this.deleteRecord, this);
        this.fireEvent(DataSetEvents.remove, { dataSet: this, records: data });
        if (!this.current) {
          let record;
          if (this.props.autoLocateAfterRemove) {
            record = this.get(0);
            if (record) {
              record.isCurrent = true;
            }
          }
          if (current !== record) {
            this.fireEvent(DataSetEvents.indexChange, { dataSet: this, record, previous: current });
          }
        }
      }
    }
  }

  /**
   * 临时删除所有记录
   */
  @action
  removeAll() {
    const { current, data } = this;
    if (data.length) {
      data.forEach(this.deleteRecord, this);
      this.fireEvent(DataSetEvents.remove, { dataSet: this, records: data });
      if (current) {
        this.fireEvent(DataSetEvents.indexChange, { dataSet: this, previous: current });
      }
    }
  }

  /**
   * 删除所有记录
   * @param confirmMessage 提示信息或弹窗的属性
   */
  @action
  async deleteAll(confirmMessage?: ReactNode | ModalProps & confirmProps) {
    if (
      this.records.length > 0 &&
      (confirmMessage === false || (await confirm(confirmMessage && confirmMessage !== true ? confirmMessage : $l('DataSet', 'delete_all_row_confirm'))) !== 'cancel')
    ) {
      this.removeAll();
      return this.pending.add(this.write(this.destroyed, true));
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
    return this.records.push(...this.transferRecords(records));
  }

  /**
   * 将若干数据记录插入记录堆栈底部
   * @param records 数据集
   * @return 堆栈数量
   */
  @action
  unshift(...records: Record[]): number {
    checkParentByInsert(this);
    return this.records.unshift(...this.transferRecords(records));
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
  splice(from: number, deleteCount: number, ...items: Record[]): (Record | undefined)[] {
    const fromRecord = this.get(from);
    const deleted = this.slice(from, from + deleteCount).map(this.deleteRecord, this);
    if (items.length) {
      checkParentByInsert(this);
      const { records } = this;
      const spliceRecord = getSpliceRecord(records, items, fromRecord);
      const transformedRecords = this.transferRecords(items);
      if (spliceRecord) {
        records.splice(records.indexOf(spliceRecord), 0, ...transformedRecords);
      } else {
        records.push(...transformedRecords);
      }
    }
    return deleted;
  }

  /**
   * 切换记录的顺序
   */
  move(from: number, to: number) {
    arrayMove(this.records, from, to);
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
   * @param fromIndex 开始检索的索引
   * @return 索引
   */
  indexOf(record: Record, fromIndex?: number): number {
    return this.data.indexOf(record, fromIndex);
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
   * 为数组中的所有元素调用指定的回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供。
   * @param fn 累计函数
   * @param initialValue 初始值
   * @returns {U}
   */
  reduce<U>(
    fn: (previousValue: U, record: Record, index: number, array: Record[]) => U,
    initialValue: U,
  ): U {
    return this.data.reduce<U>(fn, initialValue);
  }

  /**
   * 按降序调用数组中所有元素的指定回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供。
   * @param fn 累计函数
   * @param initialValue 初始值
   * @returns {U}
   */
  reduceRight<U>(
    fn: (previousValue: U, record: Record, index: number, array: Record[]) => U,
    initialValue: U,
  ): U {
    return this.data.reduceRight<U>(fn, initialValue);
  }

  /**
   * 反转记录的顺序。
   */
  @action
  reverse(): Record[] {
    return (this.records = this.records.reverse());
  }

  /**
   * 服务端排序
   * 排序新增加中间态
   * @param fieldName
   */
  @action
  sort(fieldName: string): void {
    const field = this.getField(fieldName);
    if (field) {
      const currents = getOrderFields(this.fields);
      currents.forEach(current => {
        if (current !== field) {
          current.order = undefined;
        }
      });
      switch (field.order) {
        case SortOrder.asc:
          field.order = SortOrder.desc;
          break;
        case SortOrder.desc:
          field.order = undefined;
          break;
        default:
          field.order = SortOrder.asc;
      }
      if (this.paging || !field.order) {
        this.query();
      } else {
        this.records = this.records.sort(getFieldSorter(field));
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
        if (selection === DataSetSelection.single) {
          this.selected.forEach((selected: Record) => {
            selected.isSelected = false;
            previous = selected;
          });
        }
        if (record) {
          record.isSelected = true;
        }
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
        this.records.forEach(record => {
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
      this.currentSelected.forEach(record => {
        this.unSelect(record);
      });
      this.fireEvent(DataSetEvents.unSelectAll, { dataSet: this });
      this.inBatchSelection = false;
    }
  }

  clearCachedSelected(): void {
    this.setCachedSelected([]);
  }

  @action
  setCachedSelected(cachedSelected: Record[]): void {
    this.cachedSelected = cachedSelected;
  }

  /**
   * 获取指定索引的记录
   * @param index 索引
   * @returns {Record}
   */
  get(index: number): Record | undefined {
    const { data } = this;
    return data.length ? data[index] : undefined;
  }

  /**
   * 从树形数据中获取指定索引的根节点记录
   * @param index 索引
   * @returns {Record}
   */
  getFromTree(index: number): Record | undefined {
    const { treeData } = this;
    return treeData.length ? treeData[index] : undefined;
  }

  /**
   * 判断是否有新增、变更或者删除的记录
   * @deprecated
   * @return true | false
   */
  isModified(): boolean {
    return this.dirty;
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
    if (id !== undefined) {
      return this.records.find(record => String(record.id) === String(id));
    }
  }

  /**
   * 校验数据记录是否有效 对应参数后续会废弃
   * @param isSelected 是否只校验选中记录
   * @param noCascade 是否级联校验
   * @return true | false
   */
  validate(isSelected?: boolean, noCascade?: boolean): Promise<boolean> {
    const dataToJSON = adapterDataToJSON(isSelected, noCascade) || this.dataToJSON;
    const cascade =
      noCascade === undefined && dataToJSON ? useCascade(dataToJSON) : !noCascade;
    const validateResult = Promise.all(
      (useSelected(dataToJSON) ? this.selected : this.data).map(record =>
        record.validate(false, !cascade),
      ),
    ).then(results => results.every(result => result));

    this.fireEvent(DataSetEvents.validate, { dataSet: this, result: validateResult });

    return validateResult;
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
  getGroups(): string[] {
    return this.groups;
  }

  initFields(fields: FieldProps[]): void {
    fields.forEach(field => {
      const { name } = field;
      if (name) {
        this.addField(name, field);
      } else {
        warning(
          false,
          'DataSet create field failed. Please check if property name is exists on field.',
        );
      }
    });
  }

  /*
   * 增加新字段
   * @param name 字段名
   * @param field 字段属性
   * @return 新增字段
   */
  @action
  addField(name: string, fieldProps: FieldProps = {}): Field {
    return processIntlField(
      name,
      fieldProps,
      (langName, langProps) => {
        const field = new Field(langProps, this);
        this.fields.set(langName, field);
        return field;
      },
      this,
    );
  }

  @action
  commitData(allData: any[], total?: number, onlyDelete?: boolean): DataSet {
    const { autoQueryAfterSubmit, primaryKey } = this.props;
    if (this.dataToJSON === DataToJSON.normal) {
      flatMap(this.dirtyRecords).forEach(record =>
        record.commit(omit(record.toData(), ['__dirty']), this),
      );
      // 若有响应数据，进行数据回写
    } else if (allData.length) {
      const statusKey = getConfig('statusKey');
      const status = getConfig('status');
      const restCreatedData: any[] = [];
      const restUpdatedData: any[] = [];
      allData.forEach(data => {
        const dataStatus = data[statusKey];
        // 若有数据中含有__id，根据__id回写记录，否则根据主键回写非新增的记录
        const record = data.__id
          ? this.findRecordById(data.__id)
          : primaryKey &&
          dataStatus !== status[RecordStatus.add] &&
          this.records.find(r => r.get(primaryKey) === data[primaryKey]);
        if (record) {
          record.commit(data, this);
        } else if (dataStatus === status[RecordStatus.add]) {
          restCreatedData.push(data);
        } else if (dataStatus === status[RecordStatus.update]) {
          restUpdatedData.push(data);
        }
      });
      const { created, updated, destroyed } = this;
      // 没有回写成功的新增数据按顺序回写
      if (restCreatedData.length === created.length) {
        created.forEach((r, index) => r.commit(restCreatedData[index], this));
      } else if (autoQueryAfterSubmit) {
        // 若有新增数据没有回写成功， 必须重新查询来获取主键
        this.query();
        return this;
      }
      // 剩下未回写的非新增数据使用原数据进行回写
      if (restUpdatedData.length === updated.length) {
        updated.forEach((r, index) => r.commit(restUpdatedData[index], this));
      } else if (onlyDelete) {
        updated.forEach(r => r.commit(r.toData(), this));
      } else {
        updated.forEach(r => r.commit(omit(r.toData(), ['__dirty']), this));
      }
      destroyed.forEach(r => r.commit(undefined, this));
      if (isNumber(total)) {
        this.totalCount = total;
      }
    } else if (autoQueryAfterSubmit) {
      // 无回写数据时自动进行查询
      warning(
        false,
        `The primary key which generated by database is not exists in each created records,
because of no data \`${this.dataKey}\` from the response by \`submit\` or \`delete\` method.
Then the query method will be auto invoke.`,
      );
      this.query();
    }
    return this;
  }

  /**
   * 数据集头行级联绑定
   * @param ds 头数据集
   * @param name 头数据集字段名
   */
  @action
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
    this.parentName = name;
    const { current } = ds;
    if (current) {
      ds.syncChild(this, current, name);
    } else if (this.length) {
      this.loadData([]);
    }
  }

  /**
   * 设置查询的参数.
   * @param {string} para 参数名.
   * @param {any} value 参数值.
   */
  setQueryParameter(para: string, value: any) {
    if (isNil(value)) {
      delete this.queryParameter[para];
    } else {
      this.queryParameter[para] = value;
    }
  }

  @action
  appendData(allData: (object | Record)[] = []): DataSet {
    const {
      paging,
      pageSize,
    } = this;
    allData = paging ? allData.slice(0, pageSize) : allData;
    this.fireEvent(DataSetEvents.beforeAppend, { dataSet: this, data: allData });
    const appendData = this.processData(allData);
    this.originalData = unionBy(this.originalData, appendData, 'key');
    this.records = unionBy(this.records, appendData, 'key');
    this.fireEvent(DataSetEvents.append, { dataSet: this });
    return this;
  }

  @action
  loadData(allData: (object | Record)[] = [], total?: number): DataSet {
    this.storeSelected();
    const {
      paging,
      pageSize,
      props: { autoLocateFirst, idField, parentField },
    } = this;
    switch (paging) {
      case true:
        allData = allData.slice(0, pageSize);
        break;
      case 'server':
        allData = idField && parentField ? sliceTree(idField, parentField, allData, pageSize) : allData.slice(0, pageSize);
        break;
      default:
        break;
    }
    this.fireEvent(DataSetEvents.beforeLoad, { dataSet: this, data: allData });
    this.originalData = this.processData(allData);
    this.records = this.originalData;
    if (total !== undefined && (paging === true || paging === 'server')) {
      this.totalCount = total;
    } else if (idField && parentField && paging === 'server') {
      // 异步情况复用以前的total
      if (!this.totalCount) {
        this.totalCount = this.treeData.length;
      }
    } else {
      this.totalCount = allData.length;
    }
    this.releaseCachedSelected();
    const nextRecord =
      autoLocateFirst && (idField && parentField ? this.getFromTree(0) : this.get(0));
    if (nextRecord) {
      nextRecord.isCurrent = true;
    }
    this.fireEvent(DataSetEvents.indexChange, { dataSet: this, record: nextRecord });
    this.fireEvent(DataSetEvents.load, { dataSet: this });
    return this;
  }

  @action
  processData(allData: any[]): Record[] {
    return allData.map(data => {
      if (data instanceof Record) {
        if (data.dataSet !== this) {
          data.dataSet = this;
          data.status = RecordStatus.sync;
        }
        return data;
      }
      const record = new Record(data, this);
      record.status = RecordStatus.sync;
      return record;
    });
  }

  private deleteRecord(record?: Record): Record | undefined {
    if (record) {
      record.isSelected = false;
      record.isCurrent = false;
      const { selected, records } = this;
      const selectedIndex = selected.indexOf(record);
      if (selectedIndex !== -1) {
        selected.splice(selectedIndex, 1);
      }
      if (record.isNew) {
        const index = records.indexOf(record);
        if (index !== -1) {
          records.splice(index, 1);
        }
      } else if (!record.isRemoved) {
        record.status = RecordStatus.delete;
      }
    }
    return record;
  }

  // 查询在所有页面的对应位置
  private findInAllPage(index: number): Record | undefined {
    const { paging } = this;
    let indexRecord;
    if (paging === true) {
      indexRecord = this.data[this.getIndexInCurrentPage(index)];
    } else if (paging === 'server') {
      indexRecord = this.treeData[this.getIndexInCurrentPage(index)];
    } else {
      indexRecord = this.data[index];
    }
    return indexRecord;
  }

  private getIndexInCurrentPage(index: number = this.currentIndex): number {
    const { currentPage, pageSize } = this;
    return index - (currentPage - 1) * pageSize;
  }

  private transferRecords(data: Record[]): Record[] {
    return data.map(record => {
      const { dataSet } = record;
      if (dataSet === this) {
        const { records } = this;
        const index = records.indexOf(record);
        if (index !== -1) {
          records.splice(index, 1);
        }
        return record;
      }
      if (dataSet) {
        dataSet.remove(record);
        record = new Record(record.data, this);
      }
      record.dataSet = this;
      record.status = RecordStatus.add;
      return record;
    });
  }

  private initChildren(children: { [key: string]: string | DataSet } | DataSet[]): void {
    if (isArray(children)) {
      children.forEach(childDs => {
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
      Object.keys(children as DataSetChildren).forEach(childName => {
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
      const { dataKey, totalKey } = this;
      const data: object[] = generateResponseData(resp, dataKey);
      const total: number | undefined = ObjectChainValue.get(resp, totalKey);
      this.loadData(data, total);
    }
    return this;
  }

  private appendDataFromResponse(resp: any): DataSet {
    if (resp) {
      const { dataKey } = this;
      const data: object[] = generateResponseData(resp, dataKey);
      this.appendData(data);
    }
    return this;

  }

  // private groupData(allData: object[]): object[] {
  //   return this.getGroups().reverse()
  //     .reduce((arr, name) => arr.sort(
  //       (item1, item2) => String(item1[name]).localeCompare(String(item2[name])),
  //     ), allData);
  // }

  private async write(records: Record[], onlyDelete?: boolean): Promise<any> {
    if (records.length) {
      const [created, updated, destroyed] = prepareSubmitData(records, this.dataToJSON);
      const axiosConfigs: AxiosRequestConfig[] = [];
      const submitData: object[] = [
        ...prepareForSubmit('create', created, axiosConfigs, this),
        ...prepareForSubmit('update', updated, axiosConfigs, this),
        ...prepareForSubmit('destroy', destroyed, axiosConfigs, this),
      ];
      prepareForSubmit('submit', submitData, axiosConfigs, this);
      if (axiosConfigs.length) {
        try {
          this.changeSubmitStatus(DataSetStatus.submitting);
          const submitEventResult = await this.fireEvent(DataSetEvents.submit, {
            dataSet: this,
            data: [...created, ...updated, ...destroyed],
          });
          if (submitEventResult) {
            const result: any[] = await axiosStatic.all(
              axiosConfigs.map(config => this.axios(config)),
            );
            return this.handleSubmitSuccess(result, onlyDelete);
          }
        } catch (e) {
          this.handleSubmitFail(e);
          throw new DataSetRequestError(e);
        } finally {
          this.changeSubmitStatus(DataSetStatus.ready);
        }
      }
    }
  }

  private async read(page: number = 1, params?: object): Promise<any> {
    if (this.checkReadable(this.parent)) {
      try {
        this.changeStatus(DataSetStatus.loading);
        const data = await this.generateQueryParameter(params);
        const newConfig = axiosConfigAdapter('read', this, data, this.generateQueryString(page));
        if (newConfig.url) {
          const queryEventResult = await this.fireEvent(DataSetEvents.query, {
            dataSet: this,
            params: newConfig.params,
            data: newConfig.data,
          });
          if (queryEventResult) {
            const result = await this.axios(fixAxiosConfig(newConfig));
            runInAction(() => {
              if (page >= 0) {
                this.currentPage = page;
              }
            });
            return this.handleLoadSuccess(result);
          }
        }
      } catch (e) {
        this.handleLoadFail(e);
        throw new DataSetRequestError(e);
      } finally {
        this.changeStatus(DataSetStatus.ready);
      }
    }
  }

  @action
  private storeSelected() {
    if (this.cacheSelectionKeys) {
      this.setCachedSelected([
        ...this.cachedSelected.filter(record => record.isSelected),
        ...this.currentSelected.map(record => {
          record.isCurrent = false;
          record.isCached = true;
          return record;
        }),
      ]);
    }
  }

  @action
  releaseCachedSelected() {
    const { cacheSelectionKeys, cachedSelected } = this;
    if (cacheSelectionKeys) {
      this.data.forEach(record => {
        const index = cachedSelected.findIndex(cached =>
          cacheSelectionKeys.every(key => record.get(key) === cached.get(key)),
        );
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

  private handleCascade({
    dataSet,
    record,
    previous,
  }: {
    dataSet: DataSet;
    record?: Record;
    previous?: Record;
  }) {
    if (dataSet.hasChildren) {
      dataSet.syncChildren(record, previous);
    }
  }

  private handleLoadSuccess(resp: any) {
    const { loadSuccess = defaultFeedback.loadSuccess } = this.feedback;
    loadSuccess(resp);
    return resp;
  }

  private handleLoadFail(e) {
    const { loadFailed = defaultFeedback.loadFailed } = this.feedback;
    this.fireEvent(DataSetEvents.loadFailed, { dataSet: this });
    loadFailed(e);
  }

  private handleSubmitSuccess(resp: any[], onlyDelete?: boolean) {
    const { dataKey, totalKey } = this;
    const { submitSuccess = defaultFeedback.submitSuccess } = this.feedback;
    const data: {
      [props: string]: any
    }[] = [];
    let total;
    resp.forEach(item => {
      data.push(...generateResponseData(item, dataKey));
      if (totalKey && isObject(item)) {
        const myTotal = ObjectChainValue.get(item, totalKey);
        if (!isNil(myTotal)) {
          total = myTotal;
        }
      }
    });
    const result = dataKey ? { success: true } : data;
    if (dataKey) {
      ObjectChainValue.set(result, dataKey, data);
      if (totalKey) {
        ObjectChainValue.set(result, totalKey, total);
      }
    }
    this.fireEvent(DataSetEvents.submitSuccess, { dataSet: this, data: result });
    // 针对 204 的情况进行特殊处理
    // 不然在设置了 primaryKey 的情况 下,在先新增一条再使用delete的情况下，会将204这个请求内容填入到record中
    if (!(data[0] && data[0].status === 204 && data[0].statusText === 'No Content')) {
      this.commitData(data, total, onlyDelete);
    } else {
      this.commitData([], total);
    }
    submitSuccess(result);
    return result;
  }

  @action
  private handleSubmitFail(e) {
    const { current } = this;
    const { submitFailed = defaultFeedback.submitFailed } = this.feedback;
    this.fireEvent(DataSetEvents.submitFailed, { dataSet: this });
    submitFailed(e);
    if (this.props.autoLocateAfterRemove && current && this.destroyed.length) {
      current.isCurrent = false;
    }
    this.destroyed.forEach((record, index) => {
      record.reset();
      record.isSelected = true;
      if (this.props.autoLocateAfterRemove && index === 0) {
        record.isCurrent = true;
      }
    });
  }

  private syncChildren(current?: Record, previous?: Record) {
    const { children } = this;
    const keys: string[] = Object.keys(children);
    const remoteKeys: string[] = [];
    keys.forEach(childName => {
      const ds = children[childName];
      if (previous && ds.status === DataSetStatus.ready && previous.dataSetSnapshot[childName]) {
        previous.dataSetSnapshot[childName] = ds.snapshot();
        ds.current = undefined;
      }
      if (current) {
        const snapshot = current.dataSetSnapshot[childName];
        if (snapshot instanceof DataSetSnapshot) {
          ds.restore(snapshot);
        } else if (!this.syncChild(ds, current, childName, true)) {
          ds.loadData([]);
          remoteKeys.push(childName);
        }
      } else {
        ds.loadData([]);
      }
    });
    if (current && remoteKeys.length) {
      this.syncChildrenRemote(remoteKeys, current);
    }
  }

  @action
  private syncChild(
    ds: DataSet,
    currentRecord: Record,
    childName: string,
    onlyClient?: boolean,
  ): boolean {
    const cascadeRecords = currentRecord.cascadeRecordsMap[childName];
    const childRecords = cascadeRecords || currentRecord.get(childName);
    if (currentRecord.isNew || isArrayLike(childRecords)) {
      if (cascadeRecords) {
        delete currentRecord.cascadeRecordsMap[childName];
      }
      ds.clearCachedSelected();
      ds.loadData(childRecords ? childRecords.slice() : []);
      if (currentRecord.isNew) {
        if (ds.length) {
          ds.forEach(record => (record.status = RecordStatus.add));
        } else if (ds.props.autoCreate) {
          ds.create();
        }
      }
      currentRecord.dataSetSnapshot[childName] = ds.snapshot();
      return true;
    }
    if (!onlyClient) {
      const oldSnapshot = ds.snapshot();
      ds.read(1).then(resp => {
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
      if (!current || current.isNew) {
        return false;
      }
    }
    return true;
  }

  /**
   * page相关请求设置
   * @param page 在那个页面, 小于0时不分页
   * @param pageSizeInner 页面大小
   */
  private generatePageQueryString(page: number, pageSizeInner?: number): { page?: number, pagesize?: number | undefined } {
    if (page >= 0) {
      const { paging, pageSize } = this;
      if (isNumber(pageSizeInner)) {
        return { page, pagesize: pageSizeInner };
      }
      if (paging === true || paging === 'server') {
        return { page, pagesize: pageSize };
      }
    }
    return {};
  }

  private generateOrderQueryString(): { sortname?: string; sortorder?: string } {
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

  /**
   * 返回configure 配置的值
   * @param page 在那个页面, 小于0时不分页
   * @param pageSizeInner 页面大小
   */
  private generateQueryString(page: number, pageSizeInner?: number) {
    const order = this.generateOrderQueryString();
    const pageQuery = this.generatePageQueryString(page, pageSizeInner);
    const generatePageQuery = getConfig('generatePageQuery');
    if (typeof generatePageQuery === 'function') {
      return generatePageQuery({
        sortName: order.sortname,
        sortOrder: order.sortorder,
        pageSize: pageQuery.pagesize,
        page: pageQuery.page,
      });
    }
    return { ...pageQuery, ...order };
  }

  private getParentParams(): object {
    const {
      parent,
      props: { cascadeParams },
    } = this;
    if (parent) {
      const {
        props: { primaryKey },
        current,
      } = parent;
      if (current) {
        return cascadeParams!(current, primaryKey);
      }
    }
    return {};
  }

  private async generateQueryParameter(params?: object): Promise<any> {
    const { queryDataSet, props: { validateBeforeQuery } } = this;
    const parentParams = this.getParentParams();
    if (queryDataSet) {
      await queryDataSet.ready();
      if (validateBeforeQuery && !(await queryDataSet.validate())) {
        throw new Error($l('DataSet', 'invalid_query_dataset'));
      }
    }
    let data: any = {};
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        data = omit(current.toData(true), ['__dirty']);
      }
    }
    data = {
      ...data,
      ...this.queryParameter,
      ...parentParams,
      ...params,
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
