import { __decorate } from "tslib";
import { action, computed, get, isArrayLike, observable, runInAction, set, toJS, } from 'mobx';
import axiosStatic from 'axios';
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
import XLSX from 'xlsx';
import localeContext, { $l } from '../locale-context';
import axios from '../axios';
import Record from './Record';
import Field from './Field';
import { adapterDataToJSON, axiosConfigAdapter, checkParentByInsert, doExport, findBindFieldBy, generateData, generateJSONData, generateResponseData, getFieldSorter, getOrderFields, isDirtyRecord, prepareForSubmit, prepareSubmitData, processIntlField, sortTree, useCascade, useSelected, sliceTree, findRootParent, arrayMove, processExportValue, getSplitValue, } from './utils';
import EventManager from '../_util/EventManager';
import DataSetSnapshot from './DataSetSnapshot';
import confirm from '../modal/confirm';
import isEmpty from '../_util/isEmpty';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import Transport from './Transport';
import PromiseQueue from '../_util/PromiseQueue';
import DataSetRequestError from './DataSetRequestError';
import defaultFeedback from './FeedBack';
export default class DataSet extends EventManager {
    constructor(props) {
        super();
        this.children = {};
        this.pending = new PromiseQueue();
        this.originalData = [];
        this.resetInBatch = false;
        this.inBatchSelection = false;
        this.syncChildrenRemote = debounce((remoteKeys, current) => {
            const { children } = this;
            remoteKeys.forEach(childName => this.syncChild(children[childName], current, childName));
        }, 300);
        runInAction(() => {
            props = { ...DataSet.defaultProps, ...props };
            this.props = props;
            const { data, fields, queryFields, queryDataSet, autoQuery, autoCreate, pageSize, selection, events, id, name, children, queryParameter = {}, dataToJSON, } = props;
            this.name = name;
            this.dataToJSON = dataToJSON;
            this.records = [];
            this.fields = observable.map();
            this.totalCount = 0;
            this.status = "ready" /* ready */;
            this.currentPage = 1;
            this.cachedSelected = [];
            this.queryParameter = queryParameter;
            this.pageSize = pageSize;
            this.selection = selection;
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
            }
            else if (autoCreate && this.records.length === 0) {
                this.create();
            }
        });
    }
    get axios() {
        return this.props.axios || getConfig('axios') || axios;
    }
    get dataKey() {
        const { dataKey = getConfig('dataKey') } = this.props;
        return dataKey;
    }
    get totalKey() {
        return this.props.totalKey || getConfig('totalKey');
    }
    get lang() {
        return get(this.props, 'lang') || localeContext.locale.lang;
    }
    set lang(lang) {
        runInAction(() => {
            set(this.props, 'lang', lang);
        });
    }
    get queryDataSet() {
        return get(this.props, 'queryDataSet');
    }
    /**
     * 设置查询的DataSet.
     * @param {DataSet} ds DataSet.
     */
    set queryDataSet(ds) {
        runInAction(() => {
            set(this.props, 'queryDataSet', ds);
            if (ds) {
                // 初始化时如果直接执行create，mobx会报错，所以使用了defer
                ds.pending.add(new Promise(reslove => {
                    defer(() => {
                        if (ds.records.length === 0) {
                            ds.create();
                        }
                        else if (!ds.current) {
                            ds.first();
                        }
                        reslove();
                    });
                }));
            }
        });
    }
    get queryUrl() {
        return get(this.props, 'queryUrl') || (this.name && `/dataset/${this.name}/queries`);
    }
    /**
     * 设置提交的Url.
     * @param {String} url 提交的Url.
     */
    set queryUrl(url) {
        runInAction(() => {
            set(this.props, 'queryUrl', url);
        });
    }
    get submitUrl() {
        return get(this.props, 'submitUrl') || (this.name && `/dataset/${this.name}/mutations`);
    }
    /**
     * 设置查询的Url.
     * @param {String} url 查询的Url.
     */
    set submitUrl(url) {
        runInAction(() => {
            set(this.props, 'submitUrl', url);
        });
    }
    get tlsUrl() {
        return get(this.props, 'tlsUrl') || (this.name && `/dataset/${this.name}/languages`);
    }
    /**
     * 设置多语言的Url.
     * @param {String} url 多语言的Url.
     */
    set tlsUrl(url) {
        runInAction(() => {
            set(this.props, 'tlsUrl', url);
        });
    }
    get validateUrl() {
        return get(this.props, 'validateUrl') || (this.name && `/dataset/${this.name}/validate`);
    }
    /**
     * 设置远程校验查询请求的url.
     * @param {String} url 远程校验查询请求的url.
     */
    set validateUrl(url) {
        runInAction(() => {
            set(this.props, 'validateUrl', url);
        });
    }
    get exportUrl() {
        return get(this.props, 'exportUrl') || (this.name && `/dataset/${this.name}/export`);
    }
    /**
     * 设置导出请求的url.
     * @param {String} url 远程校验查询请求的url.
     */
    set exportUrl(url) {
        runInAction(() => {
            set(this.props, 'exportUrl', url);
        });
    }
    /**
     * 服务端导出还是客户端导出
     */
    get exportMode() {
        return this.props.exportMode || getConfig('exportMode') || "server" /* server */;
    }
    set transport(transport) {
        runInAction(() => {
            this.props.transport = transport instanceof Transport ? transport.props : transport;
        });
    }
    get transport() {
        return new Transport(this.props.transport, this);
    }
    get feedback() {
        return {
            ...getConfig('feedback'),
            ...this.props.feedback,
        };
    }
    get data() {
        return this.records.filter(record => !record.isRemoved);
    }
    set data(records) {
        this.loadData(records);
    }
    get dirtyRecords() {
        const created = [];
        const updated = [];
        const destroyed = [];
        this.records.forEach(record => {
            switch (record.status) {
                case "add" /* add */:
                    created.push(record);
                    break;
                case "update" /* update */:
                    updated.push(record);
                    break;
                case "delete" /* delete */:
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
    get created() {
        return this.dirtyRecords[0];
    }
    /**
     * 获取变更的记录集
     * @return 记录集
     */
    get updated() {
        return this.dirtyRecords[1];
    }
    /**
     * 获取删除的记录集
     * @return 记录集
     */
    get destroyed() {
        return this.dirtyRecords[2];
    }
    /**
     * 获取选中的记录集
     * @return 记录集
     */
    get selected() {
        return this.currentSelected.concat(this.cachedSelected.filter(record => record.isSelected));
    }
    get currentSelected() {
        return this.records.filter(record => record.isSelected);
    }
    get totalPage() {
        return this.paging ? Math.ceil(this.totalCount / this.pageSize) : 1;
    }
    // 如果paging为server 返回root父节点的排序
    get currentIndex() {
        const { current, pageSize, currentPage } = this;
        if (current) {
            const index = this.indexOf(current);
            if (index !== -1) {
                if (this.paging === 'server') {
                    const currentParent = findRootParent(current);
                    let parentIndex = -1;
                    this.treeData.forEach((item, indexTree) => {
                        if (this.indexOf(item) === this.indexOf(currentParent)) {
                            parentIndex = indexTree;
                        }
                    });
                    return parentIndex;
                }
                return index + (currentPage - 1) * pageSize;
            }
        }
        return -1;
    }
    set currentIndex(index) {
        this.locate(index);
    }
    /**
     * 记录数
     */
    get length() {
        return this.data.length;
    }
    get hasChildren() {
        return Object.keys(this.children).length > 0;
    }
    get treeRecords() {
        return sortTree(this.records.filter(record => !record.parent), getOrderFields(this.fields)[0]);
    }
    get treeData() {
        return sortTree(this.filter(record => !record.parent), getOrderFields(this.fields)[0]);
    }
    get paging() {
        const { idField, parentField, paging } = this.props;
        return (paging === `server`) && parentField && idField ? paging : (parentField === undefined || idField === undefined) && !!paging;
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
    get current() {
        return (this.data.find(record => record.isCurrent) ||
            this.cachedSelected.find(record => record.isCurrent));
    }
    /**
     * 将记录设定为当前索引
     * @param record 记录
     */
    set current(record) {
        const currentRecord = this.current;
        if (currentRecord !== record && (!record || !record.isCached)) {
            runInAction(() => {
                if (currentRecord) {
                    currentRecord.isCurrent = false;
                }
                if (record && record.dataSet === this) {
                    record.isCurrent = true;
                }
                this.fireEvent("indexChange" /* indexChange */, {
                    dataSet: this,
                    record,
                    previous: currentRecord,
                });
            });
        }
    }
    get uniqueKeys() {
        const { primaryKey } = this.props;
        if (primaryKey) {
            return [primaryKey];
        }
        const keys = [];
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
    get cacheSelectionKeys() {
        const { cacheSelection, selection } = this.props;
        if (cacheSelection && selection === "multiple" /* multiple */) {
            return this.uniqueKeys;
        }
        return undefined;
    }
    /**
     * 获取所有记录包括缓存的选择记录
     * @param index 索引
     * @returns {Record}
     */
    get all() {
        return this.records.concat(this.cachedSelected.slice());
    }
    get dirty() {
        return this.records.some(isDirtyRecord);
    }
    processListener() {
        this.addEventListener("indexChange" /* indexChange */, this.handleCascade);
    }
    destroy() {
        this.clear();
    }
    snapshot() {
        return new DataSetSnapshot(this);
    }
    restore(snapshot) {
        if (snapshot.dataSet !== this) {
            this.events = {};
        }
        else if (snapshot.events) {
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
    toData() {
        return generateData(this).data;
    }
    toJSONData(isSelected, noCascade) {
        const dataToJSON = adapterDataToJSON(isSelected, noCascade);
        if (dataToJSON) {
            this.dataToJSON = dataToJSON;
        }
        return generateJSONData(this).data;
    }
    /**
     * 等待选中或者所有记录准备就绪
     * @returns Promise
     */
    ready(isSelect) {
        return Promise.all([
            this.pending.ready(),
            ...(isSelect || useSelected(this.dataToJSON) ? this.selected : this.data).map(record => record.ready()),
            ...[...this.fields.values()].map(field => field.ready()),
        ]);
    }
    /**
     * 查询记录
     * @param page 页码
     * @return Promise
     */
    query(page) {
        return this.pending.add(this.doQuery(page));
    }
    async doQuery(page) {
        const data = await this.read(page);
        this.loadDataFromResponse(data);
        return data;
    }
    /**
     * 将数据集中的增删改的记录进行远程提交
     * @param isSelect 如果为true，则只提交选中记录
     * @param noCascade 如果为true，则不提交级联数据
     * @return Promise
     */
    async submit(isSelect, noCascade) {
        const dataToJSON = adapterDataToJSON(isSelect, noCascade);
        if (dataToJSON) {
            this.dataToJSON = dataToJSON;
        }
        await this.ready();
        if (await this.validate()) {
            return this.pending.add(this.write(useSelected(this.dataToJSON) ? this.selected : this.records));
        }
        return false;
    }
    /**
     * 导出数据
     * @param object columns 导出的列
     * @param number exportQuantity 导出数量
     */
    async export(columns = {}, exportQuantity = 0) {
        if (this.checkReadable(this.parent) && (await this.ready())) {
            const data = await this.generateQueryParameter();
            data._HAP_EXCEL_EXPORT_COLUMNS = columns;
            const { totalCount, totalKey } = this;
            const params = { _r: Date.now(), ...this.generateOrderQueryString() };
            ObjectChainValue.set(params, totalKey, totalCount);
            const newConfig = axiosConfigAdapter('exports', this, data, params);
            if (newConfig.url) {
                if ((await this.fireEvent("export" /* export */, {
                    dataSet: this,
                    params: newConfig.params,
                    data: newConfig.data,
                })) !== false) {
                    const ExportQuantity = exportQuantity > 1000 ? 1000 : exportQuantity;
                    if (this.exportMode === "client" /* client */) {
                        this.doClientExport(data, ExportQuantity);
                    }
                    else {
                        doExport(this.axios.getUri(newConfig), newConfig.data, newConfig.method);
                    }
                }
            }
            else {
                warning(false, 'Unable to execute the export method of dataset, please check the ');
            }
        }
    }
    async doClientExport(data, quantity) {
        const columnsExport = data._HAP_EXCEL_EXPORT_COLUMNS;
        delete data._HAP_EXCEL_EXPORT_COLUMNS;
        const params = { ...this.generateQueryString(1, quantity) };
        const newConfig = axiosConfigAdapter('read', this, data, params);
        const result = await this.axios(newConfig);
        const newResult = [];
        if (result[this.dataKey] && result[this.dataKey].length > 0) {
            const processData = toJS(this.processData(result[this.dataKey])).map((item) => item.data);
            processData.forEach((itemValue) => {
                const dataItem = {};
                const columnsExportkeys = Object.keys(columnsExport);
                for (let i = 0; i < columnsExportkeys.length; i += 1) {
                    const firstRecord = this.records[0] || this;
                    const exportField = firstRecord.getField(columnsExportkeys[i]);
                    let processItemValue = getSplitValue(toJS(itemValue), columnsExportkeys[i]);
                    // 处理bind 情况
                    if (exportField && isNil(processItemValue) && exportField.get('bind')) {
                        processItemValue = getSplitValue(getSplitValue(toJS(itemValue), exportField.get('bind')), columnsExportkeys[i], true);
                    }
                    dataItem[columnsExportkeys[i]] = processExportValue(processItemValue, exportField);
                }
                newResult.push(dataItem);
            });
        }
        newResult.unshift(columnsExport);
        const ws = XLSX.utils.json_to_sheet(newResult, { skipHeader: true }); /* 新建空workbook，然后加入worksheet */
        const wb = XLSX.utils.book_new(); /* 新建book */
        XLSX.utils.book_append_sheet(wb, ws); /* 生成xlsx文件(book,sheet数据,sheet命名) */
        XLSX.writeFile(wb, `${this.name}.xlsx`); /* 写文件(book,xlsx文件名称) */
    }
    /**
     * 重置更改
     */
    reset() {
        this.resetInBatch = true;
        this.records = this.originalData.map(record => record.reset());
        this.resetInBatch = false;
        if (this.props.autoCreate && this.records.length === 0) {
            this.create();
        }
        this.fireEvent("reset" /* reset */, { dataSet: this, records: this.records });
        return this;
    }
    /**
     * 定位到指定页码，如果paging为true或`server`，则做远程查询，约定当为Tree 状态的server时候 跳转到下一页也就是index为当前的index加上1
     * @param page 页码
     * @return Promise
     */
    page(page) {
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
    async locate(index) {
        const { paging, pageSize, totalCount } = this;
        const { modifiedCheck, modifiedCheckMessage, autoLocateFirst } = this.props;
        let currentRecord = this.findInAllPage(index);
        if (currentRecord) {
            this.current = currentRecord;
            return currentRecord;
        }
        if (paging === true || paging === 'server') {
            if (index >= 0 && index < totalCount + this.created.length - this.destroyed.length) {
                if (!modifiedCheck ||
                    !this.dirty ||
                    (await confirm(modifiedCheckMessage || $l('DataSet', 'unsaved_data_confirm'))) !== 'cancel') {
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
    first() {
        return this.locate(0);
    }
    /**
     * 定位到最后一条记录
     * @return Promise
     */
    last() {
        return this.locate((this.paging ? this.totalCount : this.length) - 1);
    }
    /**
     * 定位到当前记录的上一条记录
     * 若当前页中当前记录为第一条记录且有上一页，则会查询上一页并定位到上一页的最后一条记录
     * @return Promise
     */
    pre() {
        return this.locate(this.currentIndex - 1);
    }
    /**
     * 定位到当前记录的下一条记录
     * 若当前页中当前记录为最后一条记录且有下一页，则会查询下一页并定位到下一页的第一条记录
     * @return Promise
     */
    next() {
        return this.locate(this.currentIndex + 1);
    }
    /**
     * 定位到首页
     * @return Promise
     */
    firstPage() {
        return this.page(1);
    }
    /**
     * 定位到上一页
     * @return Promise
     */
    prePage() {
        return this.page(this.currentPage - 1);
    }
    /**
     * 定位到下一页
     * @return Promise
     */
    nextPage() {
        return this.page(this.currentPage + 1);
    }
    /**
     * 定位到尾页
     * @return Promise
     */
    lastPage() {
        return this.page(this.totalPage);
    }
    /**
     * 创建一条记录
     * @param data 数据对象
     * @param dataIndex 记录所在的索引
     * @return 新建的记录
     */
    create(data = {}, dataIndex) {
        if (data === null) {
            data = {};
        }
        [...this.fields.entries()].forEach(([name, field]) => {
            const defaultValue = field.get('defaultValue');
            const value = ObjectChainValue.get(data, name);
            if (value === undefined && defaultValue !== undefined) {
                ObjectChainValue.set(data, name, toJS(defaultValue));
            }
        });
        const record = new Record(data, this);
        if (isNumber(dataIndex)) {
            this.splice(dataIndex, 0, record);
        }
        else {
            this.push(record);
        }
        if (this.props.autoLocateAfterCreate) {
            this.current = record;
        }
        this.fireEvent("create" /* create */, { dataSet: this, record });
        return record;
    }
    /**
     * 立即删除记录
     * @param records 记录或者记录数组，默认当前记录
     * @param confirmMessage 提示信息或弹窗的属性
     * @return Promise
     */
    async delete(records, confirmMessage) {
        if (records) {
            records = [].concat(records);
            if (records.length > 0 &&
                (await this.fireEvent("beforeDelete" /* beforeDelete */, { dataSet: this, records })) !== false &&
                (await confirm(confirmMessage || $l('DataSet', 'delete_selected_row_confirm'))) !== 'cancel') {
                this.remove(records);
                return this.pending.add(this.write(this.destroyed));
            }
        }
    }
    /**
     * 临时删除记录
     * @param records 记录或者记录数组
     */
    remove(records) {
        if (records) {
            const data = isArrayLike(records) ? records.slice() : [records];
            if (data.length) {
                const { current } = this;
                data.forEach(this.deleteRecord, this);
                this.fireEvent("remove" /* remove */, { dataSet: this, records: data });
                if (!this.current) {
                    let record;
                    if (this.props.autoLocateAfterRemove) {
                        record = this.get(0);
                        if (record) {
                            record.isCurrent = true;
                        }
                    }
                    if (current !== record) {
                        this.fireEvent("indexChange" /* indexChange */, { dataSet: this, record, previous: current });
                    }
                }
            }
        }
    }
    /**
     * 临时删除所有记录
     */
    removeAll() {
        const { current, data } = this;
        if (data.length) {
            data.forEach(this.deleteRecord, this);
            this.fireEvent("remove" /* remove */, { dataSet: this, records: data });
            if (current) {
                this.fireEvent("indexChange" /* indexChange */, { dataSet: this, previous: current });
            }
        }
    }
    /**
     * 删除所有记录
     * @param confirmMessage 提示信息或弹窗的属性
     */
    async deleteAll(confirmMessage) {
        if (this.records.length > 0 &&
            (await confirm(confirmMessage || $l('DataSet', 'delete_all_row_confirm'))) !== 'cancel') {
            this.removeAll();
            return this.pending.add(this.write(this.destroyed));
        }
    }
    /**
     * 将若干数据记录插入记录堆栈顶部
     * @param records 数据集
     * @return 堆栈数量
     */
    push(...records) {
        checkParentByInsert(this);
        return this.records.push(...this.transferRecords(records));
    }
    /**
     * 将若干数据记录插入记录堆栈底部
     * @param records 数据集
     * @return 堆栈数量
     */
    unshift(...records) {
        checkParentByInsert(this);
        return this.records.unshift(...this.transferRecords(records));
    }
    /**
     * 从记录堆栈顶部获取记录
     * @return 记录
     */
    pop() {
        return this.deleteRecord(this.data.pop());
    }
    /**
     * 从记录堆栈底部获取记录
     * @return 记录
     */
    shift() {
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
    splice(from, deleteCount, ...items) {
        const fromRecord = this.get(from);
        const deleted = this.slice(from, from + deleteCount).map(this.deleteRecord, this);
        if (items.length) {
            checkParentByInsert(this);
            const { records } = this;
            const transformedRecords = this.transferRecords(items);
            if (fromRecord) {
                records.splice(records.indexOf(fromRecord), 0, ...transformedRecords);
            }
            else {
                records.push(...transformedRecords);
            }
        }
        return deleted;
    }
    /**
     * 切换记录的顺序
     */
    move(from, to) {
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
    slice(start = 0, end = this.length) {
        return this.data.slice(start, end);
    }
    /**
     * 获取记录所在的索引
     * @param record 记录
     * @param fromIndex 开始检索的索引
     * @return 索引
     */
    indexOf(record, fromIndex) {
        return this.data.indexOf(record, fromIndex);
    }
    /**
     * 根据函数查找记录
     * @param fn 查询函数
     * @returns 记录
     */
    find(fn) {
        return this.data.find(fn);
    }
    /**
     * 根据函数查找记录所在的索引
     * @param fn 查询函数
     * @returns 索引
     */
    findIndex(fn) {
        return this.data.findIndex(fn);
    }
    /**
     * 根据函数遍历
     * @param fn 遍历函数
     * @param thisArg this对象
     */
    forEach(fn, thisArg) {
        this.data.forEach(fn, thisArg);
    }
    /**
     * 根据函数遍历并输出新数组
     * @param fn 遍历函数
     * @param thisArg this对象
     * @returns 输出新数组
     */
    map(fn, thisArg) {
        return this.data.map(fn, thisArg);
    }
    /**
     * 根据函数遍历，当有返回值为true时，输出true
     * @param fn 遍历函数
     * @param thisArg this对象
     * @returns boolean
     */
    some(fn, thisArg) {
        return this.data.some(fn, thisArg);
    }
    /**
     * 根据函数遍历，当有返回值为false时，输出false
     * @param fn 遍历函数
     * @param thisArg this对象
     * @returns boolean
     */
    every(fn, thisArg) {
        return this.data.every(fn, thisArg);
    }
    /**
     * 根据函数过滤并返回记录集
     * @param fn 过滤函数
     * @param thisArg this对象
     * @returns {Record[]}
     */
    filter(fn, thisArg) {
        return this.data.filter(fn, thisArg);
    }
    /**
     * 为数组中的所有元素调用指定的回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供。
     * @param fn 累计函数
     * @param initialValue 初始值
     * @returns {U}
     */
    reduce(fn, initialValue) {
        return this.data.reduce(fn, initialValue);
    }
    /**
     * 按降序调用数组中所有元素的指定回调函数。 回调函数的返回值是累计结果，并在下次调用回调函数时作为参数提供。
     * @param fn 累计函数
     * @param initialValue 初始值
     * @returns {U}
     */
    reduceRight(fn, initialValue) {
        return this.data.reduceRight(fn, initialValue);
    }
    /**
     * 反转记录的顺序。
     */
    reverse() {
        return (this.records = this.records.reverse());
    }
    /**
     * 服务端排序
     * 排序新增加中间态
     * @param fieldName
     */
    sort(fieldName) {
        const field = this.getField(fieldName);
        if (field) {
            const currents = getOrderFields(this.fields);
            currents.forEach(current => {
                if (current !== field) {
                    current.order = undefined;
                }
            });
            switch (field.order) {
                case "asc" /* asc */:
                    field.order = "desc" /* desc */;
                    break;
                case "desc" /* desc */:
                    field.order = undefined;
                    break;
                default:
                    field.order = "asc" /* asc */;
            }
            if (this.paging || !field.order) {
                this.query();
            }
            else {
                this.records = this.records.sort(getFieldSorter(field));
            }
        }
    }
    /**
     * 选中记录
     * @param recordOrIndex 记录或记录索引
     */
    select(recordOrIndex) {
        const { selection } = this;
        if (selection) {
            let record = recordOrIndex;
            if (isNumber(recordOrIndex)) {
                record = this.get(recordOrIndex);
            }
            if (record && record.selectable && !record.isSelected) {
                let previous;
                if (selection === "single" /* single */) {
                    this.selected.forEach((selected) => {
                        selected.isSelected = false;
                        previous = selected;
                    });
                }
                if (record) {
                    record.isSelected = true;
                }
                if (!this.inBatchSelection) {
                    this.fireEvent("select" /* select */, { dataSet: this, record, previous });
                }
            }
        }
    }
    /**
     * 取消选中记录
     * @param recordOrIndex 记录或记录索引
     */
    unSelect(recordOrIndex) {
        if (this.selection) {
            let record = recordOrIndex;
            if (isNumber(recordOrIndex)) {
                record = this.get(recordOrIndex);
            }
            if (record && record.selectable && record.isSelected) {
                record.isSelected = false;
                if (!this.inBatchSelection) {
                    const cachedIndex = this.cachedSelected.indexOf(record);
                    if (cachedIndex !== -1) {
                        this.cachedSelected.splice(cachedIndex, 1);
                    }
                    this.fireEvent("unSelect" /* unSelect */, { dataSet: this, record });
                }
            }
        }
    }
    /**
     * 全选
     */
    selectAll(filter) {
        const { selection } = this;
        if (selection) {
            this.inBatchSelection = true;
            if (selection === "single" /* single */) {
                if (!this.currentSelected.length) {
                    this.select(filter ? this.filter(filter)[0] : 0);
                }
            }
            else {
                this.records.forEach(record => {
                    if (!filter || filter(record) !== false) {
                        this.select(record);
                    }
                });
            }
            this.fireEvent("selectAll" /* selectAll */, { dataSet: this });
            this.inBatchSelection = false;
        }
    }
    /**
     * 取消全选
     */
    unSelectAll() {
        if (this.selection) {
            this.inBatchSelection = true;
            this.currentSelected.forEach(record => {
                this.unSelect(record);
            });
            this.fireEvent("unSelectAll" /* unSelectAll */, { dataSet: this });
            this.inBatchSelection = false;
        }
    }
    clearCachedSelected() {
        this.setCachedSelected([]);
    }
    setCachedSelected(cachedSelected) {
        this.cachedSelected = cachedSelected;
    }
    /**
     * 获取指定索引的记录
     * @param index 索引
     * @returns {Record}
     */
    get(index) {
        const { data } = this;
        return data.length ? data[index] : undefined;
    }
    /**
     * 从树形数据中获取指定索引的根节点记录
     * @param index 索引
     * @returns {Record}
     */
    getFromTree(index) {
        const { treeData } = this;
        return treeData.length ? treeData[index] : undefined;
    }
    /**
     * 判断是否有新增、变更或者删除的记录
     * @deprecated
     * @return true | false
     */
    isModified() {
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
    findRecordById(id) {
        if (id !== undefined) {
            return this.records.find(record => String(record.id) === String(id));
        }
    }
    /**
     * 校验数据记录是否有效
     * @param isSelected 是否只校验选中记录
     * @param noCascade 是否级联校验
     * @return true | false
     */
    validate(isSelected, noCascade) {
        const dataToJSON = adapterDataToJSON(isSelected, noCascade);
        if (dataToJSON) {
            this.dataToJSON = dataToJSON;
        }
        const cascade = noCascade === undefined && this.dataToJSON ? useCascade(this.dataToJSON) : !noCascade;
        const validateResult = Promise.all((useSelected(this.dataToJSON) ? this.selected : this.data).map(record => record.validate(false, !cascade))).then(results => results.every(result => result));
        this.fireEvent("validate" /* validate */, { dataSet: this, result: validateResult });
        return validateResult;
    }
    /**
     * 根据字段名获取字段
     * @param fieldName 字段名
     * @returns 字段
     */
    getField(fieldName) {
        if (fieldName) {
            return this.fields.get(fieldName);
        }
    }
    /**
     * 获取分组字段名
     * @returns 字段名列表
     */
    getGroups() {
        return [...this.fields.entries()]
            .reduce((arr, [name, field]) => {
            const group = field.get('group');
            if (isNumber(group)) {
                arr[group] = name;
            }
            else if (group === true && !arr[0]) {
                arr[0] = name;
            }
            return arr;
        }, [])
            .filter(group => group !== undefined);
    }
    initFields(fields) {
        fields.forEach(field => {
            const { name } = field;
            if (name) {
                this.addField(name, field);
            }
            else {
                warning(false, 'DataSet create field failed. Please check if property name is exists on field.');
            }
        });
    }
    /*
     * 增加新字段
     * @param name 字段名
     * @param field 字段属性
     * @return 新增字段
     */
    addField(name, fieldProps = {}) {
        return processIntlField(name, fieldProps, (langName, langProps) => {
            const field = new Field(langProps, this);
            this.fields.set(langName, field);
            return field;
        }, this);
    }
    commitData(allData, total) {
        const { autoQueryAfterSubmit, primaryKey } = this.props;
        if (this.dataToJSON === "normal" /* normal */) {
            flatMap(this.dirtyRecords).forEach(record => record.commit(omit(record.toData(), ['__dirty']), this));
            // 若有响应数据，进行数据回写
        }
        else if (allData.length) {
            const statusKey = getConfig('statusKey');
            const status = getConfig('status');
            const restCreatedData = [];
            const restUpdatedData = [];
            allData.forEach(data => {
                const dataStatus = data[statusKey];
                // 若有数据中含有__id，根据__id回写记录，否则根据主键回写非新增的记录
                const record = data.__id
                    ? this.findRecordById(data.__id)
                    : primaryKey &&
                        dataStatus !== status["add" /* add */] &&
                        this.records.find(r => r.get(primaryKey) === data[primaryKey]);
                if (record) {
                    record.commit(data, this);
                }
                else if (dataStatus === status["add" /* add */]) {
                    restCreatedData.push(data);
                }
                else if (dataStatus === status["update" /* update */]) {
                    restUpdatedData.push(data);
                }
            });
            const { created, updated, destroyed } = this;
            // 没有回写成功的新增数据按顺序回写
            if (restCreatedData.length === created.length) {
                created.forEach((r, index) => r.commit(restCreatedData[index], this));
            }
            else if (autoQueryAfterSubmit) {
                // 若有新增数据没有回写成功， 必须重新查询来获取主键
                this.query();
                return this;
            }
            // 剩下未回写的非新增数据使用原数据进行回写
            if (restUpdatedData.length === updated.length) {
                updated.forEach((r, index) => r.commit(restUpdatedData[index], this));
            }
            else {
                updated.forEach(r => r.commit(omit(r.toData(), ['__dirty']), this));
            }
            destroyed.forEach(r => r.commit(undefined, this));
            if (isNumber(total)) {
                this.totalCount = total;
            }
        }
        else if (autoQueryAfterSubmit) {
            // 无回写数据时自动进行查询
            warning(false, `The primary key which generated by database is not exists in each created records,
because of no data \`${this.dataKey}\` from the response by \`submit\` or \`delete\` method.
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
    bind(ds, name) {
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
        }
        else if (this.length) {
            this.loadData([]);
        }
    }
    /**
     * 设置查询的参数.
     * @param {string} para 参数名.
     * @param {any} value 参数值.
     */
    setQueryParameter(para, value) {
        if (isNil(value)) {
            delete this.queryParameter[para];
        }
        else {
            this.queryParameter[para] = value;
        }
    }
    loadData(allData = [], total) {
        this.storeSelected();
        const { paging, pageSize, props: { autoLocateFirst, idField, parentField }, } = this;
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
        this.fireEvent("beforeLoad" /* beforeLoad */, { dataSet: this, data: allData });
        this.originalData = this.processData(allData);
        this.records = this.originalData;
        if (total !== undefined && (paging === true || paging === 'server')) {
            this.totalCount = total;
        }
        else if (idField && parentField && paging === 'server') {
            // 异步情况复用以前的total
            if (!this.totalCount) {
                this.totalCount = this.treeData.length;
            }
        }
        else {
            this.totalCount = allData.length;
        }
        this.releaseCachedSelected();
        const nextRecord = autoLocateFirst && (idField && parentField ? this.getFromTree(0) : this.get(0));
        if (nextRecord) {
            nextRecord.isCurrent = true;
        }
        this.fireEvent("indexChange" /* indexChange */, { dataSet: this, record: nextRecord });
        this.fireEvent("load" /* load */, { dataSet: this });
        return this;
    }
    processData(allData) {
        return allData.map(data => {
            const record = data instanceof Record ? ((data.dataSet = this), data) : new Record(data, this);
            record.status = "sync" /* sync */;
            return record;
        });
    }
    deleteRecord(record) {
        if (record) {
            record.isSelected = false;
            record.isCurrent = false;
            const { selected, records } = this;
            const selectedIndex = selected.indexOf(record);
            if (selectedIndex !== -1) {
                selected.splice(selectedIndex, 1);
            }
            if (record.status === "add" /* add */) {
                const index = records.indexOf(record);
                if (index !== -1) {
                    records.splice(index, 1);
                }
            }
            else if (record.status !== "delete" /* delete */) {
                record.status = "delete" /* delete */;
            }
        }
        return record;
    }
    // 查询在所有页面的对应位置
    findInAllPage(index) {
        const { paging } = this;
        let indexRecord;
        if (paging === true) {
            indexRecord = this.data[this.getIndexInCurrentPage(index)];
        }
        else if (paging === 'server') {
            indexRecord = this.treeData[this.getIndexInCurrentPage(index)];
        }
        else {
            indexRecord = this.data[index];
        }
        ;
        return indexRecord;
    }
    getIndexInCurrentPage(index = this.currentIndex) {
        const { currentPage, pageSize } = this;
        return index - (currentPage - 1) * pageSize;
    }
    transferRecords(data) {
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
            record.status = "add" /* add */;
            return record;
        });
    }
    initChildren(children) {
        if (isArray(children)) {
            children.forEach(childDs => {
                if (childDs instanceof DataSet) {
                    const { name } = childDs;
                    if (name) {
                        childDs.bind(this, name);
                    }
                    else {
                        warning(false, 'cascade DataSet need a name');
                    }
                }
            });
        }
        else {
            Object.keys(children).forEach(childName => {
                const child = children[childName];
                if (child instanceof DataSet) {
                    child.bind(this, childName);
                }
                else {
                    warning(false, `cascade child<${childName}> must be instance of DataSet.`);
                }
            });
        }
    }
    initQueryDataSet(queryDataSet, queryFields) {
        if (queryFields) {
            queryDataSet = new DataSet({
                fields: queryFields,
            });
        }
        if (queryDataSet) {
            this.queryDataSet = queryDataSet;
        }
    }
    initEvents(events) {
        Object.keys(events).forEach(event => this.addEventListener(event, events[event]));
    }
    loadDataFromResponse(resp) {
        if (resp) {
            const { dataKey, totalKey } = this;
            const data = generateResponseData(resp, dataKey);
            const total = ObjectChainValue.get(resp, totalKey);
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
    async write(records) {
        if (records.length) {
            const [created, updated, destroyed] = prepareSubmitData(records, this.dataToJSON);
            const axiosConfigs = [];
            const submitData = [
                ...prepareForSubmit('create', created, axiosConfigs, this),
                ...prepareForSubmit('update', updated, axiosConfigs, this),
                ...prepareForSubmit('destroy', destroyed, axiosConfigs, this),
            ];
            prepareForSubmit('submit', submitData, axiosConfigs, this);
            if (axiosConfigs.length) {
                try {
                    this.changeSubmitStatus("submitting" /* submitting */);
                    const submitEventResult = await this.fireEvent("submit" /* submit */, {
                        dataSet: this,
                        data: [...created, ...updated, ...destroyed],
                    });
                    if (submitEventResult) {
                        const result = await axiosStatic.all(axiosConfigs.map(config => this.axios(config)));
                        return this.handleSubmitSuccess(result);
                    }
                }
                catch (e) {
                    this.handleSubmitFail(e);
                    throw new DataSetRequestError(e);
                }
                finally {
                    this.changeSubmitStatus("ready" /* ready */);
                }
            }
        }
    }
    async read(page = 1) {
        if (this.checkReadable(this.parent)) {
            try {
                const data = await this.generateQueryParameter();
                this.changeStatus("loading" /* loading */);
                const newConfig = axiosConfigAdapter('read', this, data, this.generateQueryString(page));
                if (newConfig.url) {
                    const queryEventResult = await this.fireEvent("query" /* query */, {
                        dataSet: this,
                        params: newConfig.params,
                        data: newConfig.data,
                    });
                    if (queryEventResult) {
                        const result = await this.axios(newConfig);
                        runInAction(() => {
                            this.currentPage = page;
                        });
                        return this.handleLoadSuccess(result);
                    }
                }
            }
            catch (e) {
                this.handleLoadFail(e);
                throw new DataSetRequestError(e);
            }
            finally {
                this.changeStatus("ready" /* ready */);
            }
        }
    }
    storeSelected() {
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
    releaseCachedSelected() {
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
    changeStatus(status) {
        this.status = status;
    }
    changeSubmitStatus(status) {
        this.status = status;
        Object.values(this.children).forEach(ds => {
            if (ds instanceof DataSet) {
                ds.changeSubmitStatus(status);
            }
        });
    }
    handleCascade({ dataSet, record, previous, }) {
        if (dataSet.hasChildren) {
            dataSet.syncChildren(record, previous);
        }
    }
    handleLoadSuccess(resp) {
        const { loadSuccess = defaultFeedback.loadSuccess } = this.feedback;
        loadSuccess(resp);
        return resp;
    }
    handleLoadFail(e) {
        const { loadFailed = defaultFeedback.loadFailed } = this.feedback;
        this.fireEvent("loadFailed" /* loadFailed */, { dataSet: this });
        loadFailed(e);
    }
    handleSubmitSuccess(resp) {
        const { dataKey, totalKey } = this;
        const { submitSuccess = defaultFeedback.submitSuccess } = this.feedback;
        const data = [];
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
        this.fireEvent("submitSuccess" /* submitSuccess */, { dataSet: this, data: result });
        // 针对 204 的情况进行特殊处理
        // 不然在设置了 primaryKey 的情况 下,在先新增一条再使用delete的情况下，会将204这个请求内容填入到record中
        if (!(data[0] && data[0].status === 204 && data[0].statusText === "No Content")) {
            this.commitData(data, total);
        }
        else {
            this.commitData([], total);
        }
        submitSuccess(result);
        return result;
    }
    handleSubmitFail(e) {
        const { current } = this;
        const { submitFailed = defaultFeedback.submitFailed } = this.feedback;
        this.fireEvent("submitFailed" /* submitFailed */, { dataSet: this });
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
    syncChildren(current, previous) {
        const { children } = this;
        const keys = Object.keys(children);
        const remoteKeys = [];
        keys.forEach(childName => {
            const ds = children[childName];
            if (previous && ds.status === "ready" /* ready */ && previous.dataSetSnapshot[childName]) {
                previous.dataSetSnapshot[childName] = ds.snapshot();
                ds.current = undefined;
            }
            if (current) {
                const snapshot = current.dataSetSnapshot[childName];
                if (snapshot instanceof DataSetSnapshot) {
                    ds.restore(snapshot);
                }
                else if (!this.syncChild(ds, current, childName, true)) {
                    ds.loadData([]);
                    remoteKeys.push(childName);
                }
            }
            else {
                ds.loadData([]);
            }
        });
        if (current && remoteKeys.length) {
            this.syncChildrenRemote(remoteKeys, current);
        }
    }
    syncChild(ds, currentRecord, childName, onlyClient) {
        const cascadeRecords = currentRecord.cascadeRecordsMap[childName];
        const childRecords = cascadeRecords || currentRecord.get(childName);
        if (currentRecord.status === "add" /* add */ || isArrayLike(childRecords)) {
            if (cascadeRecords) {
                delete currentRecord.cascadeRecordsMap[childName];
            }
            ds.clearCachedSelected();
            ds.loadData(childRecords ? childRecords.slice() : []);
            if (currentRecord.status === "add" /* add */) {
                if (ds.length) {
                    ds.forEach(record => (record.status = "add" /* add */));
                }
                else if (ds.props.autoCreate) {
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
    checkReadable(parent) {
        if (parent) {
            const { current } = parent;
            if (!current || current.status === "add" /* add */) {
                return false;
            }
        }
        return true;
    }
    /**
     * page相关请求设置
     * @param page 在那个页面
     * @param pageSizeInner 页面大小
     */
    generatePageQueryString(page, pageSizeInner) {
        const { paging, pageSize } = this;
        if (isNumber(pageSizeInner)) {
            return { page, pagesize: pageSizeInner };
        }
        if (paging === true || paging === 'server') {
            return { page, pagesize: pageSize };
        }
        return {};
    }
    generateOrderQueryString() {
        const { fields } = this;
        const orderField = getOrderFields(fields)[0];
        if (orderField) {
            const param = { sortname: orderField.name, sortorder: orderField.order };
            if (orderField.type === "object" /* object */) {
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
     * @param page 在那个页面
     * @param pageSizeInner 页面大小
     */
    generateQueryString(page, pageSizeInner) {
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
    getParentParams() {
        const { parent, props: { cascadeParams }, } = this;
        if (parent) {
            const { props: { primaryKey }, current, } = parent;
            if (current) {
                return cascadeParams(current, primaryKey);
            }
        }
        return {};
    }
    async generateQueryParameter() {
        const { queryDataSet } = this;
        const parentParams = this.getParentParams();
        if (queryDataSet) {
            await queryDataSet.ready();
            if (!(await queryDataSet.validate())) {
                throw new Error($l('DataSet', 'invalid_query_dataset'));
            }
        }
        let data = {};
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
DataSet.defaultProps = {
    autoCreate: false,
    autoQuery: false,
    autoQueryAfterSubmit: true,
    autoLocateFirst: true,
    autoLocateAfterCreate: true,
    autoLocateAfterRemove: true,
    selection: "multiple" /* multiple */,
    modifiedCheck: true,
    pageSize: 10,
    paging: true,
    dataToJSON: "dirty" /* dirty */,
    cascadeParams(parent, primaryKey) {
        if (primaryKey) {
            return { [primaryKey]: parent.get(primaryKey) };
        }
        return omit(parent.toData(), ['__dirty']);
    },
};
__decorate([
    observable
], DataSet.prototype, "parent", void 0);
__decorate([
    observable
], DataSet.prototype, "name", void 0);
__decorate([
    observable
], DataSet.prototype, "parentName", void 0);
__decorate([
    observable
], DataSet.prototype, "records", void 0);
__decorate([
    observable
], DataSet.prototype, "fields", void 0);
__decorate([
    observable
], DataSet.prototype, "props", void 0);
__decorate([
    observable
], DataSet.prototype, "pageSize", void 0);
__decorate([
    observable
], DataSet.prototype, "totalCount", void 0);
__decorate([
    observable
], DataSet.prototype, "status", void 0);
__decorate([
    observable
], DataSet.prototype, "currentPage", void 0);
__decorate([
    observable
], DataSet.prototype, "selection", void 0);
__decorate([
    observable
], DataSet.prototype, "cachedSelected", void 0);
__decorate([
    observable
], DataSet.prototype, "dataToJSON", void 0);
__decorate([
    computed
], DataSet.prototype, "axios", null);
__decorate([
    computed
], DataSet.prototype, "dataKey", null);
__decorate([
    computed
], DataSet.prototype, "totalKey", null);
__decorate([
    computed
], DataSet.prototype, "lang", null);
__decorate([
    computed
], DataSet.prototype, "queryUrl", null);
__decorate([
    computed
], DataSet.prototype, "submitUrl", null);
__decorate([
    computed
], DataSet.prototype, "tlsUrl", null);
__decorate([
    computed
], DataSet.prototype, "validateUrl", null);
__decorate([
    computed
], DataSet.prototype, "exportUrl", null);
__decorate([
    computed
], DataSet.prototype, "transport", null);
__decorate([
    computed
], DataSet.prototype, "feedback", null);
__decorate([
    computed
], DataSet.prototype, "data", null);
__decorate([
    computed
], DataSet.prototype, "dirtyRecords", null);
__decorate([
    computed
], DataSet.prototype, "created", null);
__decorate([
    computed
], DataSet.prototype, "updated", null);
__decorate([
    computed
], DataSet.prototype, "destroyed", null);
__decorate([
    computed
], DataSet.prototype, "selected", null);
__decorate([
    computed
], DataSet.prototype, "currentSelected", null);
__decorate([
    computed
], DataSet.prototype, "totalPage", null);
__decorate([
    computed
], DataSet.prototype, "currentIndex", null);
__decorate([
    computed
], DataSet.prototype, "length", null);
__decorate([
    computed
], DataSet.prototype, "treeRecords", null);
__decorate([
    computed
], DataSet.prototype, "treeData", null);
__decorate([
    computed
], DataSet.prototype, "paging", null);
__decorate([
    computed
], DataSet.prototype, "current", null);
__decorate([
    computed
], DataSet.prototype, "uniqueKeys", null);
__decorate([
    computed
], DataSet.prototype, "cacheSelectionKeys", null);
__decorate([
    computed
], DataSet.prototype, "all", null);
__decorate([
    computed
], DataSet.prototype, "dirty", null);
__decorate([
    action
], DataSet.prototype, "restore", null);
__decorate([
    action
], DataSet.prototype, "reset", null);
__decorate([
    action
], DataSet.prototype, "remove", null);
__decorate([
    action
], DataSet.prototype, "removeAll", null);
__decorate([
    action
], DataSet.prototype, "deleteAll", null);
__decorate([
    action
], DataSet.prototype, "push", null);
__decorate([
    action
], DataSet.prototype, "unshift", null);
__decorate([
    action
], DataSet.prototype, "pop", null);
__decorate([
    action
], DataSet.prototype, "shift", null);
__decorate([
    action
], DataSet.prototype, "splice", null);
__decorate([
    action
], DataSet.prototype, "reverse", null);
__decorate([
    action
], DataSet.prototype, "sort", null);
__decorate([
    action
], DataSet.prototype, "select", null);
__decorate([
    action
], DataSet.prototype, "unSelect", null);
__decorate([
    action
], DataSet.prototype, "selectAll", null);
__decorate([
    action
], DataSet.prototype, "unSelectAll", null);
__decorate([
    action
], DataSet.prototype, "setCachedSelected", null);
__decorate([
    action
], DataSet.prototype, "addField", null);
__decorate([
    action
], DataSet.prototype, "commitData", null);
__decorate([
    action
], DataSet.prototype, "bind", null);
__decorate([
    action
], DataSet.prototype, "loadData", null);
__decorate([
    action
], DataSet.prototype, "processData", null);
__decorate([
    action
], DataSet.prototype, "storeSelected", null);
__decorate([
    action
], DataSet.prototype, "releaseCachedSelected", null);
__decorate([
    action
], DataSet.prototype, "changeStatus", null);
__decorate([
    action
], DataSet.prototype, "changeSubmitStatus", null);
__decorate([
    action
], DataSet.prototype, "handleSubmitFail", null);
__decorate([
    action
], DataSet.prototype, "syncChild", null);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGEtc2V0L0RhdGFTZXQudHN4IiwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQ0wsTUFBTSxFQUNOLFFBQVEsRUFDUixHQUFHLEVBRUgsV0FBVyxFQUNYLFVBQVUsRUFDVixXQUFXLEVBQ1gsR0FBRyxFQUNILElBQUksR0FDTCxNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sV0FBa0QsTUFBTSxPQUFPLENBQUM7QUFDdkUsT0FBTyxJQUFJLE1BQU0sYUFBYSxDQUFDO0FBQy9CLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sT0FBTyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JDLE9BQU8sUUFBUSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sS0FBSyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLEtBQUssTUFBTSxjQUFjLENBQUM7QUFDakMsT0FBTyxRQUFRLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxPQUFPLE1BQU0sZ0NBQWdDLENBQUM7QUFDckQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUN4QixPQUFPLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3RELE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQztBQUM3QixPQUFPLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFDOUIsT0FBTyxLQUE2QixNQUFNLFNBQVMsQ0FBQztBQUNwRCxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLGtCQUFrQixFQUNsQixtQkFBbUIsRUFDbkIsUUFBUSxFQUNSLGVBQWUsRUFDZixZQUFZLEVBQ1osZ0JBQWdCLEVBQ2hCLG9CQUFvQixFQUNwQixjQUFjLEVBQ2QsY0FBYyxFQUNkLGFBQWEsRUFDYixnQkFB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O0lBREMsTUFBTTt3Q0FxQ04iLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL2RhdGEtc2V0L0RhdGFTZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIGFjdGlvbixcbiAgY29tcHV0ZWQsXG4gIGdldCxcbiAgSVJlYWN0aW9uRGlzcG9zZXIsXG4gIGlzQXJyYXlMaWtlLFxuICBvYnNlcnZhYmxlLFxuICBydW5JbkFjdGlvbixcbiAgc2V0LFxuICB0b0pTLFxufSBmcm9tICdtb2J4JztcbmltcG9ydCBheGlvc1N0YXRpYywgeyBBeGlvc0luc3RhbmNlLCBBeGlvc1JlcXVlc3RDb25maWcgfSBmcm9tICdheGlvcyc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgZmxhdE1hcCBmcm9tICdsb2Rhc2gvZmxhdE1hcCc7XG5pbXBvcnQgaXNOdW1iZXIgZnJvbSAnbG9kYXNoL2lzTnVtYmVyJztcbmltcG9ydCBpc0FycmF5IGZyb20gJ2xvZGFzaC9pc0FycmF5JztcbmltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2gvaXNPYmplY3QnO1xuaW1wb3J0IGlzTmlsIGZyb20gJ2xvZGFzaC9pc05pbCc7XG5pbXBvcnQgZGVmZXIgZnJvbSAnbG9kYXNoL2RlZmVyJztcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2gvZGVib3VuY2UnO1xuaW1wb3J0IHdhcm5pbmcgZnJvbSAnY2hvZXJvZG9uLXVpL2xpYi9fdXRpbC93YXJuaW5nJztcbmltcG9ydCB7IGdldENvbmZpZyB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvY29uZmlndXJlJztcbmltcG9ydCBYTFNYIGZyb20gJ3hsc3gnO1xuaW1wb3J0IGxvY2FsZUNvbnRleHQsIHsgJGwgfSBmcm9tICcuLi9sb2NhbGUtY29udGV4dCc7XG5pbXBvcnQgYXhpb3MgZnJvbSAnLi4vYXhpb3MnO1xuaW1wb3J0IFJlY29yZCBmcm9tICcuL1JlY29yZCc7XG5pbXBvcnQgRmllbGQsIHsgRmllbGRQcm9wcywgRmllbGRzIH0gZnJvbSAnLi9GaWVsZCc7XG5pbXBvcnQge1xuICBhZGFwdGVyRGF0YVRvSlNPTixcbiAgYXhpb3NDb25maWdBZGFwdGVyLFxuICBjaGVja1BhcmVudEJ5SW5zZXJ0LFxuICBkb0V4cG9ydCxcbiAgZmluZEJpbmRGaWVsZEJ5LFxuICBnZW5lcmF0ZURhdGEsXG4gIGdlbmVyYXRlSlNPTkRhdGEsXG4gIGdlbmVyYXRlUmVzcG9uc2VEYXRhLFxuICBnZXRGaWVsZFNvcnRlcixcbiAgZ2V0T3JkZXJGaWVsZHMsXG4gIGlzRGlydHlSZWNvcmQsXG4gIHByZXBhcmVGb3JTdWJtaXQsXG4gIHByZXBhcmVTdWJtaXREYXRhLFxuICBwcm9jZXNzSW50bEZpZWxkLFxuICBzb3J0VHJlZSxcbiAgdXNlQ2FzY2FkZSxcbiAgdXNlU2VsZWN0ZWQsXG4gIHNsaWNlVHJlZSxcbiAgZmluZFJvb3RQYXJlbnQsXG4gIGFycmF5TW92ZSxcbiAgcHJvY2Vzc0V4cG9ydFZhbHVlLFxuICBnZXRTcGxpdFZhbHVlLFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBFdmVudE1hbmFnZXIgZnJvbSAnLi4vX3V0aWwvRXZlbnRNYW5hZ2VyJztcbmltcG9ydCBEYXRhU2V0U25hcHNob3QgZnJvbSAnLi9EYXRhU2V0U25hcHNob3QnO1xuaW1wb3J0IGNvbmZpcm0gZnJvbSAnLi4vbW9kYWwvY29uZmlybSc7XG5pbXBvcnQge1xuICBEYXRhU2V0RXZlbnRzLFxuICBEYXRhU2V0U2VsZWN0aW9uLFxuICBEYXRhU2V0U3RhdHVzLFxuICBEYXRhVG9KU09OLFxuICBGaWVsZFR5cGUsXG4gIFJlY29yZFN0YXR1cyxcbiAgU29ydE9yZGVyLFxuICBFeHBvcnRNb2RlLFxufSBmcm9tICcuL2VudW0nO1xuaW1wb3J0IHsgTGFuZyB9IGZyb20gJy4uL2xvY2FsZS1jb250ZXh0L2VudW0nO1xuaW1wb3J0IGlzRW1wdHkgZnJvbSAnLi4vX3V0aWwvaXNFbXB0eSc7XG5pbXBvcnQgKiBhcyBPYmplY3RDaGFpblZhbHVlIGZyb20gJy4uL191dGlsL09iamVjdENoYWluVmFsdWUnO1xuaW1wb3J0IFRyYW5zcG9ydCwgeyBUcmFuc3BvcnRQcm9wcyB9IGZyb20gJy4vVHJhbnNwb3J0JztcbmltcG9ydCBQcm9taXNlUXVldWUgZnJvbSAnLi4vX3V0aWwvUHJvbWlzZVF1ZXVlJztcbmltcG9ydCB7IE1vZGFsUHJvcHMgfSBmcm9tICcuLi9tb2RhbC9Nb2RhbCc7XG5pbXBvcnQgeyBjb25maXJtUHJvcHMgfSBmcm9tICcuLi9tb2RhbC91dGlscyc7XG5pbXBvcnQgRGF0YVNldFJlcXVlc3RFcnJvciBmcm9tICcuL0RhdGFTZXRSZXF1ZXN0RXJyb3InO1xuaW1wb3J0IGRlZmF1bHRGZWVkYmFjaywgeyBGZWVkQmFjayB9IGZyb20gJy4vRmVlZEJhY2snO1xuXG5leHBvcnQgdHlwZSBEYXRhU2V0Q2hpbGRyZW4gPSB7IFtrZXk6IHN0cmluZ106IERhdGFTZXQgfTtcblxuZXhwb3J0IHR5cGUgRXZlbnRzID0geyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB9O1xuXG5leHBvcnQgaW50ZXJmYWNlIERhdGFTZXRQcm9wcyB7XG4gIC8qKlxuICAgKiDllK/kuIDmoIfor4ZcbiAgICogQHNlZSBjaGlsZHJlblxuICAgKi9cbiAgaWQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDlr7nlupTlkI7lj7Bkc+eahG5hbWXvvIznlKjkuo7oh6rliqjnlJ/miJDnuqblrprnmoRzdWJtaXRVcmwsIHF1ZXJ5VXJsLCB0bHNVcmzvvIzkuZ/lj6/nlKjkuo7nuqfogZRcbiAgICogQHNlZSBjaGlsZHJlblxuICAgKi9cbiAgbmFtZT86IHN0cmluZztcbiAgLyoqXG4gICAqIOS4u+mUruWtl+auteWQje+8jOS4gOiIrOeUqOS9nOe6p+iBlOihjOihqOeahOafpeivouWtl+autVxuICAgKi9cbiAgcHJpbWFyeUtleT86IHN0cmluZztcbiAgLyoqXG4gICAqIOivreiogFxuICAgKi9cbiAgbGFuZz86IExhbmc7XG4gIC8qKlxuICAgKiDlrZfmrrXnu4RcbiAgICovXG4gIGZpZWxkcz86IEZpZWxkUHJvcHNbXTtcbiAgLyoqXG4gICAqIOafpeivouWtl+autee7hFxuICAgKi9cbiAgcXVlcnlGaWVsZHM/OiBGaWVsZFByb3BzW107XG4gIC8qKlxuICAgKiDkuovku7ZcbiAgICovXG4gIGV2ZW50cz86IEV2ZW50cztcbiAgLyoqXG4gICAqIOWIneWni+WMluaVsOaNrlxuICAgKi9cbiAgZGF0YT86IG9iamVjdFtdO1xuICAvKipcbiAgICog5Yid5aeL5YyW5ZCO6Ieq5Yqo5p+l6K+iXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvUXVlcnk/OiBib29sZWFuO1xuICAvKipcbiAgICog5o+Q5Lqk5oiQ5Yqf5ZCO5ZON5bqU55qE5pWw5o2u5LiN56ym5ZCI5Zue5YaZ5p2h5Lu25pe26Ieq5Yqo5p+l6K+iXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGF1dG9RdWVyeUFmdGVyU3VibWl0PzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOWIneWni+WMluaXtu+8jOWmguaenOayoeacieiusOW9leS4lGF1dG9RdWVyeeS4umZhbHNl77yM5YiZ6Ieq5Yqo5Yib5bu66K6w5b2VXG4gICAqIEBkZWZhdWx0IGZhbHNlO1xuICAgKi9cbiAgYXV0b0NyZWF0ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDoh6rliqjlrprkvY3liLDnrKzkuIDmnaFcbiAgICogQGRlZmF1bHQgdHJ1ZTtcbiAgICovXG4gIGF1dG9Mb2NhdGVGaXJzdD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDoh6rliqjlrprkvY3liLDmlrDlu7rorrDlvZVcbiAgICogQGRlZmF1bHQgdHJ1ZTtcbiAgICovXG4gIGF1dG9Mb2NhdGVBZnRlckNyZWF0ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDlvZPliY3orrDlvZXooqvliKDpmaTml7boh6rliqjlrprkvY3lhbbku5borrDlvZVcbiAgICogQGRlZmF1bHQgdHJ1ZTtcbiAgICovXG4gIGF1dG9Mb2NhdGVBZnRlclJlbW92ZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDpgInmi6nnmoTmqKHlvI9cbiAgICogQGRlZmF1bHQgXCJtdWx0aXBsZVwiXG4gICAqL1xuICBzZWxlY3Rpb24/OiBEYXRhU2V0U2VsZWN0aW9uIHwgZmFsc2U7XG4gIC8qKlxuICAgKiDmn6Xor6LliY3vvIzlvZPmnInorrDlvZXmm7TmlLnov4fml7bvvIzmmK/lkKborablkYrmj5DnpLpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgbW9kaWZpZWRDaGVjaz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmn6Xor6LliY3vvIzlvZPmnInorrDlvZXmm7TmlLnov4fml7bvvIwg5o+Q56S65L+h5oGv5oiW5by556qX55qE5bGe5oCnIG1vZGlmaWVkQ2hlY2tNZXNzYWdlXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBtb2RpZmllZENoZWNrTWVzc2FnZT86IFJlYWN0Tm9kZSB8IE1vZGFsUHJvcHMgJiBjb25maXJtUHJvcHMsXG4gIC8qKlxuICAgKiDliIbpobXlpKflsI9cbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIHBhZ2VTaXplPzogbnVtYmVyO1xuICAvKipcbiAgICog5YmN56uv5YiG6aG144CB5ZCO56uv5YiG6aG16L+Y5piv5LiN5YiG6aG1XG4gICAqL1xuICBwYWdpbmc/OiBib29sZWFuIHwgJ3NlcnZlcic7XG4gIC8qKlxuICAgKiDmn6Xor6Lov5Tlm57nmoRqc29u5Lit5a+55bqU55qE5pWw5o2u55qEa2V5XG4gICAqIEBkZWZhdWx0IFwicm93c1wiXG4gICAqL1xuICBkYXRhS2V5Pzogc3RyaW5nO1xuICAvKipcbiAgICog5p+l6K+i6L+U5Zue55qEanNvbuS4reWvueW6lOeahOaAu+aVsOeahGtleVxuICAgKiBAZGVmYXVsdCBcInRvdGFsXCJcbiAgICovXG4gIHRvdGFsS2V5Pzogc3RyaW5nO1xuICAvKipcbiAgICog5p+l6K+i5p2h5Lu25pWw5o2u5rqQXG4gICAqL1xuICBxdWVyeURhdGFTZXQ/OiBEYXRhU2V0O1xuICAvKipcbiAgICog5p+l6K+i5Y+C5pWwXG4gICAqL1xuICBxdWVyeVBhcmFtZXRlcj86IG9iamVjdDtcbiAgLyoqXG4gICAqIOafpeivouivt+axgueahHVybFxuICAgKi9cbiAgcXVlcnlVcmw/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiDorrDlvZXmj5DkuqTor7fmsYLnmoR1cmxcbiAgICovXG4gIHN1Ym1pdFVybD86IHN0cmluZztcbiAgLyoqXG4gICAqIOWkmuivreiogOafpeivouivt+axgueahHVybFxuICAgKi9cbiAgdGxzVXJsPzogc3RyaW5nO1xuICAvKipcbiAgICog6L+c56iL5qCh6aqM5p+l6K+i6K+35rGC55qEdXJs44CC5aaC5ZSv5LiA5oCn5qCh6aqM44CCXG4gICAqL1xuICB2YWxpZGF0ZVVybD86IHN0cmluZztcbiAgLyoqXG4gICAqIOWvvOWHuuivt+axgueahHVybFxuICAgKi9cbiAgZXhwb3J0VXJsPzogc3RyaW5nO1xuICAvKipcbiAgICog5a+85Ye65qih5byPXG4gICAqL1xuICBleHBvcnRNb2RlPzogRXhwb3J0TW9kZTtcbiAgLyoqXG4gICAqIOiHquWumuS5iUNSVUTnmoTor7fmsYLphY3nva5cbiAgICovXG4gIHRyYW5zcG9ydD86IFRyYW5zcG9ydFByb3BzO1xuICAvKipcbiAgICog5p+l6K+i5ZKM5o+Q5Lqk5pWw5o2u55qE5Y+N6aaI6YWN572uXG4gICAqL1xuICBmZWVkYmFjaz86IFRyYW5zcG9ydFByb3BzO1xuICAvKipcbiAgICog57qn6IGU6KGM5pWw5o2u6ZuGLCDlvZPkuLrmlbDnu4Tml7bvvIzmlbDnu4TmiJDlkZjlv4XpobvmmK/mnIluYW1l5bGe5oCn55qERGF0YVNldFxuICAgKiBAZXhhbXBsZVxuICAgKiB7IG5hbWVfMTogJ2RzLWlkLTEnLCBuYW1lXzI6ICdkcy1pZC0yJyB9XG4gICAqIHsgbmFtZV8xOiBkczEsIG5hbWVfMjogZHMyIH1cbiAgICogW2RzMSwgZHMyXVxuICAgKi9cbiAgY2hpbGRyZW4/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IERhdGFTZXQgfSB8IERhdGFTZXRbXTtcbiAgLyoqXG4gICAqIOagkeW9ouaVsOaNruW9k+WJjeiKgueCuWlk5a2X5q615ZCNXG4gICAqL1xuICBpZEZpZWxkPzogc3RyaW5nO1xuICAvKipcbiAgICog5qCR5b2i5pWw5o2u5b2T5YmN54i26IqC54K5aWTlrZfmrrXlkI1cbiAgICovXG4gIHBhcmVudEZpZWxkPzogc3RyaW5nO1xuICAvKipcbiAgICog5qCR5b2i5pWw5o2u5qCH6K6w6IqC54K55piv5ZCm5bGV5byA55qE5a2X5q615ZCNXG4gICAqL1xuICBleHBhbmRGaWVsZD86IHN0cmluZztcbiAgLyoqXG4gICAqIOagkeW9ouaVsOaNruagh+iusOiKgueCueaYr+WQpuS4uumAieS4reeahOWtl+auteWQje+8jOWcqOWxleW8gOaMiemSruWQjumdouS8muaYvuekumNoZWNrYm94XG4gICAqL1xuICBjaGVja0ZpZWxkPzogc3RyaW5nO1xuICAvKipcbiAgICog57yT5a2Y6YCJ5Lit6K6w5b2V77yM5L2/5YiH5o2i5YiG6aG15pe25LuN5L+d55WZ6YCJ5Lit54q25oCB44CCXG4gICAqIOW9k+iuvue9ruS6hnByaW1hcnlLZXnmiJbmnInlrZfmrrXorr7nva7kuoZ1bmlxdWXmiY3otbfkvZznlKjjgIJcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY2FjaGVTZWxlY3Rpb24/OiBib29sZWFuO1xuICAvKipcbiAgICog6KaG55uW6buY6K6kYXhpb3NcbiAgICovXG4gIGF4aW9zPzogQXhpb3NJbnN0YW5jZTtcbiAgLyoqXG4gICAqIOaVsOaNrui9rOS4umpzb27nmoTmlrnlvI9cbiAgICogZGlydHkgLSDlj6rovazmjaLlj5jmm7TnmoTmlbDmja7vvIzljIXmi6zmnKzouqvml6Dlj5jmm7TkvYbnuqfogZTmnInlj5jmm7TnmoTmlbDmja5cbiAgICogc2VsZWN0ZWQgLSDlj6rovazmjaLpgInkuK3nmoTmlbDmja7vvIzml6DlhbPmlbDmja7nmoTlj5jmm7TnirbmgIFcbiAgICogYWxsIC0g6L2s5o2i5omA5pyJ5pWw5o2uXG4gICAqIG5vcm1hbCAtIOi9rOaNouaJgOacieaVsOaNru+8jOS4lOS4jeS8muW4puS4il9fc3RhdHVzLCBfX2lk562J6ZmE5Yqg5a2X5q61XG4gICAqIGRpcnR5LXNlbGYgLSDlkIxkaXJ0ee+8jCDkvYbkuI3ovazmjaLnuqfogZTmlbDmja5cbiAgICogc2VsZWN0ZWQtc2VsZiAtIOWQjHNlbGVjdGVk77yMIOS9huS4jei9rOaNoue6p+iBlOaVsOaNrlxuICAgKiBhbGwtc2VsZiAtIOWQjGFsbO+8jCDkvYbkuI3ovazmjaLnuqfogZTmlbDmja5cbiAgICogbm9ybWFsLXNlbGYgLSDlkIxub3JtYWzvvIwg5L2G5LiN6L2s5o2i57qn6IGU5pWw5o2uXG4gICAqIEBkZWZhdWx0IGRpcnR5XG4gICAqL1xuICBkYXRhVG9KU09OPzogRGF0YVRvSlNPTjtcbiAgLyoqXG4gICAqIOe6p+iBlOafpeivouWPguaVsFxuICAgKi9cbiAgY2FzY2FkZVBhcmFtcz86IChwYXJlbnQ6IFJlY29yZCwgcHJpbWFyeUtleT86IHN0cmluZykgPT4gb2JqZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhU2V0IGV4dGVuZHMgRXZlbnRNYW5hZ2VyIHtcbiAgc3RhdGljIGRlZmF1bHRQcm9wczogRGF0YVNldFByb3BzID0ge1xuICAgIGF1dG9DcmVhdGU6IGZhbHNlLFxuICAgIGF1dG9RdWVyeTogZmFsc2UsXG4gICAgYXV0b1F1ZXJ5QWZ0ZXJTdWJtaXQ6IHRydWUsXG4gICAgYXV0b0xvY2F0ZUZpcnN0OiB0cnVlLFxuICAgIGF1dG9Mb2NhdGVBZnRlckNyZWF0ZTogdHJ1ZSxcbiAgICBhdXRvTG9jYXRlQWZ0ZXJSZW1vdmU6IHRydWUsXG4gICAgc2VsZWN0aW9uOiBEYXRhU2V0U2VsZWN0aW9uLm11bHRpcGxlLFxuICAgIG1vZGlmaWVkQ2hlY2s6IHRydWUsXG4gICAgcGFnZVNpemU6IDEwLFxuICAgIHBhZ2luZzogdHJ1ZSxcbiAgICBkYXRhVG9KU09OOiBEYXRhVG9KU09OLmRpcnR5LFxuICAgIGNhc2NhZGVQYXJhbXMocGFyZW50LCBwcmltYXJ5S2V5KSB7XG4gICAgICBpZiAocHJpbWFyeUtleSkge1xuICAgICAgICByZXR1cm4geyBbcHJpbWFyeUtleV06IHBhcmVudC5nZXQocHJpbWFyeUtleSkgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvbWl0KHBhcmVudC50b0RhdGEoKSwgWydfX2RpcnR5J10pO1xuICAgIH0sXG4gIH07XG5cbiAgaWQ/OiBzdHJpbmc7XG5cbiAgY2hpbGRyZW46IERhdGFTZXRDaGlsZHJlbiA9IHt9O1xuXG4gIHF1ZXJ5UGFyYW1ldGVyOiBvYmplY3Q7XG5cbiAgcGVuZGluZzogUHJvbWlzZVF1ZXVlID0gbmV3IFByb21pc2VRdWV1ZSgpO1xuXG4gIHJlYWN0aW9uOiBJUmVhY3Rpb25EaXNwb3NlcjtcblxuICBvcmlnaW5hbERhdGE6IFJlY29yZFtdID0gW107XG5cbiAgcmVzZXRJbkJhdGNoOiBib29sZWFuID0gZmFsc2U7XG5cbiAgQG9ic2VydmFibGUgcGFyZW50PzogRGF0YVNldDtcblxuICBAb2JzZXJ2YWJsZSBuYW1lPzogc3RyaW5nO1xuXG4gIEBvYnNlcnZhYmxlIHBhcmVudE5hbWU/OiBzdHJpbmc7XG5cbiAgQG9ic2VydmFibGUgcmVjb3JkczogUmVjb3JkW107XG5cbiAgQG9ic2VydmFibGUgZmllbGRzOiBGaWVsZHM7XG5cbiAgQG9ic2VydmFibGUgcHJvcHM6IERhdGFTZXRQcm9wcztcblxuICBAb2JzZXJ2YWJsZSBwYWdlU2l6ZTogbnVtYmVyO1xuXG4gIEBvYnNlcnZhYmxlIHRvdGFsQ291bnQ6IG51bWJlcjtcblxuICBAb2JzZXJ2YWJsZSBzdGF0dXM6IERhdGFTZXRTdGF0dXM7XG5cbiAgQG9ic2VydmFibGUgY3VycmVudFBhZ2U6IG51bWJlcjtcblxuICBAb2JzZXJ2YWJsZSBzZWxlY3Rpb246IERhdGFTZXRTZWxlY3Rpb24gfCBmYWxzZTtcblxuICBAb2JzZXJ2YWJsZSBjYWNoZWRTZWxlY3RlZDogUmVjb3JkW107XG5cbiAgQG9ic2VydmFibGUgZGF0YVRvSlNPTjogRGF0YVRvSlNPTjtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IGF4aW9zKCk6IEF4aW9zSW5zdGFuY2Uge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmF4aW9zIHx8IGdldENvbmZpZygnYXhpb3MnKSB8fCBheGlvcztcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgZGF0YUtleSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHsgZGF0YUtleSA9IGdldENvbmZpZygnZGF0YUtleScpIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBkYXRhS2V5O1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCB0b3RhbEtleSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnRvdGFsS2V5IHx8IGdldENvbmZpZygndG90YWxLZXknKTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbGFuZygpOiBMYW5nIHtcbiAgICByZXR1cm4gZ2V0KHRoaXMucHJvcHMsICdsYW5nJykgfHwgbG9jYWxlQ29udGV4dC5sb2NhbGUubGFuZztcbiAgfVxuXG4gIHNldCBsYW5nKGxhbmc6IExhbmcpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICBzZXQodGhpcy5wcm9wcywgJ2xhbmcnLCBsYW5nKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBxdWVyeURhdGFTZXQoKTogRGF0YVNldCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGdldCh0aGlzLnByb3BzLCAncXVlcnlEYXRhU2V0Jyk7XG4gIH1cblxuICAvKipcbiAgICog6K6+572u5p+l6K+i55qERGF0YVNldC5cbiAgICogQHBhcmFtIHtEYXRhU2V0fSBkcyBEYXRhU2V0LlxuICAgKi9cbiAgc2V0IHF1ZXJ5RGF0YVNldChkczogRGF0YVNldCB8IHVuZGVmaW5lZCkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHNldCh0aGlzLnByb3BzLCAncXVlcnlEYXRhU2V0JywgZHMpO1xuICAgICAgaWYgKGRzKSB7XG4gICAgICAgIC8vIOWIneWni+WMluaXtuWmguaenOebtOaOpeaJp+ihjGNyZWF0Ze+8jG1vYnjkvJrmiqXplJnvvIzmiYDku6Xkvb/nlKjkuoZkZWZlclxuICAgICAgICBkcy5wZW5kaW5nLmFkZChcbiAgICAgICAgICBuZXcgUHJvbWlzZShyZXNsb3ZlID0+IHtcbiAgICAgICAgICAgIGRlZmVyKCgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGRzLnJlY29yZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZHMuY3JlYXRlKCk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWRzLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBkcy5maXJzdCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc2xvdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBxdWVyeVVybCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBnZXQodGhpcy5wcm9wcywgJ3F1ZXJ5VXJsJykgfHwgKHRoaXMubmFtZSAmJiBgL2RhdGFzZXQvJHt0aGlzLm5hbWV9L3F1ZXJpZXNgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorr7nva7mj5DkuqTnmoRVcmwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwg5o+Q5Lqk55qEVXJsLlxuICAgKi9cbiAgc2V0IHF1ZXJ5VXJsKHVybDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgc2V0KHRoaXMucHJvcHMsICdxdWVyeVVybCcsIHVybCk7XG4gICAgfSk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHN1Ym1pdFVybCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBnZXQodGhpcy5wcm9wcywgJ3N1Ym1pdFVybCcpIHx8ICh0aGlzLm5hbWUgJiYgYC9kYXRhc2V0LyR7dGhpcy5uYW1lfS9tdXRhdGlvbnNgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorr7nva7mn6Xor6LnmoRVcmwuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwg5p+l6K+i55qEVXJsLlxuICAgKi9cbiAgc2V0IHN1Ym1pdFVybCh1cmw6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHNldCh0aGlzLnByb3BzLCAnc3VibWl0VXJsJywgdXJsKTtcbiAgICB9KTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgdGxzVXJsKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGdldCh0aGlzLnByb3BzLCAndGxzVXJsJykgfHwgKHRoaXMubmFtZSAmJiBgL2RhdGFzZXQvJHt0aGlzLm5hbWV9L2xhbmd1YWdlc2ApO1xuICB9XG5cbiAgLyoqXG4gICAqIOiuvue9ruWkmuivreiogOeahFVybC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHVybCDlpJror63oqIDnmoRVcmwuXG4gICAqL1xuICBzZXQgdGxzVXJsKHVybDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgc2V0KHRoaXMucHJvcHMsICd0bHNVcmwnLCB1cmwpO1xuICAgIH0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCB2YWxpZGF0ZVVybCgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBnZXQodGhpcy5wcm9wcywgJ3ZhbGlkYXRlVXJsJykgfHwgKHRoaXMubmFtZSAmJiBgL2RhdGFzZXQvJHt0aGlzLm5hbWV9L3ZhbGlkYXRlYCk7XG4gIH1cblxuICAvKipcbiAgICog6K6+572u6L+c56iL5qCh6aqM5p+l6K+i6K+35rGC55qEdXJsLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIOi/nOeoi+agoemqjOafpeivouivt+axgueahHVybC5cbiAgICovXG4gIHNldCB2YWxpZGF0ZVVybCh1cmw6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHNldCh0aGlzLnByb3BzLCAndmFsaWRhdGVVcmwnLCB1cmwpO1xuICAgIH0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBleHBvcnRVcmwoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZ2V0KHRoaXMucHJvcHMsICdleHBvcnRVcmwnKSB8fCAodGhpcy5uYW1lICYmIGAvZGF0YXNldC8ke3RoaXMubmFtZX0vZXhwb3J0YCk7XG4gIH1cblxuICAvKipcbiAgICog6K6+572u5a+85Ye66K+35rGC55qEdXJsLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdXJsIOi/nOeoi+agoemqjOafpeivouivt+axgueahHVybC5cbiAgICovXG4gIHNldCBleHBvcnRVcmwodXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICBzZXQodGhpcy5wcm9wcywgJ2V4cG9ydFVybCcsIHVybCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog5pyN5Yqh56uv5a+85Ye66L+Y5piv5a6i5oi356uv5a+85Ye6XG4gICAqL1xuICBnZXQgZXhwb3J0TW9kZSgpOiBFeHBvcnRNb2RlIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5leHBvcnRNb2RlIHx8IGdldENvbmZpZygnZXhwb3J0TW9kZScpIHx8IEV4cG9ydE1vZGUuc2VydmVyO1xuICB9XG5cbiAgc2V0IHRyYW5zcG9ydCh0cmFuc3BvcnQ6IFRyYW5zcG9ydCkge1xuICAgIHJ1bkluQWN0aW9uKCgpID0+IHtcbiAgICAgIHRoaXMucHJvcHMudHJhbnNwb3J0ID0gdHJhbnNwb3J0IGluc3RhbmNlb2YgVHJhbnNwb3J0ID8gdHJhbnNwb3J0LnByb3BzIDogdHJhbnNwb3J0O1xuICAgIH0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCB0cmFuc3BvcnQoKTogVHJhbnNwb3J0IHtcbiAgICByZXR1cm4gbmV3IFRyYW5zcG9ydCh0aGlzLnByb3BzLnRyYW5zcG9ydCwgdGhpcyk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGZlZWRiYWNrKCk6IEZlZWRCYWNrIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZ2V0Q29uZmlnKCdmZWVkYmFjaycpLFxuICAgICAgLi4udGhpcy5wcm9wcy5mZWVkYmFjayxcbiAgICB9O1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkYXRhKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmRzLmZpbHRlcihyZWNvcmQgPT4gIXJlY29yZC5pc1JlbW92ZWQpO1xuICB9XG5cbiAgc2V0IGRhdGEocmVjb3JkczogUmVjb3JkW10pIHtcbiAgICB0aGlzLmxvYWREYXRhKHJlY29yZHMpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkaXJ0eVJlY29yZHMoKTogW1JlY29yZFtdLCBSZWNvcmRbXSwgUmVjb3JkW11dIHtcbiAgICBjb25zdCBjcmVhdGVkOiBSZWNvcmRbXSA9IFtdO1xuICAgIGNvbnN0IHVwZGF0ZWQ6IFJlY29yZFtdID0gW107XG4gICAgY29uc3QgZGVzdHJveWVkOiBSZWNvcmRbXSA9IFtdO1xuICAgIHRoaXMucmVjb3Jkcy5mb3JFYWNoKHJlY29yZCA9PiB7XG4gICAgICBzd2l0Y2ggKHJlY29yZC5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSBSZWNvcmRTdGF0dXMuYWRkOlxuICAgICAgICAgIGNyZWF0ZWQucHVzaChyZWNvcmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFJlY29yZFN0YXR1cy51cGRhdGU6XG4gICAgICAgICAgdXBkYXRlZC5wdXNoKHJlY29yZCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgUmVjb3JkU3RhdHVzLmRlbGV0ZTpcbiAgICAgICAgICBkZXN0cm95ZWQucHVzaChyZWNvcmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgaWYgKHJlY29yZC5kaXJ0eSkge1xuICAgICAgICAgICAgdXBkYXRlZC5wdXNoKHJlY29yZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjcmVhdGVkLCB1cGRhdGVkLCBkZXN0cm95ZWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIOiOt+WPluaWsOW7uueahOiusOW9lembhlxuICAgKiBAcmV0dXJuIOiusOW9lembhlxuICAgKi9cbiAgQGNvbXB1dGVkXG4gIGdldCBjcmVhdGVkKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gdGhpcy5kaXJ0eVJlY29yZHNbMF07XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5Y+Y5pu055qE6K6w5b2V6ZuGXG4gICAqIEByZXR1cm4g6K6w5b2V6ZuGXG4gICAqL1xuICBAY29tcHV0ZWRcbiAgZ2V0IHVwZGF0ZWQoKTogUmVjb3JkW10ge1xuICAgIHJldHVybiB0aGlzLmRpcnR5UmVjb3Jkc1sxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bliKDpmaTnmoTorrDlvZXpm4ZcbiAgICogQHJldHVybiDorrDlvZXpm4ZcbiAgICovXG4gIEBjb21wdXRlZFxuICBnZXQgZGVzdHJveWVkKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gdGhpcy5kaXJ0eVJlY29yZHNbMl07XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W6YCJ5Lit55qE6K6w5b2V6ZuGXG4gICAqIEByZXR1cm4g6K6w5b2V6ZuGXG4gICAqL1xuICBAY29tcHV0ZWRcbiAgZ2V0IHNlbGVjdGVkKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50U2VsZWN0ZWQuY29uY2F0KHRoaXMuY2FjaGVkU2VsZWN0ZWQuZmlsdGVyKHJlY29yZCA9PiByZWNvcmQuaXNTZWxlY3RlZCkpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBjdXJyZW50U2VsZWN0ZWQoKTogUmVjb3JkW10ge1xuICAgIHJldHVybiB0aGlzLnJlY29yZHMuZmlsdGVyKHJlY29yZCA9PiByZWNvcmQuaXNTZWxlY3RlZCk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHRvdGFsUGFnZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBhZ2luZyA/IE1hdGguY2VpbCh0aGlzLnRvdGFsQ291bnQgLyB0aGlzLnBhZ2VTaXplKSA6IDE7XG4gIH1cblxuICAvLyDlpoLmnpxwYWdpbmfkuLpzZXJ2ZXIg6L+U5Zuecm9vdOeItuiKgueCueeahOaOkuW6j1xuXG4gIEBjb21wdXRlZFxuICBnZXQgY3VycmVudEluZGV4KCk6IG51bWJlciB7XG4gICAgY29uc3QgeyBjdXJyZW50LCBwYWdlU2l6ZSwgY3VycmVudFBhZ2UgfSA9IHRoaXM7XG4gICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleE9mKGN1cnJlbnQpO1xuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBpZiAodGhpcy5wYWdpbmcgPT09ICdzZXJ2ZXInKSB7XG4gICAgICAgICAgY29uc3QgY3VycmVudFBhcmVudCA9IGZpbmRSb290UGFyZW50KGN1cnJlbnQpXG4gICAgICAgICAgbGV0IHBhcmVudEluZGV4ID0gLTFcbiAgICAgICAgICB0aGlzLnRyZWVEYXRhLmZvckVhY2goKGl0ZW0sIGluZGV4VHJlZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXhPZihpdGVtKSA9PT0gdGhpcy5pbmRleE9mKGN1cnJlbnRQYXJlbnQpKSB7XG4gICAgICAgICAgICAgIHBhcmVudEluZGV4ID0gaW5kZXhUcmVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIHBhcmVudEluZGV4O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleCArIChjdXJyZW50UGFnZSAtIDEpICogcGFnZVNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHNldCBjdXJyZW50SW5kZXgoaW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMubG9jYXRlKGluZGV4KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDorrDlvZXmlbBcbiAgICovXG4gIEBjb21wdXRlZFxuICBnZXQgbGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGg7XG4gIH1cblxuICBnZXQgaGFzQ2hpbGRyZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuY2hpbGRyZW4pLmxlbmd0aCA+IDA7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHRyZWVSZWNvcmRzKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gc29ydFRyZWUodGhpcy5yZWNvcmRzLmZpbHRlcihyZWNvcmQgPT4gIXJlY29yZC5wYXJlbnQpLCBnZXRPcmRlckZpZWxkcyh0aGlzLmZpZWxkcylbMF0pO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCB0cmVlRGF0YSgpOiBSZWNvcmRbXSB7XG4gICAgcmV0dXJuIHNvcnRUcmVlKHRoaXMuZmlsdGVyKHJlY29yZCA9PiAhcmVjb3JkLnBhcmVudCksIGdldE9yZGVyRmllbGRzKHRoaXMuZmllbGRzKVswXSk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHBhZ2luZygpOiBib29sZWFuIHwgJ3NlcnZlcicge1xuICAgIGNvbnN0IHsgaWRGaWVsZCwgcGFyZW50RmllbGQsIHBhZ2luZyB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKHBhZ2luZyA9PT0gYHNlcnZlcmApICYmIHBhcmVudEZpZWxkICYmIGlkRmllbGQgPyBwYWdpbmcgOiAocGFyZW50RmllbGQgPT09IHVuZGVmaW5lZCB8fCBpZEZpZWxkID09PSB1bmRlZmluZWQpICYmICEhcGFnaW5nITtcbiAgfVxuXG4gIHNldCBwYWdpbmcocGFnaW5nKSB7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5wcm9wcy5wYWdpbmcgPSBwYWdpbmc7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5b2T5YmN57Si5byV55qE6K6w5b2VXG4gICAqIEByZXR1cm4gcmVjb3JkIOiusOW9lVxuICAgKi9cbiAgQGNvbXB1dGVkXG4gIGdldCBjdXJyZW50KCk6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuZGF0YS5maW5kKHJlY29yZCA9PiByZWNvcmQuaXNDdXJyZW50KSB8fFxuICAgICAgdGhpcy5jYWNoZWRTZWxlY3RlZC5maW5kKHJlY29yZCA9PiByZWNvcmQuaXNDdXJyZW50KVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICog5bCG6K6w5b2V6K6+5a6a5Li65b2T5YmN57Si5byVXG4gICAqIEBwYXJhbSByZWNvcmQg6K6w5b2VXG4gICAqL1xuICBzZXQgY3VycmVudChyZWNvcmQ6IFJlY29yZCB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGN1cnJlbnRSZWNvcmQgPSB0aGlzLmN1cnJlbnQ7XG4gICAgaWYgKGN1cnJlbnRSZWNvcmQgIT09IHJlY29yZCAmJiAoIXJlY29yZCB8fCAhcmVjb3JkLmlzQ2FjaGVkKSkge1xuICAgICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgICBpZiAoY3VycmVudFJlY29yZCkge1xuICAgICAgICAgIGN1cnJlbnRSZWNvcmQuaXNDdXJyZW50ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY29yZCAmJiByZWNvcmQuZGF0YVNldCA9PT0gdGhpcykge1xuICAgICAgICAgIHJlY29yZC5pc0N1cnJlbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMuaW5kZXhDaGFuZ2UsIHtcbiAgICAgICAgICBkYXRhU2V0OiB0aGlzLFxuICAgICAgICAgIHJlY29yZCxcbiAgICAgICAgICBwcmV2aW91czogY3VycmVudFJlY29yZCxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IHVuaXF1ZUtleXMoKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgcHJpbWFyeUtleSB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAocHJpbWFyeUtleSkge1xuICAgICAgcmV0dXJuIFtwcmltYXJ5S2V5XTtcbiAgICB9XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBbLi4udGhpcy5maWVsZHMuZW50cmllcygpXS5mb3JFYWNoKChba2V5LCBmaWVsZF0pID0+IHtcbiAgICAgIGlmIChmaWVsZC5nZXQoJ3VuaXF1ZScpKSB7XG4gICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChrZXlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGtleXM7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGNhY2hlU2VsZWN0aW9uS2V5cygpOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyBjYWNoZVNlbGVjdGlvbiwgc2VsZWN0aW9uIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChjYWNoZVNlbGVjdGlvbiAmJiBzZWxlY3Rpb24gPT09IERhdGFTZXRTZWxlY3Rpb24ubXVsdGlwbGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnVuaXF1ZUtleXM7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICog6I635Y+W5omA5pyJ6K6w5b2V5YyF5ous57yT5a2Y55qE6YCJ5oup6K6w5b2VXG4gICAqIEBwYXJhbSBpbmRleCDntKLlvJVcbiAgICogQHJldHVybnMge1JlY29yZH1cbiAgICovXG4gIEBjb21wdXRlZFxuICBnZXQgYWxsKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmRzLmNvbmNhdCh0aGlzLmNhY2hlZFNlbGVjdGVkLnNsaWNlKCkpO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBkaXJ0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWNvcmRzLnNvbWUoaXNEaXJ0eVJlY29yZCk7XG4gIH1cblxuICBwcml2YXRlIGluQmF0Y2hTZWxlY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIHN5bmNDaGlsZHJlblJlbW90ZSA9IGRlYm91bmNlKChyZW1vdGVLZXlzOiBzdHJpbmdbXSwgY3VycmVudDogUmVjb3JkKSA9PiB7XG4gICAgY29uc3QgeyBjaGlsZHJlbiB9ID0gdGhpcztcbiAgICByZW1vdGVLZXlzLmZvckVhY2goY2hpbGROYW1lID0+IHRoaXMuc3luY0NoaWxkKGNoaWxkcmVuW2NoaWxkTmFtZV0sIGN1cnJlbnQsIGNoaWxkTmFtZSkpO1xuICB9LCAzMDApO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzPzogRGF0YVNldFByb3BzKSB7XG4gICAgc3VwZXIoKTtcbiAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICBwcm9wcyA9IHsgLi4uRGF0YVNldC5kZWZhdWx0UHJvcHMsIC4uLnByb3BzIH0gYXMgRGF0YVNldFByb3BzO1xuICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgY29uc3Qge1xuICAgICAgICBkYXRhLFxuICAgICAgICBmaWVsZHMsXG4gICAgICAgIHF1ZXJ5RmllbGRzLFxuICAgICAgICBxdWVyeURhdGFTZXQsXG4gICAgICAgIGF1dG9RdWVyeSxcbiAgICAgICAgYXV0b0NyZWF0ZSxcbiAgICAgICAgcGFnZVNpemUsXG4gICAgICAgIHNlbGVjdGlvbixcbiAgICAgICAgZXZlbnRzLFxuICAgICAgICBpZCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIHF1ZXJ5UGFyYW1ldGVyID0ge30sXG4gICAgICAgIGRhdGFUb0pTT04sXG4gICAgICB9ID0gcHJvcHM7XG4gICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgdGhpcy5kYXRhVG9KU09OID0gZGF0YVRvSlNPTiE7XG4gICAgICB0aGlzLnJlY29yZHMgPSBbXTtcbiAgICAgIHRoaXMuZmllbGRzID0gb2JzZXJ2YWJsZS5tYXA8c3RyaW5nLCBGaWVsZD4oKTtcbiAgICAgIHRoaXMudG90YWxDb3VudCA9IDA7XG4gICAgICB0aGlzLnN0YXR1cyA9IERhdGFTZXRTdGF0dXMucmVhZHk7XG4gICAgICB0aGlzLmN1cnJlbnRQYWdlID0gMTtcbiAgICAgIHRoaXMuY2FjaGVkU2VsZWN0ZWQgPSBbXTtcbiAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXIgPSBxdWVyeVBhcmFtZXRlcjtcbiAgICAgIHRoaXMucGFnZVNpemUgPSBwYWdlU2l6ZSE7XG4gICAgICB0aGlzLnNlbGVjdGlvbiA9IHNlbGVjdGlvbiE7XG4gICAgICB0aGlzLnByb2Nlc3NMaXN0ZW5lcigpO1xuICAgICAgaWYgKGlkKSB7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICB0aGlzLmluaXRDaGlsZHJlbihjaGlsZHJlbik7XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnRzKSB7XG4gICAgICAgIHRoaXMuaW5pdEV2ZW50cyhldmVudHMpO1xuICAgICAgfVxuICAgICAgaWYgKGZpZWxkcykge1xuICAgICAgICB0aGlzLmluaXRGaWVsZHMoZmllbGRzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaW5pdFF1ZXJ5RGF0YVNldChxdWVyeURhdGFTZXQsIHF1ZXJ5RmllbGRzKTtcbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBkYXRhO1xuICAgICAgICBpZiAobGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5sb2FkRGF0YShkYXRhLCBsZW5ndGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBzc3IgZG8gbm90IGF1dG8gcXVlcnlcbiAgICAgIGlmIChhdXRvUXVlcnkgJiYgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5xdWVyeSgpO1xuICAgICAgfSBlbHNlIGlmIChhdXRvQ3JlYXRlICYmIHRoaXMucmVjb3Jkcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb2Nlc3NMaXN0ZW5lcigpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoRGF0YVNldEV2ZW50cy5pbmRleENoYW5nZSwgdGhpcy5oYW5kbGVDYXNjYWRlKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG5cbiAgc25hcHNob3QoKTogRGF0YVNldFNuYXBzaG90IHtcbiAgICByZXR1cm4gbmV3IERhdGFTZXRTbmFwc2hvdCh0aGlzKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgcmVzdG9yZShzbmFwc2hvdDogRGF0YVNldFNuYXBzaG90KTogRGF0YVNldCB7XG4gICAgaWYgKHNuYXBzaG90LmRhdGFTZXQgIT09IHRoaXMpIHtcbiAgICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgfSBlbHNlIGlmIChzbmFwc2hvdC5ldmVudHMpIHtcbiAgICAgIHRoaXMuZXZlbnRzID0gc25hcHNob3QuZXZlbnRzO1xuICAgIH1cbiAgICB0aGlzLnJlY29yZHMgPSBzbmFwc2hvdC5yZWNvcmRzO1xuICAgIHRoaXMub3JpZ2luYWxEYXRhID0gc25hcHNob3Qub3JpZ2luYWxEYXRhO1xuICAgIHRoaXMudG90YWxDb3VudCA9IHNuYXBzaG90LnRvdGFsQ291bnQ7XG4gICAgdGhpcy5jdXJyZW50UGFnZSA9IHNuYXBzaG90LmN1cnJlbnRQYWdlO1xuICAgIHRoaXMucGFnZVNpemUgPSBzbmFwc2hvdC5wYWdlU2l6ZTtcbiAgICB0aGlzLmNhY2hlZFNlbGVjdGVkID0gc25hcHNob3QuY2FjaGVkU2VsZWN0ZWQ7XG4gICAgdGhpcy5kYXRhVG9KU09OID0gc25hcHNob3QuZGF0YVRvSlNPTjtcbiAgICB0aGlzLmNoaWxkcmVuID0gc25hcHNob3QuY2hpbGRyZW47XG4gICAgdGhpcy5jdXJyZW50ID0gc25hcHNob3QuY3VycmVudDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvRGF0YSgpOiBvYmplY3RbXSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlRGF0YSh0aGlzKS5kYXRhO1xuICB9XG5cbiAgdG9KU09ORGF0YShpc1NlbGVjdGVkPzogYm9vbGVhbiwgbm9DYXNjYWRlPzogYm9vbGVhbik6IG9iamVjdFtdIHtcbiAgICBjb25zdCBkYXRhVG9KU09OID0gYWRhcHRlckRhdGFUb0pTT04oaXNTZWxlY3RlZCwgbm9DYXNjYWRlKTtcbiAgICBpZiAoZGF0YVRvSlNPTikge1xuICAgICAgdGhpcy5kYXRhVG9KU09OID0gZGF0YVRvSlNPTjtcbiAgICB9XG4gICAgcmV0dXJuIGdlbmVyYXRlSlNPTkRhdGEodGhpcykuZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiDnrYnlvoXpgInkuK3miJbogIXmiYDmnInorrDlvZXlh4blpIflsLHnu6pcbiAgICogQHJldHVybnMgUHJvbWlzZVxuICAgKi9cbiAgcmVhZHkoaXNTZWxlY3Q/OiBib29sZWFuKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5wZW5kaW5nLnJlYWR5KCksXG4gICAgICAuLi4oaXNTZWxlY3QgfHwgdXNlU2VsZWN0ZWQodGhpcy5kYXRhVG9KU09OKSA/IHRoaXMuc2VsZWN0ZWQgOiB0aGlzLmRhdGEpLm1hcChyZWNvcmQgPT5cbiAgICAgICAgcmVjb3JkLnJlYWR5KCksXG4gICAgICApLFxuICAgICAgLi4uWy4uLnRoaXMuZmllbGRzLnZhbHVlcygpXS5tYXAoZmllbGQgPT4gZmllbGQucmVhZHkoKSksXG4gICAgXSk7XG4gIH1cblxuICAvKipcbiAgICog5p+l6K+i6K6w5b2VXG4gICAqIEBwYXJhbSBwYWdlIOmhteeggVxuICAgKiBAcmV0dXJuIFByb21pc2VcbiAgICovXG4gIHF1ZXJ5KHBhZ2U/OiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLnBlbmRpbmcuYWRkKHRoaXMuZG9RdWVyeShwYWdlKSk7XG4gIH1cblxuICBhc3luYyBkb1F1ZXJ5KHBhZ2UpOiBQcm9taXNlPGFueT4ge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLnJlYWQocGFnZSk7XG4gICAgdGhpcy5sb2FkRGF0YUZyb21SZXNwb25zZShkYXRhKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlsIbmlbDmja7pm4bkuK3nmoTlop7liKDmlLnnmoTorrDlvZXov5vooYzov5znqIvmj5DkuqRcbiAgICogQHBhcmFtIGlzU2VsZWN0IOWmguaenOS4unRydWXvvIzliJnlj6rmj5DkuqTpgInkuK3orrDlvZVcbiAgICogQHBhcmFtIG5vQ2FzY2FkZSDlpoLmnpzkuLp0cnVl77yM5YiZ5LiN5o+Q5Lqk57qn6IGU5pWw5o2uXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgc3VibWl0KGlzU2VsZWN0PzogYm9vbGVhbiwgbm9DYXNjYWRlPzogYm9vbGVhbik6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgZGF0YVRvSlNPTiA9IGFkYXB0ZXJEYXRhVG9KU09OKGlzU2VsZWN0LCBub0Nhc2NhZGUpO1xuICAgIGlmIChkYXRhVG9KU09OKSB7XG4gICAgICB0aGlzLmRhdGFUb0pTT04gPSBkYXRhVG9KU09OO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnJlYWR5KCk7XG4gICAgaWYgKGF3YWl0IHRoaXMudmFsaWRhdGUoKSkge1xuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZy5hZGQoXG4gICAgICAgIHRoaXMud3JpdGUodXNlU2VsZWN0ZWQodGhpcy5kYXRhVG9KU09OKSA/IHRoaXMuc2VsZWN0ZWQgOiB0aGlzLnJlY29yZHMpLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIOWvvOWHuuaVsOaNrlxuICAgKiBAcGFyYW0gb2JqZWN0IGNvbHVtbnMg5a+85Ye655qE5YiXXG4gICAqIEBwYXJhbSBudW1iZXIgZXhwb3J0UXVhbnRpdHkg5a+85Ye65pWw6YePXG4gICAqL1xuICBhc3luYyBleHBvcnQoY29sdW1uczogYW55ID0ge30sIGV4cG9ydFF1YW50aXR5OiBudW1iZXIgPSAwKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2hlY2tSZWFkYWJsZSh0aGlzLnBhcmVudCkgJiYgKGF3YWl0IHRoaXMucmVhZHkoKSkpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdlbmVyYXRlUXVlcnlQYXJhbWV0ZXIoKTtcbiAgICAgIGRhdGEuX0hBUF9FWENFTF9FWFBPUlRfQ09MVU1OUyA9IGNvbHVtbnM7XG4gICAgICBjb25zdCB7IHRvdGFsQ291bnQsIHRvdGFsS2V5IH0gPSB0aGlzO1xuICAgICAgY29uc3QgcGFyYW1zID0geyBfcjogRGF0ZS5ub3coKSwgLi4udGhpcy5nZW5lcmF0ZU9yZGVyUXVlcnlTdHJpbmcoKSB9O1xuICAgICAgT2JqZWN0Q2hhaW5WYWx1ZS5zZXQocGFyYW1zLCB0b3RhbEtleSwgdG90YWxDb3VudCk7XG4gICAgICBjb25zdCBuZXdDb25maWcgPSBheGlvc0NvbmZpZ0FkYXB0ZXIoJ2V4cG9ydHMnLCB0aGlzLCBkYXRhLCBwYXJhbXMpO1xuICAgICAgaWYgKG5ld0NvbmZpZy51cmwpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIChhd2FpdCB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLmV4cG9ydCwge1xuICAgICAgICAgICAgZGF0YVNldDogdGhpcyxcbiAgICAgICAgICAgIHBhcmFtczogbmV3Q29uZmlnLnBhcmFtcyxcbiAgICAgICAgICAgIGRhdGE6IG5ld0NvbmZpZy5kYXRhLFxuICAgICAgICAgIH0pKSAhPT0gZmFsc2VcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29uc3QgRXhwb3J0UXVhbnRpdHkgPSBleHBvcnRRdWFudGl0eSA+IDEwMDAgPyAxMDAwIDogZXhwb3J0UXVhbnRpdHk7XG4gICAgICAgICAgaWYgKHRoaXMuZXhwb3J0TW9kZSA9PT0gRXhwb3J0TW9kZS5jbGllbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZG9DbGllbnRFeHBvcnQoZGF0YSwgRXhwb3J0UXVhbnRpdHkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvRXhwb3J0KHRoaXMuYXhpb3MuZ2V0VXJpKG5ld0NvbmZpZyksIG5ld0NvbmZpZy5kYXRhLCBuZXdDb25maWcubWV0aG9kKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm5pbmcoZmFsc2UsICdVbmFibGUgdG8gZXhlY3V0ZSB0aGUgZXhwb3J0IG1ldGhvZCBvZiBkYXRhc2V0LCBwbGVhc2UgY2hlY2sgdGhlICcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZG9DbGllbnRFeHBvcnQoZGF0YTogYW55LCBxdWFudGl0eTogbnVtYmVyKSB7XG4gICAgY29uc3QgY29sdW1uc0V4cG9ydCA9IGRhdGEuX0hBUF9FWENFTF9FWFBPUlRfQ09MVU1OU1xuICAgIGRlbGV0ZSBkYXRhLl9IQVBfRVhDRUxfRVhQT1JUX0NPTFVNTlNcbiAgICBjb25zdCBwYXJhbXMgPSB7IC4uLnRoaXMuZ2VuZXJhdGVRdWVyeVN0cmluZygxLCBxdWFudGl0eSl9XG4gICAgY29uc3QgbmV3Q29uZmlnID0gYXhpb3NDb25maWdBZGFwdGVyKCdyZWFkJywgdGhpcywgZGF0YSwgcGFyYW1zKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmF4aW9zKG5ld0NvbmZpZyk7XG4gICAgY29uc3QgbmV3UmVzdWx0OiBhbnlbXSA9IFtdXG4gICAgaWYgKHJlc3VsdFt0aGlzLmRhdGFLZXldICYmIHJlc3VsdFt0aGlzLmRhdGFLZXldLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IHByb2Nlc3NEYXRhID0gdG9KUyh0aGlzLnByb2Nlc3NEYXRhKHJlc3VsdFt0aGlzLmRhdGFLZXldKSkubWFwKChpdGVtKSA9PiBpdGVtLmRhdGEpXG4gICAgICBwcm9jZXNzRGF0YS5mb3JFYWNoKChpdGVtVmFsdWUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YUl0ZW0gPSB7fVxuICAgICAgICBjb25zdCBjb2x1bW5zRXhwb3J0a2V5cyA9IE9iamVjdC5rZXlzKGNvbHVtbnNFeHBvcnQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnNFeHBvcnRrZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RSZWNvcmQgPSB0aGlzLnJlY29yZHNbMF0gfHwgdGhpc1xuICAgICAgICAgIGNvbnN0IGV4cG9ydEZpZWxkID0gZmlyc3RSZWNvcmQuZ2V0RmllbGQoY29sdW1uc0V4cG9ydGtleXNbaV0pXG4gICAgICAgICAgbGV0IHByb2Nlc3NJdGVtVmFsdWUgPSBnZXRTcGxpdFZhbHVlKHRvSlMoaXRlbVZhbHVlKSwgY29sdW1uc0V4cG9ydGtleXNbaV0pXG4gICAgICAgICAgLy8g5aSE55CGYmluZCDmg4XlhrVcbiAgICAgICAgICBpZiAoZXhwb3J0RmllbGQgJiYgaXNOaWwocHJvY2Vzc0l0ZW1WYWx1ZSkgJiYgZXhwb3J0RmllbGQuZ2V0KCdiaW5kJykpIHtcbiAgICAgICAgICAgIHByb2Nlc3NJdGVtVmFsdWUgPSBnZXRTcGxpdFZhbHVlKFxuICAgICAgICAgICAgICBnZXRTcGxpdFZhbHVlKHRvSlMoaXRlbVZhbHVlKSwgZXhwb3J0RmllbGQuZ2V0KCdiaW5kJykpLFxuICAgICAgICAgICAgICBjb2x1bW5zRXhwb3J0a2V5c1tpXSxcbiAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIClcblxuICAgICAgICAgIH1cbiAgICAgICAgICBkYXRhSXRlbVtjb2x1bW5zRXhwb3J0a2V5c1tpXV0gPSBwcm9jZXNzRXhwb3J0VmFsdWUocHJvY2Vzc0l0ZW1WYWx1ZSwgZXhwb3J0RmllbGQpXG4gICAgICAgIH1cbiAgICAgICAgbmV3UmVzdWx0LnB1c2goZGF0YUl0ZW0pO1xuICAgICAgfSlcbiAgICB9XG4gICAgbmV3UmVzdWx0LnVuc2hpZnQoY29sdW1uc0V4cG9ydClcbiAgICBjb25zdCB3cyA9IFhMU1gudXRpbHMuanNvbl90b19zaGVldChuZXdSZXN1bHQsIHsgc2tpcEhlYWRlcjogdHJ1ZSB9KTsgLyog5paw5bu656m6d29ya2Jvb2vvvIznhLblkI7liqDlhaV3b3Jrc2hlZXQgKi9cbiAgICBjb25zdCB3YiA9IFhMU1gudXRpbHMuYm9va19uZXcoKTsgIC8qIOaWsOW7umJvb2sgKi9cbiAgICBYTFNYLnV0aWxzLmJvb2tfYXBwZW5kX3NoZWV0KHdiLCB3cyk7IC8qIOeUn+aIkHhsc3jmlofku7YoYm9vayxzaGVldOaVsOaNrixzaGVldOWRveWQjSkgKi9cbiAgICBYTFNYLndyaXRlRmlsZSh3YiwgYCR7dGhpcy5uYW1lfS54bHN4YCk7IC8qIOWGmeaWh+S7tihib29rLHhsc3jmlofku7blkI3np7ApICovXG4gIH1cblxuICAvKipcbiAgICog6YeN572u5pu05pS5XG4gICAqL1xuICBAYWN0aW9uXG4gIHJlc2V0KCk6IERhdGFTZXQge1xuICAgIHRoaXMucmVzZXRJbkJhdGNoID0gdHJ1ZTtcbiAgICB0aGlzLnJlY29yZHMgPSB0aGlzLm9yaWdpbmFsRGF0YS5tYXAocmVjb3JkID0+IHJlY29yZC5yZXNldCgpKTtcbiAgICB0aGlzLnJlc2V0SW5CYXRjaCA9IGZhbHNlO1xuICAgIGlmICh0aGlzLnByb3BzLmF1dG9DcmVhdGUgJiYgdGhpcy5yZWNvcmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9XG4gICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5yZXNldCwgeyBkYXRhU2V0OiB0aGlzLCByZWNvcmRzOiB0aGlzLnJlY29yZHMgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICog5a6a5L2N5Yiw5oyH5a6a6aG156CB77yM5aaC5p6ccGFnaW5n5Li6dHJ1ZeaIlmBzZXJ2ZXJg77yM5YiZ5YGa6L+c56iL5p+l6K+i77yM57qm5a6a5b2T5Li6VHJlZSDnirbmgIHnmoRzZXJ2ZXLml7blgJkg6Lez6L2s5Yiw5LiL5LiA6aG15Lmf5bCx5pivaW5kZXjkuLrlvZPliY3nmoRpbmRleOWKoOS4ijFcbiAgICogQHBhcmFtIHBhZ2Ug6aG156CBXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgcGFnZShwYWdlOiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChwYWdlID4gMCAmJiB0aGlzLnBhZ2luZykge1xuICAgICAgcmV0dXJuIHRoaXMubG9jYXRlKChwYWdlIC0gMSkgKiB0aGlzLnBhZ2VTaXplICsgdGhpcy5jcmVhdGVkLmxlbmd0aCAtIHRoaXMuZGVzdHJveWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIHdhcm5pbmcocGFnZSA+IDAsICdQYWdlIG51bWJlciBpcyBpbmNvcnJlY3QuJyk7XG4gICAgd2FybmluZyghIXRoaXMucGFnaW5nLCAnQ2FuIG5vdCBwYWdpbmcgcXVlcnkgdXRpbCB0aGUgcHJvcGVydHk8cGFnaW5nPiBvZiBEYXRhU2V0IGlzIHRydWUgb3IgYHNlcnZlcmAuJyk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWumuS9jeiusOW9lVxuICAgKiBAcGFyYW0gaW5kZXgg57Si5byVXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgbG9jYXRlKGluZGV4OiBudW1iZXIpOiBQcm9taXNlPFJlY29yZCB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IHsgcGFnaW5nLCBwYWdlU2l6ZSwgdG90YWxDb3VudCB9ID0gdGhpcztcbiAgICBjb25zdCB7IG1vZGlmaWVkQ2hlY2ssIG1vZGlmaWVkQ2hlY2tNZXNzYWdlLCBhdXRvTG9jYXRlRmlyc3QgfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IGN1cnJlbnRSZWNvcmQgPSB0aGlzLmZpbmRJbkFsbFBhZ2UoaW5kZXgpO1xuICAgIGlmIChjdXJyZW50UmVjb3JkKSB7XG4gICAgICB0aGlzLmN1cnJlbnQgPSBjdXJyZW50UmVjb3JkO1xuICAgICAgcmV0dXJuIGN1cnJlbnRSZWNvcmQ7XG4gICAgfVxuICAgIGlmIChwYWdpbmcgPT09IHRydWUgfHwgcGFnaW5nID09PSAnc2VydmVyJykge1xuICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0b3RhbENvdW50ICsgdGhpcy5jcmVhdGVkLmxlbmd0aCAtIHRoaXMuZGVzdHJveWVkLmxlbmd0aCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIW1vZGlmaWVkQ2hlY2sgfHxcbiAgICAgICAgICAhdGhpcy5kaXJ0eSB8fFxuICAgICAgICAgIChhd2FpdCBjb25maXJtKG1vZGlmaWVkQ2hlY2tNZXNzYWdlIHx8ICRsKCdEYXRhU2V0JywgJ3Vuc2F2ZWRfZGF0YV9jb25maXJtJykpKSAhPT0gJ2NhbmNlbCdcbiAgICAgICAgKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5xdWVyeShNYXRoLmZsb29yKGluZGV4IC8gcGFnZVNpemUpICsgMSk7XG4gICAgICAgICAgY3VycmVudFJlY29yZCA9IHRoaXMuZmluZEluQWxsUGFnZShpbmRleCk7XG4gICAgICAgICAgaWYgKGN1cnJlbnRSZWNvcmQpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGF1dG9Mb2NhdGVGaXJzdCA/IGN1cnJlbnRSZWNvcmQgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFJlY29yZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgd2FybmluZyhmYWxzZSwgJ0xvY2F0ZWQgaW5kZXggb2YgUmVjb3JkIGlzIG91dCBvZiBib3VuZGFyeS4nKTtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gIH1cblxuICAvKipcbiAgICog5a6a5L2N5Yiw56ys5LiA5p2h6K6w5b2VXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgZmlyc3QoKTogUHJvbWlzZTxSZWNvcmQgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGUoMCk7XG4gIH1cblxuICAvKipcbiAgICog5a6a5L2N5Yiw5pyA5ZCO5LiA5p2h6K6w5b2VXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgbGFzdCgpOiBQcm9taXNlPFJlY29yZCB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLmxvY2F0ZSgodGhpcy5wYWdpbmcgPyB0aGlzLnRvdGFsQ291bnQgOiB0aGlzLmxlbmd0aCkgLSAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlrprkvY3liLDlvZPliY3orrDlvZXnmoTkuIrkuIDmnaHorrDlvZVcbiAgICog6Iul5b2T5YmN6aG15Lit5b2T5YmN6K6w5b2V5Li656ys5LiA5p2h6K6w5b2V5LiU5pyJ5LiK5LiA6aG177yM5YiZ5Lya5p+l6K+i5LiK5LiA6aG15bm25a6a5L2N5Yiw5LiK5LiA6aG155qE5pyA5ZCO5LiA5p2h6K6w5b2VXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgcHJlKCk6IFByb21pc2U8UmVjb3JkIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYXRlKHRoaXMuY3VycmVudEluZGV4IC0gMSk7XG4gIH1cblxuICAvKipcbiAgICog5a6a5L2N5Yiw5b2T5YmN6K6w5b2V55qE5LiL5LiA5p2h6K6w5b2VXG4gICAqIOiLpeW9k+WJjemhteS4reW9k+WJjeiusOW9leS4uuacgOWQjuS4gOadoeiusOW9leS4lOacieS4i+S4gOmhte+8jOWImeS8muafpeivouS4i+S4gOmhteW5tuWumuS9jeWIsOS4i+S4gOmhteeahOesrOS4gOadoeiusOW9lVxuICAgKiBAcmV0dXJuIFByb21pc2VcbiAgICovXG4gIG5leHQoKTogUHJvbWlzZTxSZWNvcmQgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5sb2NhdGUodGhpcy5jdXJyZW50SW5kZXggKyAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlrprkvY3liLDpppbpobVcbiAgICogQHJldHVybiBQcm9taXNlXG4gICAqL1xuICBmaXJzdFBhZ2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5wYWdlKDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWumuS9jeWIsOS4iuS4gOmhtVxuICAgKiBAcmV0dXJuIFByb21pc2VcbiAgICovXG4gIHByZVBhZ2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5wYWdlKHRoaXMuY3VycmVudFBhZ2UgLSAxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlrprkvY3liLDkuIvkuIDpobVcbiAgICogQHJldHVybiBQcm9taXNlXG4gICAqL1xuICBuZXh0UGFnZSgpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLnBhZ2UodGhpcy5jdXJyZW50UGFnZSArIDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWumuS9jeWIsOWwvumhtVxuICAgKiBAcmV0dXJuIFByb21pc2VcbiAgICovXG4gIGxhc3RQYWdlKCk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMucGFnZSh0aGlzLnRvdGFsUGFnZSk7XG4gIH1cblxuICAvKipcbiAgICog5Yib5bu65LiA5p2h6K6w5b2VXG4gICAqIEBwYXJhbSBkYXRhIOaVsOaNruWvueixoVxuICAgKiBAcGFyYW0gZGF0YUluZGV4IOiusOW9leaJgOWcqOeahOe0ouW8lVxuICAgKiBAcmV0dXJuIOaWsOW7uueahOiusOW9lVxuICAgKi9cbiAgY3JlYXRlKGRhdGE6IG9iamVjdCA9IHt9LCBkYXRhSW5kZXg/OiBudW1iZXIpOiBSZWNvcmQge1xuICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICBkYXRhID0ge307XG4gICAgfVxuICAgIFsuLi50aGlzLmZpZWxkcy5lbnRyaWVzKCldLmZvckVhY2goKFtuYW1lLCBmaWVsZF0pID0+IHtcbiAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZSA9IGZpZWxkLmdldCgnZGVmYXVsdFZhbHVlJyk7XG4gICAgICBjb25zdCB2YWx1ZSA9IE9iamVjdENoYWluVmFsdWUuZ2V0KGRhdGEsIG5hbWUpO1xuICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgT2JqZWN0Q2hhaW5WYWx1ZS5zZXQoZGF0YSwgbmFtZSwgdG9KUyhkZWZhdWx0VmFsdWUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCByZWNvcmQgPSBuZXcgUmVjb3JkKGRhdGEsIHRoaXMpO1xuICAgIGlmIChpc051bWJlcihkYXRhSW5kZXgpKSB7XG4gICAgICB0aGlzLnNwbGljZShkYXRhSW5kZXgsIDAsIHJlY29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHVzaChyZWNvcmQpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5hdXRvTG9jYXRlQWZ0ZXJDcmVhdGUpIHtcbiAgICAgIHRoaXMuY3VycmVudCA9IHJlY29yZDtcbiAgICB9XG4gICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5jcmVhdGUsIHsgZGF0YVNldDogdGhpcywgcmVjb3JkIH0pO1xuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKipcbiAgICog56uL5Y2z5Yig6Zmk6K6w5b2VXG4gICAqIEBwYXJhbSByZWNvcmRzIOiusOW9leaIluiAheiusOW9leaVsOe7hO+8jOm7mOiupOW9k+WJjeiusOW9lVxuICAgKiBAcGFyYW0gY29uZmlybU1lc3NhZ2Ug5o+Q56S65L+h5oGv5oiW5by556qX55qE5bGe5oCnXG4gICAqIEByZXR1cm4gUHJvbWlzZVxuICAgKi9cbiAgYXN5bmMgZGVsZXRlKFxuICAgIHJlY29yZHM/OiBSZWNvcmQgfCBSZWNvcmRbXSxcbiAgICBjb25maXJtTWVzc2FnZT86IFJlYWN0Tm9kZSB8IE1vZGFsUHJvcHMgJiBjb25maXJtUHJvcHMsXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKHJlY29yZHMpIHtcbiAgICAgIHJlY29yZHMgPSAoW10gYXMgUmVjb3JkW10pLmNvbmNhdChyZWNvcmRzKTtcbiAgICAgIGlmIChcbiAgICAgICAgcmVjb3Jkcy5sZW5ndGggPiAwICYmXG4gICAgICAgIChhd2FpdCB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLmJlZm9yZURlbGV0ZSwgeyBkYXRhU2V0OiB0aGlzLCByZWNvcmRzIH0pKSAhPT0gZmFsc2UgJiZcbiAgICAgICAgKGF3YWl0IGNvbmZpcm0oY29uZmlybU1lc3NhZ2UgfHwgJGwoJ0RhdGFTZXQnLCAnZGVsZXRlX3NlbGVjdGVkX3Jvd19jb25maXJtJykpKSAhPT0gJ2NhbmNlbCdcbiAgICAgICkge1xuICAgICAgICB0aGlzLnJlbW92ZShyZWNvcmRzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMucGVuZGluZy5hZGQodGhpcy53cml0ZSh0aGlzLmRlc3Ryb3llZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDkuLTml7bliKDpmaTorrDlvZVcbiAgICogQHBhcmFtIHJlY29yZHMg6K6w5b2V5oiW6ICF6K6w5b2V5pWw57uEXG4gICAqL1xuICBAYWN0aW9uXG4gIHJlbW92ZShyZWNvcmRzPzogUmVjb3JkIHwgUmVjb3JkW10pOiB2b2lkIHtcbiAgICBpZiAocmVjb3Jkcykge1xuICAgICAgY29uc3QgZGF0YSA9IGlzQXJyYXlMaWtlKHJlY29yZHMpID8gcmVjb3Jkcy5zbGljZSgpIDogW3JlY29yZHNdO1xuICAgICAgaWYgKGRhdGEubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gdGhpcztcbiAgICAgICAgZGF0YS5mb3JFYWNoKHRoaXMuZGVsZXRlUmVjb3JkLCB0aGlzKTtcbiAgICAgICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5yZW1vdmUsIHsgZGF0YVNldDogdGhpcywgcmVjb3JkczogZGF0YSB9KTtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnQpIHtcbiAgICAgICAgICBsZXQgcmVjb3JkO1xuICAgICAgICAgIGlmICh0aGlzLnByb3BzLmF1dG9Mb2NhdGVBZnRlclJlbW92ZSkge1xuICAgICAgICAgICAgcmVjb3JkID0gdGhpcy5nZXQoMCk7XG4gICAgICAgICAgICBpZiAocmVjb3JkKSB7XG4gICAgICAgICAgICAgIHJlY29yZC5pc0N1cnJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY3VycmVudCAhPT0gcmVjb3JkKSB7XG4gICAgICAgICAgICB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLmluZGV4Q2hhbmdlLCB7IGRhdGFTZXQ6IHRoaXMsIHJlY29yZCwgcHJldmlvdXM6IGN1cnJlbnQgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOS4tOaXtuWIoOmZpOaJgOacieiusOW9lVxuICAgKi9cbiAgQGFjdGlvblxuICByZW1vdmVBbGwoKSB7XG4gICAgY29uc3QgeyBjdXJyZW50LCBkYXRhIH0gPSB0aGlzO1xuICAgIGlmIChkYXRhLmxlbmd0aCkge1xuICAgICAgZGF0YS5mb3JFYWNoKHRoaXMuZGVsZXRlUmVjb3JkLCB0aGlzKTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMucmVtb3ZlLCB7IGRhdGFTZXQ6IHRoaXMsIHJlY29yZHM6IGRhdGEgfSk7XG4gICAgICBpZiAoY3VycmVudCkge1xuICAgICAgICB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLmluZGV4Q2hhbmdlLCB7IGRhdGFTZXQ6IHRoaXMsIHByZXZpb3VzOiBjdXJyZW50IH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDliKDpmaTmiYDmnInorrDlvZVcbiAgICogQHBhcmFtIGNvbmZpcm1NZXNzYWdlIOaPkOekuuS/oeaBr+aIluW8ueeql+eahOWxnuaAp1xuICAgKi9cbiAgQGFjdGlvblxuICBhc3luYyBkZWxldGVBbGwoY29uZmlybU1lc3NhZ2U/OiBSZWFjdE5vZGUgfCBNb2RhbFByb3BzICYgY29uZmlybVByb3BzKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5yZWNvcmRzLmxlbmd0aCA+IDAgJiZcbiAgICAgIChhd2FpdCBjb25maXJtKGNvbmZpcm1NZXNzYWdlIHx8ICRsKCdEYXRhU2V0JywgJ2RlbGV0ZV9hbGxfcm93X2NvbmZpcm0nKSkpICE9PSAnY2FuY2VsJ1xuICAgICkge1xuICAgICAgdGhpcy5yZW1vdmVBbGwoKTtcbiAgICAgIHJldHVybiB0aGlzLnBlbmRpbmcuYWRkKHRoaXMud3JpdGUodGhpcy5kZXN0cm95ZWQpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5bCG6Iul5bmy5pWw5o2u6K6w5b2V5o+S5YWl6K6w5b2V5aCG5qCI6aG26YOoXG4gICAqIEBwYXJhbSByZWNvcmRzIOaVsOaNrumbhlxuICAgKiBAcmV0dXJuIOWghuagiOaVsOmHj1xuICAgKi9cbiAgQGFjdGlvblxuICBwdXNoKC4uLnJlY29yZHM6IFJlY29yZFtdKTogbnVtYmVyIHtcbiAgICBjaGVja1BhcmVudEJ5SW5zZXJ0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnJlY29yZHMucHVzaCguLi50aGlzLnRyYW5zZmVyUmVjb3JkcyhyZWNvcmRzKSk7XG4gIH1cblxuICAvKipcbiAgICog5bCG6Iul5bmy5pWw5o2u6K6w5b2V5o+S5YWl6K6w5b2V5aCG5qCI5bqV6YOoXG4gICAqIEBwYXJhbSByZWNvcmRzIOaVsOaNrumbhlxuICAgKiBAcmV0dXJuIOWghuagiOaVsOmHj1xuICAgKi9cbiAgQGFjdGlvblxuICB1bnNoaWZ0KC4uLnJlY29yZHM6IFJlY29yZFtdKTogbnVtYmVyIHtcbiAgICBjaGVja1BhcmVudEJ5SW5zZXJ0KHRoaXMpO1xuICAgIHJldHVybiB0aGlzLnJlY29yZHMudW5zaGlmdCguLi50aGlzLnRyYW5zZmVyUmVjb3JkcyhyZWNvcmRzKSk7XG4gIH1cblxuICAvKipcbiAgICog5LuO6K6w5b2V5aCG5qCI6aG26YOo6I635Y+W6K6w5b2VXG4gICAqIEByZXR1cm4g6K6w5b2VXG4gICAqL1xuICBAYWN0aW9uXG4gIHBvcCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmRlbGV0ZVJlY29yZCh0aGlzLmRhdGEucG9wKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIOS7juiusOW9leWghuagiOW6lemDqOiOt+WPluiusOW9lVxuICAgKiBAcmV0dXJuIOiusOW9lVxuICAgKi9cbiAgQGFjdGlvblxuICBzaGlmdCgpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmRlbGV0ZVJlY29yZCh0aGlzLmRhdGEuc2hpZnQoKSk7XG4gIH1cblxuICAvKipcbiAgICog5Yig6Zmk5oyH5a6a57Si5byV55qE6Iul5bmy6K6w5b2V77yM5bm25Y+v5o+S5YWl6Iul5bmy5paw6K6w5b2VXG4gICAqIEBwYXJhbSBmcm9tIOe0ouW8leW8gOWni+eahOS9jee9rlxuICAgKiBAZGVmYXVsdCAwXG4gICAqIEBwYXJhbSBkZWxldGVDb3VudCDliKDpmaTnmoTmlbDph49cbiAgICogQGRlZmF1bHQgMFxuICAgKiBAcGFyYW0gcmVjb3JkcyDmj5LlhaXnmoToi6XlubLmlrDorrDlvZVcbiAgICogQHJldHVybiDooqvliKDpmaTnmoTorrDlvZXpm4ZcbiAgICovXG4gIEBhY3Rpb25cbiAgc3BsaWNlKGZyb206IG51bWJlciwgZGVsZXRlQ291bnQ6IG51bWJlciwgLi4uaXRlbXM6IFJlY29yZFtdKTogKFJlY29yZCB8IHVuZGVmaW5lZClbXSB7XG4gICAgY29uc3QgZnJvbVJlY29yZCA9IHRoaXMuZ2V0KGZyb20pO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSB0aGlzLnNsaWNlKGZyb20sIGZyb20gKyBkZWxldGVDb3VudCkubWFwKHRoaXMuZGVsZXRlUmVjb3JkLCB0aGlzKTtcbiAgICBpZiAoaXRlbXMubGVuZ3RoKSB7XG4gICAgICBjaGVja1BhcmVudEJ5SW5zZXJ0KHRoaXMpO1xuICAgICAgY29uc3QgeyByZWNvcmRzIH0gPSB0aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZWRSZWNvcmRzID0gdGhpcy50cmFuc2ZlclJlY29yZHMoaXRlbXMpO1xuICAgICAgaWYgKGZyb21SZWNvcmQpIHtcbiAgICAgICAgcmVjb3Jkcy5zcGxpY2UocmVjb3Jkcy5pbmRleE9mKGZyb21SZWNvcmQpLCAwLCAuLi50cmFuc2Zvcm1lZFJlY29yZHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVjb3Jkcy5wdXNoKC4uLnRyYW5zZm9ybWVkUmVjb3Jkcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWxldGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIh+aNouiusOW9leeahOmhuuW6j1xuICAgKi9cbiAgbW92ZShmcm9tOiBudW1iZXIsIHRvOiBudW1iZXIpIHtcbiAgICBhcnJheU1vdmUodGhpcy5yZWNvcmRzLCBmcm9tLCB0bylcbiAgfVxuXG4gIC8qKlxuICAgKiDmiKrlj5bmjIflrprntKLlvJXojIPlm7TnmoTorrDlvZXpm4bvvIzkuI3mlLnlj5jljp/orrDlvZXloIbmoIhcbiAgICogQHBhcmFtIHN0YXJ0IOW8gOWni+e0ouW8lVxuICAgKiBAZGVmYXVsdCAwXG4gICAqIEBwYXJhbSBlbmQg57uT5p2f57Si5byVXG4gICAqIEBkZWZhdWx0IOiusOW9leWghuagiOmVv+W6plxuICAgKiBAcmV0dXJuIOiiq+WIoOmZpOeahOiusOW9lembhlxuICAgKi9cbiAgc2xpY2Uoc3RhcnQ6IG51bWJlciA9IDAsIGVuZDogbnVtYmVyID0gdGhpcy5sZW5ndGgpOiBSZWNvcmRbXSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5borrDlvZXmiYDlnKjnmoTntKLlvJVcbiAgICogQHBhcmFtIHJlY29yZCDorrDlvZVcbiAgICogQHBhcmFtIGZyb21JbmRleCDlvIDlp4vmo4DntKLnmoTntKLlvJVcbiAgICogQHJldHVybiDntKLlvJVcbiAgICovXG4gIGluZGV4T2YocmVjb3JkOiBSZWNvcmQsIGZyb21JbmRleD86IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5pbmRleE9mKHJlY29yZCwgZnJvbUluZGV4KTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lh73mlbDmn6Xmib7orrDlvZVcbiAgICogQHBhcmFtIGZuIOafpeivouWHveaVsFxuICAgKiBAcmV0dXJucyDorrDlvZVcbiAgICovXG4gIGZpbmQoZm46IChyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFJlY29yZFtdKSA9PiBib29sZWFuKTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmZpbmQoZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruWHveaVsOafpeaJvuiusOW9leaJgOWcqOeahOe0ouW8lVxuICAgKiBAcGFyYW0gZm4g5p+l6K+i5Ye95pWwXG4gICAqIEByZXR1cm5zIOe0ouW8lVxuICAgKi9cbiAgZmluZEluZGV4KGZuOiAocmVjb3JkOiBSZWNvcmQsIGluZGV4OiBudW1iZXIsIGFycmF5OiBSZWNvcmRbXSkgPT4gYm9vbGVhbik6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5maW5kSW5kZXgoZm4pO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruWHveaVsOmBjeWOhlxuICAgKiBAcGFyYW0gZm4g6YGN5Y6G5Ye95pWwXG4gICAqIEBwYXJhbSB0aGlzQXJnIHRoaXPlr7nosaFcbiAgICovXG4gIGZvckVhY2goZm46IChyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFJlY29yZFtdKSA9PiB2b2lkLCB0aGlzQXJnPzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5kYXRhLmZvckVhY2goZm4sIHRoaXNBcmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIOagueaNruWHveaVsOmBjeWOhuW5tui+k+WHuuaWsOaVsOe7hFxuICAgKiBAcGFyYW0gZm4g6YGN5Y6G5Ye95pWwXG4gICAqIEBwYXJhbSB0aGlzQXJnIHRoaXPlr7nosaFcbiAgICogQHJldHVybnMg6L6T5Ye65paw5pWw57uEXG4gICAqL1xuICBtYXA8VT4oZm46IChyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFJlY29yZFtdKSA9PiBVLCB0aGlzQXJnPzogYW55KTogVVtdIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLm1hcChmbiwgdGhpc0FyZyk7XG4gIH1cblxuICAvKipcbiAgICog5qC55o2u5Ye95pWw6YGN5Y6G77yM5b2T5pyJ6L+U5Zue5YC85Li6dHJ1ZeaXtu+8jOi+k+WHunRydWVcbiAgICogQHBhcmFtIGZuIOmBjeWOhuWHveaVsFxuICAgKiBAcGFyYW0gdGhpc0FyZyB0aGlz5a+56LGhXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICovXG4gIHNvbWUoZm46IChyZWNvcmQ6IFJlY29yZCwgaW5kZXg6IG51bWJlciwgYXJyYXk6IFJlY29yZFtdKSA9PiBib29sZWFuLCB0aGlzQXJnPzogYW55KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5zb21lKGZuLCB0aGlzQXJnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lh73mlbDpgY3ljobvvIzlvZPmnInov5Tlm57lgLzkuLpmYWxzZeaXtu+8jOi+k+WHumZhbHNlXG4gICAqIEBwYXJhbSBmbiDpgY3ljoblh73mlbBcbiAgICogQHBhcmFtIHRoaXNBcmcgdGhpc+WvueixoVxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqL1xuICBldmVyeShmbjogKHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyLCBhcnJheTogUmVjb3JkW10pID0+IGJvb2xlYW4sIHRoaXNBcmc/OiBhbnkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmV2ZXJ5KGZuLCB0aGlzQXJnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lh73mlbDov4fmu6Tlubbov5Tlm57orrDlvZXpm4ZcbiAgICogQHBhcmFtIGZuIOi/h+a7pOWHveaVsFxuICAgKiBAcGFyYW0gdGhpc0FyZyB0aGlz5a+56LGhXG4gICAqIEByZXR1cm5zIHtSZWNvcmRbXX1cbiAgICovXG4gIGZpbHRlcihmbjogKHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyLCBhcnJheTogUmVjb3JkW10pID0+IGJvb2xlYW4sIHRoaXNBcmc/OiBhbnkpOiBSZWNvcmRbXSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5maWx0ZXIoZm4sIHRoaXNBcmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIOS4uuaVsOe7hOS4reeahOaJgOacieWFg+e0oOiwg+eUqOaMh+WumueahOWbnuiwg+WHveaVsOOAgiDlm57osIPlh73mlbDnmoTov5Tlm57lgLzmmK/ntK/orqHnu5PmnpzvvIzlubblnKjkuIvmrKHosIPnlKjlm57osIPlh73mlbDml7bkvZzkuLrlj4LmlbDmj5DkvpvjgIJcbiAgICogQHBhcmFtIGZuIOe0r+iuoeWHveaVsFxuICAgKiBAcGFyYW0gaW5pdGlhbFZhbHVlIOWIneWni+WAvFxuICAgKiBAcmV0dXJucyB7VX1cbiAgICovXG4gIHJlZHVjZTxVPihcbiAgICBmbjogKHByZXZpb3VzVmFsdWU6IFUsIHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyLCBhcnJheTogUmVjb3JkW10pID0+IFUsXG4gICAgaW5pdGlhbFZhbHVlOiBVLFxuICApOiBVIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnJlZHVjZTxVPihmbiwgaW5pdGlhbFZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDmjInpmY3luo/osIPnlKjmlbDnu4TkuK3miYDmnInlhYPntKDnmoTmjIflrprlm57osIPlh73mlbDjgIIg5Zue6LCD5Ye95pWw55qE6L+U5Zue5YC85piv57Sv6K6h57uT5p6c77yM5bm25Zyo5LiL5qyh6LCD55So5Zue6LCD5Ye95pWw5pe25L2c5Li65Y+C5pWw5o+Q5L6b44CCXG4gICAqIEBwYXJhbSBmbiDntK/orqHlh73mlbBcbiAgICogQHBhcmFtIGluaXRpYWxWYWx1ZSDliJ3lp4vlgLxcbiAgICogQHJldHVybnMge1V9XG4gICAqL1xuICByZWR1Y2VSaWdodDxVPihcbiAgICBmbjogKHByZXZpb3VzVmFsdWU6IFUsIHJlY29yZDogUmVjb3JkLCBpbmRleDogbnVtYmVyLCBhcnJheTogUmVjb3JkW10pID0+IFUsXG4gICAgaW5pdGlhbFZhbHVlOiBVLFxuICApOiBVIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLnJlZHVjZVJpZ2h0PFU+KGZuLCBpbml0aWFsVmFsdWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIOWPjei9rOiusOW9leeahOmhuuW6j+OAglxuICAgKi9cbiAgQGFjdGlvblxuICByZXZlcnNlKCk6IFJlY29yZFtdIHtcbiAgICByZXR1cm4gKHRoaXMucmVjb3JkcyA9IHRoaXMucmVjb3Jkcy5yZXZlcnNlKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIOacjeWKoeerr+aOkuW6j1xuICAgKiDmjpLluo/mlrDlop7liqDkuK3pl7TmgIFcbiAgICogQHBhcmFtIGZpZWxkTmFtZVxuICAgKi9cbiAgQGFjdGlvblxuICBzb3J0KGZpZWxkTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZmllbGQgPSB0aGlzLmdldEZpZWxkKGZpZWxkTmFtZSk7XG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICBjb25zdCBjdXJyZW50cyA9IGdldE9yZGVyRmllbGRzKHRoaXMuZmllbGRzKTtcbiAgICAgIGN1cnJlbnRzLmZvckVhY2goY3VycmVudCA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50ICE9PSBmaWVsZCkge1xuICAgICAgICAgIGN1cnJlbnQub3JkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc3dpdGNoIChmaWVsZC5vcmRlcikge1xuICAgICAgICBjYXNlIFNvcnRPcmRlci5hc2M6XG4gICAgICAgICAgZmllbGQub3JkZXIgPSBTb3J0T3JkZXIuZGVzYztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTb3J0T3JkZXIuZGVzYzpcbiAgICAgICAgICBmaWVsZC5vcmRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBmaWVsZC5vcmRlciA9IFNvcnRPcmRlci5hc2M7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wYWdpbmcgfHwgIWZpZWxkLm9yZGVyKSB7XG4gICAgICAgIHRoaXMucXVlcnkoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVjb3JkcyA9IHRoaXMucmVjb3Jkcy5zb3J0KGdldEZpZWxkU29ydGVyKGZpZWxkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOmAieS4reiusOW9lVxuICAgKiBAcGFyYW0gcmVjb3JkT3JJbmRleCDorrDlvZXmiJborrDlvZXntKLlvJVcbiAgICovXG4gIEBhY3Rpb25cbiAgc2VsZWN0KHJlY29yZE9ySW5kZXg6IFJlY29yZCB8IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSB0aGlzO1xuICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgIGxldCByZWNvcmQ6IFJlY29yZCB8IHVuZGVmaW5lZCA9IHJlY29yZE9ySW5kZXggYXMgUmVjb3JkO1xuICAgICAgaWYgKGlzTnVtYmVyKHJlY29yZE9ySW5kZXgpKSB7XG4gICAgICAgIHJlY29yZCA9IHRoaXMuZ2V0KHJlY29yZE9ySW5kZXggYXMgbnVtYmVyKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWNvcmQgJiYgcmVjb3JkLnNlbGVjdGFibGUgJiYgIXJlY29yZC5pc1NlbGVjdGVkKSB7XG4gICAgICAgIGxldCBwcmV2aW91czogUmVjb3JkIHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAoc2VsZWN0aW9uID09PSBEYXRhU2V0U2VsZWN0aW9uLnNpbmdsZSkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0ZWQuZm9yRWFjaCgoc2VsZWN0ZWQ6IFJlY29yZCkgPT4ge1xuICAgICAgICAgICAgc2VsZWN0ZWQuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcHJldmlvdXMgPSBzZWxlY3RlZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVjb3JkKSB7XG4gICAgICAgICAgcmVjb3JkLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5pbkJhdGNoU2VsZWN0aW9uKSB7XG4gICAgICAgICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5zZWxlY3QsIHsgZGF0YVNldDogdGhpcywgcmVjb3JkLCBwcmV2aW91cyB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlj5bmtojpgInkuK3orrDlvZVcbiAgICogQHBhcmFtIHJlY29yZE9ySW5kZXgg6K6w5b2V5oiW6K6w5b2V57Si5byVXG4gICAqL1xuICBAYWN0aW9uXG4gIHVuU2VsZWN0KHJlY29yZE9ySW5kZXg6IFJlY29yZCB8IG51bWJlcik6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xuICAgICAgbGV0IHJlY29yZDogUmVjb3JkIHwgdW5kZWZpbmVkID0gcmVjb3JkT3JJbmRleCBhcyBSZWNvcmQ7XG4gICAgICBpZiAoaXNOdW1iZXIocmVjb3JkT3JJbmRleCkpIHtcbiAgICAgICAgcmVjb3JkID0gdGhpcy5nZXQocmVjb3JkT3JJbmRleCBhcyBudW1iZXIpO1xuICAgICAgfVxuICAgICAgaWYgKHJlY29yZCAmJiByZWNvcmQuc2VsZWN0YWJsZSAmJiByZWNvcmQuaXNTZWxlY3RlZCkge1xuICAgICAgICByZWNvcmQuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoIXRoaXMuaW5CYXRjaFNlbGVjdGlvbikge1xuICAgICAgICAgIGNvbnN0IGNhY2hlZEluZGV4ID0gdGhpcy5jYWNoZWRTZWxlY3RlZC5pbmRleE9mKHJlY29yZCk7XG4gICAgICAgICAgaWYgKGNhY2hlZEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRTZWxlY3RlZC5zcGxpY2UoY2FjaGVkSW5kZXgsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLnVuU2VsZWN0LCB7IGRhdGFTZXQ6IHRoaXMsIHJlY29yZCB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlhajpgIlcbiAgICovXG4gIEBhY3Rpb25cbiAgc2VsZWN0QWxsKGZpbHRlcj86IChyZWNvcmQ6IFJlY29yZCkgPT4gYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSB0aGlzO1xuICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMuaW5CYXRjaFNlbGVjdGlvbiA9IHRydWU7XG4gICAgICBpZiAoc2VsZWN0aW9uID09PSBEYXRhU2V0U2VsZWN0aW9uLnNpbmdsZSkge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0KGZpbHRlciA/IHRoaXMuZmlsdGVyKGZpbHRlcilbMF0gOiAwKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWNvcmRzLmZvckVhY2gocmVjb3JkID0+IHtcbiAgICAgICAgICBpZiAoIWZpbHRlciB8fCBmaWx0ZXIocmVjb3JkKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KHJlY29yZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5zZWxlY3RBbGwsIHsgZGF0YVNldDogdGhpcyB9KTtcbiAgICAgIHRoaXMuaW5CYXRjaFNlbGVjdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlj5bmtojlhajpgIlcbiAgICovXG4gIEBhY3Rpb25cbiAgdW5TZWxlY3RBbGwoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XG4gICAgICB0aGlzLmluQmF0Y2hTZWxlY3Rpb24gPSB0cnVlO1xuICAgICAgdGhpcy5jdXJyZW50U2VsZWN0ZWQuZm9yRWFjaChyZWNvcmQgPT4ge1xuICAgICAgICB0aGlzLnVuU2VsZWN0KHJlY29yZCk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMudW5TZWxlY3RBbGwsIHsgZGF0YVNldDogdGhpcyB9KTtcbiAgICAgIHRoaXMuaW5CYXRjaFNlbGVjdGlvbiA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGNsZWFyQ2FjaGVkU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgdGhpcy5zZXRDYWNoZWRTZWxlY3RlZChbXSk7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldENhY2hlZFNlbGVjdGVkKGNhY2hlZFNlbGVjdGVkOiBSZWNvcmRbXSk6IHZvaWQge1xuICAgIHRoaXMuY2FjaGVkU2VsZWN0ZWQgPSBjYWNoZWRTZWxlY3RlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bmjIflrprntKLlvJXnmoTorrDlvZVcbiAgICogQHBhcmFtIGluZGV4IOe0ouW8lVxuICAgKiBAcmV0dXJucyB7UmVjb3JkfVxuICAgKi9cbiAgZ2V0KGluZGV4OiBudW1iZXIpOiBSZWNvcmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHsgZGF0YSB9ID0gdGhpcztcbiAgICByZXR1cm4gZGF0YS5sZW5ndGggPyBkYXRhW2luZGV4XSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiDku47moJHlvaLmlbDmja7kuK3ojrflj5bmjIflrprntKLlvJXnmoTmoLnoioLngrnorrDlvZVcbiAgICogQHBhcmFtIGluZGV4IOe0ouW8lVxuICAgKiBAcmV0dXJucyB7UmVjb3JkfVxuICAgKi9cbiAgZ2V0RnJvbVRyZWUoaW5kZXg6IG51bWJlcik6IFJlY29yZCB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgeyB0cmVlRGF0YSB9ID0gdGhpcztcbiAgICByZXR1cm4gdHJlZURhdGEubGVuZ3RoID8gdHJlZURhdGFbaW5kZXhdIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaYr+WQpuacieaWsOWinuOAgeWPmOabtOaIluiAheWIoOmZpOeahOiusOW9lVxuICAgKiBAZGVwcmVjYXRlZFxuICAgKiBAcmV0dXJuIHRydWUgfCBmYWxzZVxuICAgKi9cbiAgaXNNb2RpZmllZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kaXJ0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bmjIflrprliIbpobXnmoTorrDlvZXpm4ZcbiAgICogQHBhcmFtIHBhZ2Ug5aaC5p6ccGFnZeS4uuepuuaIluiAhXBhZ2luZ+S4unNlcnZlcu+8jOWImeiOt+WPluW9k+WJjeWIhumhteeahOiusOW9lembhlxuICAgKiBAcmV0dXJuIOiusOW9lembhlxuICAgKi9cblxuICAvKipcbiAgICog5qC55o2u6K6w5b2VSUTmn6Xmib7orrDlvZVcbiAgICogQHBhcmFtIGlkIOiusOW9lUlEXG4gICAqIEByZXR1cm4g6K6w5b2VXG4gICAqL1xuICBmaW5kUmVjb3JkQnlJZChpZDogbnVtYmVyIHwgc3RyaW5nKTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAoaWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVjb3Jkcy5maW5kKHJlY29yZCA9PiBTdHJpbmcocmVjb3JkLmlkKSA9PT0gU3RyaW5nKGlkKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOagoemqjOaVsOaNruiusOW9leaYr+WQpuacieaViFxuICAgKiBAcGFyYW0gaXNTZWxlY3RlZCDmmK/lkKblj6rmoKHpqozpgInkuK3orrDlvZVcbiAgICogQHBhcmFtIG5vQ2FzY2FkZSDmmK/lkKbnuqfogZTmoKHpqoxcbiAgICogQHJldHVybiB0cnVlIHwgZmFsc2VcbiAgICovXG4gIHZhbGlkYXRlKGlzU2VsZWN0ZWQ/OiBib29sZWFuLCBub0Nhc2NhZGU/OiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZGF0YVRvSlNPTiA9IGFkYXB0ZXJEYXRhVG9KU09OKGlzU2VsZWN0ZWQsIG5vQ2FzY2FkZSk7XG4gICAgaWYgKGRhdGFUb0pTT04pIHtcbiAgICAgIHRoaXMuZGF0YVRvSlNPTiA9IGRhdGFUb0pTT047XG4gICAgfVxuICAgIGNvbnN0IGNhc2NhZGUgPVxuICAgICAgbm9DYXNjYWRlID09PSB1bmRlZmluZWQgJiYgdGhpcy5kYXRhVG9KU09OID8gdXNlQ2FzY2FkZSh0aGlzLmRhdGFUb0pTT04pIDogIW5vQ2FzY2FkZTtcbiAgICBjb25zdCB2YWxpZGF0ZVJlc3VsdCA9IFByb21pc2UuYWxsKFxuICAgICAgKHVzZVNlbGVjdGVkKHRoaXMuZGF0YVRvSlNPTikgPyB0aGlzLnNlbGVjdGVkIDogdGhpcy5kYXRhKS5tYXAocmVjb3JkID0+XG4gICAgICAgIHJlY29yZC52YWxpZGF0ZShmYWxzZSwgIWNhc2NhZGUpLFxuICAgICAgKSxcbiAgICApLnRoZW4ocmVzdWx0cyA9PiByZXN1bHRzLmV2ZXJ5KHJlc3VsdCA9PiByZXN1bHQpKTtcblxuICAgIHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMudmFsaWRhdGUsIHsgZGF0YVNldDogdGhpcywgcmVzdWx0OiB2YWxpZGF0ZVJlc3VsdCB9KTtcblxuICAgIHJldHVybiB2YWxpZGF0ZVJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiDmoLnmja7lrZfmrrXlkI3ojrflj5blrZfmrrVcbiAgICogQHBhcmFtIGZpZWxkTmFtZSDlrZfmrrXlkI1cbiAgICogQHJldHVybnMg5a2X5q61XG4gICAqL1xuICBnZXRGaWVsZChmaWVsZE5hbWU/OiBzdHJpbmcpOiBGaWVsZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGZpZWxkTmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmllbGRzLmdldChmaWVsZE5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDojrflj5bliIbnu4TlrZfmrrXlkI1cbiAgICogQHJldHVybnMg5a2X5q615ZCN5YiX6KGoXG4gICAqL1xuICBnZXRHcm91cHMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBbLi4udGhpcy5maWVsZHMuZW50cmllcygpXVxuICAgICAgLnJlZHVjZSgoYXJyOiBzdHJpbmdbXSwgW25hbWUsIGZpZWxkXSkgPT4ge1xuICAgICAgICBjb25zdCBncm91cCA9IGZpZWxkLmdldCgnZ3JvdXAnKTtcbiAgICAgICAgaWYgKGlzTnVtYmVyKGdyb3VwKSkge1xuICAgICAgICAgIGFycltncm91cCBhcyBudW1iZXJdID0gbmFtZTtcbiAgICAgICAgfSBlbHNlIGlmIChncm91cCA9PT0gdHJ1ZSAmJiAhYXJyWzBdKSB7XG4gICAgICAgICAgYXJyWzBdID0gbmFtZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgfSwgW10pXG4gICAgICAuZmlsdGVyKGdyb3VwID0+IGdyb3VwICE9PSB1bmRlZmluZWQpO1xuICB9XG5cbiAgaW5pdEZpZWxkcyhmaWVsZHM6IEZpZWxkUHJvcHNbXSk6IHZvaWQge1xuICAgIGZpZWxkcy5mb3JFYWNoKGZpZWxkID0+IHtcbiAgICAgIGNvbnN0IHsgbmFtZSB9ID0gZmllbGQ7XG4gICAgICBpZiAobmFtZSkge1xuICAgICAgICB0aGlzLmFkZEZpZWxkKG5hbWUsIGZpZWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm5pbmcoXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgJ0RhdGFTZXQgY3JlYXRlIGZpZWxkIGZhaWxlZC4gUGxlYXNlIGNoZWNrIGlmIHByb3BlcnR5IG5hbWUgaXMgZXhpc3RzIG9uIGZpZWxkLicsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAgKiDlop7liqDmlrDlrZfmrrVcbiAgICogQHBhcmFtIG5hbWUg5a2X5q615ZCNXG4gICAqIEBwYXJhbSBmaWVsZCDlrZfmrrXlsZ7mgKdcbiAgICogQHJldHVybiDmlrDlop7lrZfmrrVcbiAgICovXG4gIEBhY3Rpb25cbiAgYWRkRmllbGQobmFtZTogc3RyaW5nLCBmaWVsZFByb3BzOiBGaWVsZFByb3BzID0ge30pOiBGaWVsZCB7XG4gICAgcmV0dXJuIHByb2Nlc3NJbnRsRmllbGQoXG4gICAgICBuYW1lLFxuICAgICAgZmllbGRQcm9wcyxcbiAgICAgIChsYW5nTmFtZSwgbGFuZ1Byb3BzKSA9PiB7XG4gICAgICAgIGNvbnN0IGZpZWxkID0gbmV3IEZpZWxkKGxhbmdQcm9wcywgdGhpcyk7XG4gICAgICAgIHRoaXMuZmllbGRzLnNldChsYW5nTmFtZSwgZmllbGQpO1xuICAgICAgICByZXR1cm4gZmllbGQ7XG4gICAgICB9LFxuICAgICAgdGhpcyxcbiAgICApO1xuICB9XG5cbiAgQGFjdGlvblxuICBjb21taXREYXRhKGFsbERhdGE6IGFueVtdLCB0b3RhbD86IG51bWJlcik6IERhdGFTZXQge1xuICAgIGNvbnN0IHsgYXV0b1F1ZXJ5QWZ0ZXJTdWJtaXQsIHByaW1hcnlLZXkgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHRoaXMuZGF0YVRvSlNPTiA9PT0gRGF0YVRvSlNPTi5ub3JtYWwpIHtcbiAgICAgIGZsYXRNYXAodGhpcy5kaXJ0eVJlY29yZHMpLmZvckVhY2gocmVjb3JkID0+XG4gICAgICAgIHJlY29yZC5jb21taXQob21pdChyZWNvcmQudG9EYXRhKCksIFsnX19kaXJ0eSddKSwgdGhpcyksXG4gICAgICApO1xuICAgICAgLy8g6Iul5pyJ5ZON5bqU5pWw5o2u77yM6L+b6KGM5pWw5o2u5Zue5YaZXG4gICAgfSBlbHNlIGlmIChhbGxEYXRhLmxlbmd0aCkge1xuICAgICAgY29uc3Qgc3RhdHVzS2V5ID0gZ2V0Q29uZmlnKCdzdGF0dXNLZXknKTtcbiAgICAgIGNvbnN0IHN0YXR1cyA9IGdldENvbmZpZygnc3RhdHVzJyk7XG4gICAgICBjb25zdCByZXN0Q3JlYXRlZERhdGE6IGFueVtdID0gW107XG4gICAgICBjb25zdCByZXN0VXBkYXRlZERhdGE6IGFueVtdID0gW107XG4gICAgICBhbGxEYXRhLmZvckVhY2goZGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGFTdGF0dXMgPSBkYXRhW3N0YXR1c0tleV07XG4gICAgICAgIC8vIOiLpeacieaVsOaNruS4reWQq+aciV9faWTvvIzmoLnmja5fX2lk5Zue5YaZ6K6w5b2V77yM5ZCm5YiZ5qC55o2u5Li76ZSu5Zue5YaZ6Z2e5paw5aKe55qE6K6w5b2VXG4gICAgICAgIGNvbnN0IHJlY29yZCA9IGRhdGEuX19pZFxuICAgICAgICAgID8gdGhpcy5maW5kUmVjb3JkQnlJZChkYXRhLl9faWQpXG4gICAgICAgICAgOiBwcmltYXJ5S2V5ICYmXG4gICAgICAgICAgZGF0YVN0YXR1cyAhPT0gc3RhdHVzW1JlY29yZFN0YXR1cy5hZGRdICYmXG4gICAgICAgICAgdGhpcy5yZWNvcmRzLmZpbmQociA9PiByLmdldChwcmltYXJ5S2V5KSA9PT0gZGF0YVtwcmltYXJ5S2V5XSk7XG4gICAgICAgIGlmIChyZWNvcmQpIHtcbiAgICAgICAgICByZWNvcmQuY29tbWl0KGRhdGEsIHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGFTdGF0dXMgPT09IHN0YXR1c1tSZWNvcmRTdGF0dXMuYWRkXSkge1xuICAgICAgICAgIHJlc3RDcmVhdGVkRGF0YS5wdXNoKGRhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGFTdGF0dXMgPT09IHN0YXR1c1tSZWNvcmRTdGF0dXMudXBkYXRlXSkge1xuICAgICAgICAgIHJlc3RVcGRhdGVkRGF0YS5wdXNoKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHsgY3JlYXRlZCwgdXBkYXRlZCwgZGVzdHJveWVkIH0gPSB0aGlzO1xuICAgICAgLy8g5rKh5pyJ5Zue5YaZ5oiQ5Yqf55qE5paw5aKe5pWw5o2u5oyJ6aG65bqP5Zue5YaZXG4gICAgICBpZiAocmVzdENyZWF0ZWREYXRhLmxlbmd0aCA9PT0gY3JlYXRlZC5sZW5ndGgpIHtcbiAgICAgICAgY3JlYXRlZC5mb3JFYWNoKChyLCBpbmRleCkgPT4gci5jb21taXQocmVzdENyZWF0ZWREYXRhW2luZGV4XSwgdGhpcykpO1xuICAgICAgfSBlbHNlIGlmIChhdXRvUXVlcnlBZnRlclN1Ym1pdCkge1xuICAgICAgICAvLyDoi6XmnInmlrDlop7mlbDmja7msqHmnInlm57lhpnmiJDlip/vvIwg5b+F6aG76YeN5paw5p+l6K+i5p2l6I635Y+W5Li76ZSuXG4gICAgICAgIHRoaXMucXVlcnkoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICAvLyDliankuIvmnKrlm57lhpnnmoTpnZ7mlrDlop7mlbDmja7kvb/nlKjljp/mlbDmja7ov5vooYzlm57lhplcbiAgICAgIGlmIChyZXN0VXBkYXRlZERhdGEubGVuZ3RoID09PSB1cGRhdGVkLmxlbmd0aCkge1xuICAgICAgICB1cGRhdGVkLmZvckVhY2goKHIsIGluZGV4KSA9PiByLmNvbW1pdChyZXN0VXBkYXRlZERhdGFbaW5kZXhdLCB0aGlzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGVkLmZvckVhY2gociA9PiByLmNvbW1pdChvbWl0KHIudG9EYXRhKCksIFsnX19kaXJ0eSddKSwgdGhpcykpO1xuICAgICAgfVxuICAgICAgZGVzdHJveWVkLmZvckVhY2gociA9PiByLmNvbW1pdCh1bmRlZmluZWQsIHRoaXMpKTtcbiAgICAgIGlmIChpc051bWJlcih0b3RhbCkpIHtcbiAgICAgICAgdGhpcy50b3RhbENvdW50ID0gdG90YWw7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhdXRvUXVlcnlBZnRlclN1Ym1pdCkge1xuICAgICAgLy8g5peg5Zue5YaZ5pWw5o2u5pe26Ieq5Yqo6L+b6KGM5p+l6K+iXG4gICAgICB3YXJuaW5nKFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgYFRoZSBwcmltYXJ5IGtleSB3aGljaCBnZW5lcmF0ZWQgYnkgZGF0YWJhc2UgaXMgbm90IGV4aXN0cyBpbiBlYWNoIGNyZWF0ZWQgcmVjb3JkcyxcbmJlY2F1c2Ugb2Ygbm8gZGF0YSBcXGAke3RoaXMuZGF0YUtleX1cXGAgZnJvbSB0aGUgcmVzcG9uc2UgYnkgXFxgc3VibWl0XFxgIG9yIFxcYGRlbGV0ZVxcYCBtZXRob2QuXG5UaGVuIHRoZSBxdWVyeSBtZXRob2Qgd2lsbCBiZSBhdXRvIGludm9rZS5gLFxuICAgICAgKTtcbiAgICAgIHRoaXMucXVlcnkoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICog5pWw5o2u6ZuG5aS06KGM57qn6IGU57uR5a6aXG4gICAqIEBwYXJhbSBkcyDlpLTmlbDmja7pm4ZcbiAgICogQHBhcmFtIG5hbWUg5aS05pWw5o2u6ZuG5a2X5q615ZCNXG4gICAqL1xuICBAYWN0aW9uXG4gIGJpbmQoZHM6IERhdGFTZXQsIG5hbWU6IHN0cmluZykge1xuICAgIGlmICghbmFtZSkge1xuICAgICAgd2FybmluZyhmYWxzZSwgJ0RhdGFTZXQ6IGNhc2NhZGUgYmluZGluZyBuZWVkIGEgbmFtZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZHMuY2hpbGRyZW5bbmFtZV0pIHtcbiAgICAgIHdhcm5pbmcoZmFsc2UsIGBEYXRhU2V0OiBkdXBsaWNhdGUgY2FzY2FkZSBiaW5kaW5nIG9mIG5hbWU8JHtuYW1lfT5gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHMuY2hpbGRyZW5bbmFtZV0gPSB0aGlzO1xuICAgIHRoaXMucGFyZW50ID0gZHM7XG4gICAgdGhpcy5wYXJlbnROYW1lID0gbmFtZTtcbiAgICBjb25zdCB7IGN1cnJlbnQgfSA9IGRzO1xuICAgIGlmIChjdXJyZW50KSB7XG4gICAgICBkcy5zeW5jQ2hpbGQodGhpcywgY3VycmVudCwgbmFtZSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmxlbmd0aCkge1xuICAgICAgdGhpcy5sb2FkRGF0YShbXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIOiuvue9ruafpeivoueahOWPguaVsC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhcmEg5Y+C5pWw5ZCNLlxuICAgKiBAcGFyYW0ge2FueX0gdmFsdWUg5Y+C5pWw5YC8LlxuICAgKi9cbiAgc2V0UXVlcnlQYXJhbWV0ZXIocGFyYTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgaWYgKGlzTmlsKHZhbHVlKSkge1xuICAgICAgZGVsZXRlIHRoaXMucXVlcnlQYXJhbWV0ZXJbcGFyYV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucXVlcnlQYXJhbWV0ZXJbcGFyYV0gPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIGxvYWREYXRhKGFsbERhdGE6IChvYmplY3QgfCBSZWNvcmQpW10gPSBbXSwgdG90YWw/OiBudW1iZXIpOiBEYXRhU2V0IHtcbiAgICB0aGlzLnN0b3JlU2VsZWN0ZWQoKTtcbiAgICBjb25zdCB7XG4gICAgICBwYWdpbmcsXG4gICAgICBwYWdlU2l6ZSxcbiAgICAgIHByb3BzOiB7IGF1dG9Mb2NhdGVGaXJzdCwgaWRGaWVsZCwgcGFyZW50RmllbGQgfSxcbiAgICB9ID0gdGhpcztcbiAgICBzd2l0Y2ggKHBhZ2luZykge1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgICBhbGxEYXRhID0gYWxsRGF0YS5zbGljZSgwLCBwYWdlU2l6ZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VydmVyJzpcbiAgICAgICAgYWxsRGF0YSA9IGlkRmllbGQgJiYgcGFyZW50RmllbGQgPyBzbGljZVRyZWUoaWRGaWVsZCwgcGFyZW50RmllbGQsIGFsbERhdGEsIHBhZ2VTaXplKSA6IGFsbERhdGEuc2xpY2UoMCwgcGFnZVNpemUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLmJlZm9yZUxvYWQsIHsgZGF0YVNldDogdGhpcywgZGF0YTogYWxsRGF0YSB9KTtcbiAgICB0aGlzLm9yaWdpbmFsRGF0YSA9IHRoaXMucHJvY2Vzc0RhdGEoYWxsRGF0YSk7XG4gICAgdGhpcy5yZWNvcmRzID0gdGhpcy5vcmlnaW5hbERhdGE7XG4gICAgaWYgKHRvdGFsICE9PSB1bmRlZmluZWQgJiYgKHBhZ2luZyA9PT0gdHJ1ZSB8fCBwYWdpbmcgPT09ICdzZXJ2ZXInKSkge1xuICAgICAgdGhpcy50b3RhbENvdW50ID0gdG90YWw7XG4gICAgfSBlbHNlIGlmIChpZEZpZWxkICYmIHBhcmVudEZpZWxkICYmIHBhZ2luZyA9PT0gJ3NlcnZlcicpIHtcbiAgICAgIC8vIOW8guatpeaDheWGteWkjeeUqOS7peWJjeeahHRvdGFsXG4gICAgICBpZiAoIXRoaXMudG90YWxDb3VudCkge1xuICAgICAgICB0aGlzLnRvdGFsQ291bnQgPSB0aGlzLnRyZWVEYXRhLmxlbmd0aFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRvdGFsQ291bnQgPSBhbGxEYXRhLmxlbmd0aDtcbiAgICB9XG4gICAgdGhpcy5yZWxlYXNlQ2FjaGVkU2VsZWN0ZWQoKTtcbiAgICBjb25zdCBuZXh0UmVjb3JkID1cbiAgICAgIGF1dG9Mb2NhdGVGaXJzdCAmJiAoaWRGaWVsZCAmJiBwYXJlbnRGaWVsZCA/IHRoaXMuZ2V0RnJvbVRyZWUoMCkgOiB0aGlzLmdldCgwKSk7XG4gICAgaWYgKG5leHRSZWNvcmQpIHtcbiAgICAgIG5leHRSZWNvcmQuaXNDdXJyZW50ID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5pbmRleENoYW5nZSwgeyBkYXRhU2V0OiB0aGlzLCByZWNvcmQ6IG5leHRSZWNvcmQgfSk7XG4gICAgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5sb2FkLCB7IGRhdGFTZXQ6IHRoaXMgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBAYWN0aW9uXG4gIHByb2Nlc3NEYXRhKGFsbERhdGE6IGFueVtdKTogUmVjb3JkW10ge1xuICAgIHJldHVybiBhbGxEYXRhLm1hcChkYXRhID0+IHtcbiAgICAgIGNvbnN0IHJlY29yZCA9XG4gICAgICAgIGRhdGEgaW5zdGFuY2VvZiBSZWNvcmQgPyAoKGRhdGEuZGF0YVNldCA9IHRoaXMpLCBkYXRhKSA6IG5ldyBSZWNvcmQoZGF0YSwgdGhpcyk7XG4gICAgICByZWNvcmQuc3RhdHVzID0gUmVjb3JkU3RhdHVzLnN5bmM7XG4gICAgICByZXR1cm4gcmVjb3JkO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWxldGVSZWNvcmQocmVjb3JkPzogUmVjb3JkKTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAocmVjb3JkKSB7XG4gICAgICByZWNvcmQuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgcmVjb3JkLmlzQ3VycmVudCA9IGZhbHNlO1xuICAgICAgY29uc3QgeyBzZWxlY3RlZCwgcmVjb3JkcyB9ID0gdGhpcztcbiAgICAgIGNvbnN0IHNlbGVjdGVkSW5kZXggPSBzZWxlY3RlZC5pbmRleE9mKHJlY29yZCk7XG4gICAgICBpZiAoc2VsZWN0ZWRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgc2VsZWN0ZWQuc3BsaWNlKHNlbGVjdGVkSW5kZXgsIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHJlY29yZC5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSByZWNvcmRzLmluZGV4T2YocmVjb3JkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHJlY29yZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZWNvcmQuc3RhdHVzICE9PSBSZWNvcmRTdGF0dXMuZGVsZXRlKSB7XG4gICAgICAgIHJlY29yZC5zdGF0dXMgPSBSZWNvcmRTdGF0dXMuZGVsZXRlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLy8g5p+l6K+i5Zyo5omA5pyJ6aG16Z2i55qE5a+55bqU5L2N572uXG4gIHByaXZhdGUgZmluZEluQWxsUGFnZShpbmRleDogbnVtYmVyKTogUmVjb3JkIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCB7IHBhZ2luZyB9ID0gdGhpcztcbiAgICBsZXQgaW5kZXhSZWNvcmRcbiAgICBpZiAocGFnaW5nID09PSB0cnVlKSB7XG4gICAgICBpbmRleFJlY29yZCA9IHRoaXMuZGF0YVt0aGlzLmdldEluZGV4SW5DdXJyZW50UGFnZShpbmRleCldO1xuICAgIH0gZWxzZSBpZiAocGFnaW5nID09PSAnc2VydmVyJykge1xuICAgICAgaW5kZXhSZWNvcmQgPSB0aGlzLnRyZWVEYXRhW3RoaXMuZ2V0SW5kZXhJbkN1cnJlbnRQYWdlKGluZGV4KV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4UmVjb3JkID0gdGhpcy5kYXRhW2luZGV4XVxuICAgIH07XG4gICAgcmV0dXJuIGluZGV4UmVjb3JkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJbmRleEluQ3VycmVudFBhZ2UoaW5kZXg6IG51bWJlciA9IHRoaXMuY3VycmVudEluZGV4KTogbnVtYmVyIHtcbiAgICBjb25zdCB7IGN1cnJlbnRQYWdlLCBwYWdlU2l6ZSB9ID0gdGhpcztcbiAgICByZXR1cm4gaW5kZXggLSAoY3VycmVudFBhZ2UgLSAxKSAqIHBhZ2VTaXplO1xuICB9XG5cbiAgcHJpdmF0ZSB0cmFuc2ZlclJlY29yZHMoZGF0YTogUmVjb3JkW10pOiBSZWNvcmRbXSB7XG4gICAgcmV0dXJuIGRhdGEubWFwKHJlY29yZCA9PiB7XG4gICAgICBjb25zdCB7IGRhdGFTZXQgfSA9IHJlY29yZDtcbiAgICAgIGlmIChkYXRhU2V0ID09PSB0aGlzKSB7XG4gICAgICAgIGNvbnN0IHsgcmVjb3JkcyB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgaW5kZXggPSByZWNvcmRzLmluZGV4T2YocmVjb3JkKTtcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgIHJlY29yZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkO1xuICAgICAgfVxuICAgICAgaWYgKGRhdGFTZXQpIHtcbiAgICAgICAgZGF0YVNldC5yZW1vdmUocmVjb3JkKTtcbiAgICAgICAgcmVjb3JkID0gbmV3IFJlY29yZChyZWNvcmQuZGF0YSwgdGhpcyk7XG4gICAgICB9XG4gICAgICByZWNvcmQuZGF0YVNldCA9IHRoaXM7XG4gICAgICByZWNvcmQuc3RhdHVzID0gUmVjb3JkU3RhdHVzLmFkZDtcbiAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGluaXRDaGlsZHJlbihjaGlsZHJlbjogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBEYXRhU2V0IH0gfCBEYXRhU2V0W10pOiB2b2lkIHtcbiAgICBpZiAoaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICAgIGNoaWxkcmVuLmZvckVhY2goY2hpbGREcyA9PiB7XG4gICAgICAgIGlmIChjaGlsZERzIGluc3RhbmNlb2YgRGF0YVNldCkge1xuICAgICAgICAgIGNvbnN0IHsgbmFtZSB9ID0gY2hpbGREcztcbiAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgY2hpbGREcy5iaW5kKHRoaXMsIG5hbWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXJuaW5nKGZhbHNlLCAnY2FzY2FkZSBEYXRhU2V0IG5lZWQgYSBuYW1lJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmtleXMoY2hpbGRyZW4gYXMgRGF0YVNldENoaWxkcmVuKS5mb3JFYWNoKGNoaWxkTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGRyZW5bY2hpbGROYW1lXTtcbiAgICAgICAgaWYgKGNoaWxkIGluc3RhbmNlb2YgRGF0YVNldCkge1xuICAgICAgICAgIGNoaWxkLmJpbmQodGhpcywgY2hpbGROYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXJuaW5nKGZhbHNlLCBgY2FzY2FkZSBjaGlsZDwke2NoaWxkTmFtZX0+IG11c3QgYmUgaW5zdGFuY2Ugb2YgRGF0YVNldC5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0UXVlcnlEYXRhU2V0KHF1ZXJ5RGF0YVNldD86IERhdGFTZXQsIHF1ZXJ5RmllbGRzPzogRmllbGRQcm9wc1tdKSB7XG4gICAgaWYgKHF1ZXJ5RmllbGRzKSB7XG4gICAgICBxdWVyeURhdGFTZXQgPSBuZXcgRGF0YVNldCh7XG4gICAgICAgIGZpZWxkczogcXVlcnlGaWVsZHMsXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHF1ZXJ5RGF0YVNldCkge1xuICAgICAgdGhpcy5xdWVyeURhdGFTZXQgPSBxdWVyeURhdGFTZXQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0RXZlbnRzKGV2ZW50czogRXZlbnRzKTogdm9pZCB7XG4gICAgT2JqZWN0LmtleXMoZXZlbnRzKS5mb3JFYWNoKGV2ZW50ID0+IHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRzW2V2ZW50XSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkRGF0YUZyb21SZXNwb25zZShyZXNwOiBhbnkpOiBEYXRhU2V0IHtcbiAgICBpZiAocmVzcCkge1xuICAgICAgY29uc3QgeyBkYXRhS2V5LCB0b3RhbEtleSB9ID0gdGhpcztcbiAgICAgIGNvbnN0IGRhdGE6IG9iamVjdFtdID0gZ2VuZXJhdGVSZXNwb25zZURhdGEocmVzcCwgZGF0YUtleSk7XG4gICAgICBjb25zdCB0b3RhbDogbnVtYmVyIHwgdW5kZWZpbmVkID0gT2JqZWN0Q2hhaW5WYWx1ZS5nZXQocmVzcCwgdG90YWxLZXkpO1xuICAgICAgdGhpcy5sb2FkRGF0YShkYXRhLCB0b3RhbCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcHJpdmF0ZSBncm91cERhdGEoYWxsRGF0YTogb2JqZWN0W10pOiBvYmplY3RbXSB7XG4gIC8vICAgcmV0dXJuIHRoaXMuZ2V0R3JvdXBzKCkucmV2ZXJzZSgpXG4gIC8vICAgICAucmVkdWNlKChhcnIsIG5hbWUpID0+IGFyci5zb3J0KFxuICAvLyAgICAgICAoaXRlbTEsIGl0ZW0yKSA9PiBTdHJpbmcoaXRlbTFbbmFtZV0pLmxvY2FsZUNvbXBhcmUoU3RyaW5nKGl0ZW0yW25hbWVdKSksXG4gIC8vICAgICApLCBhbGxEYXRhKTtcbiAgLy8gfVxuXG4gIHByaXZhdGUgYXN5bmMgd3JpdGUocmVjb3JkczogUmVjb3JkW10pOiBQcm9taXNlPGFueT4ge1xuICAgIGlmIChyZWNvcmRzLmxlbmd0aCkge1xuICAgICAgY29uc3QgW2NyZWF0ZWQsIHVwZGF0ZWQsIGRlc3Ryb3llZF0gPSBwcmVwYXJlU3VibWl0RGF0YShyZWNvcmRzLCB0aGlzLmRhdGFUb0pTT04pO1xuICAgICAgY29uc3QgYXhpb3NDb25maWdzOiBBeGlvc1JlcXVlc3RDb25maWdbXSA9IFtdO1xuICAgICAgY29uc3Qgc3VibWl0RGF0YTogb2JqZWN0W10gPSBbXG4gICAgICAgIC4uLnByZXBhcmVGb3JTdWJtaXQoJ2NyZWF0ZScsIGNyZWF0ZWQsIGF4aW9zQ29uZmlncywgdGhpcyksXG4gICAgICAgIC4uLnByZXBhcmVGb3JTdWJtaXQoJ3VwZGF0ZScsIHVwZGF0ZWQsIGF4aW9zQ29uZmlncywgdGhpcyksXG4gICAgICAgIC4uLnByZXBhcmVGb3JTdWJtaXQoJ2Rlc3Ryb3knLCBkZXN0cm95ZWQsIGF4aW9zQ29uZmlncywgdGhpcyksXG4gICAgICBdO1xuICAgICAgcHJlcGFyZUZvclN1Ym1pdCgnc3VibWl0Jywgc3VibWl0RGF0YSwgYXhpb3NDb25maWdzLCB0aGlzKTtcbiAgICAgIGlmIChheGlvc0NvbmZpZ3MubGVuZ3RoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VTdWJtaXRTdGF0dXMoRGF0YVNldFN0YXR1cy5zdWJtaXR0aW5nKTtcbiAgICAgICAgICBjb25zdCBzdWJtaXRFdmVudFJlc3VsdCA9IGF3YWl0IHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMuc3VibWl0LCB7XG4gICAgICAgICAgICBkYXRhU2V0OiB0aGlzLFxuICAgICAgICAgICAgZGF0YTogWy4uLmNyZWF0ZWQsIC4uLnVwZGF0ZWQsIC4uLmRlc3Ryb3llZF0sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKHN1Ym1pdEV2ZW50UmVzdWx0KSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQ6IGFueVtdID0gYXdhaXQgYXhpb3NTdGF0aWMuYWxsKFxuICAgICAgICAgICAgICBheGlvc0NvbmZpZ3MubWFwKGNvbmZpZyA9PiB0aGlzLmF4aW9zKGNvbmZpZykpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVN1Ym1pdFN1Y2Nlc3MocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZVN1Ym1pdEZhaWwoZSk7XG4gICAgICAgICAgdGhyb3cgbmV3IERhdGFTZXRSZXF1ZXN0RXJyb3IoZSk7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VTdWJtaXRTdGF0dXMoRGF0YVNldFN0YXR1cy5yZWFkeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHJlYWQocGFnZTogbnVtYmVyID0gMSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKHRoaXMuY2hlY2tSZWFkYWJsZSh0aGlzLnBhcmVudCkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmdlbmVyYXRlUXVlcnlQYXJhbWV0ZXIoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VTdGF0dXMoRGF0YVNldFN0YXR1cy5sb2FkaW5nKTtcbiAgICAgICAgY29uc3QgbmV3Q29uZmlnID0gYXhpb3NDb25maWdBZGFwdGVyKCdyZWFkJywgdGhpcywgZGF0YSwgdGhpcy5nZW5lcmF0ZVF1ZXJ5U3RyaW5nKHBhZ2UpKTtcbiAgICAgICAgaWYgKG5ld0NvbmZpZy51cmwpIHtcbiAgICAgICAgICBjb25zdCBxdWVyeUV2ZW50UmVzdWx0ID0gYXdhaXQgdGhpcy5maXJlRXZlbnQoRGF0YVNldEV2ZW50cy5xdWVyeSwge1xuICAgICAgICAgICAgZGF0YVNldDogdGhpcyxcbiAgICAgICAgICAgIHBhcmFtczogbmV3Q29uZmlnLnBhcmFtcyxcbiAgICAgICAgICAgIGRhdGE6IG5ld0NvbmZpZy5kYXRhLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChxdWVyeUV2ZW50UmVzdWx0KSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmF4aW9zKG5ld0NvbmZpZyk7XG4gICAgICAgICAgICBydW5JbkFjdGlvbigoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuY3VycmVudFBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVMb2FkU3VjY2VzcyhyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aGlzLmhhbmRsZUxvYWRGYWlsKGUpO1xuICAgICAgICB0aHJvdyBuZXcgRGF0YVNldFJlcXVlc3RFcnJvcihlKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMuY2hhbmdlU3RhdHVzKERhdGFTZXRTdGF0dXMucmVhZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEBhY3Rpb25cbiAgcHJpdmF0ZSBzdG9yZVNlbGVjdGVkKCkge1xuICAgIGlmICh0aGlzLmNhY2hlU2VsZWN0aW9uS2V5cykge1xuICAgICAgdGhpcy5zZXRDYWNoZWRTZWxlY3RlZChbXG4gICAgICAgIC4uLnRoaXMuY2FjaGVkU2VsZWN0ZWQuZmlsdGVyKHJlY29yZCA9PiByZWNvcmQuaXNTZWxlY3RlZCksXG4gICAgICAgIC4uLnRoaXMuY3VycmVudFNlbGVjdGVkLm1hcChyZWNvcmQgPT4ge1xuICAgICAgICAgIHJlY29yZC5pc0N1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICByZWNvcmQuaXNDYWNoZWQgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiByZWNvcmQ7XG4gICAgICAgIH0pLFxuICAgICAgXSk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICByZWxlYXNlQ2FjaGVkU2VsZWN0ZWQoKSB7XG4gICAgY29uc3QgeyBjYWNoZVNlbGVjdGlvbktleXMsIGNhY2hlZFNlbGVjdGVkIH0gPSB0aGlzO1xuICAgIGlmIChjYWNoZVNlbGVjdGlvbktleXMpIHtcbiAgICAgIHRoaXMuZGF0YS5mb3JFYWNoKHJlY29yZCA9PiB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gY2FjaGVkU2VsZWN0ZWQuZmluZEluZGV4KGNhY2hlZCA9PlxuICAgICAgICAgIGNhY2hlU2VsZWN0aW9uS2V5cy5ldmVyeShrZXkgPT4gcmVjb3JkLmdldChrZXkpID09PSBjYWNoZWQuZ2V0KGtleSkpLFxuICAgICAgICApO1xuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgcmVjb3JkLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgIGNhY2hlZFNlbGVjdGVkLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIEBhY3Rpb25cbiAgcHJpdmF0ZSBjaGFuZ2VTdGF0dXMoc3RhdHVzOiBEYXRhU2V0U3RhdHVzKSB7XG4gICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gIH1cblxuICBAYWN0aW9uXG4gIHByaXZhdGUgY2hhbmdlU3VibWl0U3RhdHVzKHN0YXR1czogRGF0YVNldFN0YXR1cykge1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgIE9iamVjdC52YWx1ZXModGhpcy5jaGlsZHJlbikuZm9yRWFjaChkcyA9PiB7XG4gICAgICBpZiAoZHMgaW5zdGFuY2VvZiBEYXRhU2V0KSB7XG4gICAgICAgIGRzLmNoYW5nZVN1Ym1pdFN0YXR1cyhzdGF0dXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVDYXNjYWRlKHtcbiAgICBkYXRhU2V0LFxuICAgIHJlY29yZCxcbiAgICBwcmV2aW91cyxcbiAgfToge1xuICAgIGRhdGFTZXQ6IERhdGFTZXQ7XG4gICAgcmVjb3JkPzogUmVjb3JkO1xuICAgIHByZXZpb3VzPzogUmVjb3JkO1xuICB9KSB7XG4gICAgaWYgKGRhdGFTZXQuaGFzQ2hpbGRyZW4pIHtcbiAgICAgIGRhdGFTZXQuc3luY0NoaWxkcmVuKHJlY29yZCwgcHJldmlvdXMpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlTG9hZFN1Y2Nlc3MocmVzcDogYW55KSB7XG4gICAgY29uc3QgeyBsb2FkU3VjY2VzcyA9IGRlZmF1bHRGZWVkYmFjay5sb2FkU3VjY2VzcyB9ID0gdGhpcy5mZWVkYmFjaztcbiAgICBsb2FkU3VjY2VzcyhyZXNwKTtcbiAgICByZXR1cm4gcmVzcDtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlTG9hZEZhaWwoZSkge1xuICAgIGNvbnN0IHsgbG9hZEZhaWxlZCA9IGRlZmF1bHRGZWVkYmFjay5sb2FkRmFpbGVkIH0gPSB0aGlzLmZlZWRiYWNrO1xuICAgIHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMubG9hZEZhaWxlZCwgeyBkYXRhU2V0OiB0aGlzIH0pO1xuICAgIGxvYWRGYWlsZWQoZSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZVN1Ym1pdFN1Y2Nlc3MocmVzcDogYW55W10pIHtcbiAgICBjb25zdCB7IGRhdGFLZXksIHRvdGFsS2V5IH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgc3VibWl0U3VjY2VzcyA9IGRlZmF1bHRGZWVkYmFjay5zdWJtaXRTdWNjZXNzIH0gPSB0aGlzLmZlZWRiYWNrO1xuICAgIGNvbnN0IGRhdGE6IHtcbiAgICAgIFtwcm9wczogc3RyaW5nXTogYW55XG4gICAgfVtdID0gW107XG4gICAgbGV0IHRvdGFsO1xuICAgIHJlc3AuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGRhdGEucHVzaCguLi5nZW5lcmF0ZVJlc3BvbnNlRGF0YShpdGVtLCBkYXRhS2V5KSk7XG4gICAgICBpZiAodG90YWxLZXkgJiYgaXNPYmplY3QoaXRlbSkpIHtcbiAgICAgICAgY29uc3QgbXlUb3RhbCA9IE9iamVjdENoYWluVmFsdWUuZ2V0KGl0ZW0sIHRvdGFsS2V5KTtcbiAgICAgICAgaWYgKCFpc05pbChteVRvdGFsKSkge1xuICAgICAgICAgIHRvdGFsID0gbXlUb3RhbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IHJlc3VsdCA9IGRhdGFLZXkgPyB7IHN1Y2Nlc3M6IHRydWUgfSA6IGRhdGE7XG4gICAgaWYgKGRhdGFLZXkpIHtcbiAgICAgIE9iamVjdENoYWluVmFsdWUuc2V0KHJlc3VsdCwgZGF0YUtleSwgZGF0YSk7XG4gICAgICBpZiAodG90YWxLZXkpIHtcbiAgICAgICAgT2JqZWN0Q2hhaW5WYWx1ZS5zZXQocmVzdWx0LCB0b3RhbEtleSwgdG90YWwpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmZpcmVFdmVudChEYXRhU2V0RXZlbnRzLnN1Ym1pdFN1Y2Nlc3MsIHsgZGF0YVNldDogdGhpcywgZGF0YTogcmVzdWx0IH0pO1xuICAgIC8vIOmSiOWvuSAyMDQg55qE5oOF5Ya16L+b6KGM54m55q6K5aSE55CGXG4gICAgLy8g5LiN54S25Zyo6K6+572u5LqGIHByaW1hcnlLZXkg55qE5oOF5Ya1IOS4iyzlnKjlhYjmlrDlop7kuIDmnaHlho3kvb/nlKhkZWxldGXnmoTmg4XlhrXkuIvvvIzkvJrlsIYyMDTov5nkuKror7fmsYLlhoXlrrnloavlhaXliLByZWNvcmTkuK1cbiAgICBpZiAoIShkYXRhWzBdICYmIGRhdGFbMF0uc3RhdHVzID09PSAyMDQgJiYgZGF0YVswXS5zdGF0dXNUZXh0ID09PSBcIk5vIENvbnRlbnRcIikpIHtcbiAgICAgIHRoaXMuY29tbWl0RGF0YShkYXRhLCB0b3RhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tbWl0RGF0YShbXSwgdG90YWwpO1xuICAgIH1cbiAgICBzdWJtaXRTdWNjZXNzKHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgcHJpdmF0ZSBoYW5kbGVTdWJtaXRGYWlsKGUpIHtcbiAgICBjb25zdCB7IGN1cnJlbnQgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBzdWJtaXRGYWlsZWQgPSBkZWZhdWx0RmVlZGJhY2suc3VibWl0RmFpbGVkIH0gPSB0aGlzLmZlZWRiYWNrO1xuICAgIHRoaXMuZmlyZUV2ZW50KERhdGFTZXRFdmVudHMuc3VibWl0RmFpbGVkLCB7IGRhdGFTZXQ6IHRoaXMgfSk7XG4gICAgc3VibWl0RmFpbGVkKGUpO1xuICAgIGlmICh0aGlzLnByb3BzLmF1dG9Mb2NhdGVBZnRlclJlbW92ZSAmJiBjdXJyZW50ICYmIHRoaXMuZGVzdHJveWVkLmxlbmd0aCkge1xuICAgICAgY3VycmVudC5pc0N1cnJlbnQgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kZXN0cm95ZWQuZm9yRWFjaCgocmVjb3JkLCBpbmRleCkgPT4ge1xuICAgICAgcmVjb3JkLnJlc2V0KCk7XG4gICAgICByZWNvcmQuaXNTZWxlY3RlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy5wcm9wcy5hdXRvTG9jYXRlQWZ0ZXJSZW1vdmUgJiYgaW5kZXggPT09IDApIHtcbiAgICAgICAgcmVjb3JkLmlzQ3VycmVudCA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHN5bmNDaGlsZHJlbihjdXJyZW50PzogUmVjb3JkLCBwcmV2aW91cz86IFJlY29yZCkge1xuICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHRoaXM7XG4gICAgY29uc3Qga2V5czogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhjaGlsZHJlbik7XG4gICAgY29uc3QgcmVtb3RlS2V5czogc3RyaW5nW10gPSBbXTtcbiAgICBrZXlzLmZvckVhY2goY2hpbGROYW1lID0+IHtcbiAgICAgIGNvbnN0IGRzID0gY2hpbGRyZW5bY2hpbGROYW1lXTtcbiAgICAgIGlmIChwcmV2aW91cyAmJiBkcy5zdGF0dXMgPT09IERhdGFTZXRTdGF0dXMucmVhZHkgJiYgcHJldmlvdXMuZGF0YVNldFNuYXBzaG90W2NoaWxkTmFtZV0pIHtcbiAgICAgICAgcHJldmlvdXMuZGF0YVNldFNuYXBzaG90W2NoaWxkTmFtZV0gPSBkcy5zbmFwc2hvdCgpO1xuICAgICAgICBkcy5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgY29uc3Qgc25hcHNob3QgPSBjdXJyZW50LmRhdGFTZXRTbmFwc2hvdFtjaGlsZE5hbWVdO1xuICAgICAgICBpZiAoc25hcHNob3QgaW5zdGFuY2VvZiBEYXRhU2V0U25hcHNob3QpIHtcbiAgICAgICAgICBkcy5yZXN0b3JlKHNuYXBzaG90KTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5zeW5jQ2hpbGQoZHMsIGN1cnJlbnQsIGNoaWxkTmFtZSwgdHJ1ZSkpIHtcbiAgICAgICAgICBkcy5sb2FkRGF0YShbXSk7XG4gICAgICAgICAgcmVtb3RlS2V5cy5wdXNoKGNoaWxkTmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRzLmxvYWREYXRhKFtdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoY3VycmVudCAmJiByZW1vdGVLZXlzLmxlbmd0aCkge1xuICAgICAgdGhpcy5zeW5jQ2hpbGRyZW5SZW1vdGUocmVtb3RlS2V5cywgY3VycmVudCk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBwcml2YXRlIHN5bmNDaGlsZChcbiAgICBkczogRGF0YVNldCxcbiAgICBjdXJyZW50UmVjb3JkOiBSZWNvcmQsXG4gICAgY2hpbGROYW1lOiBzdHJpbmcsXG4gICAgb25seUNsaWVudD86IGJvb2xlYW4sXG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNhc2NhZGVSZWNvcmRzID0gY3VycmVudFJlY29yZC5jYXNjYWRlUmVjb3Jkc01hcFtjaGlsZE5hbWVdO1xuICAgIGNvbnN0IGNoaWxkUmVjb3JkcyA9IGNhc2NhZGVSZWNvcmRzIHx8IGN1cnJlbnRSZWNvcmQuZ2V0KGNoaWxkTmFtZSk7XG4gICAgaWYgKGN1cnJlbnRSZWNvcmQuc3RhdHVzID09PSBSZWNvcmRTdGF0dXMuYWRkIHx8IGlzQXJyYXlMaWtlKGNoaWxkUmVjb3JkcykpIHtcbiAgICAgIGlmIChjYXNjYWRlUmVjb3Jkcykge1xuICAgICAgICBkZWxldGUgY3VycmVudFJlY29yZC5jYXNjYWRlUmVjb3Jkc01hcFtjaGlsZE5hbWVdO1xuICAgICAgfVxuICAgICAgZHMuY2xlYXJDYWNoZWRTZWxlY3RlZCgpO1xuICAgICAgZHMubG9hZERhdGEoY2hpbGRSZWNvcmRzID8gY2hpbGRSZWNvcmRzLnNsaWNlKCkgOiBbXSk7XG4gICAgICBpZiAoY3VycmVudFJlY29yZC5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgICAgaWYgKGRzLmxlbmd0aCkge1xuICAgICAgICAgIGRzLmZvckVhY2gocmVjb3JkID0+IChyZWNvcmQuc3RhdHVzID0gUmVjb3JkU3RhdHVzLmFkZCkpO1xuICAgICAgICB9IGVsc2UgaWYgKGRzLnByb3BzLmF1dG9DcmVhdGUpIHtcbiAgICAgICAgICBkcy5jcmVhdGUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY3VycmVudFJlY29yZC5kYXRhU2V0U25hcHNob3RbY2hpbGROYW1lXSA9IGRzLnNuYXBzaG90KCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCFvbmx5Q2xpZW50KSB7XG4gICAgICBjb25zdCBvbGRTbmFwc2hvdCA9IGRzLnNuYXBzaG90KCk7XG4gICAgICBkcy5yZWFkKDEpLnRoZW4ocmVzcCA9PiB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudCB9ID0gdGhpcztcbiAgICAgICAgaWYgKGN1cnJlbnQgIT09IGN1cnJlbnRSZWNvcmQpIHtcbiAgICAgICAgICBkcyA9IG5ldyBEYXRhU2V0KCkucmVzdG9yZShvbGRTbmFwc2hvdCk7XG4gICAgICAgIH1cbiAgICAgICAgZHMuY2xlYXJDYWNoZWRTZWxlY3RlZCgpO1xuICAgICAgICBjdXJyZW50UmVjb3JkLmRhdGFTZXRTbmFwc2hvdFtjaGlsZE5hbWVdID0gZHMubG9hZERhdGFGcm9tUmVzcG9uc2UocmVzcCkuc25hcHNob3QoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIGNoZWNrUmVhZGFibGUocGFyZW50KSB7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgY29uc3QgeyBjdXJyZW50IH0gPSBwYXJlbnQ7XG4gICAgICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5zdGF0dXMgPT09IFJlY29yZFN0YXR1cy5hZGQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBwYWdl55u45YWz6K+35rGC6K6+572uXG4gICAqIEBwYXJhbSBwYWdlIOWcqOmCo+S4qumhtemdolxuICAgKiBAcGFyYW0gcGFnZVNpemVJbm5lciDpobXpnaLlpKflsI9cbiAgICovXG4gIHByaXZhdGUgZ2VuZXJhdGVQYWdlUXVlcnlTdHJpbmcocGFnZTogbnVtYmVyLCBwYWdlU2l6ZUlubmVyPzogbnVtYmVyKSB7XG4gICAgY29uc3QgeyBwYWdpbmcsIHBhZ2VTaXplIH0gPSB0aGlzO1xuICAgIGlmIChpc051bWJlcihwYWdlU2l6ZUlubmVyKSkge1xuICAgICAgcmV0dXJuIHsgcGFnZSwgcGFnZXNpemU6IHBhZ2VTaXplSW5uZXIgfVxuICAgIH1cbiAgICBpZiAocGFnaW5nID09PSB0cnVlIHx8IHBhZ2luZyA9PT0gJ3NlcnZlcicpIHtcbiAgICAgIHJldHVybiB7IHBhZ2UsIHBhZ2VzaXplOiBwYWdlU2l6ZSB9O1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlT3JkZXJRdWVyeVN0cmluZygpOiB7IHNvcnRuYW1lPzogc3RyaW5nOyBzb3J0b3JkZXI/OiBzdHJpbmcgfSB7XG4gICAgY29uc3QgeyBmaWVsZHMgfSA9IHRoaXM7XG4gICAgY29uc3Qgb3JkZXJGaWVsZCA9IGdldE9yZGVyRmllbGRzKGZpZWxkcylbMF07XG4gICAgaWYgKG9yZGVyRmllbGQpIHtcbiAgICAgIGNvbnN0IHBhcmFtID0geyBzb3J0bmFtZTogb3JkZXJGaWVsZC5uYW1lLCBzb3J0b3JkZXI6IG9yZGVyRmllbGQub3JkZXIgfTtcbiAgICAgIGlmIChvcmRlckZpZWxkLnR5cGUgPT09IEZpZWxkVHlwZS5vYmplY3QpIHtcbiAgICAgICAgY29uc3QgYmluZEZpZWxkID0gZmluZEJpbmRGaWVsZEJ5KG9yZGVyRmllbGQsIHRoaXMuZmllbGRzLCAndmFsdWVGaWVsZCcpO1xuICAgICAgICBpZiAoYmluZEZpZWxkKSB7XG4gICAgICAgICAgcGFyYW0uc29ydG5hbWUgPSBiaW5kRmllbGQubmFtZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcmFtO1xuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICAvKipcbiAgICog6L+U5ZueY29uZmlndXJlIOmFjee9rueahOWAvFxuICAgKiBAcGFyYW0gcGFnZSDlnKjpgqPkuKrpobXpnaJcbiAgICogQHBhcmFtIHBhZ2VTaXplSW5uZXIg6aG16Z2i5aSn5bCPIFxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZVF1ZXJ5U3RyaW5nKHBhZ2U6IG51bWJlcixwYWdlU2l6ZUlubmVyPzogbnVtYmVyKSB7XG4gICAgY29uc3Qgb3JkZXIgPSB0aGlzLmdlbmVyYXRlT3JkZXJRdWVyeVN0cmluZygpO1xuICAgIGNvbnN0IHBhZ2VRdWVyeSA9IHRoaXMuZ2VuZXJhdGVQYWdlUXVlcnlTdHJpbmcocGFnZSwgcGFnZVNpemVJbm5lcik7XG4gICAgY29uc3QgZ2VuZXJhdGVQYWdlUXVlcnkgPSBnZXRDb25maWcoJ2dlbmVyYXRlUGFnZVF1ZXJ5Jyk7XG4gICAgaWYgKHR5cGVvZiBnZW5lcmF0ZVBhZ2VRdWVyeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGdlbmVyYXRlUGFnZVF1ZXJ5KHtcbiAgICAgICAgc29ydE5hbWU6IG9yZGVyLnNvcnRuYW1lLFxuICAgICAgICBzb3J0T3JkZXI6IG9yZGVyLnNvcnRvcmRlcixcbiAgICAgICAgcGFnZVNpemU6IHBhZ2VRdWVyeS5wYWdlc2l6ZSxcbiAgICAgICAgcGFnZTogcGFnZVF1ZXJ5LnBhZ2UsXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgLi4ucGFnZVF1ZXJ5LCAuLi5vcmRlciB9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQYXJlbnRQYXJhbXMoKTogb2JqZWN0IHtcbiAgICBjb25zdCB7XG4gICAgICBwYXJlbnQsXG4gICAgICBwcm9wczogeyBjYXNjYWRlUGFyYW1zIH0sXG4gICAgfSA9IHRoaXM7XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBwcm9wczogeyBwcmltYXJ5S2V5IH0sXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICB9ID0gcGFyZW50O1xuICAgICAgaWYgKGN1cnJlbnQpIHtcbiAgICAgICAgcmV0dXJuIGNhc2NhZGVQYXJhbXMhKGN1cnJlbnQsIHByaW1hcnlLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge307XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlUXVlcnlQYXJhbWV0ZXIoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHF1ZXJ5RGF0YVNldCB9ID0gdGhpcztcbiAgICBjb25zdCBwYXJlbnRQYXJhbXMgPSB0aGlzLmdldFBhcmVudFBhcmFtcygpO1xuICAgIGlmIChxdWVyeURhdGFTZXQpIHtcbiAgICAgIGF3YWl0IHF1ZXJ5RGF0YVNldC5yZWFkeSgpO1xuICAgICAgaWYgKCEoYXdhaXQgcXVlcnlEYXRhU2V0LnZhbGlkYXRlKCkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigkbCgnRGF0YVNldCcsICdpbnZhbGlkX3F1ZXJ5X2RhdGFzZXQnKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBkYXRhOiBhbnkgPSB7fTtcbiAgICBpZiAocXVlcnlEYXRhU2V0KSB7XG4gICAgICBjb25zdCB7IGN1cnJlbnQgfSA9IHF1ZXJ5RGF0YVNldDtcbiAgICAgIGlmIChjdXJyZW50KSB7XG4gICAgICAgIGRhdGEgPSBvbWl0KGN1cnJlbnQudG9EYXRhKHRydWUpLCBbJ19fZGlydHknXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGRhdGEgPSB7XG4gICAgICAuLi5kYXRhLFxuICAgICAgLi4udGhpcy5xdWVyeVBhcmFtZXRlcixcbiAgICAgIC4uLnBhcmVudFBhcmFtcyxcbiAgICB9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhkYXRhKS5yZWR1Y2UoKHAsIGtleSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkYXRhW2tleV07XG4gICAgICBpZiAoIWlzRW1wdHkodmFsdWUpKSB7XG4gICAgICAgIHBba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHA7XG4gICAgfSwge30pO1xuICB9XG59XG4iXSwidmVyc2lvbiI6M30=