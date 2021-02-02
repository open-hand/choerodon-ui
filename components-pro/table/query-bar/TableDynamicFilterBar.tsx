import React, { cloneElement, Component, isValidElement, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike, observable, runInAction } from 'mobx';
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
import classNames from 'classnames';

import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from 'choerodon-ui/lib/icon';

import Field from '../../data-set/Field';
import DataSet from '../../data-set';
import { RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import TextField from '../../text-field';
import TableContext from '../TableContext';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonColor } from '../../button/enum';
import { ButtonProps } from '../../button/Button';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import { Action } from '../../trigger/enum';
import { DynamicFilterBarConfig } from '../Table';
import FieldList from './FieldList';
import TableButtons from './TableButtons';
import ColumnFilter from './ColumnFilter';
import QuickFilterMenu from './quick-filter';

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
}

@observer
export default class TableDynamicFilterBar extends Component<TableDynamicFilterBarProps> {
  static contextType = TableContext;

  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    queryFieldsLimit: 3,
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

  refFilterWrapper: HTMLDivElement | null = null;

  originalValue: object;

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
      const fields = [...dataSet.fields.keys()];
      map(fields, field => {
        if (!dataSet.current.getField(field).isValid()) {
          this.handleSelect(field);
        }
      });
      runInAction(() => {
        this.expand = true;
      });
      this.refFilterWrapper!.style.height = '';
      this.refFilterWrapper!.style.overflow = '';
    }
  }

  @autobind
  setConditionStatus(value, orglValue?: object) {
    runInAction(() => this.conditionStatus = value);
    if (value === RecordStatus.sync && orglValue) {
      this.originalValue = orglValue;
    }
  }

  /**
   * 筛选条件更新 触发表格查询
   */
  @autobind
  handleDataSetUpdate({ record }) {
    const { dataSet } = this.props;
    let status = RecordStatus.update;
    if (record) {
      status = isEqualDynamicProps(this.originalValue, record.toData()) ? RecordStatus.sync : RecordStatus.update;
    }
    this.setConditionStatus(status);
    dataSet.query();
  }

  /**
   * queryDS 新建，初始勾选值
   */
  @autobind
  handleDataSetCreate({ dataSet, record }) {
    const conditionData = Object.entries(record.toData());
    this.originalValue = record.toData();
    const keys = [...dataSet.fields.keys()];
    map(conditionData, data => {
      let name = data[0];
      if (!keys.includes(data[0]) &&
        isObject(data[1]) &&
        !isEnumEmpty(data[1]) &&
        !isArray(data[1])) {
        name = `${data[0]}.${Object.keys(data[1])[0]}`;
      }
      if (isSelect(data) && !dataSet.getField(name).get('bind')) {
        this.handleSelect(name);
      }
    });
  }

  /**
   * tableFilterSuffix 预留自定义区域
   */
  renderSuffix() {
    const { prefixCls, dynamicFilterBar, queryDataSet, dataSet } = this.props;
    const suffixes = dynamicFilterBar?.suffixes || getConfig('tableFilterSuffix') || undefined;
    const children: ReactElement[] = [];
    if (suffixes && suffixes.length) {
      suffixes.forEach(suffix => {
        if (isString(suffix) && suffix === 'filter') {
          children.push(<ColumnFilter prefixCls={prefixCls} />);
        } else if (isValidElement(suffix)) {
          children.push(suffix);
        } else if (isFunction(suffix)) {
          children.push(suffix({ queryDataSet, dataSet }));
        }
      });
      return (<div className={`${prefixCls}-dynamic-filter-bar-suffix`}>
        {children}
      </div>);
    }
    return null;
  }

  /**
   * 注入 onEnterDown 事件
   * @param element
   */
  createFields(element): ReactElement {
    const { onEnterDown } = element.props;
    if (onEnterDown && isFunction(onEnterDown)) {
      return element;
    }
    const props: any = {
      onEnterDown: this.handleQuery,
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

  /**
   * 勾选
   * @param code
   */
  @action
  handleSelect = (code) => {
    const codes = Array.isArray(code) ? code : [code];
    this.selectFields = uniq([...this.selectFields, ...codes]);
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
      codes.map((name) => {
        if (queryDataSet.current) {
          queryDataSet.current.set(name, undefined);
        }
        return null;
      });
    }
    this.selectFields = pull([...this.selectFields], ...codes);
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
          const { height } = this.refFilterWrapper!.getBoundingClientRect();
          const { height: childHeight } = this.refFilterWrapper!.children[0].getBoundingClientRect();
          runInAction(() => {
            this.expand = hidden ? height <= 0 : height <= (childHeight + 2);
          });
          if (hidden && height) {
              // 收起全部
              this.refFilterWrapper!.style.display = 'none';
            } else {
              this.refFilterWrapper!.style.display = 'inline-flex';
              this.refFilterWrapper!.style.height = '';
              this.refFilterWrapper!.style.overflow = '';
          }
          if (height > childHeight && !hidden) {
            // 收起留一行高度
            this.refFilterWrapper!.style.height = pxToRem(childHeight) || '';
            this.refFilterWrapper!.style.overflow = 'hidden';
          } else {
            this.refFilterWrapper!.style.height = '';
            this.refFilterWrapper!.style.overflow = '';
          }
        }}
      >
          {this.expand ? (<>
            {$l('Table', 'collapse')}
            <Icon type='expand_less' />
          </>) : (<>
            {$l('Table', 'expand_button')}
            <Icon type='expand_more' />
          </>)}
       </span>
    );
  }


  /**
   * 获取筛选下拉
   */
  getFilterMenu(): ReactNode {
    const { prefixCls, queryFields, queryDataSet, dataSet, dynamicFilterBar } = this.props;
    const tableFilterAdapter = dynamicFilterBar?.tableFilterAdapter || getConfig('tableFilterAdapter');
    if (queryDataSet && queryFields.length && tableFilterAdapter) {
      return (
        <div className={`${prefixCls}-filter-menu`}>
          <QuickFilterMenu
            prefixCls={prefixCls}
            expand={this.expand}
            dynamicFilterBar={dynamicFilterBar}
            dataSet={dataSet}
            queryDataSet={queryDataSet}
            onChange={this.handleSelect}
            conditionStatus={this.conditionStatus}
            onStatusChange={this.setConditionStatus}
          />
          {this.getExpandNode(true)}
        </div>
      );
    }
    if (queryDataSet && queryDataSet.current) {
      return (
        <div className={`${prefixCls}-filter-rest-buttons`}>
          {this.conditionStatus === RecordStatus.update && <Button
            onClick={() => {
              if (queryDataSet && queryDataSet.current) {
                queryDataSet.current.reset();
              }
              this.handleDataSetCreate({ dataSet: queryDataSet, record: queryDataSet.current });
              this.setConditionStatus(RecordStatus.sync);
              dataSet.query();
            }}
            color={ButtonColor.primary}
          >
            {$l('Table', 'reset_button')}
          </Button>}
          {this.getExpandNode(false)}
        </div>
      );
    }
  }


  /**
   * 渲染查询条
   */
  getQueryBar(): ReactNode {
    const { prefixCls, queryFieldsLimit = 3, queryFields, queryDataSet, dataSet, dynamicFilterBar } = this.props;
    const searchText = dynamicFilterBar?.searchText || getConfig('tableFilterSearchText') || 'params';
    if (queryDataSet && queryFields.length) {
      return (
        <div key="query_bar" className={`${prefixCls}-dynamic-filter-bar`}>
          {this.getFilterMenu()}
          <div className={`${prefixCls}-filter-wrapper`} ref={(node) => this.refFilterWrapper = node}>
            {queryFields.slice(0, queryFieldsLimit).map(element => {
              const { name, suffixCls } = element.props;
              const value = element.props.dataSet.current && element.props.dataSet.current.get(name);
              const queryField = queryDataSet.getField(name);
              const hasLabel = !this.isEmpty(value) || suffixCls === 'checkbox';
              const itemClassName = classNames(
                `${prefixCls}-filter-item`,
                {
                  [`${prefixCls}-filter-item-label`]: hasLabel,
                },
              );
              return (
                <div className={`${prefixCls}-filter-content`} key={`${name}-label`}>
                  {hasLabel ? <span className={`${prefixCls}-filter-label`}>{queryField?.get('label')}</span> : null}
                  <span className={itemClassName}>{this.createFields(element)}</span>
                </div>
              );
            })}
            {queryFields.slice(queryFieldsLimit).map(element => {
              const { name, suffixCls } = element.props;
              const value = element.props.dataSet.current && element.props.dataSet.current.get(name);
              const queryField = queryDataSet.getField(name);
              if (this.selectFields.includes(name)) {
                return (
                  <div className={`${prefixCls}-filter-content`} key={name}>
                    <span className={`${prefixCls}-filter-label`}>{!this.isEmpty(value) || suffixCls === 'checkbox' ? queryField?.get('label') : ''}</span>
                    <span className={`${prefixCls}-filter-item`}>
                      {this.createFields(element)}
                      <Icon
                        type="cancel"
                        className={`${prefixCls}-filter-item-close`}
                        onClick={() => {
                          this.handleUnSelect([name]);
                        }}
                      />
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
                      groups={[{title: $l('Table', 'predefined_fields'), fields: [...queryDataSet.fields.values()].filter(f => !f.get('bind')).slice(queryFieldsLimit)}]}
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
                  {$l('Table', 'add_filter')}
                  <Icon type="arrow_drop_down" />
                </span>
              </Dropdown>
            </div>)}
            <div className={`${prefixCls}-filter-search`}>
              <TextField
                clearButton
                placeholder={$l('Table', 'enter_search_content')}
                suffix={<Icon type="search" />}
                value={this.searchText}
                onChange={() => noop}
                onClear={() => {
                  runInAction(() => {
                    this.searchText = '';
                  });
                  dataSet.setQueryParameter(searchText, undefined);
                  this.handleQuery();
                }}
                onInput={(e) => {
                  // @ts-ignore
                  const { value } = e.target;
                  runInAction(() => {
                    this.searchText = value || '';
                  });
                  dataSet.setQueryParameter(searchText, value);
                  this.handleQuery();
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  @autobind
  handleQuery() {
    const { dataSet } = this.props;
    dataSet.query();
  }

  render() {
    const { prefixCls, buttons, summaryBar } = this.props;
    const queryBar = this.getQueryBar();
    const tableButtons = buttons.length ? (
      <div key="dynamic_filter_toolbar" className={`${prefixCls}-dynamic-filter-toolbar`}>
        <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons}>
          {summaryBar}
          {this.renderSuffix()}
        </TableButtons>
      </div>
    ) : (
      <div className={`${prefixCls}-toolbar`}>
        {summaryBar}
      </div>
    );

    return [queryBar, tableButtons];
  }
}
