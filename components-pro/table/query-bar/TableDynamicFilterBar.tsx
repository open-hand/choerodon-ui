import React, { cloneElement, Component, isValidElement, MouseEvent, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, autorun, isArrayLike, observable, runInAction, toJS } from 'mobx';
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
import defer from 'lodash/defer';
import difference from 'lodash/difference';
import isUndefined from 'lodash/isUndefined';
import isNil from 'lodash/isNil';
import classNames from 'classnames';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { TableFilterAdapterProps } from 'choerodon-ui/lib/configure';
import { getProPrefixCls as getProPrefixClsDefault, getConfig as getConfigDefault } from 'choerodon-ui/lib/configure/utils';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from 'choerodon-ui/lib/icon';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import Popover from 'choerodon-ui/lib/popover';
import Tag from 'choerodon-ui/lib/tag';
import Field, { DynamicProps, FieldProps, Fields } from '../../data-set/Field';
import DataSet, { DataSetProps } from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { DataSetEvents, DataSetSelection, DataSetStatus, FieldIgnore, FieldType, RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import TextField from '../../text-field';
import { ValueChangeAction } from '../../text-field/enum';
import Tooltip from '../../tooltip';
import { ElementProps } from '../../core/ViewComponent';
import { WaitType, Tooltip as OptionTooltip } from '../../core/enum';
import { ButtonProps } from '../../button/Button';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import {
  DynamicFilterBarConfig,
  Suffixes,
  TableFilterBarButtonIcon,
  TableFilterBarButtonIconItem,
  CombineSortConfig,
  SummaryBarConfigProps,
} from '../Table';
import FieldList from './FieldList';
import TableButtons from './TableButtons';
import ColumnFilter from './ColumnFilter';
import QuickFilterMenu from './quick-filter/QuickFilterMenu';
import QuickFilterMenuContext from './quick-filter/QuickFilterMenuContext';
import { ConditionDataSet, QuickFilterDataSet, NewFilterDataSet, AdvancedFieldSet } from './quick-filter/QuickFilterDataSet';
import { TransportProps } from '../../data-set/Transport';
import { hide, show } from '../../tooltip/singleton';
import { ShowHelp } from '../../field/enum';
import { renderValidationMessage as utilRenderValidationMessage } from '../../field/utils';
import Select from '../../select';
import Tree from '../../tree';
import { ButtonColor, FuncType } from '../../button/enum';
import { OPERATOR, OPERATOR_TYPE } from './quick-filter/Operator';
import { getEditorByField } from '../utils';
import { ShowValidation } from '../../form/enum';
import { TriggerViewMode } from '../../trigger-field/enum';
import CombineSort from './CombineSort';
import TableStore from '../TableStore';
import { TextFieldProps } from '../../text-field/TextField';
import isMobile from '../../_util/isMobile';

/**
 * 当前数据是否有值并需要选中
 * @param data
 */
export function isSelect(data) {
  if (isObject(data[1])) {
    return !isEnumEmpty(data[1]);
  }
  return data[0] !== '__dirty' && !isEmpty(data[1]);
}

export function isEqualDynamicProps(originalValue: any, newValue: any, dataSet?: DataSet, record?: Record, name?: string) {
  if (isEqual(newValue, originalValue)) {
    return true;
  }
  if (isObject(newValue) && isObject(originalValue) && Object.keys(newValue).length) {
    const combineKeys = uniq(Object.keys(newValue).concat(Object.keys(originalValue)));
    return combineKeys.every(key => {
      const value = toJS(newValue[key]);
      const oldValue = toJS(originalValue[key]);
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
      const field = dataSet!.getField(key);
      if (field && field.get('range', record)) {
        const rangeValue = value ? isArray(value) ? value.join('') : Object.values(value).join('') : '';
        const rangeOldValue = oldValue ? isArray(oldValue) ? oldValue.join('') : Object.values(oldValue).join('') : '';
        return rangeValue === rangeOldValue;
      }
      if (field && field.get('lovCode') && oldValue && value) {
        const valueField = dataSet!.getField(key)!.get('valueField', record);
        const textField = dataSet!.getField(key)!.get('textField', record);
        if (field.get('multiple', record)) {
          if (isArray(oldValue) && isArray(value)) {
            if (oldValue.length !== value.length) {
              return false;
            }
            const oldValueArr = oldValue.map((v) => ({ [valueField]: v[valueField], [textField]: v[textField] }));
            const valueArr = value.map((v) => ({ [valueField]: v[valueField], [textField]: v[textField] }));
            return isEqual(oldValueArr, valueArr);
          }
        }
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

/**
 * 处理查询过滤条件
 * @params
 */
export function processFilterParam(dataSet) {
  const newFilterDataSet = dataSet.getState(NEWFILTERDATASET);
  // 处理公式参数
  let searchExp = '';
  const expType = dataSet.getState(EXPTYPE);
  if (expType !== 'customize') {
    const joinStr = (expType === 'all' || expType === undefined) ? 'AND' : 'OR';
    for (let i = 1; i <= newFilterDataSet.length; i++) {
      if (i === newFilterDataSet.length) {
        searchExp += i;
      } else {
        searchExp += i + joinStr;
      }
    }
  } else {
    searchExp = dataSet.getState(SEARCHEXP).toLocaleUpperCase().replace(/\s+/g, '');
  }
  dataSet.setQueryParameter('search.exp', searchExp);
  // 处理字段参数
  const searchFld: string[] = [];
  newFilterDataSet.map((record, index) => {
    const dataObj = record.toData();
    const name = dataObj[AdvancedFieldSet.fieldName];
    const comparator = dataObj[AdvancedFieldSet.comparator];
    const tableName = newFilterDataSet.getField(name)!.get('help', record);
    let value = '';
    if (isObject(dataObj[name])) {
      if (!isArray(dataObj[name])) {
        value = dataObj[name][name];
      } else {
        value = dataObj[name].map(arr => isObject(arr) ? arr[name] : arr);
      }
    } else {
      value = dataObj[name];
    }
    const paramFieldName = tableName ? `${tableName}.${name}` : name;
    let searchValue: any[] = [];
    if ([OPERATOR.IS_NULL.value, OPERATOR.IS_NOT_NULL.value].includes(comparator) || value) {
      const enCodeValue = isNumber(value) ? value : (value ? encodeURIComponent(value) : value);
      searchValue = [index + 1, paramFieldName, dataObj[AdvancedFieldSet.comparator], enCodeValue].filter(Boolean);
    }
    if (searchValue && searchValue.length) {
      searchFld.push(searchValue.join('@'))
    }
    return null;
  })
  const searchFilParam = searchFld.join(',');
  dataSet.setQueryParameter('search.fld', searchFilParam);
}

/**
 * 查询字段是否禁用
 * @param field 查询字段
 * @param queryDataSet 查询dataSet
 * @returns 
 */
export function fieldIsDisabled(field: Field, queryDataSet: DataSet) {
  const record = queryDataSet.current;
  if (field) {
    const disabled = field.get('disabled', record);
    if (disabled) {
      return true;
    }
    const cascadeMap = field.get('cascadeMap', record);
    if (
      cascadeMap &&
      (!record || Object.keys(cascadeMap).some(cascade => {
        if (isObject(record.get(cascadeMap[cascade]))) {
          return isEnumEmpty(record.get(cascadeMap[cascade]));
        }
        return isNil(record.get(cascadeMap[cascade]));
      }))
    ) {
      return true;
    }
  }
  return false;
}

export function getTableFilterBarButtonIcon(
  icon: keyof TableFilterBarButtonIconItem,
  getConfig: typeof getConfigDefault,
  tableFilterBarButtonIconProp?: TableFilterBarButtonIcon,
): string | undefined {
  const tableFilterBarButtonIcon = isNil(tableFilterBarButtonIconProp)
    ? getConfig('tableFilterBarButtonIcon')
    : tableFilterBarButtonIconProp;
  const getDefaultIcon = (iconName: keyof TableFilterBarButtonIconItem) => {
    switch (iconName) {
      case 'saveIconType':
        return 'save';
      case 'saveAsIconType':
        return 'donut_large';
      case 'resetIconType':
        return 'undo';
      default:
    }
  };
  if (tableFilterBarButtonIcon === true) {
    return getDefaultIcon(icon);
  }
  if (typeof tableFilterBarButtonIcon === 'object') {
    const type = tableFilterBarButtonIcon[icon];
    if (typeof type === 'string') {
      return type;
    }
    if (type !== false) {
      return getDefaultIcon(icon);
    }
  }
}

/**
 * 高级搜索字段配置类型声明
 */
export interface AdvancedSearchField {
  name: string;
  /**
   * 字段关联表
   */
  tableName?: string;
  /**
   * 字段别名
   */
  alias?: string;
  /**
   * 字段配置来源
   */
  source?: 'fields' | 'queryFields' | 'other';
  /**
   * 其他字段 & 配置覆盖
   */
  fieldProps?: FieldProps;
}

export interface TableDynamicFilterBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons?: ReactElement<ButtonProps>[];
  summaryBar?: ReactElement<any>;
  dynamicFilterBar?: DynamicFilterBarConfig;
  onBeforeQuery?: () => (Promise<boolean | void> | boolean | void);
  onQuery?: () => void;
  onReset?: () => void;
  onFieldEnterDown?: ({ e, name, dataSet }) => void;
  autoQueryAfterReset?: boolean;
  fuzzyQuery?: boolean;
  fuzzyQueryOnly?: boolean,
  fuzzyQueryPlaceholder?: string;
  fuzzyQueryProps?: TextFieldProps;
  searchCode?: string;
  autoQuery?: boolean;
  refreshBtn?: boolean;
  onRefresh?: () => Promise<boolean | undefined> | boolean | undefined | void;
  sortableFieldNames?: string[];
  advancedSearchFields?: AdvancedSearchField[];
  defaultActiveKey?: string;
  tableStore?: TableStore;
  showSingleLine?: boolean;
  filterQueryCallback?: Function;
  tableFilterBarButtonIcon?: TableFilterBarButtonIcon;
  /**
   * 组合排序配置
   */
  combineSortConfig?: CombineSortConfig;
  summaryBarConfigProps?: SummaryBarConfigProps;
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
export const EXPTYPE = '__EXPTYPE__';
export const SEARCHEXP = '__SEARCHEXP__';
export const NEWFILTERDATASET = '__NEWFILTERDATASET__';
export const ORIGINALVALUEOBJ = '__ORIGINALVALUEOBJ__';
export const HASINIT = '__HASINIT__';

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
    const { getProPrefixCls = getProPrefixClsDefault } = this.context;
    return getProPrefixCls('table', prefixCls);
  }

  get queryFields(): React.ReactElement<any>[] {
    const { queryFields, queryDataSet, dataSet } = this.props;
    const menuDataSet = dataSet.getState(MENUDATASET);
    const isTenant = menuDataSet && menuDataSet.current && menuDataSet.current.get('isTenant');
    return queryFields.filter(component => {
      const { name } = component.props;
      if (component.props.hidden) {
        return !component.props.hidden;
      }
      if (isTenant && queryDataSet && queryDataSet.getField(name)) {
        return queryDataSet.getField(name)!.get('fieldVisible') !== 0;
      }
      if (!name || (name && queryDataSet && !queryDataSet.getField(name))) {
        return false;
      }
      return !component.props.hidden;
    });
  }

  moreFields: Field[];

  /**
   * 控制添加筛选下拉显隐
   */
  @observable fieldSelectHidden: boolean;

  /**
   * 收起/展开
   */
  @observable expand: boolean;

  /**
 * 弹窗显隐
 */
  @observable visible: boolean;

  @observable shouldLocateData: boolean;

  @observable showExpandIcon: boolean;

  refAdvancedFilterContainer: Popover | null = null;

  refDropdown: HTMLDivElement | null = null;

  refSingleWrapper: HTMLDivElement | null = null;

  refEditors: Map<string, any> = new Map();

  refFilterItems: Map<string, any> = new Map();

  refCustomizeExpTypeEditor: TextField | null = null;

  originalConditionFields: string[] = [];

  tempFields: Fields;

  isTooltipShown?: boolean;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.fieldSelectHidden = true;
      this.expand = true;
    });
    if (!props.dataSet.getState(SELECTFIELDS)) {
      props.dataSet.setState(SELECTFIELDS, []);
    }
  }

  componentDidMount(): void {
    const { fuzzyQueryOnly, queryDataSet, dataSet } = this.props;
    if (!fuzzyQueryOnly) {
      this.processDataSetListener(true);
      document.addEventListener('mousedown', this.handleMouseDownOut);
      if (this.isSingleLineOpt() && this.refSingleWrapper) {
        const { height } = this.refSingleWrapper.getBoundingClientRect();
        const childNode = this.refSingleWrapper.children[0].children[0];
        if (childNode) {
          const { height: childHeight } = childNode.getBoundingClientRect();
          runInAction(() => {
            this.showExpandIcon = height > (childHeight + 18);
          });
        }
      }
      const { autoQuery } = dataSet.props;
      if (!autoQuery || (autoQuery && dataSet.status === DataSetStatus.ready)) {
        this.handleDataSetQuery({ dataSet });
      }
    }
    const shouldInit = dataSet.getState(ORIGINALVALUEOBJ) ? dataSet.getState(ORIGINALVALUEOBJ).query === undefined : true;
    if (shouldInit && queryDataSet && queryDataSet.current) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
    if (queryDataSet && queryDataSet.current && !this.tableFilterAdapter) {
      dataSet.setState(CONDITIONSTATUS, queryDataSet.current.dirty ? RecordStatus.update : RecordStatus.sync);
    }
    this.setFilterVisiable();
  }


  componentWillUnmount(): void {
    const { fuzzyQueryOnly, dataSet } = this.props;
    if (!fuzzyQueryOnly) {
      document.removeEventListener('mousedown', this.handleMouseDownOut);
      this.processDataSetListener(false);
      dataSet.setState(HASINIT, undefined)
    }
    if (this.isTooltipShown) {
      hide();
      delete this.isTooltipShown;
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
          const childNode = this.refSingleWrapper.children[0].children[0];
          if (childNode) {
            const { height: childHeight } = childNode.getBoundingClientRect();
            runInAction(() => {
              this.showExpandIcon = height > (childHeight + 18);
            });
          }
        }
      }
      const shouldInit = dataSet.getState(ORIGINALVALUEOBJ) ? dataSet.getState(ORIGINALVALUEOBJ).query === undefined : true;
      if (shouldInit && queryDataSet && queryDataSet.current) {
        this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current, tableDs: dataSet });
      }
      if (queryDataSet && queryDataSet.current && !this.tableFilterAdapter) {
        dataSet.setState(CONDITIONSTATUS, queryDataSet.current.dirty ? RecordStatus.update : RecordStatus.sync);
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
      handler.call(queryDataSet, DataSetEvents.reset, this.handleDataSetReset);
      handler.call(queryDataSet, DataSetEvents.load, this.handleDataSetLoad);
      dsHandler.call(dataSet, DataSetEvents.query, this.handleDataSetQuery);
    }
  }

  @action
  handleMouseDownOut = (e) => {
    if (this.refDropdown && !this.refDropdown.contains(e.target)) {
      this.fieldSelectHidden = true;
    }
  };

  @autobind
  async handleDataSetQuery({ dataSet }) {
    if (!dataSet.getState(MENURESULT) && this.tableFilterAdapter && !dataSet.getState(HASINIT)) {
      dataSet.setState(HASINIT, true);
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
          const { queryDataSet, filterQueryCallback = noop } = this.props;
          filterQueryCallback({ dataSet })
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
  @action
  setConditionStatus(value, orglValue?: object) {
    const { dataSet } = this.props;
    dataSet.setState(CONDITIONSTATUS, value);
    if (value === RecordStatus.sync && orglValue) {
      const oriObj = dataSet.getState(ORIGINALVALUEOBJ);
      dataSet.setState(ORIGINALVALUEOBJ, { ...oriObj, query: orglValue });
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
  async handleDataSetUpdate({ record, name, oldValue, value }) {
    const { dataSet, queryDataSet, onQuery = noop, autoQuery, onBeforeQuery = noop } = this.props;
    const field = queryDataSet && queryDataSet.getField(name);
    let shouldQuery = true;
    if (field && field.get('range', record)) {
      // 处理 range 失焦对象 undefined，bind 字段无处理的情况
      if (value) {
        const rangeKeys = Object.keys(value);
        if (rangeKeys.length) {
          if (value[rangeKeys[0]] === undefined && value[rangeKeys[1]] === undefined) {
            record.set(name, null)
          } else if (value[rangeKeys[1]] === undefined) {
            record.set(name, {
              [rangeKeys[0]]: value[rangeKeys[0]],
              [rangeKeys[1]]: null,
            });
          } else if (value[rangeKeys[0]] === undefined) {
            record.set(name, {
              [rangeKeys[0]]: null,
              [rangeKeys[1]]: value[rangeKeys[1]],
            });
          }
        }
      }
      const rangeValue = value ? isArray(value) ? value.join('') : Object.values(value).join('') : '';
      const rangeOldValue = oldValue ? isArray(oldValue) ? oldValue.join('') : Object.values(oldValue).join('') : '';
      shouldQuery = rangeValue !== rangeOldValue;
    }
    let status = RecordStatus.update;
    if (record) {
      const shouldUpdate = (dataSet.getState(SELECTFIELDS) || []).length !== this.originalConditionFields.length
      || !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
      let selectStatus = shouldUpdate ? RecordStatus.update : RecordStatus.sync;
      if (!(dataSet.getState(SELECTFIELDS) || []).includes(name) && this.moreFields?.map(m => m.name).includes(name)) {
        selectStatus = this.handleSelect(name, record);
      }
      if (selectStatus === RecordStatus.sync) {
        status = isEqualDynamicProps(omit(dataSet.getState(ORIGINALVALUEOBJ).query, ['__dirty']), omit(record.toData(), ['__dirty']), queryDataSet, record, name) ? RecordStatus.sync : RecordStatus.update;
      }
    }
    this.setConditionStatus(status);
    if (autoQuery && shouldQuery) {
      if (await dataSet.modifiedCheck(undefined, dataSet, 'query')) {
        if (await onBeforeQuery() === false) {
          return;
        }
        if (queryDataSet && queryDataSet.current && await queryDataSet.current.validate()) {
          dataSet.query();
          onQuery();
        } else {
          let hasFocus = false;
          for (let i = 0; i < this.queryFields.length; i++) {
            const queryField = this.queryFields[i];
            const editor = this.refEditors.get(String(queryField.key));
            if (editor && !editor.valid && !hasFocus && (field && !field.get('multiple', record)) && isFunction(editor.focus)) {
              editor.focus();
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
  handleDataSetCreate() {
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
  }

  /**
   * queryDS reset，初始记录
   */
  @autobind
  handleDataSetReset() {
    const { queryDataSet } = this.props;
    if (queryDataSet && !this.tableFilterAdapter) {
      queryDataSet.create();
    }
  }

  /**
   * queryDS load，兼容项目loadData([])的处理，初始化记录
   */
  @autobind
  handleDataSetLoad({ dataSet }) {
    if (!this.tableFilterAdapter && !dataSet.length) {
      dataSet.create();
    }
  }

  /**
   * 初始化勾选值、条件字段
   * @param props
   */
  @autobind
  @action
  initConditionFields(props) {
    const { dataSet: tableDS } = this.props;   
    const { dataSet, record, tableDs = tableDS } = props;
    const originalValue = omit(record.toData(), ['__dirty']);
    const conditionData = Object.entries(originalValue);
    const newObj = tableDs.getState(ORIGINALVALUEOBJ) || {};
    tableDs.setState(ORIGINALVALUEOBJ, { ...newObj, query: originalValue });
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
   * 高级搜索字段集
   */
  get advancedSearchFieldProps() {
    const { queryDataSet, dataSet, advancedSearchFields } = this.props;
    if (advancedSearchFields && advancedSearchFields.length) {
      const omitPropsArr = ['dynamicProps', 'computedProps', 'order', 'pattern', 'maxLength', 'minLength', 'max', 'min', 'validator', 'required', 'readOnly', 'disabled', 'defaultValue', 'cascadeMap', 'ignore'];
      return advancedSearchFields!.map(field => {
        const { name, source, alias, tableName, fieldProps = {} } = field;
        const fieldName = alias || name;
        const dynamicRequired = ({record}) => {
          const isNullOperater = [OPERATOR.IS_NULL.value, OPERATOR.IS_NOT_NULL.value].includes(record.get(AdvancedFieldSet.comparator));
          if (fieldName === record.get(AdvancedFieldSet.fieldName) && !isNullOperater) {
            return true;
          }
          return false;
        };
        const { required, computedProps} = fieldProps;
        if (required) delete fieldProps.required;
        if (computedProps && 'required' in computedProps) delete computedProps.required;
        if (fieldProps.dynamicProps) {
          (fieldProps.dynamicProps as DynamicProps).required = dynamicRequired;
        } else {
          fieldProps.dynamicProps = { required: dynamicRequired };
        }
        if (source === 'fields' && dataSet.props.fields) {
          const dsFiedlsProps = dataSet.props.fields.find(f => f.name === name);
          return {
            ...omit(dsFiedlsProps, omitPropsArr),
            ...fieldProps,
            help: tableName,
            name: fieldName,
          };
        }
        if (source === 'queryFields' && queryDataSet && queryDataSet.props.fields) {
          const dsFiedlsProps = queryDataSet.props.fields.find(f => f.name === name);
          return {
            ...omit(dsFiedlsProps, omitPropsArr),
            ...fieldProps,
            help: tableName,
            name: fieldName,
          };
        }
        return {
          ...fieldProps,
          // multiple: fieldProps && fieldProps.multiple ? '|' : false,
          help: tableName,
          name: fieldName,
        };
      });
    }
    return [];
  }

  /**
 * 加载动态筛选条相关初始数据 & 存储初始值
 *  1.筛选条
 *  2.高级搜索
 *  3.模糊搜索
 * @param param
 */
  loadConditionData({ conditionDataSet, newFilterDataSet, menuRecord, dataSet, searchText }) {
    const comparatorData: object[] = [];
    const regularData: object[] = [];
    const newObj = dataSet.getState(ORIGINALVALUEOBJ) || {};
    let searchTextValue = null;
    menuRecord.get('conditionList').forEach(condition => {
      if (condition.conditionType !== 'comparator') {
        regularData.push(condition);
      } else {
        const { fieldName, value, conditionType, comparator, ...rest } = condition;
        comparatorData.push({
          [AdvancedFieldSet.fieldName]: fieldName,
          [fieldName]: value,
          [AdvancedFieldSet.conditionType]: conditionType,
          [AdvancedFieldSet.comparator]: comparator,
          ...rest,
        })
      }
    });
    // 加载筛选条数据
    conditionDataSet.loadData(regularData);
    // 加载高级搜索面板数据
    newFilterDataSet.loadData(comparatorData);
    // 初始高级搜索
    dataSet.setState(ORIGINALVALUEOBJ, { ...newObj, advance: comparatorData });
    // 加载模糊搜索数据
    if (menuRecord && menuRecord.get('queryList') && menuRecord.get('queryList').length) {
      const searchObj = menuRecord.get('queryList').find(ql => ql.fieldName === SEARCHTEXT);
      searchTextValue = searchObj ? searchObj.value : null;
      dataSet.setState(SEARCHTEXT, searchTextValue);
      // 初始模糊搜索
      dataSet.setState(ORIGINALVALUEOBJ, { ...newObj, advance: comparatorData, fuzzy: searchTextValue });

      dataSet.setQueryParameter(searchText, searchTextValue);
    } else if (dataSet.getState(SEARCHTEXT)) {
      dataSet.setState(SEARCHTEXT, null);
      dataSet.setState(ORIGINALVALUEOBJ, { ...newObj, advance: comparatorData, fuzzy: null });
      dataSet.setQueryParameter(searchText, null);
    }
  }

  /**
   * 初始筛选条数据源状态
   */
  @autobind
  async initMenuDataSet(): Promise<boolean> {
    const { queryDataSet, dataSet, dynamicFilterBar, searchCode } = this.props;
    const { getConfig } = this.context;
    const searchCodes = dynamicFilterBar && dynamicFilterBar.searchCode || searchCode;
    if (this.tableFilterAdapter) {
      const menuDataSet = new DataSet(QuickFilterDataSet({
        searchCode: searchCodes,
        queryDataSet,
        tableFilterAdapter: this.tableFilterAdapter,
      }) as DataSetProps, { getConfig: getConfig as any });
      const conditionDataSet = new DataSet(ConditionDataSet(), { getConfig: getConfig as any });
      const newFilterDataSet = new DataSet(NewFilterDataSet({
        propFields: this.advancedSearchFieldProps,
      }) as DataSetProps, { getConfig: getConfig as any });
      const optionDataSet = new DataSet({
        paging: false,
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
      if (queryDataSet && queryDataSet.current && dataSet.getState(ORIGINALVALUEOBJ)) {
        status = isEqualDynamicProps(dataSet.getState(ORIGINALVALUEOBJ).query, omit(queryDataSet.current.toData(), ['__dirty']), queryDataSet, queryDataSet.current) ? RecordStatus.sync : RecordStatus.update;
      } else {
        status = RecordStatus.sync;
      }
      // 初始化状态
      dataSet.setState(MENUDATASET, menuDataSet);
      dataSet.setState(CONDITIONDATASET, conditionDataSet);
      dataSet.setState(NEWFILTERDATASET, newFilterDataSet);
      dataSet.setState(OPTIONDATASET, optionDataSet);
      dataSet.setState(FILTERMENUDATASET, filterMenuDataSet);
      dataSet.setState(CONDITIONSTATUS, status);
      // dataSet.setState(SEARCHTEXT, null);
      const result = await menuDataSet.query();
      dataSet.setState(MENURESULT, result);
      if (optionDataSet) {
        optionDataSet.loadData(result);
      }
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        this.loadConditionData({ menuRecord, conditionDataSet, newFilterDataSet, dataSet, searchText: this.searchText });
      }
      if (result && result.length) {
        runInAction(() => {
          this.shouldLocateData = true;
        });
        if (queryDataSet && queryDataSet.fields && !this.tempFields) {
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
      <TableButtons key={`${buttons.length}-toolbar`} prefixCls={`${prefixCls}-dynamic-filter`} buttons={buttons} />
    ) : null;
    if (suffixes && suffixes.length) {
      suffixes.forEach(suffix => {
        if (suffix === 'filter') {
          children.push(<ColumnFilter prefixCls={prefixCls} key='prefix-column-filter' />);
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

  @action
  getPrefix(): ReactNode {
    const { dynamicFilterBar, queryDataSet, dataSet } = this.props;
    const { prefixCls } = this;
    const prefixes = dynamicFilterBar && dynamicFilterBar.prefixes;
    const children: ReactElement[] = [];
    if (prefixes && prefixes.length) {
      prefixes.forEach((prefix: any) => {
        if (isString(prefix) && prefix === 'filter') {
          children.push(<ColumnFilter prefixCls={prefixCls} key='prefix-column-filter' />);
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
    const { onFieldEnterDown = noop, dataSet } = this.props;
    const { onEnterDown } = element.props;
    const props: any = {
      ref: (node) => this.refEditors.set(name, node),
      border: false,
      _inTable: true,
      showValidation: 'tooltip',
      onEnterDown: onEnterDown && isFunction(onEnterDown) ? onEnterDown : (e) => onFieldEnterDown({ e, name, dataSet }),
    };
    const elementName = element && isFunction(element.type) && (element.type as any).displayName;
    if (isUndefined(element.props.suffix) && ['Currency', 'NumberField', 'EmailField', 'UrlField', 'TextField'].includes(elementName)) {
      Object.assign(props, { suffix: <Icon type="search" /> });
    }
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
    return shouldUpdate || isDirty ? RecordStatus.update : RecordStatus.sync;
  };

  /**
   * 取消勾选
   * @param code
   */
  @action
  handleUnSelect = (code) => {
    const { queryDataSet, dataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    let isDirty = false;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        codes.forEach((name) => current.set(name, undefined));
        isDirty = current.dirty;
      }
    }
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    dataSet.setState(SELECTFIELDS, pull([...selectFields], ...codes));
    const shouldUpdate = dataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length
      || !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    this.setConditionStatus(shouldUpdate || isDirty ? RecordStatus.update : RecordStatus.sync);
    dataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  /**
   * 查询前修改提示及校验定位
   */
  async modifiedCheckQuery(fuzzyValue?: string, fuzzyOldValue?: string, refresh?: boolean): Promise<void> {
    const { dataSet, queryDataSet, fuzzyQueryOnly, onRefresh = noop } = this.props;
    if (await dataSet.modifiedCheck(undefined, dataSet, 'query')) {
      if ((queryDataSet && queryDataSet.current && await queryDataSet.current.validate()) || fuzzyQueryOnly) {
        if (fuzzyValue) {
          runInAction(() => {
            dataSet.setState(SEARCHTEXT, fuzzyValue || null);
          });
          dataSet.setQueryParameter(this.searchText, fuzzyValue);
        }
        if (refresh) {
          if ((await onRefresh()) !== false) {
            dataSet.query();
          }
        } else {
          dataSet.query();
        }
      } else {
        let hasFocus = false;
        for (const [key, value] of this.refEditors.entries()) {
          if (value && !value.valid && !hasFocus) {
            if (isFunction(this.refEditors.get(key).focus)) {
              this.refEditors.get(key).focus();
            }
            hasFocus = true;
          }
        }
      }
    } else {
      runInAction(() => {
        dataSet.setState(SEARCHTEXT, fuzzyOldValue || null);
      });
      dataSet.setQueryParameter(this.searchText, fuzzyOldValue);
    }
  }

  renderRefreshBtn(): ReactNode {
    const { prefixCls } = this;
    return (
      <span
        className={`${prefixCls}-filter-menu-query`}
        onClick={async (e) => {
          e.stopPropagation();
          await this.modifiedCheckQuery(undefined, undefined, true);
        }}
      >
        {isMobile() ? <Icon type="refresh" /> : <Tooltip title={$l('Table', 'refresh')}>
          <Icon type="refresh" />
        </Tooltip>}
      </span>
    );
  }

  handleExpandIconClick(hidden): void {
    const { refSingleWrapper } = this;
    if (refSingleWrapper && refSingleWrapper.children[0].children[0]) {
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
        refSingleWrapper.style.height = pxToRem(childHeight + 4, true) || '';
        refSingleWrapper.style.overflow = 'hidden';
      } else {
        refSingleWrapper.style.height = '';
        refSingleWrapper.style.overflow = '';
      }
    }
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
      >
        {refreshBtn ? this.renderRefreshBtn() : null}
        {this.expand ? (<Tooltip title={$l('Table', 'collapse')}>
          <Icon type="baseline-arrow_drop_up" onClick={() => this.handleExpandIconClick(hidden)} />
        </Tooltip>) : (<Tooltip title={$l('Table', 'expand_button')}>
          <Icon type="baseline-arrow_drop_down" onClick={() => this.handleExpandIconClick(hidden)} />
        </Tooltip>)}
      </span>
    );
  }

  /**
   * 过滤比较符
   * @param record 
   * @param optionRecord 
   * @returns 
   */
  optionsFilter(record, optionRecord): boolean {
    if (!record.get(AdvancedFieldSet.fieldName)) return false;
    const { dataSet } = this.props;
    const newFilterDataSet = dataSet.getState(NEWFILTERDATASET);
    const field = newFilterDataSet!.getField(record.get(AdvancedFieldSet.fieldName), record);
    const type = field.get('type', record);
    const value = OPERATOR[optionRecord.get('value').toUpperCase()];
    if (!OPERATOR_TYPE[type.toUpperCase()]) {
      return OPERATOR_TYPE.STRING.includes(value);
    }
    if (
      field.get('lookupCode', record) ||
      isString(field.get('lookupUrl', record)) ||
      (type !== FieldType.object && (field.get('lovCode', record) || field.getLookup(record) || field.get('options', record)))
    ) {
      return OPERATOR_TYPE.LOOKUP.includes(value);
    }
    if (field.get('lovCode', record)) {
      return OPERATOR_TYPE.LOV.includes(value);
    }
    return OPERATOR_TYPE[type.toUpperCase()].includes(value);
  }

  /**
   * 高级筛选弹窗确认
   */
  @autobind
  async handleFilterOk() {
    const { dataSet, autoQuery } = this.props;
    const newFilterDataSet = dataSet.getState(NEWFILTERDATASET);
    const res = await newFilterDataSet.validate();
    const customizeExpTypeValidation = !this.refCustomizeExpTypeEditor || await this.refCustomizeExpTypeEditor.checkValidity();
    if (res && customizeExpTypeValidation) {
      // 初始状态下移除空行
      if (newFilterDataSet.length !== 1) {
        newFilterDataSet.map(r => {
          if (!r.get(AdvancedFieldSet.fieldName)) {
            newFilterDataSet.remove(r, true);
          }
          return null;
        });
      }
      const checkResult = await dataSet.modifiedCheck(undefined, dataSet, 'query');
      if (checkResult) {
        const jsonData = newFilterDataSet.toJSONData();
        processFilterParam(dataSet);
        const status = isEqualDynamicProps(toJS(dataSet.getState(ORIGINALVALUEOBJ).advance), jsonData, newFilterDataSet) ? dataSet.getState(CONDITIONSTATUS) : RecordStatus.update;
        // 更新筛选条状态
        this.setConditionStatus(status);
        if (autoQuery) dataSet.query();
        runInAction(() => {
          this.visible = false;
        });
      } else {
        this.handleFilterCancel();
      }
    }
  }

  /**
   * 高级筛选弹窗取消
   */
  @autobind
  handleFilterCancel() {
    const { dataSet } = this.props;
    const newFilterDataSet = dataSet.getState(NEWFILTERDATASET);
    const orgValue = dataSet.getState(ORIGINALVALUEOBJ).advance;
    newFilterDataSet.loadData(orgValue);
    this.setConditionStatus(dataSet.getState(CONDITIONSTATUS));
    runInAction(() => {
      if (this.refCustomizeExpTypeEditor && this.refCustomizeExpTypeEditor.validationResults && this.refCustomizeExpTypeEditor.validationResults.length > 0) {
        this.refCustomizeExpTypeEditor.validationResults = undefined;
      }
      this.visible = false;
    })
  }

  @autobind
  setFilterVisiable() {
    autorun(() => {
      if (this.visible) {
        document.addEventListener('mousedown', this.handleEmitFilterCancel);
        document.addEventListener('keydown', this.handleEmitFilterCancel);
      } else {
        document.removeEventListener('mousedown', this.handleEmitFilterCancel);
        document.removeEventListener('keydown', this.handleEmitFilterCancel);
      }
    });
  }

  @autobind
  isPopupChildren(element: HTMLElement | null): boolean {
    const { getConfig } = this.context;
    const proPreCls = getConfig('proPrefixCls');
    const popupClasses = [
      `${proPreCls}-popup`,
      `${proPreCls}-modal`,
    ];
    const hasPopupClass = popupClasses.some((cls: string) => {
      return element && element.className.includes(cls);
    });
    if (hasPopupClass) {
      return true;
    }
    if (!hasPopupClass && element && element.parentElement && element.parentElement !== document.body) {
      return this.isPopupChildren(element.parentElement as HTMLElement);
    }
    return false;
  }
  
  @autobind
  handleEmitFilterCancel(e: Event | KeyboardEvent) {
    const { target, type } = e;
    switch (type) {
      case 'mousedown': {
        const container = this.refAdvancedFilterContainer?.getPopupDomNode();
        const keepVisible = target === container
          || container.contains(target as Node)
          || this.isPopupChildren(target as HTMLElement);
        if (!keepVisible) {
          this.handleFilterCancel();
        }
        break;
      }
      case 'keydown': {
        if (e instanceof KeyboardEvent && (e.ctrlKey || e.metaKey) && e.key === '/') {
          this.handleFilterCancel();
        }
        break;
      }
      default:
        break;
    }
  }

  @autobind
  saveCustomizeExpTypeEditorRef(node: TextField | null) {
    this.refCustomizeExpTypeEditor = node;
  }

  @autobind
  saveAdvancedFilterContainerRef(node: Popover | null) {
    this.refAdvancedFilterContainer = node;
  }

  /**
   * 渲染高级筛选面板
   */
  getAdvancedFilter(): ReactNode {
    const { prefixCls, context: { getConfig } } = this;
    const { dataSet, advancedSearchFields } = this.props;
    const tlsKey = getConfig('tlsKey');
    const newFilterDataSet = dataSet.getState(NEWFILTERDATASET);
    const menuDataSet = dataSet.getState(MENUDATASET);
    if (advancedSearchFields && advancedSearchFields.length && newFilterDataSet) {
      const { getConfig } = this.context;
      const selectOptions = this.advancedSearchFieldProps.map(fieldProps => {
        const { name, label, bind } = fieldProps;
        if (bind) return null;
        const field = newFilterDataSet.getField(name);
        const hasBindProps = (propsName) => field && field.get(propsName) && field.get(propsName).bind;
        if (field.get('bind') ||
          hasBindProps('computedProps') ||
          hasBindProps('dynamicProps') ||
          field.get('name').includes(tlsKey)
        ) {
          return null
        }
        return <Select.Option key={`${name}_select_option`} value={name}>{label || name}</Select.Option>
      });
      const PopoverContent = (
        <>
          <Tooltip
            theme="light"
            title={dataSet.getState(EXPTYPE) === 'customize' ? $l('Table', 'ad_search_help') : null}
          >
            <Select
              isFlat
              border
              // dataSet={menuDataSet.current}
              // name="conExpression"
              value={dataSet.getState(EXPTYPE) ? dataSet.getState(EXPTYPE) : (
                ['all', 'either'].includes(menuDataSet.current && menuDataSet.current.get('conExpression')) ? menuDataSet.current.get('conExpression') : "all"
              )}
              onChange={(value) => {
                dataSet.setState(EXPTYPE, value);
                if (value !== 'customize') {
                  dataSet.setState(SEARCHEXP, undefined);
                }
                if (menuDataSet.current) {
                  menuDataSet.current.set('conExpression', value)
                }
              }}
              clearButton={false}
              className={`${prefixCls}-new-filter-popover-select`}
              trigger={[Action.click, Action.focus]}
            >
              <Select.Option value="all">{$l('Table', 'ad_search_all')}</Select.Option>
              <Select.Option value="either">{$l('Table', 'ad_search_any')}</Select.Option>
              <Select.Option value="customize">
                {$l('Table', 'ad_search_custom')}
                <Tooltip
                  theme="light"
                  title={$l('Table', 'ad_search_help')}
                >
                  <Icon className={`${prefixCls}-new-filter-popover-select-icon`} type="help_outline" />
                </Tooltip>
              </Select.Option>
            </Select>
          </Tooltip>
          {
            dataSet.getState(EXPTYPE) === 'customize' ?
              <TextField
                ref={this.saveCustomizeExpTypeEditorRef}
                clearButton
                validator={(value) => (isNil(value) ? $l('Table', 'ad_search_validation') : true)}
                value={dataSet.getState(SEARCHEXP) ?
                  dataSet.getState(SEARCHEXP) :
                  (menuDataSet.current && menuDataSet.current.get('conExpression') !== 'customize' ? menuDataSet.current.get('conExpression') : undefined)}
                onChange={(value) => {
                  dataSet.setState(SEARCHEXP, value);
                  if (menuDataSet.current) {
                    menuDataSet.current.set('conExpression', value)
                  }
                }}
                className={classNames(
                  `${prefixCls}-new-filter-popover-input`,
                  `${getConfig('proPrefixCls')}-input-required`,
                  `${getConfig('proPrefixCls')}-input-required-colors`,
                )}
                placeholder={$l('Table', 'ad_search_placeholder')}
                showValidation={ShowValidation.tooltip}
              />
              : null
          }
          {newFilterDataSet.length > 0 && <div className={`${prefixCls}-new-filter-popover-line`} />}
          <Tree
            key="__filter"
            dataSet={newFilterDataSet}
            showLine={{
              showLeafIcon: false,
            }}
            className={`${prefixCls}-new-filter-popover-tree`}
            onTreeNode={() => ({
              className: `${prefixCls}-new-filter-popover-tree-node`,
            })}
            showIcon
            icon={(props) => {
              return <Tag className={`${prefixCls}-new-filter-popover-item-tag`}>{Number(props.pos.split('0-')[1]) + 1}</Tag>;
            }}
            renderer={({ record }) => {
              if (!record) return null;
              const comparator = record.get(AdvancedFieldSet.comparator);
              const fieldName = record.get(AdvancedFieldSet.fieldName);
              const field = record.getField(fieldName);
              const disabled = [OPERATOR.IS_NULL.value, OPERATOR.IS_NOT_NULL.value].includes(comparator);
              let valueFieldDom: ReactElement = <TextField style={{ width: '1.92rem' }} disabled />;
              if (field && !field.get('bind', record) && !fieldName.includes(tlsKey)) {
                const editor = getEditorByField(field, record, true);
                let shouldUseClick = false;
                if ('viewMode' in editor.props && editor.props.viewMode === TriggerViewMode.popup) {
                  shouldUseClick = true;
                }
                const fieldValue = record.get(fieldName);
                const maxTagTextLength = field.get('multiple') && fieldValue && fieldValue.length > 1 ? 3 : 7;
                valueFieldDom = cloneElement(editor, {
                  help: '',
                  key: fieldName,
                  name: fieldName,
                  record,
                  style: { width: '1.92rem' },
                  disabled,
                  showValidation: ShowValidation.tooltip,
                  trigger: shouldUseClick ? [Action.click, Action.focus] : undefined,
                  maxTagCount: 1,
                  maxTagTextLength,
                  maxTagPlaceholder: restValues => `+${restValues.length}`,
                });
              }
              return (
                <div className={`${prefixCls}-new-filter-popover-item`} key={`${record.index}_option`}>
                  <Select
                    name={AdvancedFieldSet.fieldName}
                    style={{ width: '1.2rem' }}
                    record={record}
                    placeholder={$l('Lov', 'choose')}
                    optionTooltip={OptionTooltip.overflow}
                    trigger={[Action.click, Action.focus]}
                    showValidation={ShowValidation.tooltip}
                  >
                    {selectOptions}
                  </Select>
                  <Select
                    name={AdvancedFieldSet.comparator}
                    renderer={({ value, text }) => value ? $l('Operator', value.toLowerCase()) : text}
                    optionRenderer={({ value, text }) => value ? $l('Operator', value.toLowerCase()) : text}
                    style={{ width: '0.88rem' }}
                    dropdownMatchSelectWidth={false}
                    optionTooltip={OptionTooltip.overflow}
                    record={record}
                    disabled={!record.get(AdvancedFieldSet.fieldName)}
                    optionsFilter={(optionRecord) => this.optionsFilter(record, optionRecord)}
                    trigger={[Action.click, Action.focus]}
                    showValidation={ShowValidation.tooltip}
                  />
                  {valueFieldDom}
                  <Button
                    funcType={FuncType.link}
                    icon="delete_black-o"
                    color={ButtonColor.primary}
                    onClick={() => {
                      if (newFilterDataSet.length === 1) {
                        newFilterDataSet.removeAll()
                      } else {
                        newFilterDataSet.remove(record);
                      }
                    }}
                  />
                </div>
              );
            }}
          />
          <Button
            funcType={FuncType.link}
            icon="add"
            color={ButtonColor.primary}
            onClick={() => {
              newFilterDataSet.create();
            }}
          >
            {$l('Table', 'ad_search_add')}
          </Button>
          <div className={`${prefixCls}-new-filter-popover-footer`}>
            <Button
              onClick={this.handleFilterCancel}
              icon='close'
            >
              {$l('Modal', 'cancel')}
            </Button>
            <Button
              onClick={this.handleFilterOk}
              color={ButtonColor.primary}
              icon='done'
            >
              {$l('Modal', 'ok')}
            </Button>
          </div>
        </>
      );
      return (
        <Popover
          title={$l('Table', 'ad_search_title')}
          content={PopoverContent}
          overlayClassName={`${prefixCls}-new-filter-popover`}
          trigger="click"
          visible={this.visible}
          ref={this.saveAdvancedFilterContainerRef}
        >
          <Button
            funcType={FuncType.link}
            className={`${prefixCls}-new-filter-popover-icon`}
            icon="filter2"
            color={newFilterDataSet && newFilterDataSet.some(r => r.status !== 'sync') ? ButtonColor.primary : ButtonColor.dark}
            onClick={() => {
              if (!newFilterDataSet.length) {
                newFilterDataSet.create();
              }
              runInAction(() => {
                this.visible = true;
              })
            }}
          />
        </Popover>
      );
    }
    return null;
  }

  getCombineSort(): ReactNode {
    const { dataSet, sortableFieldNames, tableStore, combineSortConfig } = this.props;
    const { prefixCls } = this;
    let combineSort: ReactNode = null;
    if (dataSet.props.combineSort && sortableFieldNames && sortableFieldNames.length > 0 &&
      (!combineSortConfig || combineSortConfig.currentDataSort !== false || combineSortConfig.allDataSort !== false)
    ) {
      combineSort = <CombineSort dataSet={dataSet} prefixCls={prefixCls} sortableFieldNames={sortableFieldNames} combineSortConfig={combineSortConfig} />;
    }
    if (!tableStore) return combineSort;

    const { props: { boardCustomized, customizedCode } } = tableStore;
    if (boardCustomized && !customizedCode) return null;
    return combineSort;
  }

  /**
   * 渲染模糊搜索
   */
  getFuzzyQuery(): ReactNode {
    const { dataSet, fuzzyQuery, fuzzyQueryPlaceholder, fuzzyQueryProps, onReset = noop } = this.props;
    const { prefixCls } = this;
    const placeholder = fuzzyQueryPlaceholder || $l('Table', 'enter_search_content');
    const fuzzyValue = dataSet.getState(ORIGINALVALUEOBJ) && dataSet.getState(ORIGINALVALUEOBJ).fuzzy;
    if (!fuzzyQuery) return null;
    return (<div className={`${prefixCls}-filter-search`}>
      <TextField
        style={{ width: 280 }}
        clearButton
        placeholder={placeholder}
        prefix={<Icon type="search" />}
        value={dataSet.getState(SEARCHTEXT)}
        valueChangeAction={ValueChangeAction.input}
        waitType={WaitType.debounce}
        wait={500}
        {...fuzzyQueryProps}
        onChange={(value: string, oldValue: string) => {
          this.handleQuery(undefined, value, oldValue);
          dataSet.setState(SEARCHTEXT, value);
          dataSet.setQueryParameter(this.searchText, value);
          this.setConditionStatus(value === (isNil(fuzzyValue) ? null : fuzzyValue) ? RecordStatus.sync : RecordStatus.update);
        }}
        onClear={() => {
          runInAction(() => {
            dataSet.setState(SEARCHTEXT, null);
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
    const { queryDataSet, dataSet, autoQueryAfterReset, onReset = noop, tableFilterBarButtonIcon } = this.props;
    const { prefixCls, context: { getConfig } } = this;
    const resetIconType = getTableFilterBarButtonIcon('resetIconType', getConfig, tableFilterBarButtonIcon);
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
                    const orgObj = dataSet.getState(ORIGINALVALUEOBJ);
                    shouldQuery = (dataSet.getState(SEARCHTEXT) !== orgObj.fuzzy) || !isEqualDynamicProps(orgObj.query, omit(current.toData(), ['__dirty']), queryDataSet, current);
                    dataSet.setState(SEARCHTEXT, orgObj.fuzzy)
                    dataSet.setQueryParameter(this.searchText, orgObj.fuzzy)
                    current.reset();
                    dataSet.setState(SELECTFIELDS, [...this.originalConditionFields]);
                  }
                }
                this.setConditionStatus(RecordStatus.sync);
                onReset();
                if (autoQueryAfterReset && shouldQuery) {
                  this.handleQuery();
                }
              }}
              icon={resetIconType}
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
    const { onReset = noop, defaultActiveKey, queryFields, queryDataSet, dataSet, dynamicFilterBar, searchCode, autoQuery,
      fuzzyQueryOnly, tableFilterBarButtonIcon } = this.props;
    const { prefixCls } = this;
    const prefix = this.getPrefix();
    const suffix = this.renderSuffix();
    const fuzzyQuery = this.getFuzzyQuery();
    const combineSort = this.getCombineSort();
    const advancedFilter = this.getAdvancedFilter();
    if (fuzzyQueryOnly) {
      return (
        <div className={`${prefixCls}-filter-menu`}>
          {prefix}
          {advancedFilter}
          {combineSort}
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
            refEditors: this.refEditors,
            onChange: this.handleSelect,
            onReset,
            conditionStatus: dataSet.getState(CONDITIONSTATUS),
            onStatusChange: this.setConditionStatus,
            selectFields: dataSet.getState(SELECTFIELDS),
            onOriginalChange: this.setOriginalConditionFields,
            menuDataSet: dataSet.getState(MENUDATASET),
            filterMenuDataSet: dataSet.getState(FILTERMENUDATASET),
            conditionDataSet: dataSet.getState(CONDITIONDATASET),
            newFilterDataSet: dataSet.getState(NEWFILTERDATASET),
            optionDataSet: dataSet.getState(OPTIONDATASET),
            shouldLocateData: this.shouldLocateData,
            initConditionFields: this.initConditionFields,
            searchText: this.searchText,
            loadConditionData: this.loadConditionData,
            defaultActiveKey,
            tableFilterBarButtonIcon,
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
          {advancedFilter}
          {combineSort}
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
    const { getConfig } = this.context;
    const result: Field[] = [];
    const tlsKey = getConfig('tlsKey');
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
            !field.get('name').includes(tlsKey)
          ) {
            result.push(field);
            cloneFields.delete(name);
          }
        }
      });
      if (cloneFields.size) {
        result.push(...cloneFields.values());
      }
    }
    return result;
  }

  /**
   * 获取模糊搜索字段参数名
   */
  get searchText(): string {
    const { dynamicFilterBar } = this.props;
    const { getConfig } = this.context;
    return dynamicFilterBar && dynamicFilterBar.searchText || getConfig('tableFilterSearchText') || 'params';
  }

  @autobind
  handleHelpMouseEnter(e: MouseEvent, help: string) {
    const { target } = e;
    const { getTooltipTheme, getTooltipPlacement } = this.context;
    show(target as HTMLElement, {
      title: help,
      theme: getTooltipTheme('help'),
      placement: getTooltipPlacement('help'),
    });
    this.isTooltipShown = true;
  }

  @autobind
  handleHelpMouseLeave() {
    hide();
  }

  renderTooltipHelp(help) {
    if (help) {
      return (
        <Icon
          type="help"
          onMouseEnter={(e) => this.handleHelpMouseEnter(e, help)}
          onMouseLeave={this.handleHelpMouseLeave}
        />
      );
    }
  }

  /**
   * 渲染查询项 label
   * @param param
   * @returns 
   */
  getLabel({ field, value, record, placeholder }) {
    if (value) {
      return field.get('label', record);
    }
    return field.get('label', record) || placeholder;
  }

  /**
   * 渲染查询条
   */
  getQueryBar(): ReactNode {
    const { getConfig } = this.context;
    const { queryFieldsLimit = 3, queryFields, queryDataSet, dataSet, fuzzyQueryOnly, showSingleLine } = this.props;
    const menuDataSet = dataSet.getState(MENUDATASET);
    const isTenant = menuDataSet && menuDataSet.current && menuDataSet.current.get('isTenant');
    let fieldsLimit = queryFieldsLimit;
    if (isTenant) {
      fieldsLimit = 0;
    }
    const { prefixCls } = this;
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    const filterBarCls = classNames(`${prefixCls}-dynamic-filter-bar`, {
      [`${prefixCls}-dynamic-filter-bar-single-line`]: showSingleLine,
    });
    if (fuzzyQueryOnly) {
      return (
        <div key="query_bar" className={filterBarCls}>
          {this.getFilterMenu()}
        </div>
      );
    }
    if (queryDataSet && queryFields.length) {
      // let moreFields: Field[] = [];
      if (fieldsLimit < this.queryFields.length) {
        // 单独使用动态筛选条组件，且queryFields设置了部分字段时
        this.moreFields = isTenant ? [...queryDataSet.fields.values()].filter(field => {
          return this.queryFields.find(item => item.props.name === field.name);
        }) : this.originOrderQueryFields.filter(field => {
          return this.queryFields.find(item => item.props.name === field.name);
        }).slice(fieldsLimit);
      }
      const singleLineModeAction = this.isSingleLineOpt() ?
        <div className={`${prefixCls}-dynamic-filter-bar-single-action`}>
          {this.getResetButton()}
          {this.getExpandNode(false)}
        </div> : null;
      return (
        <div key="query_bar" className={filterBarCls}>
          {this.getFilterMenu()}
          <div className={`${prefixCls}-dynamic-filter-single-wrapper`} ref={(node) => this.refSingleWrapper = node}>
            <div className={`${prefixCls}-filter-wrapper`}>
              {this.queryFields.slice(0, fieldsLimit).map(element => {
                const { name, hidden, showHelp, disabled, help, placeholder, label: elLabel } = element.props;
                const isLabelShowHelp = (showHelp || getConfig('showHelp')) === ShowHelp.label;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                if (!queryField) return null;
                const isRequired = queryField && queryField.get('required', queryDataSet.current);
                const validationMessage = queryField && queryField.getValidationMessage(queryDataSet.current);
                const hasValue = !this.isEmpty(queryDataSet.current && queryDataSet.current.get(name));
                const label = elLabel || this.getLabel({field: queryField!, value: hasValue, placeholder, record: queryDataSet.current});
                const isDisabled = disabled || fieldIsDisabled(queryField, queryDataSet);
                const itemContentClassName = classNames(`${prefixCls}-filter-content`,
                  {
                    [`${prefixCls}-filter-content-disabled`]: isDisabled,
                    [`${prefixCls}-filter-content-required`]: isRequired,
                    [`${prefixCls}-filter-content-has-value`]: hasValue,
                    [`${prefixCls}-filter-content-invalid`]: validationMessage,
                  });
                return (
                  <div
                    className={itemContentClassName}
                    key={name}
                    onMouseDown={() => {
                      if (!isDisabled) {
                        const editor = this.refEditors.get(name);
                        if (editor && isFunction(editor.focus)) {
                          defer(() => {
                            this.refEditors.get(name).focus();
                          }, 50);
                        }
                      }
                    }}
                    onClick={() => {
                      if (!isDisabled) {
                        const filterItem = this.refFilterItems.get(name);
                        if (filterItem) {
                          if (!filterItem.className.includes("c7n-pro-lov-click")) {
                            filterItem.className += ' c7n-pro-lov-click';
                          }
                        }
                      }
                    }}
                    onBlur={() => {
                      const filterItem = this.refFilterItems.get(name);
                      if (filterItem && filterItem.className.includes("c7n-pro-lov-click")) {
                        filterItem.className = filterItem.className.split(" c7n-pro-lov-click")[0];
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (validationMessage) {
                        const { currentTarget } = e;
                        show(currentTarget as HTMLElement, {
                          title: utilRenderValidationMessage(validationMessage, true),
                          theme: 'light',
                          placement: 'top',
                        });
                        this.isTooltipShown = true;
                      }
                    }}
                    onMouseLeave={() => {
                      hide();
                    }}
                  >
                    <span className={`${prefixCls}-filter-label`}>
                      {label}
                      {isLabelShowHelp ? this.renderTooltipHelp(help || queryField && queryField.get('help', queryDataSet.current)) : null}
                    </span>
                    <span
                      className={classNames(`${prefixCls}-filter-item`,
                        {
                          [`${prefixCls}-filter-item-has-value`]: hasValue,
                        })}
                      ref={(node) => this.refFilterItems.set(name, node)}
                    >
                      {this.createFields(element, name)}
                    </span>
                  </div>
                );
              })}
              {this.queryFields.slice(fieldsLimit).map(element => {
                const { name, hidden, showHelp, disabled, help, placeholder, label: elLabel } = element.props;
                const isLabelShowHelp = (showHelp || getConfig('showHelp')) === ShowHelp.label;
                if (hidden) return null;
                const queryField = queryDataSet.getField(name);
                if (!queryField) return null;
                const isRequired = queryField && queryField.get('required', queryDataSet.current);
                const validationMessage = queryField && queryField.getValidationMessage(queryDataSet.current);
                const hasValue = !this.isEmpty(queryDataSet.current && queryDataSet.current.get(name));
                const label = elLabel || this.getLabel({field: queryField!, value: hasValue, placeholder, record: queryDataSet.current});
                const isDisabled = disabled || fieldIsDisabled(queryField, queryDataSet);
                const itemContentClassName = classNames(`${prefixCls}-filter-content`,
                  {
                    [`${prefixCls}-filter-content-disabled`]: isDisabled,
                    [`${prefixCls}-filter-content-required`]: isRequired,
                    [`${prefixCls}-filter-content-has-value`]: hasValue,
                    [`${prefixCls}-filter-content-invalid`]: validationMessage,
                  });
                if (selectFields.includes(name)) {
                  return (
                    <div
                      className={itemContentClassName}
                      key={name}
                      onMouseDown={() => {
                        if (!isDisabled) {
                          const editor = this.refEditors.get(name);
                          if (editor && isFunction(editor.focus)) {
                            defer(() => {
                              this.refEditors.get(name).focus();
                            }, 50);
                          }
                        }
                      }}
                      onClick={() => {
                        if (!isDisabled) {
                          const filterItem = this.refFilterItems.get(name);
                          if (filterItem) {
                            if (!filterItem.className.includes("c7n-pro-lov-click")) {
                              filterItem.className += ' c7n-pro-lov-click';
                            }
                          }
                        }
                      }}
                      onBlur={() => {
                        const filterItem = this.refFilterItems.get(name);
                        if (filterItem && filterItem.className.includes("c7n-pro-lov-click")) {
                          filterItem.className = filterItem.className.split(" c7n-pro-lov-click")[0];
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (validationMessage) {
                          const { currentTarget } = e;
                          show(currentTarget as HTMLElement, {
                            title: utilRenderValidationMessage(validationMessage, true),
                            theme: 'light',
                            placement: 'top',
                          });
                          this.isTooltipShown = true;
                        }
                      }}
                      onMouseLeave={() => {
                        hide();
                      }}
                    >
                      <Icon
                        type="cancel"
                        className={`${prefixCls}-filter-item-close`}
                        onMouseDown={(e)=>{
                          e.stopPropagation();
                          this.handleUnSelect([name]);
                        }}
                      />
                      <span className={`${prefixCls}-filter-label`}>
                        {label}
                        {isLabelShowHelp ? this.renderTooltipHelp(help || queryField && queryField.get('help', queryDataSet.current)) : null}
                      </span>
                      <span
                        className={classNames(`${prefixCls}-filter-item`,
                          {
                            [`${prefixCls}-filter-item-has-value`]: hasValue,
                          })}
                        ref={(node) => this.refFilterItems.set(name, node)}
                      >
                        {this.createFields(element, name)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              {(fieldsLimit < this.queryFields.length) && (<div className={`${prefixCls}-filter-item`}>
                <Dropdown
                  key='drop-down'
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
                          fields: this.moreFields,
                        }]}
                        prefixCls={`${prefixCls}-filter-list` || 'c7n-pro-table-filter-list'}
                        closeMenu={() => runInAction(() => this.fieldSelectHidden = true)}
                        value={selectFields}
                        onSelect={this.handleSelect}
                        onUnSelect={this.handleUnSelect}
                        queryDataSet={queryDataSet}
                      />
                    </div>
                  )}
                  trigger={[Action.click]}
                >
                  <span
                    key='add-fields'
                    className={`${prefixCls}-add-fields`}
                    onMouseDown={(e: any) => {
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

  /**
   * 
   * @param collapse 
   * @param value 模糊查询参数
   */
  @autobind
  async handleQuery(collapse?: boolean, value?: string, oldValue?: string) {
    const { onQuery = noop, autoQuery, onBeforeQuery = noop } = this.props;
    if (await onBeforeQuery() === false) {
      return;
    }
    if (autoQuery) {
      await this.modifiedCheckQuery(value, oldValue);
    }
    if (!collapse) {
      onQuery();
    }
  }

  render() {
    const { buttons, summaryBar, summaryBarConfigProps = {} } = this.props;
    const { placement = 'topRight' } = summaryBarConfigProps;
    const { prefixCls } = this;
    const queryBar = this.getQueryBar();
    const summaryBarCls = summaryBar && ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(placement)
      ? `${prefixCls}-summary-${placement}` : '';
    if (queryBar) {
      return [queryBar, summaryBar];
    }
    return <TableButtons
      key="toolbar"
      prefixCls={`${prefixCls}-dynamic-filter-buttons`}
      buttons={buttons as ReactElement<ButtonProps>[]}
      className={summaryBarCls}
    >
      {summaryBar}
    </TableButtons>;
  }
}
