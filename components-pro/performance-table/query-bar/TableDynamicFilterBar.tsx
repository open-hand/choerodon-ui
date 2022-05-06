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

import { TableFilterAdapterProps } from 'choerodon-ui/lib/configure';
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
import { iteratorFilterToArray } from '../../_util/iteratorUtils';
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

function isEqualDynamicProps(originalValue, newValue) {
  if (isEqual(newValue, originalValue)) {
    return true;
  }
  if (isObject(newValue) && isObject(originalValue) && Object.keys(newValue).length) {
    return Object.keys(newValue).every(key => {
      const value = newValue[key];
      const oldValue = originalValue[key];
      if (oldValue === value) {
        return true;
      }
      const oEp = isNumber(oldValue) ? isEmpty(oldValue) : isEnumEmpty(oldValue);
      const nEp = isNumber(value) ? isEmpty(value) : isEnumEmpty(value);
      if (oEp && nEp) {
        return true;
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
  onReset?: () => void;
  autoQueryAfterReset?: boolean;
  fuzzyQuery?: boolean;
  fuzzyQueryPlaceholder?: string;
  searchCode?: string;
  autoQuery?: boolean;
  expandButton?: boolean;
}

@observer
export default class TableDynamicFilterBar extends Component<TableDynamicFilterBarProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    queryFieldsLimit: 3,
    autoQueryAfterReset: true,
    fuzzyQuery: true,
    autoQuery: true,
    expandButton: true,
  };

  context: Props;

  get prefixCls(): string {
    if ('prefixCls' in this.props) {
      const { prefixCls } = this.props;
      return prefixCls!;
    }
    const { tableStore: { getProPrefixCls } } = this.context;
    return getProPrefixCls('performance-table');
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
    this.processDataSetListener(true);
    document.addEventListener('click', this.handleClickOut);
  }

  componentWillUnmount(): void {
    document.removeEventListener('click', this.handleClickOut);
    this.processDataSetListener(false);
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
    queryDataSet.setState('conditionStatus', value);
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
    queryDataSet.setState('selectFields', [...this.originalConditionFields]);
  };

  /**
   * 筛选条件更新 触发表格查询
   */
  @autobind
  handleDataSetUpdate({ record }) {
    const { dataSet, onQuery = noop, autoQuery } = this.props;
    let status = RecordStatus.update;
    if (record) {
      status = isEqualDynamicProps(this.originalValue, record.toData()) ? RecordStatus.sync : RecordStatus.update;
    }
    this.setConditionStatus(status);
    if (autoQuery) {
      dataSet.query();
      onQuery();
    }
  }

  /**
   * queryDS 新建，初始勾选值
   */
  @autobind
  handleDataSetCreate(props: { dataSet: DataSet; record: Record }) {
    const { dataSet, record } = props;
    const { queryDataSet } = this.props;
    const originalValue = record.toData();
    const conditionData = Object.entries(originalValue);
    this.originalValue = originalValue;
    const { fields } = dataSet;
    map(conditionData, data => {
      let name = data[0];
      if (!fields.has(data[0]) &&
        isObject(data[1]) &&
        !isEnumEmpty(data[1]) &&
        !isArray(data[1])) {
        name = `${data[0]}.${Object.keys(data[1])[0]}`;
      }
      if (isSelect(data) && !(queryDataSet.getState('selectFields') || []).includes(name)) {
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
    queryDataSet.setState('menuDataSet', menuDataSet);
    queryDataSet.setState('conditionDataSet', conditionDataSet);
    queryDataSet.setState('optionDataSet', optionDataSet);
    queryDataSet.setState('filterMenuDataSet', filterMenuDataSet);
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
   */
  @action
  handleSelect = (code) => {
    const { queryDataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    const selectFields = queryDataSet.getState('selectFields') || [];
    queryDataSet.setState('selectFields', uniq([...selectFields, ...codes]));
    const shouldUpdate = !isEqual(toJS(queryDataSet.getState('selectFields') || []), toJS(this.originalConditionFields));
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
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
    const selectFields = queryDataSet.getState('selectFields') || [];
    queryDataSet.setState('selectFields', pull([...selectFields], ...codes));
    const shouldUpdate = !isEqual(toJS(queryDataSet.getState('selectFields')), toJS(this.originalConditionFields));
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
  };

  /**
   * 渲染展开逻辑
   * @param hidden 是否隐藏全部
   */
  getExpandNode(hidden): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    const { expandButton } = this.props;
    if (!expandButton) {
      return;
    }
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
          queryDataSet.getState('conditionStatus') === RecordStatus.update && (
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
    const { queryFields, queryDataSet, dataSet, dynamicFilterBar, searchCode, autoQuery, expandButton } = this.props;
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
            conditionStatus: queryDataSet.getState('conditionStatus'),
            onStatusChange: this.setConditionStatus,
            selectFields: queryDataSet.getState('selectFields'),
            onOriginalChange: this.setOriginalConditionFields,
            menuDataSet: queryDataSet.getState('menuDataSet'),
            filterMenuDataSet: queryDataSet.getState('filterMenuDataSet'),
            conditionDataSet: queryDataSet.getState('conditionDataSet'),
            optionDataSet: queryDataSet.getState('optionDataSet'),
            shouldLocateData: this.shouldLocateData,
          }}
        >
          <QuickFilterMenu />
        </QuickFilterMenuContext.Provider>
      ) : null;
      const resetButton = this.isSingleLineOpt() || this.tableFilterAdapter ? null : this.getResetButton();
      const expandNode = this.getExpandNode(true);

      return (
        <div className={`${proPrefixCls}-filter-menu`}>
          {prefix}
          {fuzzyQuery}
          {quickFilterMenu}
          {resetButton}
          {this.isSingleLineOpt() ? null : (
            <>
              {expandButton ? <span className={`${proPrefixCls}-filter-search-divide`} /> : null}
              {expandNode}
            </>
          )}
          {this.renderSuffix()}
        </div>
      );
    }
  }

  /**
   * 渲染查询条
   */
  getQueryBar(): ReactNode {
    const { tableStore: { proPrefixCls } } = this.context;
    const { queryFieldsLimit = 3, queryFields, queryDataSet } = this.props;
    const selectFields = queryDataSet.getState('selectFields') || [];
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
                      onClick={() => this.refEditors.get(name).focus()}
                    >
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
                          fields: iteratorFilterToArray(queryDataSet.fields.values(), f => !f.get('bind') && !f.get('name').includes('__tls')).slice(queryFieldsLimit),
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
