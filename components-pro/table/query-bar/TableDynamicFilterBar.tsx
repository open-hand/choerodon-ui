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

import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from 'choerodon-ui/lib/icon';
import { Action } from 'choerodon-ui/lib/trigger/enum';

import Field from '../../data-set/Field';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { DataSetEvents, RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import TextField from '../../text-field';
import Tooltip from '../../tooltip';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonProps } from '../../button/Button';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import { DynamicFilterBarConfig, Suffixes } from '../Table';
import FieldList from './FieldList';
import TableButtons from './TableButtons';
import ColumnFilter from './ColumnFilter';
import QuickFilterMenu from './quick-filter';
import { iteratorFilterToArray } from '../../_util/iteratorUtils';

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

export interface TableDynamicFilterBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons: ReactElement<ButtonProps>[];
  summaryBar?: ReactElement<any>;
  dynamicFilterBar?: DynamicFilterBarConfig;
  onQuery?: () => void;
  onReset?: () => void;
  autoQueryAfterReset?: boolean;
  fuzzyQuery?: boolean;
  fuzzyQueryPlaceholder?: string;
  searchCode?: string;
  autoQuery?: boolean;
}

@observer
export default class TableDynamicFilterBar extends Component<TableDynamicFilterBarProps> {
  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    queryFieldsLimit: 3,
    autoQueryAfterReset: true,
    fuzzyQuery: true,
    autoQuery: true,
  };

  @observable moreFields: Field[];

  /**
   * 控制添加筛选下拉显隐
   */
  @observable fieldSelectHidden: boolean;

  /**
   * 勾选字段
   */
  @observable selectFields: string[];

  /**
   * 收起/展开
   */
  @observable expand: boolean;

  /**
   * 搜索值
   */
  @observable searchText: string;

  /**
   * 条件状态
   */
  @observable conditionStatus: RecordStatus;

  refDropdown: HTMLDivElement | null = null;

  refSingleWrapper: HTMLDivElement | null = null;

  refEditors: Map<string, any> = new Map();

  originalValue: object;

  originalConditionFields: string[] = [];

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.fieldSelectHidden = true;
      this.selectFields = [];
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
      handler.call(queryDataSet, DataSetEvents.validate, this.handleDataSetValidate);
      handler.call(queryDataSet, DataSetEvents.update, this.handleDataSetUpdate);
      handler.call(queryDataSet, DataSetEvents.create, this.handleDataSetCreate);
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
    runInAction(() => this.conditionStatus = value);
    if (value === RecordStatus.sync && orglValue) {
      this.originalValue = orglValue;
    }
  }

  @action
  setOriginalConditionFields = (code) => {
    if (!code) {
      this.originalConditionFields = [];
    } else {
      const codes = Array.isArray(code) ? code : [code];
      this.originalConditionFields = uniq([...this.originalConditionFields, ...codes]);
    }
    this.selectFields = [...this.originalConditionFields];
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
      if (isSelect(data) && !this.selectFields.includes(name)) {
        const field = dataSet.getField(name);
        if (!field || !field.get('bind', record)) {
          this.originalConditionFields.push(name);
          this.handleSelect(name);
        }
      }
    });
  }

  /**
   * tableFilterSuffix 预留自定义区域
   */
  renderSuffix() {
    const { prefixCls, dynamicFilterBar, queryDataSet, dataSet, buttons } = this.props;
    const suffixes: Suffixes[] | undefined = dynamicFilterBar && dynamicFilterBar.suffixes || getConfig('tableFilterSuffix');
    const children: ReactElement[] = [];
    let suffixesDom: ReactElement | null = null;
    const tableButtons = buttons.length ? (
      <TableButtons key="toolbar" prefixCls={`${prefixCls}-dynamic-filter`} buttons={buttons} />
    ) : null;
    if (suffixes && suffixes.length) {
      suffixes.forEach(suffix => {
        if (suffix === 'filter') {
          children.push(<ColumnFilter prefixCls={prefixCls} />);
        } else if (isValidElement(suffix)) {
          children.push(suffix);
        } else if (isFunction(suffix)) {
          children.push(suffix({ queryDataSet, dataSet }));
        }
      });
      suffixesDom = (
        <div className={`${prefixCls}-dynamic-filter-bar-suffix`}>
          {children}
        </div>
      );
    }
    return [
      tableButtons,
      suffixesDom,
    ];
  }

  getPrefix(): ReactNode {
    const { prefixCls, dynamicFilterBar, queryDataSet, dataSet } = this.props;
    const prefixes = dynamicFilterBar && dynamicFilterBar.prefixes;
    const children: ReactElement[] = [];
    if (prefixes && prefixes.length) {
      prefixes.forEach((prefix: any) => {
        if (isString(prefix) && prefix === 'filter') {
          children.push(<ColumnFilter prefixCls={prefixCls} />);
        } else if (isValidElement(prefix)) {
          children.push(prefix);
        } else if (isFunction(prefix)) {
          children.push(prefix({ queryDataSet, dataSet }));
        }
      });
      return (<>
        <div className={`${prefixCls}-dynamic-filter-bar-prefix`}>
          {children}
        </div>
        <span className={`${prefixCls}-filter-search-divide`} />
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

  get tableFilterAdapter() {
    const { dynamicFilterBar } = this.props;
    return dynamicFilterBar && dynamicFilterBar.tableFilterAdapter || getConfig('tableFilterAdapter');
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
    const codes = Array.isArray(code) ? code : [code];
    this.selectFields = uniq([...this.selectFields, ...codes]);
    const shouldUpdate = !isEqual(toJS(this.selectFields), toJS(this.originalConditionFields));
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
    this.selectFields = pull([...this.selectFields], ...codes);
    const shouldUpdate = !isEqual(toJS(this.selectFields), toJS(this.originalConditionFields));
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
  };

  /**
   * 渲染展开逻辑
   * @param hidden 是否隐藏全部
   */
  getExpandNode(hidden): ReactNode {
    const { prefixCls } = this.props;
    return (
      <span
        className={`${prefixCls}-filter-menu-expand`}
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
              refSingleWrapper.style.height = pxToRem(childHeight + 18) || '';
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
    const { prefixCls, dataSet, dynamicFilterBar, autoQueryAfterReset, fuzzyQuery, fuzzyQueryPlaceholder, onReset = noop } = this.props;
    const searchText = dynamicFilterBar?.searchText || getConfig('tableFilterSearchText') || 'params';
    const placeholder = fuzzyQueryPlaceholder || $l('Table', 'enter_search_content');
    if (!fuzzyQuery) return null;
    return (<div className={`${prefixCls}-filter-search`}>
      <TextField
        style={{ width: 280 }}
        clearButton
        placeholder={placeholder}
        prefix={<Icon type="search" />}
        value={this.searchText}
        onChange={() => noop}
        onClear={() => {
          runInAction(() => {
            this.searchText = '';
          });
          onReset();
          if (autoQueryAfterReset) {
            dataSet.setQueryParameter(searchText, undefined);
            this.handleQuery(true);
          }
        }}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
          const { value } = e.target;
          runInAction(() => {
            this.searchText = value || '';
          });
          dataSet.setQueryParameter(searchText, value);
          this.handleQuery();
        }}
      />
    </div>);
  }

  /**
   * 渲染重置按钮
   */
  getResetButton() {
    const { prefixCls, queryDataSet, autoQueryAfterReset, onReset = noop } = this.props;
    return (
      <div className={`${prefixCls}-filter-buttons`}>
        {
          this.conditionStatus === RecordStatus.update && (
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
    const { prefixCls, queryFields, queryDataSet, dataSet, dynamicFilterBar, searchCode, autoQuery } = this.props;
    if (queryDataSet && queryFields.length) {
      const prefix = this.getPrefix();
      const fuzzyQuery = this.getFuzzyQuery();
      const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
      const quickFilterMenu = this.tableFilterAdapter && searchCodes ? (
        <QuickFilterMenu
          autoQuery={autoQuery}
          prefixCls={prefixCls}
          expand={this.expand}
          dynamicFilterBar={dynamicFilterBar}
          searchCode={searchCodes}
          dataSet={dataSet}
          queryDataSet={queryDataSet}
          onChange={this.handleSelect}
          conditionStatus={this.conditionStatus}
          onStatusChange={this.setConditionStatus}
          selectFields={this.selectFields}
          onOriginalChange={this.setOriginalConditionFields}
        />
      ) : null;
      const resetButton = this.isSingleLineOpt() || this.tableFilterAdapter ? null : this.getResetButton();
      const expandNode = this.getExpandNode(true);

      return (
        <div className={`${prefixCls}-filter-menu`}>
          {prefix}
          {fuzzyQuery}
          {quickFilterMenu}
          {resetButton}
          {this.isSingleLineOpt() ? null : (
            <>
              <span className={`${prefixCls}-filter-search-divide`} />
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
    const { prefixCls, queryFieldsLimit = 3, queryFields, queryDataSet } = this.props;
    const singleLineModeAction = this.isSingleLineOpt() ? <div className={`${prefixCls}-dynamic-filter-bar-single-action`}>
      {this.getResetButton()}
      {this.getExpandNode(false)}
    </div> : null;

    if (queryDataSet && queryFields.length) {
      return (
        <div key="query_bar" className={`${prefixCls}-dynamic-filter-bar`}>
          {this.getFilterMenu()}
          <div className={`${prefixCls}--dynamic-filter-single-wrapper`} ref={(node) => this.refSingleWrapper = node}>
            <div className={`${prefixCls}-filter-wrapper`}>
              {queryFields.slice(0, queryFieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                const itemClassName = `${prefixCls}-filter-item`;
                return (
                  <div
                    className={`${prefixCls}-filter-content`}
                    key={name}
                    onClick={() => this.refEditors.get(name).focus()}
                  >
                    <span className={`${prefixCls}-filter-label`}>{queryField?.get('label')}</span>
                    <span className={itemClassName}>{this.createFields(element, name)}</span>
                  </div>
                );
              })}
              {queryFields.slice(queryFieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                if (this.selectFields.includes(name)) {
                  return (
                    <div
                      className={`${prefixCls}-filter-content`}
                      key={name}
                      onClick={() => this.refEditors.get(name).focus()}
                    >
                      <Icon
                        type="cancel"
                        className={`${prefixCls}-filter-item-close`}
                        onClick={() => {
                          this.handleUnSelect([name]);
                        }}
                      />
                      <span className={`${prefixCls}-filter-label`}>{queryField?.get('label')}</span>
                      <span className={`${prefixCls}-filter-item`}>
                        {this.createFields(element, name)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              {(queryFieldsLimit < queryFields.length) && (<div className={`${prefixCls}-filter-item`}>
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
                          fields: iteratorFilterToArray(queryDataSet.fields.values(), f => !f.get('bind')).slice(queryFieldsLimit),
                        }]}
                        prefixCls={`${prefixCls}-filter-list` || 'c7n-pro-table-filter-list'}
                        closeMenu={() => runInAction(() => this.fieldSelectHidden = true)}
                        value={this.selectFields}
                        onSelect={this.handleSelect}
                        onUnSelect={this.handleUnSelect}
                      />
                    </div>
                  )}
                  trigger={[Action.click]}
                >
                  <span
                    className={`${prefixCls}-add-fields`}
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
    const { dataSet, onQuery = noop, autoQuery } = this.props;
    if (autoQuery) {
      dataSet.query();
    }
    if (!collapse) {
      onQuery();
    }
  }

  render() {
    const { summaryBar, buttons, prefixCls } = this.props;
    const queryBar = this.getQueryBar();
    if (queryBar) {
      return [queryBar, summaryBar];
    }
    return <TableButtons key="toolbar" prefixCls={`${prefixCls}-dynamic-filter-buttons`} buttons={buttons}>
      {summaryBar}
    </TableButtons>;
  }
}
