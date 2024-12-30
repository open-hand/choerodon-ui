import React, { CSSProperties, isValidElement, Key, ReactElement, ReactNode } from 'react';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import { observer } from 'mobx-react';
import { action, computed, IReactionDisposer, isArrayLike, observable, reaction, runInAction, toJS } from 'mobx';
import { Menus, SingleMenu } from 'choerodon-ui/lib/rc-components/cascader';
import { defaultFieldNames } from 'choerodon-ui/lib/rc-components/cascader/Cascader';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { Size } from 'choerodon-ui/lib/_util/enum';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { FieldNamesType, MenuMode } from 'choerodon-ui/lib/cascader';
import TriggerField, { TriggerFieldPopupContentProps, TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import { DataSetStatus, FieldType } from '../data-set/enum';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import Spin from '../spin';
import { stopEvent } from '../_util/EventManager';
import normalizeOptions, { expandTreeRecords } from './utils';
import { $l } from '../locale-context';
import ObjectChainValue from '../_util/ObjectChainValue';
import isEmptyUtil from '../_util/isEmpty';
import isSameLike from '../_util/isSameLike';
import { OptionProps } from '../option/Option';
import { ExpandTrigger } from './enum';
import { Action } from '../trigger/enum';

export const MORE_KEY = '__more__';

export interface OptionObject {
  value: any;
  meaning: string;
}

export interface ProcessOption extends OptionObject {
  parent: any;
  children?: any;
  disabled?: boolean;
}

export interface CascaderOptionType {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  children?: Array<CascaderOptionType>;
  parent?: Array<CascaderOptionType>;
  __IS_FILTERED_OPTION?: boolean;
}

export interface SearchMatcherProps {
  record: Record;
  text: string;
  textField: string;
  valueField: string;
}

export type SearchMatcher = string | ((props: SearchMatcherProps) => boolean);

const disabledField = 'disabled';

function defaultOnOption({ record }) {
  if (record instanceof Record) {
    return {
      disabled: record.get(disabledField),
    };
  }
}

export function getItemKey(record: Record, text: ReactNode, value: any) {
  return `item-${value || record.id}-${(isValidElement(text) ? text.key : text) || record.id}`;
}

function getSimpleValue(value, valueField) {
  if (isPlainObject(value)) {
    return ObjectChainValue.get(value, valueField);
  }
  return value;
}

/**
 * 简单比较arry的值是否相同
 * 主要问题是观察变量修改了值类型所以使用此方法
 * @param arr
 * @param arrNext
 */
function arraySameLike(arr, arrNext): boolean {
  if (isArrayLike(arr) && isArrayLike(arrNext)) {
    return arr.toString() === arrNext.toString();
  }
  return false;
}

function defaultSearchMatcher({ record, text, textField }) {
  return record.get(textField) && record.get(textField).indexOf(text) !== -1;
}

export type onOptionProps = { dataSet: DataSet; record: Record };

export type RenderProps = {
  value?: any;
  text?: ReactNode;
  record?: Record | null;
  dataSet?: DataSet | null;
  isFilterSearch?: boolean;
};

type Renderer<T extends RenderProps = RenderProps> = (props: T) => ReactNode;


export interface CascaderPopupContentProps extends TriggerFieldPopupContentProps {
  dataSet: DataSet;
  textField: string;
  valueField: string;
  field?: Field | undefined;
  record?: Record | undefined;
  content: ReactNode;
}

export interface CascaderProps extends TriggerFieldProps {
  /**
   * 次级菜单的展开方式，可选 'click' 和 'hover'
   */
  expandTrigger?: ExpandTrigger;
  /**
   * 下拉框匹配输入框宽度
   * @default true
   */
  dropdownMatchSelectWidth?: boolean;
  /**
   * 下拉框菜单样式名
   */
  dropdownMenuStyle?: CSSProperties;
  /**
   * 选项数据源
   */
  options?: DataSet | CascaderOptionType[];
  /**
   * 是否为原始值
   * true - 选项中valueField对应的值
   * false - 选项值对象
   */
  primitiveValue?: boolean;
  /**
   * 当下拉列表为空时显示的内容
   */
  notFoundContent?: ReactNode;
  /**
   * 设置选项属性，如 disabled;
   */
  onOption?: (props: onOptionProps) => OptionProps;
  /**
   * 选择一个值的时候触发
   */
  onChoose?: (value, record) => void;
  /**
   * 取消选中一个值的时候触发多选时候生效
   */
  onUnChoose?: (value, record) => void;
  /** 单框弹出形式切换 */
  menuMode?: MenuMode;
  /** 由于渲染在body下可以方便按照业务配置弹出框的大小 */
  singleMenuStyle?: CSSProperties;
  /** 由于渲染在body下可以方便按照业务配置超出大小样式和最小宽度等 */
  singleMenuItemStyle?: CSSProperties;
  /** 设置需要的提示问题配置 */
  singlePleaseRender?: ({ key, className, text }: { key: string; className: string; text: string }) => ReactElement<any>;
  /** 头部可以渲染出想要的tab样子 */
  singleMenuItemRender?: (title: string) => ReactElement<any>;
  /** 选择及改变 */
  changeOnSelect?: boolean;
  searchable?: boolean;
  searchMatcher?: SearchMatcher;
  async?: boolean;
  loadData?: (node) => Promise<any>;
  /**
   * 渲染分页 Item 内容
   */
  pagingOptionContent?: string | ReactNode;
  fieldNames?: FieldNamesType;
  /** 渲染Option文本的钩子 */
  optionRenderer?: Renderer;
}

export class Cascader<T extends CascaderProps> extends TriggerField<T> {
  static displayName = 'Cascader';

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'cascader',
    searchable: false,
    dropdownMatchSelectWidth: false,
    expandTrigger: ExpandTrigger.click,
    fieldNames: defaultFieldNames,
    onOption: defaultOnOption,
  };

  @observable activeValues;

  @observable menuItemWith: number;

  @observable clickTab;

  @observable moreQuerying;

  optionsIsChange: boolean | undefined;

  defaultOptions: DataSet = new DataSet(undefined, { getConfig: this.getContextConfig as any });

  get isClickTab() {
    return this.clickTab;
  }

  get activeValue(): any {
    const { options, optionsIsChange, activeValues, valueField } = this;
    if (optionsIsChange && activeValues && activeValues instanceof Record) {
      const newActiveValue = options.find(r => r.get(valueField) === activeValues.get(valueField));
      if (newActiveValue && newActiveValue !== activeValues) {
        return newActiveValue;
      }
    }
    return activeValues;
  }

  get itemMenuWidth(): number {
    return this.menuItemWith;
  }

  constructor(props, context) {
    super(props, context);
    this.setActiveValue({});
    this.setItemMenuWidth(0);
    this.setIsClickTab(false);
  }

  findActiveRecord(value, options) {
    let result;
    const returnActiveValue = (arrayOption, index) => {
      if (arrayOption && arrayOption.length > 0) {
        arrayOption.forEach((item) => {
          if (isSameLike(value[index], this.getRecordOrObjValue(item, this.valueField))) {
            result = item;
            if (item.children) {
              returnActiveValue(item.children, ++index);
            }
          }
        });
      }
    };
    if (options instanceof DataSet) {
      returnActiveValue(options.treeData, 0);
    }
    if (isArrayLike(options)) {
      returnActiveValue(options, 0);
    }
    return result;
  }

  @action
  setActiveValue(activeValues: any) {
    this.optionsIsChange = false;
    this.activeValues = activeValues;
  }

  @action setIsClickTab(isClickTab: boolean) {
    this.clickTab = isClickTab;
  }

  @action
  setItemMenuWidth(width: number) {
    this.menuItemWith = width;
  }

  getDefaultAction(): Action[] {
    return this.getContextConfig('selectTrigger') || super.getDefaultAction();
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Cascader', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  get textField(): string {
    return this.getProp('textField') || 'meaning';
  }

  get valueField(): string {
    return this.getProp('valueField') || 'value';
  }

  @computed
  get cascadeOptions(): Record[] {
    const { record, field, options } = this;
    const { data } = options;
    if (field) {
      const cascadeMap = field.get('cascadeMap', record);
      if (cascadeMap) {
        if (record) {
          const cascades = Object.keys(cascadeMap);
          return data.filter(item =>
            cascades.every(cascade =>
              isSameLike(record.get(cascadeMap[cascade]), item.get(cascade)),
            ),
          );
        }
        return [];
      }
    }
    return data;
  }

  get multiple(): boolean {
    return !!this.getProp('multiple');
  }

  get menuMultiple(): boolean {
    return this.multiple;
  }

  get parentField(): string {
    return this.getProp('parentField') || 'parentValue';
  }

  get idField(): string {
    return this.getProp('idField') || this.valueField;
  }

  get searchMatcher(): SearchMatcher {
    const { searchMatcher = defaultSearchMatcher } = this.observableProps;
    return searchMatcher;
  }

  @computed
  get options(): DataSet {
    const {
      field,
      textField,
      valueField,
      idField,
      parentField,
      multiple,
      observableProps: { options },
    } = this;
    if (isArrayLike(options)) {
      this.optionsIsChange = true;
      return normalizeOptions({
        textField,
        valueField,
        idField,
        disabledField,
        multiple,
        data: toJS(options),
        parentField,
        getConfig: this.getContextConfig,
      });
    }
    return (
      options ||
      (field && field.getOptions(this.record)) ||
      this.defaultOptions
    );
  }

  @computed
  get filteredOptions(): Record[] {
    const { text } = this;
    return this.searchData(this.cascadeOptions, text);
  }

  // 增加父级属性
  addOptionsParent(options, parent) {
    if (options.length > 0) {
      return options.map((ele) => {
        ele.parent = parent || undefined;
        if (ele.children) {
          this.addOptionsParent(ele.children, ele);
        }
        return ele;
      });
    }
  }

  get primitive(): boolean {
    return this.observableProps.primitiveValue !== false && this.getProp('type') !== FieldType.object;
  }

  checkValueReaction?: IReactionDisposer;

  checkComboReaction?: IReactionDisposer;

  checkValue() {
    this.checkValueReaction = reaction(() => this.cascadeOptions, () => this.processSelectedData());
  }

  checkCombo() {
    this.checkComboReaction = reaction(
      () => this.getValue(),
      value => this.generateComboOption(value),
    );
  }

  clearCheckValue() {
    if (this.checkValueReaction) {
      this.checkValueReaction();
      this.checkValueReaction = undefined;
    }
  }

  clearCheckCombo() {
    if (this.checkComboReaction) {
      this.checkComboReaction();
      this.checkComboReaction = undefined;
    }
  }

  clearReaction() {
    this.clearCheckValue();
    this.clearCheckCombo();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.clearReaction();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    this.forcePopupAlign();
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'multiple',
      'value',
      'searchable',
      'searchMatcher',
      'name',
      'dropdownMatchSelectWidth',
      'dropdownMenuStyle',
      'primitiveValue',
      'notFoundContent',
      'onOption',
      'expandTrigger',
      'dropdownMatchSelectWidth',
      'menuMode',
      'singleMenuStyle',
      'singleMenuItemStyle',
      'singlePleaseRender',
      'singleMenuItemRender',
      'onChoose',
      'onUnChoose',
      'changeOnSelect',
      'pagingOptionContent',
      'loadData',
      'async',
      'fieldNames',
      'optionRenderer',
    ]);
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      children: props.children,
      options: props.options,
      searchable: props.searchable,
      searchMatcher: props.searchMatcher,
      primitiveValue: props.primitiveValue,
    };
  }

  getMenuPrefixCls() {
    return `${this.prefixCls}-dropdown-menu`;
  }

  getPagingOptionContent() {
    const { pagingOptionContent } = this.props;
    if (pagingOptionContent !== undefined) {
      return pagingOptionContent;
    }
    return this.getContextConfig('selectPagingOptionContent');
  }

  renderMultipleHolder() {
    const { name, multiple } = this;
    if (multiple) {
      return super.renderMultipleHolder();
    }
    return (
      <input
        key="value"
        type="hidden"
        value={this.toValueString(this.getValue()) || ''}
        name={name}
        onChange={noop}
      />
    );
  }

  getNotFoundContent() {
    const { notFoundContent } = this.props;
    if (notFoundContent !== undefined) {
      return notFoundContent;
    }
    return this.getContextConfig('renderEmpty')('Select');
  }

  /**
   * 返回一个打平tree返回层级
   * @param record
   * @param fn
   */
  findParentRecordTree(record: Record, fn?: any) {
    const recordTree: any[] = [];
    if (record) {
      if (isFunction(fn)) {
        recordTree.push(fn(record));
      } else {
        recordTree.push(record);
      }
    }
    if (record && record.parent) {
      if (isFunction(fn)) {
        return [...this.findParentRecordTree(record.parent, fn), ...recordTree];
      }
      return [...this.findParentRecordTree(record.parent), ...recordTree];
    }
    return recordTree;
  }

  @autobind
  handleLoadData(event): Promise<any> {
    const { loadData } = this.props;
    const dataSet = this.options;
    const promises: Promise<any>[] = [];
    if (dataSet) {
      const { idField, parentField } = dataSet.props;
      const { value: record } = event;
      if (idField && parentField && record && !record.children) {
        const id = record.get(idField);
        promises.push(dataSet.queryMore(-1, { [parentField]: id }));
      }
    }
    if (loadData) {
      promises.push(loadData(event));
    }
    return Promise.all(promises);
  }

  /**
   * 获取record 或者 obj对应的值
   * @param value
   * @param key
   */
  getRecordOrObjValue(value, key) {
    if (value instanceof Record) {
      return value.get(key);
    }
    if (isObject(value)) {
      return value[key];
    }
    return value;
  }

  /**
   * 渲染menu 表格
   * @param menuProps
   */
  @autobind
  getMenu(menuProps: object = {}): ReactNode {
    const { options } = this;
    if (!options) {
      return null;
    }
    // 暂时不用考虑分组情况 groups
    const {
      disabled: menuDisabled,
      textField,
      valueField,
      props: {
        dropdownMenuStyle,
        expandTrigger,
        onOption,
        menuMode,
        singleMenuStyle,
        singleMenuItemStyle,
        singlePleaseRender,
        changeOnSelect,
        singleMenuItemRender,
        async,
        loadData,
        fieldNames,
      },
    } = this;
    let optGroups: any[] = [];
    let selectedValues: any[] = [];

    // 过滤后的数据不用进行子集遍历
    const treePropsChange = (treeRecord: Record[], isFilterSearch = false) => {
      let treeRecords: any = [];
      if (treeRecord.length > 0) {
        treeRecords = treeRecord.map((recordItem) => {
          const value = this.getRecordOrObjValue(recordItem, valueField);
          const text = isFilterSearch ? this.treeTextToArray(recordItem).join('/') : this.getRecordOrObjValue(recordItem, textField);
          const optionProps = onOption ? onOption({ dataSet: options, record: recordItem }) : undefined;
          const optionDisabled = menuDisabled || (optionProps && optionProps.disabled);
          const key: Key = getItemKey(recordItem, text, value);
          let children;
          if (recordItem.isSelected) {
            selectedValues.push(recordItem);
          }
          if (recordItem.children && !isFilterSearch) {
            children = treePropsChange(recordItem.children);
          }
          const isLeaf = (async || !!loadData) ? undefined : (this.text ? (!children || !children.length) : !recordItem.children || !recordItem.children.length);
          const itemContent = this.getMenuItem({ record: recordItem, text, value, isFilterSearch });
          return (children ? {
            disabled: optionDisabled,
            label: itemContent,
            value: recordItem,
            children,
            isLeaf,
            ...optionProps,
            key,
          } : {
            disabled: optionDisabled,
            label: itemContent,
            value: recordItem,
            isLeaf,
            ...optionProps,
            key,
          });
        });
      }
      return treeRecords;
    };

    if (this.text) {
      optGroups = treePropsChange(expandTreeRecords(this.filteredOptions, !changeOnSelect), true);
    } else if (options) {
      optGroups = treePropsChange(options.treeData);
    } else {
      optGroups = [];
    }

    const getInputSelectedValue = (inputValue) => {
      let activeInputValue = [];
      if (isArrayLike(options)) {
        activeInputValue = this.findParentRecordTree(this.findActiveRecord(inputValue, this.options));
      } else if (options instanceof DataSet) {
        activeInputValue = this.findParentRecordTree(this.findActiveRecord(inputValue, this.options.treeData));
      } else {
        activeInputValue = [];
      }
      return activeInputValue;
    };
    /**
     * 获取当前激活的 menuItem
     * 以及value 展示激活状态的判断
     * 按钮能够控制不受值的影响
     * inputValue: 输入框的值
     * activeValue: 激活值（choose和键盘影响）
     * this.popup:开启状态有激活值那么为激活值
     */
    const getActiveValue = (inputValue) => {
      let activeValue = [];
      if (!isEmpty(inputValue)) {
        if (inputValue && arraySameLike(this.treeValueToArray(this.activeValue), inputValue) || this.activeValue.children) {
          activeValue = this.findParentRecordTree(this.activeValue);
        } else if (this.activeValue) {
          activeValue = getInputSelectedValue(inputValue);
        }
      } else if (inputValue) {
        activeValue = this.findParentRecordTree(this.activeValue);
      }
      return activeValue;
    };

    if (this.popup && !isEmpty(this.activeValue)) {
      selectedValues = this.findParentRecordTree(this.activeValue);
    } else if (!this.multiple) {
      selectedValues = getActiveValue(this.getValues());
    } else if (this.getValues() && this.getValues().length > 0) {
      for (let i = this.getValues().length - 1; i >= 0; i--) {
        selectedValues = getActiveValue(this.getValues()[i]);
        if (!isEmpty(selectedValues)) {
          break;
        }
      }
    } else if (!isEmpty(this.activeValue)) {
      selectedValues = this.findParentRecordTree(this.activeValue);
    }

    let dropdownMenuStyleMerge = dropdownMenuStyle;
    if ((this.itemMenuWidth > 0)) {
      dropdownMenuStyleMerge = { ...dropdownMenuStyle, width: pxToRem(this.itemMenuWidth, true)! };
    }

    // 由于想让多选出现不同展现这边增加一个selected属性来解决但是会造成一定的性能损耗

    let selectedValueMultiple;
    if (this.multiple) {
      const selectedMultiple = this.getValues()
        .map(item => getInputSelectedValue(item))
        .filter((recordItem) => recordItem !== undefined && recordItem !== null);
      selectedValueMultiple = Array.from(new Set(selectedMultiple.reduce((accumulator, currentValue) => [...accumulator, ...currentValue], [])));
    }

    if (options.paging && options.currentPage < options.totalPage && menuMode !== MenuMode.single) {
      const menuPrefixCls = this.getMenuPrefixCls();
      optGroups.push({
        key: MORE_KEY,
        eventKey: MORE_KEY,
        label: <Spin style={{ left: 0 }} size={Size.small} spinning={this.moreQuerying === true}>{this.getPagingOptionContent()}</Spin>,
        className: `${menuPrefixCls}-item ${menuPrefixCls}-item-more`,
        isLeaf: true,
        disabled: this.moreQuerying,
      });
    }

    // 渲染成单项选择还是多项选择组件以及空组件
    if (options && options.length && optGroups.length) {
      if (menuMode === MenuMode.single) {
        return (
          <SingleMenu
            {...menuProps}
            fieldNames={fieldNames}
            defaultFieldNames={defaultFieldNames}
            singleMenuStyle={singleMenuStyle}
            singleMenuItemStyle={singleMenuItemStyle}
            singlePleaseRender={singlePleaseRender}
            singleMenuItemRender={singleMenuItemRender}
            prefixCls={this.prefixCls}
            expandTrigger={expandTrigger}
            activeValue={selectedValues}
            selectedValues={selectedValueMultiple}
            options={optGroups}
            locale={{ pleaseSelect: $l('Cascader', 'please_select') }}
            onSelect={this.handleMenuSelect}
            isTabSelected={this.isClickTab}
            dropdownMenuColumnStyle={dropdownMenuStyleMerge}
            visible={this.popup}
          />
        );
      }
      return (
        <Menus
          {...menuProps}
          fieldNames={fieldNames}
          defaultFieldNames={defaultFieldNames}
          prefixCls={this.prefixCls}
          expandTrigger={expandTrigger}
          activeValue={selectedValues}
          selectedValues={selectedValueMultiple}
          options={optGroups}
          onSelect={this.handleMenuSelect}
          dropdownMenuColumnStyle={dropdownMenuStyleMerge}
          visible={this.popup}
        />
      );
    }
    return (
      <div key="no_data">
        <ul className={`${this.prefixCls}-menu`} style={{ ...{ height: 'auto' }, ...dropdownMenuStyleMerge }}>
          <li
            className={`${this.prefixCls}-menu-item ${this.prefixCls}-menu-item-disabled`}
          >
            {this.loading ? ' ' : this.getNotFoundContent()}
          </li>
        </ul>
      </div>
    );
  }

  getMenuItem({ record, text, value, isFilterSearch }: RenderProps): string | ReactNode {
    const {
      options,
      props: { optionRenderer },
    } = this;
    return optionRenderer
      ? optionRenderer({ dataSet: options, record, text, value, isFilterSearch })
      : text;
  }

  get searchable(): boolean {
    return !!this.observableProps.searchable;
  }

  get loading(): boolean {
    return this.options.status === DataSetStatus.loading;
  }

  isEditable(): boolean {
    return super.isEditable() && !!this.searchable;
  }

  getPopupContent(): ReactNode {
    const menu = (
      <Spin key="menu" spinning={this.loading}>
        {this.getMenu()}
      </Spin>
    );
    if (this.multiple) {
      return [
        <div key="check-all" className={`${this.prefixCls}-select-all-none`}>
          <span onClick={this.chooseAll}>{$l('Cascader', 'select_all')}</span>
          <span onClick={this.unChooseAll}>{$l('Cascader', 'unselect_all')}</span>
        </div>,
        menu,
      ];
    }
    return menu;
  }

  /**
   * 增加 popupContent 回调参数 用于控制对应交互
   */
  @autobind
  getPopupProps(): CascaderPopupContentProps {
    const { options, textField, field, record, valueField } = this;
    return {
      ...super.getPopupProps(),
      dataSet: options,
      textField,
      valueField,
      field,
      record,
      content: this.getPopupContent(),
    };
  }

  @autobind
  getPopupStyleFromAlign(target): CSSProperties | undefined {
    if (target) {
      if (this.props.dropdownMatchSelectWidth) {
        const { width } = target.getBoundingClientRect();
        this.setItemMenuWidth(width);
        return {
          minWidth: pxToRem(width, true)!,
        };
      }
      return undefined;
    }
  }

  getTriggerIconFont(): string {
    return this.searchable && this.isFocused ? 'search' : 'baseline-arrow_drop_down';
  }

  @autobind
  handleKeyDown(e) {
    if (!this.disabled && !this.readOnly) {
      switch (e.keyCode) {
        case KeyCode.RIGHT:
          this.handleKeyLeftRightNext(e, 1);
          break;
        case KeyCode.DOWN:
          this.handleKeyDownPrevNext(e, 1);
          break;
        case KeyCode.LEFT:
          this.handleKeyLeftRightNext(e, -1);
          break;
        case KeyCode.UP:
          this.handleKeyDownPrevNext(e, -1);
          break;
        case KeyCode.END:
        case KeyCode.PAGE_DOWN:
          this.handleKeyDownFirstLast(e, 1);
          break;
        case KeyCode.HOME:
        case KeyCode.PAGE_UP:
          this.handleKeyDownFirstLast(e, -1);
          break;
        case KeyCode.ENTER:
          this.handleKeyDownEnter(e);
          break;
        case KeyCode.ESC:
          this.handleKeyDownEsc(e);
          break;
        case KeyCode.SPACE:
          this.handleKeyDownSpace(e);
          break;
        default:
      }
    }
    super.handleKeyDown(e);
  }

  // 获取当前列第一个值和最后的值
  findTreeDataFirstLast(options, activeValue, direction) {
    const nowIndexList = activeValue.parent ? activeValue.parent.children : options;
    if (nowIndexList.length > 0 && direction > 0) {
      return nowIndexList[nowIndexList.length - 1];
    }
    if (nowIndexList.length > 0 && direction < 0) {
      return nowIndexList[0];
    }
    return activeValue;
  }

  // 按键第一个和最后一个的位置
  handleKeyDownFirstLast(e, direction: number) {
    stopEvent(e);
    if (isEmpty(toJS(this.activeValue))) {
      this.setActiveValue(this.options.treeData[0]);
    } else {
      const activeItem = this.findTreeDataFirstLast(this.options.treeData, this.activeValue, direction);
      if (!this.editable || this.popup) {
        this.setActiveValue(activeItem);
      }
    }
  }

  // 查找同级位置
  findTreeDataUpDown(options, value, direction, fn?: any) {
    const nowIndexList = value.parent ? value.parent.children : options;
    if (isArrayLike(nowIndexList)) {
      const nowIndex = fn !== undefined ? fn : nowIndexList.findIndex(ele => ele.value === value);
      const length = nowIndexList.length;
      if (nowIndex + direction >= length) {
        return nowIndexList[0];
      }
      if (nowIndex + direction < 0) {
        return nowIndexList[length - 1];
      }
      return nowIndexList[nowIndex + direction];
    }
    return value;
  }

  sameKeyRecordIndex(options: Record[], activeValue: Record, valueKey: string) {
    const nowIndexList = activeValue.parent ? activeValue.parent.children : options;
    return nowIndexList!.findIndex(ele => ele[valueKey] === activeValue[valueKey]);
  }

  // 上下按键判断
  handleKeyDownPrevNext(e, direction: number) {
    if (!this.editable) {
      if (isEmpty(toJS(this.activeValue))) {
        this.setActiveValue(this.options.treeData[0]);
      } else {
        this.setActiveValue(this.findTreeDataUpDown(this.options.treeData, this.activeValue, direction, this.sameKeyRecordIndex(this.options.treeData, this.activeValue, 'key')));
      }
      e.preventDefault();
    } else if (e === KeyCode.DOWN) {
      this.expand();
      e.preventDefault();
    }
  }

  // 查找相邻的节点
  findTreeParentChidren(_options, activeValue, direction) {
    if (direction > 0) {
      if (activeValue.children && activeValue.children.length > 0) {
        return activeValue.children[0];
      }
      return activeValue;
    }
    if (activeValue.parent) {
      return activeValue.parent;
    }
    return activeValue;
  }

  handleKeyLeftRightNext(e, direction: number) {
    if (!this.editable) {
      if (isEmpty(toJS(this.activeValue))) {
        this.setActiveValue(this.options.treeData[0]);
      } else {
        this.setActiveValue(this.findTreeParentChidren(this.options.treeData, this.activeValue, direction));
      }
      e.preventDefault();
    } else if (e === KeyCode.DOWN) {
      this.expand();
      e.preventDefault();
    }
  }

  handleKeyDownEnter(e) {
    if (this.popup && !this.editable) {
      const value = this.activeValue;
      if (this.isSelected(value) && this.multiple) {
        this.unChoose(value);
      } else if (value.children) {
        this.setPopup(true);
      } else if (value && !value.get(disabledField)) {
        this.choose(value);
      }
    }
    e.preventDefault();
  }

  handleKeyDownEsc(e) {
    if (this.popup) {
      e.preventDefault();
      this.collapse();
    }
  }

  handleKeyDownSpace(e) {
    if (!this.editable) {
      e.preventDefault();
      if (!this.popup) {
        this.expand();
      }
    }
  }

  @autobind
  handleBlur(e) {
    if (!e.isDefaultPrevented()) {
      super.handleBlur(e);
      this.resetFilter();
    }
  }

  expand() {
    const { options } = this;
    if (options && options.length) {
      super.expand();
    }
  }

  syncValueOnBlur(value) {
    if (!value && !this.multiple) {
      this.setValue(this.emptyValue);
    }
  }

  findByText(text): Record | undefined {
    const { textField, props: { changeOnSelect } } = this;
    const findTreeItem = (options, valueItem, index) => {
      let sameItemTreeNode;
      if (valueItem.length > 0) {
        sameItemTreeNode = options.find(ele => {
          return isSameLike(this.getRecordOrObjValue(ele, textField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], textField) : valueItem[index]);
        });
        if (sameItemTreeNode) {
          if (sameItemTreeNode.children && !(changeOnSelect && index === (valueItem.length - 1))) {
            return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
          }
          return sameItemTreeNode;
        }
      }
    };
    const textArray = text.split('/');
    if (textArray && textArray.length > 0) {
      if (this.options) {
        return findTreeItem(this.options.treeData, textArray, 0);
      }
    }
  }

  findByValue(value): Record | undefined {
    const { valueField, props: { changeOnSelect } } = this;
    const findTreeItem = (options, valueItem, index) => {
      let sameItemTreeNode;
      if (valueItem.length > 0) {
        sameItemTreeNode = options.find(ele => {
          return isSameLike(this.getRecordOrObjValue(ele, valueField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], valueField) : valueItem[index]);
        });
        if (sameItemTreeNode) {
          if (sameItemTreeNode.children && !(changeOnSelect && index === (valueItem.length - 1))) {
            return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
          }
          return sameItemTreeNode;
        }
      }
    };
    value = getSimpleValue(value, valueField);
    if (this.options && value) {
      return findTreeItem(toJS(this.options.treeData), toJS(value), 0);
    }
  }

  isSelected(record: Record) {
    const { valueField } = this;
    // 多值处理
    if (this.multiple) {
      return this.getValues().some(value => {
        const simpleValue = getSimpleValue(value, valueField);
        return arraySameLike(this.treeValueToArray(record), toJS(simpleValue));
      });
    }

    const simpleValue = this.getValues();
    return arraySameLike(this.treeValueToArray(record), simpleValue);
  }

  generateComboOption(value: string | any[], callback?: (text: string) => void): void {
    const { textField } = this;
    if (value) {
      if (isArrayLike(value)) {
        value.forEach(v => !isNil(v) && this.generateComboOption(v));
      } else {
        const found = this.findByText(value) || this.findByValue(value);
        if (found) {
          const text = found.get(textField);
          if (text !== value && callback) {
            callback(text);
          }
        }
      }
    }
  }

  handlePopupAnimateAppear() {
    // noop
  }

  @autobind
  getValueKey(v) {
    if (isArrayLike(v)) {
      return v.map(this.getValueKey, this).join(',');
    }
    const autoType = this.getProp('type') === FieldType.auto;
    const value = getSimpleValue(v, this.valueField);
    return autoType && !isNil(value) ? value.toString() : value;
  }

  @autobind
  handlePopupAnimateEnd(_key, _exists) {
    // noop
  }

  // 触发下拉框事件,增加了触发方式判断优化trigger类型
  @autobind
  handleMenuSelect(targetOption, _menuIndex, isClickTab, trigger) {
    const { onChoose, onUnChoose, changeOnSelect, async, loadData } = this.props;
    if (!targetOption || targetOption.disabled) {
      return;
    }
    if (targetOption.key === MORE_KEY) {
      const { options } = this;
      runInAction(() => {
        this.moreQuerying = true;
        options.queryMore(options.currentPage + 1)
          .finally(() => {
            runInAction(() => this.moreQuerying = false);
          });
      });
      return;
    }
    if (changeOnSelect && ExpandTrigger.dblclick === trigger) {
      this.setPopup(false);
      return;
    }
    // 单选模式
    if (!this.isSelected(targetOption.value) || isClickTab || !this.multiple) {
      if (targetOption.children) {
        this.setPopup(true);
        this.setActiveValue(targetOption.value);
        this.setIsClickTab(isClickTab);
        if (changeOnSelect && ExpandTrigger.click === trigger) {
          this.choose(targetOption.value, true);
        }
        if (onChoose) {
          onChoose(
            this.processRecordToObject(targetOption.value),
            targetOption.value,
          );
        }
      } else {
        if (!targetOption.isLeaf && (async || !!loadData)) {
          const loadDataCallBack = async ? this.handleLoadData : loadData;
          if (changeOnSelect) {
            this.choose(targetOption.value, true);
          }
          this.setPopup(true);
          this.setActiveValue(targetOption.value);
          this.setIsClickTab(isClickTab);
          loadDataCallBack!(targetOption);
          return;
        }
        if (!isClickTab) {
          this.setActiveValue(targetOption.value);
          this.choose(targetOption.value);
          if (onChoose) {
            onChoose(
              this.processRecordToObject(targetOption.value),
              targetOption.value,
            );
          }
        } else {
          this.setPopup(true);
        }
        this.setIsClickTab(isClickTab);
      }
      // 多选模式
    } else {
      if (ExpandTrigger.hover === trigger) {
        this.setActiveValue(targetOption.value);
        return;
      }
      this.setactiveEmpty();
      this.unChoose(targetOption.value);
      if (onUnChoose) {
        onUnChoose(
          this.processRecordToObject(targetOption.value),
          targetOption.value,
        );
      }
    }
  }

  setactiveEmpty() {
    if (this.multiple) {
      this.setActiveValue([]);
    } else {
      this.setActiveValue({});
    }
  }

  handleOptionSelect(record: Record) {
    this.prepareSetValue(this.processRecordToObject(record));
  }

  handleOptionUnSelect(record: Record) {
    const newValue = this.treeValueToArray(record);
    this.removeValue(newValue, -1);
  }

  // 移除所选值
  @action
  removeValues(values: any[], index = 0) {
    if (!this.multiple) {
      const oldValues = this.getValues();
      if (this.getValueKey(oldValues) === this.getValueKey(values[0])) {
        if (index === -1) {
          this.afterRemoveValue(values[0], 1);
          this.setValue([]);
        }
      }
    }
    super.removeValues(values, index);
    this.setactiveEmpty();
  }

  handleSearch(_text?: string) {
    // noop
  }

  @action
  setText(text?: string): void {
    super.setText(text);
    if (this.searchable) {
      this.doSearch(text);
    }
  }

  doSearch = debounce(value => {
    if (isString(this.searchMatcher)) {
      this.searchRemote(value);
    }
    this.handleSearch(value);
  }, 500);

  searchRemote(value) {
    const { field, searchMatcher } = this;
    if (field && isString(searchMatcher)) {
      field.setLovPara(searchMatcher, value === '' ? undefined : value);
    }
  }

  searchData(data: Record[], text?: string): Record[] {
    const {
      searchable,
      searchMatcher,
    } = this;
    return searchable && text && typeof searchMatcher === 'function' ? data.filter((r) => {
      return this.matchRecordBySearch(r, text);
    }) : data;
  }

  @autobind
  matchRecordBySearch(record: Record, text?: string): boolean {
    const {
      textField,
      valueField,
      searchable,
      searchMatcher,
    } = this;
    return !(searchable && text && typeof searchMatcher === 'function') || searchMatcher({
      record,
      text,
      textField,
      valueField,
    });
  }

  @autobind
  @action
  handleChange(e) {
    const { value } = e.target;
    this.setText(value);
    if (this.observableProps.combo) {
      this.generateComboOption(value, text => this.setText(text));
    }
    if (!this.popup) {
      this.expand();
    }
  }

  processRecordToObject(record: Record) {
    const { primitive } = this;
    if (record && record.dataSet!.getFromTree(0)) {
      return primitive ? this.treeValueToArray(record) : this.treeToArray(record);
    }
  }

  /**
   * 返回tree 的值的列表方法
   * @param record
   * @param allArray
   */
  treeValueToArray(record: Record | ProcessOption, allArray?: string[]) {
    const { valueField } = this;
    if (!allArray) {
      allArray = [];
    }
    if (record) {
      allArray = [this.getRecordOrObjValue(record, valueField), ...allArray];
    }
    if (record.parent) {
      return this.treeValueToArray(record.parent, allArray);
    }
    return allArray;
  }

  /**
   * 返回tree 的值的列表方法
   * @param record
   * @param allArray
   */
  treeTextToArray(record: Record, allArray?: string[]) {
    const { textField } = this;
    if (!allArray) {
      allArray = [];
    }
    if (record) {
      allArray = [this.getRecordOrObjValue(record, textField), ...allArray];
    }
    if (record.parent) {
      return this.treeTextToArray(record.parent, allArray);
    }
    return allArray;
  }

  /**
   * 返回tree 的值的列表方法
   * @param record
   * @param allArray
   */
  treeToArray(record: Record, allArray?: Record[]) {
    if (!allArray) {
      allArray = [];
    }
    if (record) {
      allArray = [record.toData(), ...allArray];
    }
    if (record.parent) {
      return this.treeToArray(record.parent, allArray);
    }
    return allArray;
  }

  removeObjParentChild(obj: any) {
    if (isPlainObject(obj)) {
      const cloneObj = cloneDeep(toJS(obj));
      delete cloneObj.parent;
      delete cloneObj.children;
      return cloneObj;
    }
    return obj;
  }

  processObjectValue(value, textField) {
    if (!isNil(value)) {
      const found = this.findByValue(value);
      if (found && isArrayLike(value)) {
        return this.treeTextToArray(found);
      }
      if (isPlainObject(value)) {
        return ObjectChainValue.get(value, textField);
      }
    }
  }

  processLookupValue(value) {
    const { field, textField, primitive } = this;
    const processvalue = this.processObjectValue(value, textField);
    if (isArrayLike(processvalue)) {
      return processvalue.join('/');
    }
    if (primitive && field) {
      return super.processValue(field.getText(value, undefined, this.record));
    }
  }

  // 处理value
  processValue(value: any): ReactNode {
    const text = this.processLookupValue(value);
    if (isEmptyUtil(text)) {
      if (isPlainObject(value)) {
        return ObjectChainValue.get(value, this.valueField) || '';
      }
      return super.processValue(value);
    }
    return text;
  }

  toValueString(value: any): string | undefined {
    if (isArrayLike(value)) {
      return value.join('/');
    }
    return value;
  }

  @action
  clear() {
    this.setText(undefined);
    this.setActiveValue({});
    super.clear();
  }

  addValue(...values) {
    if (this.multiple) {
      const oldValues = this.getValues();
      if (values.length) {
        const oldValuesJS = oldValues.map(item => toJS(item));
        this.setValue([...oldValuesJS, ...values]);
      } else if (!oldValues.length) {
        this.setValue(this.emptyValue);
      }
    } else {
      this.setValue(values.pop());
    }
  }

  resetFilter() {
    this.setText(undefined);
    this.forcePopupAlign();
  }

  @autobind
  reset() {
    super.reset();
    this.resetFilter();
  }

  unChoose(record?: Record | null) {
    if (record) {
      this.handleOptionUnSelect(record);
    }
  }

  /**
   *
   * @param record
   * @param visible
   */
  choose(record?: Record | null, visible?: boolean) {
    if (!this.multiple && !visible) {
      this.collapse();
    }
    if (record) {
      this.handleOptionSelect(record);
    }
  }

  @autobind
  chooseAll() {
    const chooseAll: any[] = [];
    this.options.forEach(item => {
      if (isEmpty(item.children) && !item.get(disabledField)) {
        chooseAll.push(this.processRecordToObject(item));
      }
    }, this);
    this.setValue(chooseAll);
  }

  @autobind
  unChooseAll() {
    this.clear();
  }

  @autobind
  async handlePopupHiddenChange(hidden: boolean) {
    this.setIsClickTab(false);
    if (!hidden) {
      this.forcePopupAlign();
    }
    super.handlePopupHiddenChange(hidden);
  }

  async processSelectedData() {
    const values = this.getValues();
    const { field } = this;
    if (field) {
      await field.ready();
    }
    const {
      observableProps: { combo },
    } = this;
    runInAction(() => {
      const newValues = values.filter(value => {
        const record = this.findByValue(value);
        return !!record;
      });
      if (this.text && combo) {
        this.generateComboOption(this.text);
      }
      if (
        field &&
        field.get('cascadeMap') &&
        !isEqual(newValues, values)
      ) {
        this.setValue(this.multiple ? newValues : newValues[0]);
      }
    });
  }

  renderLengthInfo(): ReactNode {
    return undefined;
  }
}

@observer
export default class ObserverCascader extends Cascader<CascaderProps> {
  static defaultProps = Cascader.defaultProps;
}
