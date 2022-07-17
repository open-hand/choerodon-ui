import React, {
  cloneElement,
  Component,
  ReactElement,
  ReactNode,
  MouseEventHandler,
} from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike, observable, runInAction, toJS } from 'mobx';
import uniq from 'lodash/uniq';
import pull from 'lodash/pull';
import noop from 'lodash/noop';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import isEqual from 'lodash/isEqual';
import isArray from 'lodash/isArray';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';
import difference from 'lodash/difference';
import { TableFilterAdapterProps } from 'choerodon-ui/lib/configure';
import { getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import Icon from 'choerodon-ui/lib/icon';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import Field, { Fields } from '../../data-set/Field';
import DataSet, { DataSetProps } from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { DataSetEvents, DataSetSelection, FieldIgnore, FieldType, RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import Menu from '../../menu';
import TextField from '../../text-field';
import { ValueChangeAction } from '../../text-field/enum';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonProps } from '../../button/Button';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import { ComboFilterBarConfig } from '../Table';
import FieldList from './FieldList';
import TableButtons from './TableButtons';
import QuickFilterMenu from './combo-quick-filter/QuickFilterMenu';
import QuickFilterButton from './combo-quick-filter/QuickFilterButton';
import QuickFilterMenuContext from './combo-quick-filter/QuickFilterMenuContext';
import { ConditionDataSet, QuickFilterDataSet } from './combo-quick-filter/QuickFilterDataSet';
import { TransportProps } from '../../data-set/Transport';
import TableContext, { TableContextValue } from '../TableContext';

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
      if (isEmpty(oldValue) && isEmpty(value)) {
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

export interface TableAction {
  name: ReactElement<any> | string;
  onClick?: MouseEventHandler<any>;
  disabled?: boolean;
  children?: TableAction[];
  element?: ReactElement<any>;
  style?: any,
}

export interface TableComboBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons?: ReactElement<ButtonProps>[];
  tableActions?: TableAction[];
  summaryBar?: ReactElement<any>;
  advancedFilter?: ReactNode;
  filerMenuAction?: ReactNode;
  comboFilterBar?: ComboFilterBarConfig;
  inlineSearchRender?: ReactNode[];
  inlineSearch?: boolean;
  title?: string | ReactNode;
  onQuery?: () => void;
  onReset?: () => void;
  autoQueryAfterReset?: boolean;
  fuzzyQuery?: boolean;
  fuzzyQueryPlaceholder?: string;
  singleMode?: boolean;
  autoQuery?: boolean;
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
export default class TableComboBar extends Component<TableComboBarProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    queryFieldsLimit: 3,
    autoQueryAfterReset: true,
    fuzzyQuery: true,
    autoQuery: true,
    buttons: [],
    singleMode: false,
  };

  context: TableContextValue;

  get prefixCls() {
    const { prefixCls } = this.props;
    const { tableStore: { getProPrefixCls = getProPrefixClsDefault }} = this.context;
    // const { getProPrefixCls = getProPrefixClsDefault } = this.context;
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
    });
  }

  componentDidMount(): void {
    const {singleMode, queryDataSet, dataSet } = this.props;
    if (!singleMode) {
      this.processDataSetListener(true);
      document.addEventListener('click', this.handleClickOut);
      if (this.isSingleLineOpt() && this.refSingleWrapper) {
        const { height } = this.refSingleWrapper.getBoundingClientRect();
        const { height: childHeight } = this.refSingleWrapper.children[0].children[0].getBoundingClientRect();
        runInAction(() => {
          this.showExpandIcon = height > (childHeight + 18);
        });
      }
      if (!dataSet.props.autoQuery) {
        this.handleDataSetQuery({ dataSet });
      }
    }
    if (this.originalValue === undefined && queryDataSet && queryDataSet.current) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
  }


  componentWillUnmount(): void {
    const { singleMode } = this.props;
    if (!singleMode) {
      document.removeEventListener('click', this.handleClickOut);
      this.processDataSetListener(false);
    }
  }

  componentWillReceiveProps(nextProps: Readonly<TableComboBarProps>): void {
    const { dataSet, singleMode, queryDataSet } = nextProps;
    // eslint-disable-next-line react/destructuring-assignment
    if (dataSet !== this.props.dataSet || singleMode !== this.props.singleMode) {
      runInAction(() => {
        this.fieldSelectHidden = true;
      });
      if (!singleMode) {
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

  processDataSetListener(flag: boolean, nextProps?: TableComboBarProps) {
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
    const { singleMode } = this.props;
    if (!dataSet.getState(MENURESULT) && this.tableFilterAdapter && !singleMode) {
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
          const { queryDataSet } = this.props;
          if (queryDataSet && queryDataSet.current && dataSet.props.autoQuery) {
            if (Object.keys(initQueryData).length) {
              dataSet.query();
              return false;
            }
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
          this.handleSelect(name, record);
        }
      }
    });
  }

  /**
   * 初始筛选条数据源状态
   */
  @autobind
  async initMenuDataSet(): Promise<boolean> {
    const { queryDataSet, dataSet } = this.props;
    const { tableStore: { getConfig }} = this.context;
    if (this.tableFilterAdapter) {
      const menuDataSet = new DataSet(QuickFilterDataSet({
        queryDataSet,
        tableFilterAdapter: this.tableFilterAdapter,
      }) as DataSetProps, { getConfig: getConfig as any });
      const conditionDataSet = new DataSet(ConditionDataSet(), { getConfig: getConfig as any });
      const optionDataSet = new DataSet({
        selection: DataSetSelection.single,
        fields: [
          {
            name: 'title',
            type: FieldType.string,
            transformResponse: () => $l('Table', 'filter_header_title'),
            group: true,
          },
        ],
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
    const { buttons = [], tableActions = [{name: 'test'}] } = this.props;
    const { prefixCls } = this;
    const tableButtons = buttons.length ? (
      <TableButtons key="toolbar" prefixCls={`${prefixCls}-combo-filter`} buttons={buttons} />
    ) : null;
    const menu = tableActions.length > 0 ? (
      <Menu className={`${prefixCls}-combo-filter-action-menu`}>
        {tableActions.map(({ name, onClick, disabled, style, children, element }) => {
          if (children && Array.isArray(children)) {
            return (
              <Menu.SubMenu title={name} style={style}>
                {children.map(({ name: itemName, onClick: itemSubClick, disabled: itemDisabled, style: itemStyle }) => (
                  <Menu.Item key={`${itemName}-action`} onClick={itemSubClick} disabled={itemDisabled} style={itemStyle}>
                    {itemName}
                  </Menu.Item>
                ))}
              </Menu.SubMenu>
            );
          } if (element && React.isValidElement(element)) {
            // 完全渲染自定义组件
            return element;
          }
          return (
            <Menu.Item key={`${name}-action`} onClick={onClick} disabled={disabled} style={style}>
              {name}
            </Menu.Item>
          );
        })}
      </Menu>
    ) : null;
    const tableAction = menu && (
      <div key="action_menu" className={`${prefixCls}-combo-filter-action`}>
        <Dropdown overlay={menu} trigger={[Action.click]}>
          <Button className={`${prefixCls}-combo-filter-action-button`} icon='more_horiz' />
        </Dropdown>
      </div>
    );

    return tableButtons || tableAction ? [tableButtons, tableAction] : null;
  }

  getPrefix(): ReactNode {
    const { title } = this.props;
    const { prefixCls } = this;
    if (title) {
      return (
        <div className={`${prefixCls}-combo-filter-bar-title`}>
          {title}
        </div>
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
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.tableFilterAdapter;
  }

  get searchId(): string | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.searchId;
  }

  get filterCallback(): ((searchId: string) => void) | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.filterCallback;
  }

  get filterSaveCallback(): ((any) => void) | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.filterSaveCallback;
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
    const { dataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    dataSet.setState(SELECTFIELDS, uniq([...selectFields, ...codes]));
    const shouldUpdate = dataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length
      || !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    const isDirty = record ? record.dirty : false;
    this.setConditionStatus(shouldUpdate || isDirty ? RecordStatus.update : RecordStatus.sync);
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
      <div className={`${prefixCls}-filter-query-buttons`}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            dataSet.query();
          }}
        >
          {$l('Table', 'query_button')}
        </Button>
      </div>
    );
  }

  /**
   * 渲染模糊搜索
   */
  getFuzzyQuery(): ReactNode {
    const { dataSet, comboFilterBar, fuzzyQuery, fuzzyQueryPlaceholder, onReset = noop } = this.props;
    const { tableStore: { getConfig }} = this.context;
    const { prefixCls } = this;
    const searchText = comboFilterBar && comboFilterBar.searchText || getConfig('tableFilterSearchText') || 'params';
    const placeholder = fuzzyQueryPlaceholder || $l('Table', 'please_enter_search_content');
    if (!fuzzyQuery) return null;
    return (<div className={`${prefixCls}-filter-search`}>
      <TextField
        style={{ width: 182 }}
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
      <div className={`${prefixCls}-filter-reset-buttons`}>
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
   * quickFilterMenu
   */
  getFilterMenu(): ReactNode {
    const { queryFields, queryDataSet, dataSet, autoQuery, singleMode, filerMenuAction, title } = this.props;
    const { prefixCls, context: { tableStore: { customized }} } = this;
    const prefix = this.getPrefix();
    const suffix = this.renderSuffix();

    if (queryDataSet && queryFields.length) {
      const quickFilterMenu = this.tableFilterAdapter ? (
        <QuickFilterMenuContext.Provider
          value={{
            tempQueryFields: this.tempFields,
            autoQuery,
            prefixCls,
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
            searchId: this.searchId,
            filterCallback: this.filterCallback,
            filterSaveCallback: this.filterSaveCallback,
            filerMenuAction,
            customizedColumns: JSON.stringify(customized),
          }}
        >
          <QuickFilterMenu />
        </QuickFilterMenuContext.Provider>
      ) : null;

      return (prefix || quickFilterMenu || suffix) && !singleMode ? (
        <div className={`${prefixCls}-filter-menu`}>
          {prefix}
          {quickFilterMenu && (
            <>
              {title && (<span className={`${prefixCls}-combo-filter-menu-divide`}>/</span>)}
              {quickFilterMenu}
            </>
          )}
          {suffix}
        </div>
      ) : null;
    }
  }

  /**
   * 筛选按钮
   * quickFilterButtons
   */
  getFilterButton(): ReactNode {
    const { queryFields, queryDataSet, dataSet, autoQuery, filerMenuAction } = this.props;
    const { prefixCls, context: { tableStore: { customized }} } = this;

    if (queryDataSet && queryFields.length) {
      const quickFilterButton = this.tableFilterAdapter ? (
        <QuickFilterMenuContext.Provider
          value={{
            tempQueryFields: this.tempFields,
            autoQuery,
            prefixCls,
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
            searchId: this.searchId,
            filterCallback: this.filterCallback,
            filterSaveCallback: this.filterSaveCallback,
            filerMenuAction,
            customizedColumns: JSON.stringify(customized),
          }}
        >
          <QuickFilterButton />
        </QuickFilterMenuContext.Provider>
      ) : null;

      return (
        <div className={`${prefixCls}-combo-filter-buttons`}>
          {quickFilterButton}
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
          const hasBindProps = (propsName) => field && field.get(propsName) && field.get(propsName).bind;
          if (field &&
            !field.get('bind') &&
            !hasBindProps('computedProps') &&
            !hasBindProps('dynamicProps') &&
            !field.get('name').includes('__tls')
          ) {
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
    const { queryFieldsLimit = 3, queryFields, queryDataSet, dataSet, advancedFilter, singleMode } = this.props;
    let fieldsLimit = queryFieldsLimit;
    if (singleMode) {
      fieldsLimit = this.originOrderQueryFields.length;
    }
    const fuzzyQuery = this.getFuzzyQuery();

    const { prefixCls } = this;
    const selectFields = dataSet.getState(SELECTFIELDS) || [];

    if (queryDataSet && queryFields.length) {
      const singleLineModeAction = !singleMode &&
        <div className={`${prefixCls}-combo-filter-bar-single-action`}>
          {this.getResetButton()}
          {this.renderRefreshBtn()}
        </div>;

      const filterMenu = this.getFilterMenu();

      return (
        <div key="query_bar" className={`${prefixCls}-combo-filter-bar`}>
          {filterMenu && (
            <>
              {filterMenu}
              <div className={`${prefixCls}-combo-menu-divide`} />
            </>
          )}
          <div className={`${prefixCls}-combo-filter-single-wrapper`} ref={(node) => this.refSingleWrapper = node}>
            {fuzzyQuery}
            <div className={`${prefixCls}-filter-wrapper`}>
              {this.queryFields.slice(0, fieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
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
                    <span className={itemClassName}>{this.createFields(element, name)}</span>
                  </div>
                );
              })}
              {this.queryFields.slice(fieldsLimit).map(element => {
                const { name, hidden } = element.props;
                if (hidden) return null;
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
                      <span className={`${prefixCls}-filter-item`}>
                        {this.createFields(element, name)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              {(fieldsLimit < this.queryFields.length) && !singleMode && (<div className={`${prefixCls}-filter-add-fields`}>
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
                    {$l('Table', 'add_filter')}
                    <Icon type={this.fieldSelectHidden ? "baseline-arrow_drop_down" : "baseline-arrow_drop_up"} />
                  </span>
                </Dropdown>
              </div>)}
              {!singleMode && advancedFilter && (
                <>
                  <div className={`${prefixCls}-combo-advanced-filter-divide`} />
                  {advancedFilter}
                </>
              )}
            </div>
            {!singleMode && this.getFilterButton()}
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
