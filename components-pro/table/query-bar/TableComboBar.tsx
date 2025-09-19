import React, {
  cloneElement,
  Component,
  CSSProperties,
  isValidElement,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike, observable, runInAction, toJS } from 'mobx';
import uniq from 'lodash/uniq';
import pull from 'lodash/pull';
import noop from 'lodash/noop';
import map from 'lodash/map';
import isObject from 'lodash/isObject';
import isEnumEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import difference from 'lodash/difference';
import pullAllWith from 'lodash/pullAllWith';
import classNames from 'classnames';
import { TableFilterAdapterProps } from 'choerodon-ui/lib/configure';
import { getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import Icon from 'choerodon-ui/lib/icon';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import Field, { Fields } from '../../data-set/Field';
import DataSet, { DataSetProps } from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { DataSetEvents, DataSetSelection, FieldIgnore, FieldType, RecordStatus } from '../../data-set/enum';
import Button from '../../button';
import Dropdown from '../../dropdown';
import Menu from '../../menu';
import TextField from '../../text-field';
import Tooltip from '../../tooltip';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonProps } from '../../button/Button';
import { ButtonColor } from '../../button/enum';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import { ComboFilterBarConfig, Suffixes, TableCustomized, SummaryBarConfigProps } from '../Table';
import ComboFieldList from './ComboFieldList';
import TableButtons from './TableButtons';
import QuickFilterMenu from './combo-quick-filter/QuickFilterMenu';
import QuickFilterButton from './combo-quick-filter/QuickFilterButton';
import QuickFilterMenuContext from './combo-quick-filter/QuickFilterMenuContext';
import { ConditionDataSet, QuickFilterDataSet } from './combo-quick-filter/QuickFilterDataSet';
import { TransportProps } from '../../data-set/Transport';
import TableContext, { TableContextValue } from '../TableContext';
import { isEqualDynamicProps, isSelect, parseValue } from './TableDynamicFilterBar';
import ColumnFilter from './ColumnFilter';

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
  summaryBar?: ReactElement<any>;
  comboFilterBar?: ComboFilterBarConfig;
  onQuery?: () => void;
  onReset?: () => void;
  autoQueryAfterReset?: boolean;
  fuzzyQuery?: boolean;
  fuzzyQueryPlaceholder?: string;
  searchCode?: string;
  autoQuery?: boolean;
  refreshBtn?: boolean;
  simpleMode?: boolean;
  singleLineMode?: boolean;
  inlineSearchRender?: ReactElement<any>;
  inlineSearch?: boolean;
  tableActions?: TableAction[];
  title?: string | ReactNode;
  advancedFilter?: ReactNode;
  filerMenuAction?: ReactNode;
  queryFieldsStyle?: { [key: string]: CSSProperties };
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

