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
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import difference from 'lodash/difference';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { TableFilterAdapterProps } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from 'choerodon-ui/lib/icon';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import Field, { Fields } from '../../data-set/Field';
import DataSet, { DataSetProps } from '../../data-set/DataSet';
import { DataSetEvents, DataSetSelection, FieldIgnore, FieldType, RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import TextField from '../../text-field';
import { ValueChangeAction } from '../../text-field/enum';
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
import QuickFilterMenu from './quick-filter/QuickFilterMenu';
import QuickFilterMenuContext from './quick-filter/QuickFilterMenuContext';
import { ConditionDataSet, QuickFilterDataSet } from './quick-filter/QuickFilterDataSet';
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

export function isEqualDynamicProps(originalValue, newValue, dataSet, record) {
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
      if (isNumber(oldValue) || isNumber(value)) {
        const oEp = isNumber(oldValue) ? isEmpty(oldValue) : isEnumEmpty(oldValue);
        const nEp = isNumber(value) ? isEmpty(value) : isEnumEmpty(value);
        if (oEp && nEp) {
          return true;
        }
        return String(oldValue) === String(value);
      }
      const field = dataSet.getField(key);
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

/**
 * 提交副本数据
 * @param data
 */
export function omitData(data) {
  return omit(
    data,
    'creationDate',
    'createdBy',
    'lastUpdateDate',
    'lastUpdatedBy',
    'objectVersionNumber',
    '_token',
    'searchId',
    'searchConditionId',
    'searchQueryId',
    'searchOrderId',
  );
}


/**
 * obj 值使用 JSON 保存、获取赋值转化
 * @param value
 */
export function parseValue(value) {
  try {
    const res = JSON.parse(value);
    if (typeof res === 'object') {
      return res;
    }
    return value;
  } catch (e) {
    return value;
  }
}

export function stringifyValue(value) {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

export interface TableDynamicFilterBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons?: ReactElement<ButtonProps>[];
  summaryBar?: ReactElement<any>;
  dynamicFilterBar?: DynamicFilterBarConfig;
  onQuery?: () => void;
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
export const MENURESULT = '__MENURESULT__';
export const SEARCHTEXT = '__SEARCHTEXT__';
export const SELECTCHANGE = '__SELECTCHANGE__';

@observer
export default class TableDynamicFilterBar extends Component<TableDynamicFilterBarProps> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    queryFieldsLimit: 3,
    autoQueryAfterReset: true,
    fuzzyQuery: true,
    fuzzyQueryOnly: false,
    autoQuery: true,
    refreshBtn: true,
    buttons: [],
  };

  context: ConfigContextValue;

  get prefixCls() {
    const { prefixCls } = this.props;
    const { getProPrefixCls } = this.context;
    return getProPrefixCls('table', prefixCls);
  }

  get queryFields(): React.ReactElement<any>[] {
    const { queryFields, queryDataSet, dataSet } = this.props;
    const menuDataSet = dataSet.getState(MENUDATASET);
    const isTenant = menuDataSet && menuDataSet.current && menuDataSet.current.get('isTenant');
    return queryFields.filter(component => {
      if (component.props.hidden) {
        return !component.props.hidden;
      }
      if (isTenant && queryDataSet && queryDataSet.getField(component.props.name)) {
        return queryDataSet.getField(component.props.name)!.get('fieldVisible') !== 0;
      }
      return !component.props.hidden;
    });
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

  refSingleWrapper: HTMLDivElement | null = null;

  refEditors: Map<string, any> = new Map();

  originalValue: object;

  originalConditionFields: string[] = [];

  tempFields: Fields;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.fieldSelectHidden = true;
      this.expand = true;
    });
  }

  componentDidMount(): void {
    const { fuzzyQueryOnly, queryDataSet } = this.props;
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
    if (this.originalValue === undefined && queryDataSet && queryDataSet.current) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
  }


  componentWillUnmount(): void {
    const { fuzzyQueryOnly } = this.props;
    if (!fuzzyQueryOnly) {
      document.removeEventListener('click', this.handleClickOut);
      this.processDataSetListener(false);
    }
  }

  componentWillReceiveProps(nextProps: Readonly<TableDynamicFilterBarProps>): void {
    const { dataSet, fuzzyQueryOnly, queryDataSet } = nextProps;
    // eslint-disable-next-line react/destructuring-assignment
    if (dataSet !== this.props.dataSet || fuzzyQueryOnly !== this.props.fuzzyQueryOnly) {
      runInAction(() => {
        this.fieldSelectHidden = true;
        this.expand = true;
      });
      if (!fuzzyQueryOnly) {
        // 移除原有实例监听
        this.processDataSetListener(false);
        this.processDataSetListener(true, nextProps);
        if (this.isSingleLineOpt() && this.refSingleWrapper) {
          const { height } = this.refSingleWrapper.getBoundingClientRect();
          const { height: childHeight } = this.refSingleWrapper.children[0].children[0].getBoundingClientRect();
          runInAction(() => {
            this.showExpandIcon = height > (childHeight + 18);
          });
        }
      }
      if (this.originalValue === undefined && queryDataSet && queryDataSet.current) {
        this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
      }
    }
  }

  processDataSetListener(flag: boolean, nextProps?: TableDynamicFilterBarProps) {
    const { queryDataSet, dataSet } = nextProps || this.props;
    if (queryDataSet) {
      const handler = flag ? queryDataSet.addEventListener : queryDataSet.removeEventListener;
      const dsHandler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(queryDataSet, DataSetEvents.validate, this.handleDataSetValidate);
      handler.call(queryDataSet, DataSetEvents.update, this.handleDataSetUpdate);
      handler.call(queryDataSet, DataSetEvents.create, this.handleDataSetCreate);
      dsHandler.call(dataSet, DataSetEvents.query, this.handleDataSetQuery);
    }
  }

  @action
  handleClickOut = (e) => {
    if (this.refDropdown && !this.refDropdown.contains(e.target)) {
      this.fieldSelectHidden = true;
    }
  };

  @autobind
  async handleDataSetQuery({ dataSet }) {
    if (!dataSet.getState(MENURESULT) && this.tableFilterAdapter) {
      await this.initMenuDataSet();
      const res = dataSet.getState(MENURESULT);
      if (res && res.length && res.filter(menu => menu.defaultFlag).length) {
        const defaultMenus = res.filter(menu => menu.defaultFlag);
        const { conditionList } = defaultMenus.length > 1 ? defaultMenus.find(menu => menu.isTenant !== 1) : defaultMenus[0];
        const initQueryData = {};
        if (conditionList && conditionList.length) {
          map(conditionList, condition => {
            if (condition.comparator === 'EQUAL') {
              const { fieldName, value } = condition;
              initQueryData[fieldName] = parseValue(value);
            }
          });
          if (Object.keys(initQueryData).length) {
            dataSet.query();
            return false;
          }
        }
      }
    }
  }

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
    const { dataSet } = this.props;
    dataSet.setState(CONDITIONSTATUS, value);
    if (value === RecordStatus.sync && orglValue) {
      this.originalValue = orglValue;
    }
  }

  @action
  setOriginalConditionFields = (code) => {
    const { queryDataSet, dataSet } = this.props;
    if (!code) {
      if (queryDataSet) {
        this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.get(0) });
      }
    } else {
      this.originalConditionFields = Array.isArray(code) ? code : [code];
    }
    dataSet.setState(SELECTFIELDS, [...this.originalConditionFields]);
  };

  /**
   * 筛选条件更新 触发表格查询
   */
  @autobind
  handleDataSetUpdate({ record }) {
    const { dataSet, queryDataSet, onQuery = noop, autoQuery } = this.props;
    let status = RecordStatus.update;
    if (record) {
      status = isEqualDynamicProps(this.originalValue, omit(record.toData(), ['__dirty']), queryDataSet, record) ? RecordStatus.sync : RecordStatus.update;
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
  handleDataSetCreate() {
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
  }

  /**
   * 初始化勾选值、条件字段
   * @param props
   */
  @autobind
  @action
  initConditionFields(props) {
    const { dataSet, record } = props;
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
      if (isSelect(data) && !(dataSet.getState(SELECTFIELDS) || []).includes(name)) {
        const field = dataSet.getField(name);
        if (!field || !field.get('bind', record) || field.get('usedFlag')) {
          this.originalConditionFields.push(name);
          this.handleSelect(name);
        }
      }
    });
  }

  /**
   * 初始筛选条数据源状态
   */
  @autobind
  async initMenuDataSet(): Promise<boolean> {
    const { queryDataSet, dataSet, dynamicFilterBar, searchCode } = this.props;
    const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
    if (this.tableFilterAdapter) {
      const menuDataSet = new DataSet(QuickFilterDataSet({
        searchCode: searchCodes,
        queryDataSet,
        tableFilterAdapter: this.tableFilterAdapter,
      }) as DataSetProps);
      const conditionDataSet = new DataSet(ConditionDataSet());
      const optionDataSet = new DataSet({
        selection: DataSetSelection.single,
        fields: [
          {
            // 是否租户默认配置
            name: 'isTenant',
            type: FieldType.string,
            transformResponse: value => value ? $l('Table', 'preset') : $l('Table', 'user'),
            group: true,
          },
        ],
      });
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
      });
      let status = RecordStatus.update;
      if (queryDataSet && queryDataSet.current) {
        status = isEqualDynamicProps(this.originalValue, omit(queryDataSet.current.toData(), ['__dirty']), queryDataSet, queryDataSet.current) ? RecordStatus.sync : RecordStatus.update;
      }
      // 初始化状态
      dataSet.setState(MENUDATASET, menuDataSet);
      dataSet.setState(CONDITIONDATASET, conditionDataSet);
      dataSet.setState(OPTIONDATASET, optionDataSet);
      dataSet.setState(FILTERMENUDATASET, filterMenuDataSet);
      dataSet.setState(CONDITIONSTATUS, status);
      dataSet.setState(SEARCHTEXT, '');
      const result = await menuDataSet.query();
      dataSet.setState(MENURESULT, result);
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
        if (queryDataSet && queryDataSet.fields) {
          this.tempFields = queryDataSet.snapshot().dataSet.fields;
        }
      } else {
        const { current } = filterMenuDataSet;
        if (current) current.set('filterName', undefined);
        runInAction(() => {
          this.shouldLocateData = true;
        });
      }
    }
    return true;
  }

  /**
   * tableFilterSuffix 预留自定义区域
   */
  renderSuffix() {
    const { dynamicFilterBar, queryDataSet, dataSet, buttons = [] } = this.props;
    const { getConfig } = this.context;
    const { prefixCls } = this;
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
    const { dynamicFilterBar, queryDataSet, dataSet } = this.props;
    const { prefixCls } = this;
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
      return (
        <>
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
   * 注入 refEditors
   * @param element
   * @param name
   */
  createFields(element, name): ReactElement {
    const props: any = {
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
    const { dynamicFilterBar, searchCode } = this.props;
    const { getConfig } = this.context;
    const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
    return searchCodes ? dynamicFilterBar && dynamicFilterBar.tableFilterAdapter || getConfig('tableFilterAdapter') : null;
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
    const { dataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    dataSet.setState(SELECTFIELDS, uniq([...selectFields, ...codes]));
    const shouldUpdate = dataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length
      || !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
    dataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  /**
   * 取消勾选
   * @param code
   */
  @action
  handleUnSelect = (code) => {
    const { queryDataSet, dataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        codes.forEach((name) => current.set(name, undefined));
      }
    }
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    dataSet.setState(SELECTFIELDS, pull([...selectFields], ...codes));
    const shouldUpdate = dataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length
      || !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
    dataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  renderRefreshBtn(): ReactNode {
    const { prefixCls, props: { dataSet } } = this;
    return (
      <span
        className={`${prefixCls}-filter-menu-query`}
        onClick={(e) => {
          e.stopPropagation();
          dataSet.query();
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
    const { prefixCls, props: { refreshBtn } } = this;
    if (!this.showExpandIcon && !hidden) return refreshBtn ? this.renderRefreshBtn() : null;
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
    const { dataSet, dynamicFilterBar, fuzzyQuery, fuzzyQueryPlaceholder, onReset = noop } = this.props;
    const { getConfig } = this.context;
    const { prefixCls } = this;
    const searchText = dynamicFilterBar && dynamicFilterBar.searchText || getConfig('tableFilterSearchText') || 'params';
    const placeholder = fuzzyQueryPlaceholder || $l('Table', 'enter_search_content');
    if (!fuzzyQuery) return null;
    return (<div className={`${prefixCls}-filter-search`}>
      <TextField
        style={{ width: 280 }}
        clearButton
        placeholder={placeholder}
        prefix={<Icon type="search" />}
        value={dataSet.getState(SEARCHTEXT)}
        valueChangeAction={ValueChangeAction.input}
        onChange={debounce((value: string) => {
          runInAction(() => {
            dataSet.setState(SEARCHTEXT, value || '');
          });
          dataSet.setQueryParameter(searchText, value);
          this.handleQuery();
        }, 500)}
        onClear={() => {
          runInAction(() => {
            dataSet.setState(SEARCHTEXT, '');
          });
          onReset();
        }}
      />
    </div>);
  }

  /**
   * 渲染重置按钮
   */
  getResetButton() {
    const { queryDataSet, dataSet, autoQueryAfterReset, onReset = noop } = this.props;
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-filter-buttons`}>
        {
          dataSet.getState(CONDITIONSTATUS) === RecordStatus.update && (
            <Button
              onClick={() => {
                let shouldQuery = false;
                if (queryDataSet) {
                  const { current } = queryDataSet;
                  if (current) {
                    shouldQuery = !isEqualDynamicProps(this.originalValue, omit(current.toData(), ['__dirty']), queryDataSet, current);
                    current.reset();
                    dataSet.setState(SEARCHTEXT, '');
                    dataSet.setState(SELECTFIELDS, [...this.originalConditionFields]);
                  }
                }
                this.setConditionStatus(RecordStatus.sync);
                onReset();
                if (autoQueryAfterReset && shouldQuery) {
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
    const { queryFields, queryDataSet, dataSet, dynamicFilterBar, searchCode, autoQuery, fuzzyQueryOnly } = this.props;
    const { prefixCls } = this;
    const prefix = this.getPrefix();
    const suffix = this.renderSuffix();
    const fuzzyQuery = this.getFuzzyQuery();
    if (fuzzyQueryOnly) {
      return (
        <div className={`${prefixCls}-filter-menu`}>
          {prefix}
          {fuzzyQuery}
          {suffix}
        </div>
      );
    }
    if (queryDataSet && queryFields.length) {
      const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
      const quickFilterMenu = this.tableFilterAdapter && searchCodes ? (
        <QuickFilterMenuContext.Provider
          value={{
            tempQueryFields: this.tempFields,
            autoQuery,
            prefixCls,
            expand: this.expand,
            dataSet,
            queryDataSet,
            onChange: this.handleSelect,
            conditionStatus: dataSet.getState(CONDITIONSTATUS),
            onStatusChange: this.setConditionStatus,
            selectFields: dataSet.getState(SELECTFIELDS),
            onOriginalChange: this.setOriginalConditionFields,
            menuDataSet: dataSet.getState(MENUDATASET),
            filterMenuDataSet: dataSet.getState(FILTERMENUDATASET),
            conditionDataSet: dataSet.getState(CONDITIONDATASET),
            optionDataSet: dataSet.getState(OPTIONDATASET),
            shouldLocateData: this.shouldLocateData,
            initConditionFields: this.initConditionFields,
          }}
        >
          <QuickFilterMenu />
        </QuickFilterMenuContext.Provider>
      ) : null;
      const resetButton = this.isSingleLineOpt() || this.tableFilterAdapter ? null : this.getResetButton();

      return (
        <div className={`${prefixCls}-filter-menu`}>
          {prefix}
          {fuzzyQuery}
          {quickFilterMenu}
          {resetButton}
          {this.isSingleLineOpt() ? null : (
            <>
              <span className={`${prefixCls}-filter-search-divide`} />
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
          if (field && !field.get('bind') && !field.get('name').includes('__tls') && field.get('fieldVisible') !== 0) {
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
    const { queryFieldsLimit = 3, queryFields, queryDataSet, dataSet, fuzzyQueryOnly } = this.props;
    const menuDataSet = dataSet.getState(MENUDATASET);
    let fieldsLimit = queryFieldsLimit;
    if (menuDataSet && menuDataSet.current && menuDataSet.current.get('isTenant')) {
      fieldsLimit = 0;
    }
    const { prefixCls } = this;
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    if (fuzzyQueryOnly) {
      return (
        <div key="query_bar" className={`${prefixCls}-dynamic-filter-bar`}>
          {this.getFilterMenu()}
        </div>
      );
    }
    if (queryDataSet && queryFields.length) {
      const singleLineModeAction = this.isSingleLineOpt() ?
        <div className={`${prefixCls}-dynamic-filter-bar-single-action`}>
          {this.getResetButton()}
          {this.getExpandNode(false)}
        </div> : null;
      return (
        <div key="query_bar" className={`${prefixCls}-dynamic-filter-bar`}>
          {this.getFilterMenu()}
          <div className={`${prefixCls}-dynamic-filter-single-wrapper`} ref={(node) => this.refSingleWrapper = node}>
            <div className={`${prefixCls}-filter-wrapper`}>
              {this.queryFields.slice(0, fieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                const itemClassName = `${prefixCls}-filter-item`;
                return (
                  <div
                    className={`${prefixCls}-filter-content`}
                    key={name}
                    onClick={() => {
                      const editor = this.refEditors.get(name);
                      if (editor) {
                        this.refEditors.get(name).focus();
                      }
                    }}
                  >
                    <span className={`${prefixCls}-filter-label`}>{queryField && queryField.get('label')}</span>
                    <span className={itemClassName}>{this.createFields(element, name)}</span>
                  </div>
                );
              })}
              {this.queryFields.slice(fieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                if (selectFields.includes(name)) {
                  return (
                    <div
                      className={`${prefixCls}-filter-content`}
                      key={name}
                      onClick={() => {
                        const editor = this.refEditors.get(name);
                        if (editor) {
                          this.refEditors.get(name).focus();
                        }
                      }}
                    >
                      <Icon
                        type="cancel"
                        className={`${prefixCls}-filter-item-close`}
                        onClick={() => {
                          this.handleUnSelect([name]);
                        }}
                      />
                      <span className={`${prefixCls}-filter-label`}>{queryField && queryField.get('label')}</span>
                      <span className={`${prefixCls}-filter-item`}>
                        {this.createFields(element, name)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              {(fieldsLimit < this.queryFields.length) && (<div className={`${prefixCls}-filter-item`}>
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
                          fields: this.originOrderQueryFields.slice(fieldsLimit),
                        }]}
                        prefixCls={`${prefixCls}-filter-list` || 'c7n-pro-table-filter-list'}
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
    const { summaryBar, buttons } = this.props;
    const { prefixCls } = this;
    const queryBar = this.getQueryBar();
    if (queryBar) {
      return [queryBar, summaryBar];
    }
    return <TableButtons key="toolbar" prefixCls={`${prefixCls}-dynamic-filter-buttons`} buttons={buttons as ReactElement<ButtonProps>[]}>
      {summaryBar}
    </TableButtons>;
  }
}
