import React, { cloneElement, Component, isValidElement, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike, observable, runInAction, toJS } from 'mobx';
import uniq from 'lodash/uniq';
import pull from 'lodash/pull';
import noop from 'lodash/noop';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isEqual from 'lodash/isEqual';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import difference from 'lodash/difference';

import { TableFilterAdapterProps } from 'choerodon-ui/lib/configure';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from 'choerodon-ui/lib/icon';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Action } from 'choerodon-ui/lib/trigger/enum';

import Field from '../../data-set/Field';
import DataSet, { DataSetProps } from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { DataSetSelection, FieldIgnore, FieldType, RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import TextField from '../../text-field';
import Tooltip from '../../tooltip';
import TableContext, { Props } from '../TableContext';
import { ElementProps } from '../../core/ViewComponent';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import FieldList from '../../table/query-bar/FieldList';
import ColumnFilter from '../tool-bar/ColumnFilter';
import { DynamicFilterBarConfig } from '../Table';
import { Suffixes } from '../../table/Table';
import { ValueChangeAction } from '../../text-field/enum';
import QuickFilterMenu from '../../table/query-bar/quick-filter/QuickFilterMenu';
import QuickFilterMenuContext from '../../table/query-bar/quick-filter/QuickFilterMenuContext';
import { ConditionDataSet, QuickFilterDataSet } from '../../table/query-bar/quick-filter/QuickFilterDataSet';
import { TransportProps } from '../../data-set/Transport';

/**
 * 当前数据是否有值并需要选中
 * @param data
 */
function isSelect(data) {
  if (isObject(data[1])) {
    return !isEnumEmpty(data[1]);
  }
  return data[0] !== '__dirty' && !isEmpty(data[1]);
}

export function isEqualDynamicProps(originalValue, newValue, dataSet, record, name?: string) {
  if (isEqual(newValue, originalValue)) {
    return true;
  }
  if (isObject(newValue) && isObject(originalValue) && Object.keys(newValue).length) {
    const combineKeys = Object.keys(newValue).concat(Object.keys(originalValue));
    return combineKeys.every(key => {
      const value = newValue[key];
      const oldValue = originalValue[key];
      if (oldValue === value) {
        return true;
      }
      if (isEmpty(oldValue) && isEmpty(value)) {
        return true;
      }
      if (name && name.includes('.')) {
        return isEmpty(oldValue) && isEmpty(record!.get(name))
      }
      if (isNumber(oldValue) || isNumber(value)) {
        const oEp = isNumber(oldValue) ? isEmpty(oldValue) : isEnumEmpty(oldValue);
        const nEp = isNumber(value) ? isEmpty(value) : isEnumEmpty(value);
        if (oEp && nEp) {
          return true;
        }
        return String(oldValue) === String(value);
      }
      const field = dataSet.getField(key);
      if (field && field.get('range', record)) {
        const rangeValue = value ? isArray(value) ? value.join('') : Object.values(value).join('') : '';
        const rangeOldValue = oldValue ? isArray(oldValue) ? oldValue.join('') : Object.values(oldValue).join('') : '';
        return rangeValue === rangeOldValue;
      }
      if (field && field.get('lovCode') && oldValue && value) {
        const valueField = dataSet.getField(key).get('valueField', record);
        const textField = dataSet.getField(key).get('textField', record);
        return value[valueField] === oldValue[valueField] && value[textField] === oldValue[textField];
      }
      return isEqual(oldValue, value);
    });
  }
  return isEqual(newValue, originalValue);
}

function getQueryData(queryDataSet) {
  const { current } = queryDataSet;
  if (current) {
    const queryData = omit(current.toData(true), ['__dirty']);
    return Object.keys(queryData).reduce((p, key) => {
      const value = queryData[key];
      if (!isEmpty(value)) {
        p[key] = value;
      }
      return p;
    }, {});
  }
  return {};
}

export interface TableDynamicFilterBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  dynamicFilterBar?: DynamicFilterBarConfig;
  onQuery?: (props: object) => void;
  onRefresh?: (props: object) => void;
  onReset?: () => void;
  autoQueryAfterReset?: boolean;
  fuzzyQuery?: boolean;
  fuzzyQueryOnly?: boolean,
  fuzzyQueryPlaceholder?: string;
  searchCode?: string;
  autoQuery?: boolean;
  refreshBtn?: boolean;
}