export const RESETQUERYFIELDS = '__RESETQUERYFIELDS__';

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
    refreshBtn: true,
    buttons: [],
    simpleMode: false,
    singleLineMode: true,
  };

  context: TableContextValue;

  get prefixCls() {
    const { prefixCls } = this.props;
    const {
      tableStore: { getProPrefixCls = getProPrefixClsDefault },
    } = this.context;
    return getProPrefixCls('table', prefixCls);
  }

  get queryFields(): React.ReactElement<any>[] {
    const { queryFields } = this.props;
    return queryFields.filter(component => {
      if (component.props.hidden) {
        return !component.props.hidden;
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

  refDropdown: HTMLDivElement | null = null;

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
    const { queryDataSet, dataSet } = this.props;
    this.processDataSetListener(true);
    document.addEventListener('click', this.handleClickOut);
    if (!dataSet.props.autoQuery) {
      this.handleDataSetQuery({ dataSet });
    }
    if (this.originalValue === undefined && queryDataSet && queryDataSet.current) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener('click', this.handleClickOut);
    this.processDataSetListener(false);
  }

  componentWillReceiveProps(nextProps: Readonly<TableComboBarProps>): void {
    const { dataSet, queryDataSet } = nextProps;
    // eslint-disable-next-line react/destructuring-assignment
    if (dataSet !== this.props.dataSet) {
      runInAction(() => {
        this.fieldSelectHidden = true;
      });
      this.processDataSetListener(false);
      this.processDataSetListener(true, nextProps);
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
  handleClickOut = e => {
    if (this.refDropdown && !this.refDropdown.contains(e.target)) {
      this.fieldSelectHidden = true;
    }
  };

  @action
  handleTableHeight = () => {
    const { tableStore } = this.context;
    if (tableStore) {
      tableStore.node.handleHeightTypeChange(true);
    }
  };

  @action
  handleResize = () => {
    const { tableStore } = this.context;
    if (tableStore) {
      tableStore.node.handleHeightTypeChange();
    }
  };

  @autobind
  async handleDataSetQuery({ dataSet }) {
    const { initSearchId } = this;
    if (!dataSet.getState(MENURESULT) && this.tableFilterAdapter) {
      await this.initMenuDataSet();
      const res = dataSet.getState(MENURESULT);
      if (res && res.length) {
        const { conditionList } = initSearchId
          ? res.find(menu => menu.searchId === initSearchId)
          : res[0];
        const initQueryData = {};
        if (conditionList && conditionList.length) {
          map(conditionList, condition => {
            const { fieldName, value } = condition;
            initQueryData[fieldName] = parseValue(value);
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
    if (!(await result)) {
      runInAction(() => {
        const { current } = dataSet;
        dataSet.fields.forEach((field, key) => {
          if (!field.isValid(current)) {
            this.handleSelect(key);
          }
        });
      });
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
  setOriginalConditionFields = code => {
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
    const { dataSet, queryDataSet, onQuery = noop, autoQuery } = this.props;
    const field = queryDataSet && queryDataSet.getField(name);
    let shouldQuery = true;
    if (field && field.get('range', record)) {
      const rangeValue = value
        ? isArray(value)
          ? value.join('')
          : Object.values(value).join('')
        : '';
      const rangeOldValue = oldValue
        ? isArray(oldValue)
          ? oldValue.join('')
          : Object.values(oldValue).join('')
        : '';
      shouldQuery = rangeValue !== rangeOldValue;
    }
    let status = RecordStatus.update;
    if (record) {
      status = isEqualDynamicProps(
        this.originalValue,
        omit(record.toData(), ['__dirty']),
        queryDataSet,
        record,
        name,
      )
        ? RecordStatus.sync
        : RecordStatus.update;
    }
    this.setConditionStatus(status);
    if (autoQuery && shouldQuery) {
      if (await dataSet.modifiedCheck(undefined, dataSet, 'query')) {
        if (queryDataSet && queryDataSet.current && (await queryDataSet.current.validate())) {
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
  handleDataSetCreate() {
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      this.initConditionFields({ dataSet: queryDataSet, record: queryDataSet.current });
    }
    this.handleTableHeight();
  }

  /**
   * 初始化勾选值、条件字段
   * @param props
   */
  @autobind
  @action
  initConditionFields(props) {
    const { dataSet, record } = props;
    const originalValue = record ? omit(record.toData(), ['__dirty']) : {};
    const conditionData = Object.entries(originalValue);
    this.originalValue = originalValue;
    this.originalConditionFields = [];
    const { fields } = dataSet;
    map(conditionData, data => {
      let name = data[0];
      if (!fields.has(data[0]) && isObject(data[1]) && !isEnumEmpty(data[1]) && !isArray(data[1])) {
        name = `${data[0]}.${Object.keys(data[1])[0]}`;
      }
      if (isSelect(data) && !(dataSet.getState(SELECTFIELDS) || []).includes(name)) {
        const field = dataSet.getField(name);
        if (!field || !field.get('bind', record)) {
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
    const { initSearchId } = this;
    const {
      tableStore,
      tableStore: { getConfig },
    } = this.context;
    if (this.tableFilterAdapter) {
      const menuDataSet = new DataSet(
        QuickFilterDataSet({
          queryDataSet,
          tableFilterAdapter: this.tableFilterAdapter,
        }) as DataSetProps,
        { getConfig: getConfig as any },
      );
      const conditionDataSet = new DataSet(ConditionDataSet(), { getConfig: getConfig as any });
      const optionDataSet = new DataSet(
        {
          selection: DataSetSelection.single,
          paging: false,
          fields: [
            {
              name: 'title',
              type: FieldType.string,
              transformResponse: () => $l('Table', 'filter_header_title'),
              group: true,
            },
          ],
        },
        { getConfig: getConfig as any },
      );
      const filterMenuDataSet = new DataSet(
        {
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
        },
        { getConfig: getConfig as any },
      );
      let status = RecordStatus.update;
      if (queryDataSet && queryDataSet.current) {
        status = isEqualDynamicProps(
          this.originalValue,
          omit(queryDataSet.current.toData(), ['__dirty']),
          queryDataSet,
          queryDataSet.current,
        )
          ? RecordStatus.sync
          : RecordStatus.update;
      }
      // 初始化状态
      dataSet.setState(CONDITIONDATASET, conditionDataSet);
      dataSet.setState(OPTIONDATASET, optionDataSet);
      dataSet.setState(FILTERMENUDATASET, filterMenuDataSet);
      dataSet.setState(CONDITIONSTATUS, status);
      dataSet.setState(SEARCHTEXT, '');
      const result = await menuDataSet.query();
      if (optionDataSet) {
        optionDataSet.loadData(result);
      }
      if (initSearchId) {
        menuDataSet.locate(
          menuDataSet.findIndex(
            menu => menu.get('searchId').toString() === initSearchId.toString(),
          ),
        );
      } else {
        menuDataSet.locate(0);
      }
      dataSet.setState(MENURESULT, result);
      dataSet.setState(MENUDATASET, menuDataSet);
      const menuRecord = menuDataSet.current;
      if (menuRecord) {
        const conditionList =
          menuRecord.get('personalFilter') && parseValue(menuRecord.get('personalFilter'));
        conditionDataSet.loadData(conditionList);
        const customizedColumn =
          menuRecord.get('personalColumn') && parseValue(menuRecord.get('personalColumn'));
        if (tableStore) {
          runInAction(() => {
            const newCustomized: TableCustomized = { columns: { ...customizedColumn } };
            tableStore.tempCustomized = { columns: {} };
            tableStore.saveCustomized(newCustomized);
            tableStore.initColumns();
          });
        }
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
    const { buttons = [], tableActions = [], comboFilterBar, queryDataSet, dataSet } = this.props;
    const { prefixCls } = this;
    const {
      tableStore: { getConfig },
    } = this.context;
    const tableButtons = buttons.length ? (
      <TableButtons key="toolbar" prefixCls={`${prefixCls}-combo-filter`} buttons={buttons} />
    ) : null;
    const suffixes: Suffixes[] | undefined =
      (comboFilterBar && comboFilterBar.suffixes) || getConfig('tableFilterSuffix');
    const children: ReactElement[] = [];
    let suffixesDom: ReactElement | null = null;
    const actions = tableActions.length ? (
      <Menu className={`${prefixCls}-combo-filter-action-menu`}>
        {tableActions.map(({ name, onClick, disabled, style, children, element }) => {
          if (children && Array.isArray(children)) {
            return (
              <Menu.SubMenu title={name} style={style}>
                {children.map(
                  ({
                    name: itemName,
                    onClick: itemSubClick,
                    disabled: itemDisabled,
                    style: itemStyle,
                  }) => (
                    <Menu.Item
                      key={`${itemName}-action`}
                      onClick={itemSubClick}
                      disabled={itemDisabled}
                      style={itemStyle}
                    >
                      {itemName}
                    </Menu.Item>
                  ),
                )}
              </Menu.SubMenu>
            );
          }
          if (element && React.isValidElement(element)) {
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

    const tableActionsDom = actions && (
      <div key="action_menu" className={`${prefixCls}-combo-filter-action`}>
        <Dropdown overlay={actions} trigger={[Action.click]}>
          <Button
            className={`${prefixCls}-combo-filter-action-button`}
            icon="more_horiz"
            color={ButtonColor.secondary}
          />
        </Dropdown>
      </div>
    );

    if (suffixes && suffixes.length) {
      suffixes.forEach(suffix => {
        if (suffix === 'filter') {
          children.push(<ColumnFilter prefixCls={prefixCls} key='suffix-column-filter'/>);
        } else if (isValidElement(suffix)) {
          children.push(suffix);
        } else if (isFunction(suffix)) {
          children.push(suffix({ queryDataSet, dataSet }));
        }
      });
      suffixesDom = <div className={`${prefixCls}-combo-filter-bar-suffix`} key='suffix-dom'>{children}</div>;
    }

    if (tableButtons || tableActionsDom || suffixesDom) {
      return [tableButtons, tableActionsDom, suffixesDom];
    }
    return null;
  }

  getPrefix(): ReactNode {
    const { title, singleLineMode } = this.props;
    const { prefixCls } = this;
    if (title && !singleLineMode) {
      return <div className={`${prefixCls}-combo-filter-title`} key='prefix-filter-title'>{title}</div>;
    }
    return null;
  }

  /**
   * 注入 refEditors
   * @param element
   * @param name
   * @param field
   */
  createFields(element, name, field): ReactElement {
    const { queryFieldsStyle } = this.props;
    const { prefixCls } = this;
    const { clearButton = true } = element.props;
    const styleCss: CSSProperties | undefined = queryFieldsStyle && queryFieldsStyle[name];
    let fieldWidth;
    if (styleCss) {
      fieldWidth = styleCss.width;
    }
    let props: any = {
      ref: node => this.refEditors.set(name, node),
      placeholder: field.get('label'),
      maxTagCount: 2,
      border: true,
      isFlat: !fieldWidth,
      maxTagTextLength: 3,
    };
    if (fieldWidth) {
      props = {
        ...props,
        clearButton,
        className: `${prefixCls}-combo-filter-item-overlay`,
        style: {
          width: fieldWidth,
        },
      };
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
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.tableFilterAdapter;
  }

  get initSearchId(): number | null | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.searchId;
  }

  get filterCallback(): ((searchId: string) => void) | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.filterCallback;
  }

  get filterSave(): boolean | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.filterSave;
  }

  get filterSaveCallback(): ((any) => void) | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.filterSaveCallback;
  }

  get filterOptionRenderer(): ((searchId, searchIcon, text) => React.ReactNode) | undefined {
    const { comboFilterBar } = this.props;
    return comboFilterBar && comboFilterBar.filterOptionRenderer;
  }

  dynamicLimit(): number {
    const { queryFieldsLimit = 3, dataSet } = this.props;
    const conditionList = dataSet.getState(CONDITIONDATASET);
    const menuResult = dataSet.getState(MENURESULT);
    if (menuResult && menuResult.length > 0) {
      if (conditionList) {
        return conditionList.length;
      }
    }
    return queryFieldsLimit;
  }

  updateQueryFields(): React.ReactElement<any>[] {
    const { dataSet } = this.props;
    const conditionList = dataSet.getState(CONDITIONDATASET);
    if (conditionList) {
      const result: ReactElement<any>[] = [];
      const conditionData = conditionList.toData();
      const fields = this.queryFields;
      map(conditionData, data => {
        const name = data.fieldName;
        const findField = fields.find(component => component.props.name === name);
        if (findField) {
          result.push(findField);
          pullAllWith(fields, [findField], isEqual);
        }
      });
      return result.concat(fields);
    }
    return this.queryFields;
  }

  updateOriginOrderQueryFields(): Field[] {
    const { dataSet } = this.props;
    const conditionList = dataSet.getState(CONDITIONDATASET);
    const result: Field[] = [];
    const cloneFields = this.originOrderQueryFields;
    if (conditionList) {
      const conditionData = conditionList.toData();
      map(conditionData, data => {
        const name = data.fieldName;
        const findField = cloneFields.find(field => field.name === name);
        if (findField) {
          result.push(findField);
          pullAllWith(cloneFields, [findField], isEqual);
        }
      });
    }
    return result.concat(cloneFields);
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
    const shouldUpdate =
      dataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length ||
      !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    const isDirty = record ? record.dirty : false;
    this.setConditionStatus(shouldUpdate || isDirty ? RecordStatus.update : RecordStatus.sync);
    dataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  /**
   * 取消勾选
   * @param code
   */
  @action
  handleUnSelect = code => {
    const { queryDataSet, dataSet } = this.props;
    const codes = Array.isArray(code) ? code : [code];
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        codes.forEach(name => current.set(name, undefined));
      }
    }
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    dataSet.setState(SELECTFIELDS, pull([...selectFields], ...codes));
    const shouldUpdate =
      dataSet.getState(SELECTFIELDS).length !== this.originalConditionFields.length ||
      !!difference(toJS(dataSet.getState(SELECTFIELDS)), toJS(this.originalConditionFields)).length;
    this.setConditionStatus(shouldUpdate ? RecordStatus.update : RecordStatus.sync);
    dataSet.setState(SELECTCHANGE, shouldUpdate);
  };

  /**
   * 查询前修改提示及校验定位
   */
  async modifiedCheckQuery(): Promise<void> {
    const { tableStore: { getConfig } } = this.context;
    const { dataSet, queryDataSet, queryFields, comboFilterBar } = this.props;
    const searchText = comboFilterBar && comboFilterBar.searchText || getConfig('tableFilterSearchText') || 'params';
    const hasQueryFields = queryDataSet && queryFields.length > 0;
    if (
      ((await dataSet.modifiedCheck(undefined, dataSet, 'query')) &&
        queryDataSet &&
        queryDataSet.current &&
        (await queryDataSet.current.validate())) ||
      !hasQueryFields
    ) {
      dataSet.setQueryParameter(searchText, dataSet.getState(SEARCHTEXT));
      dataSet.query();
    } else {
      let hasFocus = false;
      for (const [key, value] of this.refEditors.entries()) {
        if (value && !value.valid && !hasFocus) {
          this.refEditors.get(key).focus();
          hasFocus = true;
        }
      }
    }
  }

  renderRefreshBtn(): ReactNode {
    const { prefixCls } = this;
    return (
      <span
        className={`${prefixCls}-filter-menu-query`}
        onClick={async e => {
          e.stopPropagation();
          await this.modifiedCheckQuery();
        }}
      >
        <Tooltip title={$l('Table', 'refresh')}>
          <Icon type="refresh" />
        </Tooltip>
      </span>
    );
  }

  /**
   * 渲染模糊搜索
   */
  getFuzzyQuery(): ReactNode {
    const {
      dataSet,
      fuzzyQuery,
      fuzzyQueryPlaceholder,
      comboFilterBar,
      onReset = noop,
      queryDataSet,
      queryFields,
    } = this.props;
    const { tableStore: { getConfig } } = this.context;
    const { prefixCls } = this;
    const searchText = comboFilterBar && comboFilterBar.searchText || getConfig('tableFilterSearchText') || 'params';
    const placeholder = fuzzyQueryPlaceholder || $l('Table', 'enter_search_filter');
    const hasQueryFields = queryDataSet && queryFields.length > 0;
    if (!fuzzyQuery && !hasQueryFields) {
      return null;
    }
    if (!fuzzyQuery) {
      return (
        <span className={`${prefixCls}-combo-filter-search-title`}>{$l('Table', 'search')}: </span>
      );
    }
    return (
      <div className={`${prefixCls}-combo-filter-search`}>
        <TextField
          style={{ width: 182 }}
          clearButton
          placeholder={placeholder}
          prefix={<Icon type="search" />}
          value={dataSet.getState(SEARCHTEXT)}
          onChange={(value: string) => {
            runInAction(() => {
              dataSet.setState(SEARCHTEXT, value || '');
            });
            dataSet.setQueryParameter(searchText, value);
            this.handleQuery();
          }}
          onClear={() => {
            runInAction(() => {
              dataSet.setState(SEARCHTEXT, '');
            });
            onReset();
          }}
        />
      </div>
    );
  }

  /**
   * 渲染重置按钮
   */
  getResetButton() {
    const { queryDataSet, dataSet, autoQueryAfterReset, onReset = noop } = this.props;
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-filter-buttons`}>
        {dataSet.getState(CONDITIONSTATUS) === RecordStatus.update && (
          <Button
            onClick={() => {
              let shouldQuery = false;
              if (queryDataSet) {
                const { current } = queryDataSet;
                if (current) {
                  shouldQuery = !isEqualDynamicProps(
                    this.originalValue,
                    omit(current.toData(), ['__dirty']),
                    queryDataSet,
                    current,
                  );
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
            color={ButtonColor.secondary}
          >
            {$l('Table', 'reset_button')}
          </Button>
        )}
      </div>
    );
  }

  /**
   * 筛选头
   * fuzzyQuery + quickFilterMenu + resetButton + buttons
   */
  getFilterMenu(): ReactNode {
    const {
      queryFields,
      queryDataSet,
      dataSet,
      autoQuery,
      filerMenuAction,
      onReset = noop,
      singleLineMode,
    } = this.props;
    const { tableStore } = this.context;
    const { prefixCls, initSearchId } = this;
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
            refEditors: this.refEditors,
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
            initSearchId,
            filterCallback: this.filterCallback,
            filterSave: this.filterSave,
            filterSaveCallback: this.filterSaveCallback,
            filterOptionRenderer: this.filterOptionRenderer,
            onReset,
            tableStore,
          }}
        >
          <QuickFilterMenu />
        </QuickFilterMenuContext.Provider>
      ) : null;

      return singleLineMode ? (
        <>
          {(quickFilterMenu || filerMenuAction) && (
            <div className={`${prefixCls}-combo-filter-menu`}>
              {quickFilterMenu}
              {filerMenuAction && (
                <div className={`${prefixCls}-combo-filter-menu-action`}>{filerMenuAction}</div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className={`${prefixCls}-combo-filter-menu`}>
          {prefix}
          {prefix && quickFilterMenu && (
            <span className={`${prefixCls}-combo-filter-title-divide`}>/</span>
          )}
          {quickFilterMenu}
          {filerMenuAction && (
            <div className={`${prefixCls}-combo-filter-menu-action`}>{filerMenuAction}</div>
          )}
          {suffix}
        </div>
      );
    }
  }

  getFilterButton(): ReactNode {
    const {
      queryFields,
      queryDataSet,
      dataSet,
      autoQuery,
      onReset = noop,
      singleLineMode,
    } = this.props;
    const { tableStore } = this.context;
    const { prefixCls, initSearchId } = this;
    const suffix = this.renderSuffix();
    const quickFilterButton =
      this.tableFilterAdapter && (queryDataSet && queryFields.length) ? (
        <QuickFilterMenuContext.Provider
          value={{
            tempQueryFields: this.tempFields,
            autoQuery,
            prefixCls,
            dataSet,
            queryDataSet,
            refEditors: this.refEditors,
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
            initSearchId,
            filterCallback: this.filterCallback,
            filterSave: this.filterSave,
            filterSaveCallback: this.filterSaveCallback,
            filterOptionRenderer: this.filterOptionRenderer,
            onReset,
            tableStore,
          }}
        >
          <QuickFilterButton />
        </QuickFilterMenuContext.Provider>
      ) : null;
    const resetButton = this.tableFilterAdapter ? null : this.getResetButton();

    return singleLineMode ? (
      <div className={`${prefixCls}-combo-filter-menu-button`}>
        {quickFilterButton}
        {resetButton}
        {dataSet.getState(CONDITIONSTATUS) === RecordStatus.update &&
        suffix &&
        (quickFilterButton || resetButton) ? (
            <span className={`${prefixCls}-combo-filter-menu-button-singleLine-divide`} />
          ) : null}
        {suffix}
      </div>
    ) : (
      <div className={`${prefixCls}-combo-filter-menu-button`}>
        {quickFilterButton}
        {resetButton}
      </div>
    );
  }

  /**
   * 查询字段初始顺序
   * 排除动态属性影响
   */
  get originOrderQueryFields(): Field[] {
    const { queryDataSet } = this.props;
    const result: Field[] = [];
    if (queryDataSet) {
      const {
        fields,
        props: { fields: propFields = [] },
      } = queryDataSet;
      const cloneFields: Map<string, Field> = fields.toJS();
      propFields.forEach(({ name }) => {
        if (name) {
          const field = cloneFields.get(name);
          const hasBindProps = propsName =>
            field && field.get(propsName) && field.get(propsName).bind;
          if (
            field &&
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
    const {
      queryFieldsLimit = 3,
      queryFields,
      queryDataSet,
      dataSet,
      simpleMode,
      advancedFilter,
      singleLineMode,
    } = this.props;
    let fieldsLimit = queryFieldsLimit;
    if (simpleMode) {
      fieldsLimit = this.originOrderQueryFields.length;
    }
    if (this.tableFilterAdapter && !simpleMode) {
      fieldsLimit = this.dynamicLimit();
    }
    const updateQueryFields = this.updateQueryFields();
    const updateOriginOrderQueryFields = this.updateOriginOrderQueryFields();
    const { prefixCls } = this;
    const selectFields = dataSet.getState(SELECTFIELDS) || [];
    const fuzzyQuery = this.getFuzzyQuery();

    const hasQueryFields = queryDataSet && queryFields.length > 0;

    const showAdvancedFilter = advancedFilter && !simpleMode && (
      <>
        <span className={`${prefixCls}-combo-filter-advanced-divide`} />
        {advancedFilter}
      </>
    );
    return (
      <ReactResizeObserver key="query_bar" resizeProp="height" onResize={this.handleResize}>
        <div className={`${prefixCls}-combo-filter-bar`}>
          {this.getFilterMenu() && !singleLineMode && (
            <>
              {this.getFilterMenu()}
              <div className={`${prefixCls}-combo-filter-menu-divide`} />
            </>
          )}
          <div className={`${prefixCls}-combo-filter-single-wrapper`}>
            {this.getFilterMenu() && singleLineMode && <>{this.getFilterMenu()}</>}
            {fuzzyQuery}
            <div className={`${prefixCls}-combo-filter-wrapper`}>
              {hasQueryFields && (
                <>
                  {updateQueryFields.slice(0, fieldsLimit).map(element => {
                    const { name, hidden, disabled } = element.props;
                    if (hidden) return null;
                    const queryField = queryDataSet && queryDataSet.getField(name);
                    const itemContentClassName = classNames(`${prefixCls}-combo-filter-content`, {
                      [`${prefixCls}-filter-content-disabled`]:
                      disabled || (queryField && queryField.get('disabled')),
                    });
                    return (
                      <div
                        className={itemContentClassName}
                        key={name}
                        onClick={() => {
                          const editor = this.refEditors.get(name);
                          if (editor) {
                            this.refEditors.get(name).focus();
                          }
                        }}
                      >
                        <span className={`${prefixCls}-combo-filter-item`}>
                          {this.createFields(element, name, queryField)}
                        </span>
                      </div>
                    );
                  })}
                  {updateQueryFields.slice(fieldsLimit).map(element => {
                    const { name, hidden, disabled } = element.props;
                    if (hidden) return null;
                    const queryField = queryDataSet && queryDataSet.getField(name);
                    const itemContentClassName = classNames(`${prefixCls}-combo-filter-content`, {
                      [`${prefixCls}-filter-content-disabled`]:
                      disabled || (queryField && queryField.get('disabled')),
                    });
                    if (selectFields.includes(name)) {
                      return (
                        <div
                          className={itemContentClassName}
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
                            className={`${prefixCls}-combo-filter-item-close`}
                            onClick={() => {
                              this.handleUnSelect([name]);
                            }}
                          />
                          <span className={`${prefixCls}-combo-filter-item`}>
                            {this.createFields(element, name, queryField)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {fieldsLimit < updateQueryFields.length && (
                    <div className={`${prefixCls}-combo-filter-item`}>
                      <Dropdown
                        visible={!this.fieldSelectHidden}
                        overlay={
                          <div
                            role="none"
                            ref={node => (this.refDropdown = node)}
                            onClick={e => {
                              e.stopPropagation();
                            }}
                          >
                            <ComboFieldList
                              groups={[
                                {
                                  title: $l('Table', 'predefined_fields'),
                                  fields: updateOriginOrderQueryFields.slice(fieldsLimit),
                                },
                              ]}
                              prefixCls={
                                `${prefixCls}-combo-filter-list` || 'c7n-pro-table-combo-filter-list'
                              }
                              closeMenu={() => runInAction(() => (this.fieldSelectHidden = true))}
                              value={selectFields}
                              onSelect={this.handleSelect}
                              onUnSelect={this.handleUnSelect}
                              fieldsLimit={this.tableFilterAdapter ? fieldsLimit : 0}
                            />
                          </div>
                        }
                        trigger={[Action.click]}
                      >
                        <span
                          className={`${prefixCls}-combo-add-fields`}
                          onClick={(e: any) => {
                            e.nativeEvent.stopImmediatePropagation();
                            runInAction(() => {
                              this.fieldSelectHidden = !this.fieldSelectHidden;
                            });
                          }}
                        >
                          {$l('Table', 'add_search')}
                          <Icon
                            type={
                              this.fieldSelectHidden
                                ? 'baseline-arrow_drop_down'
                                : 'baseline-arrow_drop_up'
                            }
                          />
                        </span>
                      </Dropdown>
                    </div>
                  )}
                </>
              )}
              {showAdvancedFilter}
            </div>
            {this.getFilterButton()}
          </div>
        </div>
      </ReactResizeObserver>
    );
  }

  @autobind
  async handleQuery(collapse?: boolean) {
    const { onQuery = noop, autoQuery } = this.props;
    if (autoQuery) {
      await this.modifiedCheckQuery();
    }
    if (!collapse) {
      onQuery();
    }
  }

  render() {
    const { summaryBar, buttons, summaryBarConfigProps = {} } = this.props;
    const { placement = 'topRight' } = summaryBarConfigProps;
    const { prefixCls } = this;
    const queryBar = this.getQueryBar();
    const summaryBarCls = summaryBar && ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(placement)
      ? `${prefixCls}-summary-${placement}` : '';
    if (queryBar) {
      return [queryBar, summaryBar];
    }
    return (
      <TableButtons
        key="toolbar"
        prefixCls={`${prefixCls}-combo-filter-buttons`}
        buttons={buttons as ReactElement<ButtonProps>[]}
        className={summaryBarCls}
      >
        {summaryBar}
      </TableButtons>
    );
  }
}