export const CONDITIONSTATUS = '__CONDITIONSTATUS__';
export const SELECTFIELDS = '__SELECTFIELDS__';
export const MENUDATASET = '__MENUDATASET__';
export const CONDITIONDATASET = '__CONDITIONDATASET__';
export const OPTIONDATASET = '__OPTIONDATASET__';
export const FILTERMENUDATASET = '__FILTERMENUDATASET__';
export const SELECTCHANGE = '__SELECTCHANGE__';

@observer
export default class TableDynamicFilterBar extends Component<TableDynamicFilterBarProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    queryFieldsLimit: 3,
    autoQueryAfterReset: true,
    fuzzyQuery: true,
    fuzzyQueryOnly: false,
    autoQuery: true,
    refreshBtn: true,
  };

  context: Props;

  get prefixCls(): string {
    if ('prefixCls' in this.props) {
      const { prefixCls } = this.props;
      return prefixCls!;
    }
    const { tableStore: { proPrefixCls = getProPrefixCls('performance-table') } } = this.context;
    return proPrefixCls;
  }

  @observable moreFields: Field[];

  /**
   * 控制添加筛选下拉显隐
   */
  @observable fieldSelectHidden: boolean;

  /**
   * 收起/展开
   */
  @observable expand: boolean;

  /**
   * 搜索值
   */
  @observable searchText: string;

  @observable shouldLocateData: boolean;

  @observable showExpandIcon: boolean;

  refDropdown: HTMLDivElement | null = null;

  refFilterWrapper: HTMLDivElement | null = null;

  refSingleWrapper: HTMLDivElement | null = null;

  refEditors: Map<string, any> = new Map();

  originalValue: object;

  originalConditionFields: string[] = [];

  enterNum = 0;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.fieldSelectHidden = true;
      this.expand = true;
    });
  }

  componentDidMount(): void {
    const { fuzzyQueryOnly } = this.props;
    if (!fuzzyQueryOnly) {
      this.processDataSetListener(true);
      document.addEventListener('click', this.handleClickOut);
      if (this.isSingleLineOpt() && this.refSingleWrapper) {
        const { height } = this.refSingleWrapper.getBoundingClientRect();
        const { height: childHeight } = this.refSingleWrapper.children[0].children[0].getBoundingClientRect();
        runInAction(() => {
          this.showExpandIcon = height > (childHeight + 18);
        });
      }

    }
  }

  componentWillUnmount(): void {
    const { fuzzyQueryOnly } = this.props;
    if (!fuzzyQueryOnly) {
      document.removeEventListener('click', this.handleClickOut);
      this.processDataSetListener(false);
    }
  }

  processDataSetListener(flag: boolean) {
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      const handler = flag ? queryDataSet.addEventListener : queryDataSet.removeEventListener;
      handler.call(queryDataSet, 'validate', this.handleDataSetValidate);
      handler.call(queryDataSet, 'update', this.handleDataSetUpdate);
      handler.call(queryDataSet, 'create', this.handleDataSetCreate);
    }
  }

  @action
  handleClickOut = (e) => {
    if (this.refDropdown && !this.refDropdown.contains(e.target)) {
      this.fieldSelectHidden = true;
    }
  };

  /**
   * queryDataSet 查询前校验事件 触发展开动态字段
   * @param dataSet 查询DS
   * @param result
   */
  @autobind
  async handleDataSetValidate({ dataSet, result }) {
    if (!await result) {
      runInAction(() => {
        const { current } = dataSet;
        dataSet.fields.forEach((field, key) => {
          if (!field.isValid(current)) {
            this.handleSelect(key);
          }
        });
        this.expand = true;
      });
      const { refSingleWrapper } = this;
      if (refSingleWrapper) {
        refSingleWrapper.style.height = '';
        refSingleWrapper.style.overflow = '';
      }
    }
  }

  @autobind
  setConditionStatus(value, orglValue?: object) {
    const { queryDataSet } = this.props;
    queryDataSet.setState(CONDITIONSTATUS, value);
    if (value === RecordStatus.sync && orglValue) {
      this.originalValue = orglValue;
    }
  }

  @action
  setOriginalConditionFields = (code) => {
    const { queryDataSet } = this.props;
    if (!code) {
      this.originalConditionFields = [];
    } else {
      const codes = Array.isArray(code) ? code : [code];
      this.originalConditionFields = uniq([...this.originalConditionFields, ...codes]);
    }
    queryDataSet.setState(SELECTFIELDS, [...this.originalConditionFields]);
  };

  /**
   * 筛选条件更新 触发表格查询
   */
  @autobind
  async handleDataSetUpdate({ record, name, oldValue, value }) {
    const { dataSet, queryDataSet, onQuery = noop, autoQuery } = this.props;
    const field = queryDataSet && queryDataSet.getField(name);
    let shouldQuery = true;
    if (field && field.get('range', record)) {
      const rangeValue = value ? isArray(value) ? value.join('') : Object.values(value).join('') : '';
      const rangeOldValue = oldValue ? isArray(oldValue) ? oldValue.join('') : Object.values(oldValue).join('') : '';
      shouldQuery = rangeValue !== rangeOldValue;
    }
    let status = RecordStatus.update;
    if (record) {
      status = isEqualDynamicProps(this.originalValue, omit(record.toData(), ['__dirty']), queryDataSet, record, name) ? RecordStatus.sync : RecordStatus.update;
    }
    this.setConditionStatus(status);
    if (autoQuery && shouldQuery) {
      if (await dataSet.modifiedCheck(undefined, dataSet, 'query')) {
        if (queryDataSet && queryDataSet.current && await queryDataSet.current.validate()) {
          dataSet.query();
          onQuery();
        } else {
          let hasFocus = false;
          for (const [key, value] of this.refEditors.entries()) {
            if (value && !value.valid && !hasFocus) {
              this.refEditors.get(key).focus();
              hasFocus = true;
            }
          }
        }
      } else {
        record.init(name, oldValue);
      }
    }
  }

  /**
   * queryDS 新建，初始勾选值
   */
  @autobind
  handleDataSetCreate(props: { dataSet: DataSet; record: Record }) {
    const { dataSet, record } = props;
    const { queryDataSet } = this.props;
    const originalValue = omit(record.toData(), ['__dirty']);
    const conditionData = Object.entries(originalValue);
    this.originalValue = originalValue;
    this.originalConditionFields = [];
    const { fields } = dataSet;
    map(conditionData, data => {
      let name = data[0];
      if (!fields.has(data[0]) &&
        isObject(data[1]) &&
        !isEnumEmpty(data[1]) &&
        !isArray(data[1])) {
        name = `${data[0]}.${Object.keys(data[1])[0]}`;
      }
      if (isSelect(data) && !(queryDataSet.getState(SELECTFIELDS) || []).includes(name)) {
        const field = dataSet.getField(name);
        if (!field || !field.get('bind', record)) {
          this.originalConditionFields.push(name);
          this.handleSelect(name);
        }
      }
    });
    this.initMenuDataSet();
  }

  @autobind
  async initMenuDataSet(): Promise<void> {
    const { queryDataSet, dataSet, dynamicFilterBar, searchCode } = this.props;
    const { tableStore: { getConfig } } = this.context;
    const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
    const menuDataSet = new DataSet(QuickFilterDataSet({
      searchCode: searchCodes,
      queryDataSet,
      tableFilterAdapter: this.tableFilterAdapter,
    }) as DataSetProps, { getConfig: getConfig as any });
    const conditionDataSet = new DataSet(ConditionDataSet(), { getConfig: getConfig as any });
    const optionDataSet = new DataSet({
      selection: DataSetSelection.single,
    }, { getConfig: getConfig as any });
    const filterMenuDataSet = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'filterName',
          type: FieldType.string,
          textField: 'searchName',
          valueField: 'searchId',
          options: optionDataSet,
          ignore: FieldIgnore.always,
        },
      ],
    }, { getConfig: getConfig as any });
    queryDataSet.setState(MENUDATASET, menuDataSet);
    queryDataSet.setState(CONDITIONDATASET, conditionDataSet);
    queryDataSet.setState(OPTIONDATASET, optionDataSet);
    queryDataSet.setState(FILTERMENUDATASET, filterMenuDataSet);
    const result = await menuDataSet.query();
    if (optionDataSet) {
      optionDataSet.loadData(result);
    }
    const menuRecord = menuDataSet.current;
    if (menuRecord) {
      conditionDataSet.loadData(menuRecord.get('conditionList'));
    }
    if (result && result.length) {
      runInAction(() => {
        this.shouldLocateData = true;
      });
    } else {
      const { current } = filterMenuDataSet;
      if (current) current.set('filterName', undefined);
      runInAction(() => {
        this.shouldLocateData = true;
      });
      if (dataSet.props.autoQuery) {
        dataSet.query();
      }
    }
  }

  /**
   * tableFilterSuffix 预留自定义区域
   */
  renderSuffix() {
    const { tableStore, tableStore: { proPrefixCls } } = this.context;
    const { dynamicFilterBar, queryDataSet, dataSet } = this.props;
    const suffixes: Suffixes[] | undefined = dynamicFilterBar && dynamicFilterBar.suffixes || tableStore.getConfig('tableFilterSuffix');
    const children: ReactElement[] = [];
    if (suffixes && suffixes.length) {
      suffixes.forEach(suffix => {
        if (suffix === 'filter') {
          children.push(<ColumnFilter prefixCls={proPrefixCls} />);
        } else if (isValidElement(suffix)) {
          children.push(suffix);
        } else if (isFunction(suffix)) {
          children.push(suffix({ queryDataSet, dataSet }));
        }
      });
      return (
        <div className={`${proPrefixCls}-dynamic-filter-bar-suffix`}>
          {children}
        </div>
      );
    }
  }

  getPrefix(): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    const { dynamicFilterBar, queryDataSet, dataSet } = this.props;
    const prefixes = dynamicFilterBar && dynamicFilterBar.prefixes;
    const children: ReactElement[] = [];
    if (prefixes && prefixes.length) {
      prefixes.forEach((prefix: any) => {
        if (isString(prefix) && prefix === 'filter') {
          children.push(<ColumnFilter prefixCls={proPrefixCls} />);
        } else if (isValidElement(prefix)) {
          children.push(prefix);
        } else if (isFunction(prefix)) {
          children.push(prefix({ queryDataSet, dataSet }));
        }
      });
      return (
        <>
          <div className={`${proPrefixCls}-dynamic-filter-bar-prefix`}>
            {children}
          </div>
          <span className={`${proPrefixCls}-filter-search-divide`} />
        </>
      );
    }
    return null;
  }

  /**
   * 注入 onEnterDown 事件
   * @param element
   * @param name
   */
  createFields(element, name): ReactElement {
    const { onEnterDown } = element.props;
    if (onEnterDown && isFunction(onEnterDown)) {
      return element;
    }
    const props: any = {
      onEnterDown: () => {
        this.handleQuery();
      },
      ref: (node) => this.refEditors.set(name, node),
    };
    return cloneElement(element, props);
  }

  /**
   * 判断查询值是否为空
   * @param value
   */
  isEmpty(value) {
    return isArrayLike(value) ? !value.length : isEmpty(value);
  }


  get tableFilterAdapter(): TransportProps | TableFilterAdapterProps | null | undefined {
    const { dynamicFilterBar } = this.props;
    const { tableStore } = this.context;
    return dynamicFilterBar && dynamicFilterBar.tableFilterAdapter || tableStore.getConfig('tableFilterAdapter');
  }

  /**
   * 是否单行操作
   */
  isSingleLineOpt(): boolean {
    const { fuzzyQuery } = this.props;
    return !(fuzzyQuery || this.tableFilterAdapter);
  }

  /**
   * 勾选
   * @param code
   * @param record
   */
  @action
  handleSelect = (code, record?: Record) => {
    const { queryDataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    const selectFields = queryDataSet.getState(SELECTFIELDS) || [];
    queryDataSet.setState(SELECTFIELDS, uniq([...selectFields, ...codes]));
    const shouldUpdate = queryDataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length
      || !!difference(toJS(queryDataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    const isDirty = record ? record.dirty : false;
    this.setConditionStatus(shouldUpdate || isDirty ? RecordStatus.update : RecordStatus.sync);
    queryDataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  /**
   * 取消勾选
   * @param code
   */
  @action
  handleUnSelect = (code) => {
    const { queryDataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        codes.forEach((name) => current.set(name, undefined));
      }
    }
    const selectFields = queryDataSet.getState(SELECTFIELDS) || [];
    queryDataSet.setState(SELECTFIELDS, pull([...selectFields], ...codes));
    const shouldUpdate = queryDataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length
      || !!difference(toJS(queryDataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
    queryDataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  renderRefreshBtn(): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    return (
      <span
        className={`${proPrefixCls}-filter-menu-query`}
        onClick={(e) => {
          e.stopPropagation();
          const { dataSet, queryDataSet, onRefresh = noop } = this.props;
          const data = getQueryData(queryDataSet);
          onRefresh({ dataSet, queryDataSet, data, params: this.searchText });
        }}
      >
        <Tooltip title={$l('Table', 'refresh')}>
          <Icon type="refresh" />
        </Tooltip>
      </span>
    );
  }

  /**
   * 渲染展开逻辑
   * @param hidden 是否隐藏全部
   */
  getExpandNode(hidden): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    const { refreshBtn } = this.props;
    if (!this.showExpandIcon && !hidden) return refreshBtn ? this.renderRefreshBtn() : null;
    return (
      <span
        className={`${proPrefixCls}-filter-menu-expand`}
        onClick={() => {
          const { refSingleWrapper } = this;
          if (refSingleWrapper) {
            const { height } = refSingleWrapper.getBoundingClientRect();
            const { height: childHeight } = refSingleWrapper.children[0].children[0].getBoundingClientRect();
            runInAction(() => {
              this.expand = hidden ? height <= 0 : height <= (childHeight + 18);
            });
            if (hidden && height) {
              // 收起全部
              refSingleWrapper.style.display = 'none';
            } else {
              refSingleWrapper.style.display = 'flex';
              refSingleWrapper.style.height = '';
              refSingleWrapper.style.overflow = '';
            }
            if (height > (childHeight + 18) && !hidden) {
              // 收起留一行高度
              refSingleWrapper.style.height = pxToRem(childHeight + 18, true) || '';
              refSingleWrapper.style.overflow = 'hidden';
            } else {
              refSingleWrapper.style.height = '';
              refSingleWrapper.style.overflow = '';
            }
          }
        }}
      >
        {refreshBtn ? this.renderRefreshBtn() : null}
        {this.expand ? (<Tooltip title={$l('Table', 'collapse')}>
          <Icon type="baseline-arrow_drop_up" />
        </Tooltip>) : (<Tooltip title={$l('Table', 'expand_button')}>
          <Icon type="baseline-arrow_drop_down" />
        </Tooltip>)}
      </span>
    );
  }

  /**
   * 渲染模糊搜索
   */
  getFuzzyQuery(): ReactNode {
    const { fuzzyQuery } = this.props;
    if (!fuzzyQuery) return null;
    const { dataSet, dynamicFilterBar, autoQueryAfterReset, fuzzyQueryPlaceholder, onReset = noop } = this.props;
    const { tableStore, tableStore: { proPrefixCls, node, highlightRowIndexs } } = this.context;
    const searchText = dynamicFilterBar && dynamicFilterBar.searchText || tableStore.getConfig('tableFilterSearchText') || 'params';
    const placeholder = fuzzyQueryPlaceholder || $l('Table', 'enter_search_content');
    return (<div className={`${proPrefixCls}-filter-search`}>
      <TextField
        style={{ width: 280 }}
        clearButton
        placeholder={placeholder}
        prefix={<Icon type="search" />}
        value={this.searchText}
        valueChangeAction={ValueChangeAction.input}
        onChange={debounce((value: string) => {
          runInAction(() => {
            this.searchText = value || '';
            if (dynamicFilterBar && dynamicFilterBar.quickSearch) {
              tableStore.highlightRowIndexs = [];
              tableStore.searchText = value || '';
              node.forceUpdate();
            }
          });
          dataSet.setQueryParameter(searchText, value);
          this.handleQuery();
        }, 500)}
        onKeyDown={(e) => {
          if (e.keyCode === KeyCode.ENTER && dynamicFilterBar && dynamicFilterBar.quickSearch) {
            e.preventDefault();
            const rows: any[] = [...new Set(highlightRowIndexs)];
            node.scrollTop(rows[this.enterNum] * node.getRowHeight());
            this.enterNum += 1;
            if (this.enterNum + 1 > rows.length) {
              this.enterNum = 0;
            }
          }
        }}
        onClear={() => {
          runInAction(() => {
            this.searchText = '';
            if (dynamicFilterBar && dynamicFilterBar.quickSearch) {
              tableStore.searchText = '';
              tableStore.highlightRowIndexs = [];
              node.forceUpdate();
            }
          });
          onReset();
          if (autoQueryAfterReset) {
            dataSet.setQueryParameter(searchText, undefined);
            this.handleQuery(true);
          }
        }}
      />
    </div>);
  }

  /**
   * 渲染重置按钮
   */
  getResetButton() {
    const { tableStore: { proPrefixCls } } = this.context;
    const { queryDataSet, autoQueryAfterReset, onReset = noop } = this.props;
    return (
      <div className={`${proPrefixCls}-filter-buttons`}>
        {
          queryDataSet.getState(CONDITIONSTATUS) === RecordStatus.update && (
            <Button
              onClick={() => {
                if (queryDataSet) {
                  const { current } = queryDataSet;
                  if (current) {
                    current.reset();
                    this.handleDataSetCreate({ dataSet: queryDataSet, record: current });
                  }
                }
                this.setConditionStatus(RecordStatus.sync);
                onReset();
                if (autoQueryAfterReset) {
                  this.handleQuery();
                }
              }}
            >
              {$l('Table', 'reset_button')}
            </Button>
          )
        }
      </div>
    );
  }

  /**
   * 筛选头
   * fuzzyQuery + quickFilterMenu + resetButton + buttons
   */
  getFilterMenu(): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    const { queryFields, queryDataSet, dataSet, dynamicFilterBar, searchCode, autoQuery, fuzzyQueryOnly } = this.props;
    const prefix = this.getPrefix();
    const suffix = this.renderSuffix();
    const fuzzyQuery = this.getFuzzyQuery();
    if (fuzzyQueryOnly) {
      return (
        <div className={`${proPrefixCls}-filter-menu`}>
          {prefix}
          {fuzzyQuery}
          {suffix}
        </div>
      );
    }
    if (queryDataSet && queryFields.length) {
      const prefix = this.getPrefix();
      const fuzzyQuery = this.getFuzzyQuery();
      const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
      const quickFilterMenu = this.tableFilterAdapter && searchCodes ? (
        <QuickFilterMenuContext.Provider
          value={{
            autoQuery,
            prefixCls: proPrefixCls,
            expand: this.expand,
            dataSet,
            queryDataSet,
            onChange: this.handleSelect,
            conditionStatus: queryDataSet.getState(CONDITIONSTATUS),
            onStatusChange: this.setConditionStatus,
            selectFields: queryDataSet.getState(SELECTFIELDS),
            onOriginalChange: this.setOriginalConditionFields,
            menuDataSet: queryDataSet.getState(MENUDATASET),
            filterMenuDataSet: queryDataSet.getState(FILTERMENUDATASET),
            conditionDataSet: queryDataSet.getState(CONDITIONDATASET),
            optionDataSet: queryDataSet.getState(OPTIONDATASET),
            shouldLocateData: this.shouldLocateData,
          }}
        >
          <QuickFilterMenu />
        </QuickFilterMenuContext.Provider>
      ) : null;
      const resetButton = this.isSingleLineOpt() || this.tableFilterAdapter ? null : this.getResetButton();

      return (
        <div className={`${proPrefixCls}-filter-menu`}>
          {prefix}
          {fuzzyQuery}
          {quickFilterMenu}
          {resetButton}
          {this.isSingleLineOpt() ? null : (
            <>
              <span className={`${proPrefixCls}-filter-search-divide`} />
              {this.getExpandNode(true)}
            </>
          )}
          {suffix}
        </div>
      );
    }
  }

  /**
 * 查询字段初始顺序
 * 排除动态属性影响
 */
  get originOrderQueryFields(): Field[] {
    const { queryDataSet } = this.props;
    const result: Field[] = [];
    if (queryDataSet) {
      const { fields, props: { fields: propFields = [] } } = queryDataSet;
      const cloneFields: Map<string, Field> = fields.toJS();
      propFields.forEach(({ name }) => {
        if (name) {
          const field = cloneFields.get(name);
          if (field && !field.get('bind') && !field.get('name').includes('__tls')) {
            result.push(field);
          }
        }
      });
    }
    return result;
  }

  /**
   * 渲染查询条
   */
  getQueryBar(): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    const { queryFieldsLimit = 3, queryFields, dataSet, queryDataSet, fuzzyQueryOnly } = this.props;
    const menuDataSet = dataSet.getState(MENUDATASET);
    const isTenant = menuDataSet && menuDataSet.current && menuDataSet.current.get('isTenant');
    let fieldsLimit = queryFieldsLimit;
    if (isTenant) {
      fieldsLimit = 0;
    }
    const selectFields = queryDataSet.getState(SELECTFIELDS) || [];
    if (fuzzyQueryOnly) {
      return (
        <div key="query_bar" className={`${proPrefixCls}-dynamic-filter-bar`}>
          {this.getFilterMenu()}
        </div>
      );
    }
    const singleLineModeAction = this.isSingleLineOpt() ?
      <div className={`${proPrefixCls}-dynamic-filter-bar-single-action`}>
        {this.getResetButton()}
        {this.getExpandNode(false)}
      </div> : null;

    if (queryDataSet && queryFields.length) {
      return (
        <div key="query_bar" className={`${proPrefixCls}-dynamic-filter-bar`}>
          {this.getFilterMenu()}
          <div className={`${proPrefixCls}--dynamic-filter-single-wrapper`} ref={(node) => this.refSingleWrapper = node}>
            <div className={`${proPrefixCls}-filter-wrapper`}>
              {queryFields.slice(0, queryFieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                const itemClassName = `${proPrefixCls}-filter-item`;
                return (
                  <div
                    className={`${proPrefixCls}-filter-content`}
                    key={name}
                    onClick={() => this.refEditors.get(name).focus()}
                  >
                    <span className={`${proPrefixCls}-filter-label`}>{queryField && queryField.get('label')}</span>
                    <span className={itemClassName}>{this.createFields(element, name)}</span>
                  </div>
                );
              })}
              {queryFields.slice(queryFieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                if (selectFields.includes(name)) {
                  return (
                    <div
                      className={`${proPrefixCls}-filter-content`}
                      key={name}
                      onClick={() => {
                        const editor = this.refEditors.get(name);
                        if (editor && Object.prototype.hasOwnProperty.call(editor, 'focus')) {
                          this.refEditors.get(name).focus();
                        }
                      }}                    >
                      <Icon
                        type="cancel"
                        className={`${proPrefixCls}-filter-item-close`}
                        onClick={() => {
                          this.handleUnSelect([name]);
                        }}
                      />
                      <span className={`${proPrefixCls}-filter-label`}>{queryField && queryField.get('label')}</span>
                      <span className={`${proPrefixCls}-filter-item`}>
                        {this.createFields(element, name)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              {(queryFieldsLimit < queryFields.length) && (<div className={`${proPrefixCls}-filter-item`}>
                <Dropdown
                  visible={!this.fieldSelectHidden}
                  overlay={(
                    <div
                      role="none"
                      ref={(node) => this.refDropdown = node}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <FieldList
                        groups={[{
                          title: $l('Table', 'predefined_fields'),
                          fields: isTenant ? [...queryDataSet.fields.values()] : this.originOrderQueryFields.slice(fieldsLimit),
                        }]}
                        prefixCls={`${proPrefixCls}-filter-list` || 'c7n-pro-table-filter-list'}
                        closeMenu={() => runInAction(() => this.fieldSelectHidden = true)}
                        value={selectFields}
                        onSelect={this.handleSelect}
                        onUnSelect={this.handleUnSelect}
                      />
                    </div>
                  )}
                  trigger={[Action.click]}
                >
                  <span
                    className={`${proPrefixCls}-add-fields`}
                    onClick={(e: any) => {
                      e.nativeEvent.stopImmediatePropagation();
                      runInAction(() => {
                        this.fieldSelectHidden = false;
                      });
                    }}
                  >
                    <Icon type="add" />
                    {$l('Table', 'add_filter')}
                  </span>
                </Dropdown>
              </div>)}
            </div>
            {singleLineModeAction}
          </div>
        </div>
      );
    }
    return null;
  }

  @autobind
  handleQuery(collapse?: boolean) {
    const { dataSet, queryDataSet, onQuery = noop, autoQuery } = this.props;
    if (autoQuery) {
      dataSet.query();
    }
    if (!collapse) {
      const data = getQueryData(queryDataSet);
      onQuery({ dataSet, queryDataSet, data, params: this.searchText });
    }
  }

  render() {
    return this.getQueryBar();
  }
}
