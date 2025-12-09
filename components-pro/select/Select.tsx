import React, { CSSProperties, isValidElement, Key, ReactElement, ReactNode } from 'react';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import defer from 'lodash/defer';
import isPlainObject from 'lodash/isPlainObject';
import { observer } from 'mobx-react';
import { action, computed, get, IReactionDisposer, isArrayLike, isObservableObject, observable, reaction, runInAction, toJS } from 'mobx';
import classNames from 'classnames';
import Menu, { Item, ItemGroup } from 'choerodon-ui/lib/rc-components/menu';
import Tag from 'choerodon-ui/lib/tag';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { Tooltip as OptionTooltip } from '../core/enum';
import TriggerField, { TriggerFieldPopupContentProps, TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import Option, { OptionProps } from '../option/Option';
import OptGroup from '../option/OptGroup';
import { DataSetStatus, FieldType } from '../data-set/enum';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import { preventDefault, stopEvent } from '../_util/EventManager';
import normalizeOptions, { OTHER_OPTION_PROPS } from '../option/normalizeOptions';
import { $l } from '../locale-context';
import ObjectChainValue from '../_util/ObjectChainValue';
import isEmpty from '../_util/isEmpty';
import isSame from '../_util/isSame';
import isSameLike from '../_util/isSameLike';
import { Renderer } from '../field/FormField';
import isIE from '../_util/isIE';
import Field from '../data-set/Field';
import { ButtonProps } from '../button/Button';
import { getIf } from '../data-set/utils';
import ObserverTextField, { TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { ValueChangeAction } from '../text-field/enum';
import { LabelLayout } from '../form/enum';
import { isFieldValueEmpty } from '../field/utils';
import { Action } from '../trigger/enum';
import OverflowTip from '../overflow-tip';

function updateActiveKey(menu: Menu, activeKey: string) {
  const store = menu.getStore();
  const menuId = menu.getEventKey();
  const state = store.getState();
  store.setState({
    activeKey: {
      ...state.activeKey,
      [menuId]: activeKey,
    },
  });
}

function defaultSearchMatcher({ record, text, textField }) {
  if (record.get(textField) && isString(record.get(textField))) {
    return record.get(textField).toLowerCase().indexOf(text.toLowerCase()) !== -1;
  }
}

export function isSearchTextEmpty(text: string | string[] | undefined): text is undefined {
  return isArrayLike(text) ? !text.length : !text;
}

export const DISABLED_FIELD = '__disabled';
export const MORE_KEY = '__more__';

function defaultOnOption({ record }) {
  return {
    disabled: record.get(DISABLED_FIELD),
  };
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

export type onOptionProps = { dataSet: DataSet; record: Record };

export type SearchMatcher = string | ((props: SearchMatcherProps) => boolean);

export interface SearchMatcherProps {
  record: Record;
  text: string | string[];
  value: any;
  props: any;
  textField: string;
  valueField: string;
}

export type ParamMatcher = string | ((props: ParamMatcherProps) => string | object);

export interface ParamMatcherProps {
  record: Record | undefined;
  key: string;
  text: string | string[] | undefined;
  textField: string;
  valueField: string;
}

export interface SelectPopupContentProps extends TriggerFieldPopupContentProps {
  dataSet: DataSet;
  textField: string;
  valueField: string;
  field?: Field | undefined;
  record?: Record | undefined;
  content: ReactNode;
}

export interface SelectProps extends TriggerFieldProps<SelectPopupContentProps> {
  /**
   * 复合输入值
   * @default false
   */
  combo?: boolean;
  /**
   * 常用项
   */
  commonItem?: string[];
  /**
   * 常用项标签超出最大数量时的占位描述
   */
  maxCommonTagPlaceholder?: ReactNode | ((omittedValues: any[]) => ReactNode);
  /**
   * 常用项标签最大数量
   */
  maxCommonTagCount?: number;
  /**
   * 常用项标签文案最大长度
   */
  maxCommonTagTextLength?: number;
  /**
   * 可搜索
   * @default false
   */
  searchable?: boolean;
  /**
   * 开启搜索时，是否保留查询参数
   * @default true
   */
  reserveParam?: boolean;
  /**
   * 搜索框在 Popup 中显示
   * @default false
   */
  searchFieldInPopup?: boolean;
  /**
   * 搜索框的属性
   */
  searchFieldProps?: TextFieldProps;
  /**
   * 搜索匹配器。 当为字符串时，作为lookup的参数名来重新请求值列表。
   */
  searchMatcher?: SearchMatcher;
  /**
   * 参数匹配器。 当为字符串时，参数拼接。
   */
  paramMatcher?: ParamMatcher;
  /**
   * 选项过滤
   * @param {Record} record
   * @return {boolean}
   */
  optionsFilter?: (record: Record, index: number, records: Record[]) => boolean;
  /**
   * 当选项改变时，检查并清除不在选项中的值
   * @default true
   */
  checkValueOnOptionsChange?: boolean;
  /**
   * 下拉框匹配输入框宽度
   * @default true
   */
  dropdownMatchSelectWidth?: boolean;
  /**
   * 下拉框虚拟滚动
   * @default true
   */
  virtual?: boolean;
  /**
   * 多选时显示全选按钮;
   * @default true
   */
  selectAllButton?: boolean | ((buttons: ButtonProps[]) => ButtonProps[]);
  /**
   * 多选是否开启反选
   * @default false
   */
  reverse?: boolean;
  /**
   * 下拉框菜单样式名
   */
  dropdownMenuStyle?: CSSProperties;
  /**
   * 选项数据源
   */
  options?: DataSet;
  /**
   * 是否为原始值
   * true - 选项中valueField对应的值
   * false - 选项值对象
   */
  primitiveValue?: boolean;
  /**
   * 渲染Option文本的钩子
   * @example
   * ```js
   * <Select
   *   {...props}
   *   optionRenderer={({ record, text, value }) => text + '$'}
   * />
   * ```
   */
  optionRenderer?: Renderer;
  /**
   * 渲染 group 文本的钩子
   */
  groupRenderer?: Renderer;
  /**
   * 渲染分页 Item 内容
   */
  pagingOptionContent?: string | ReactNode;
  /**
   * 当下拉列表为空时显示的内容
   */
  notFoundContent?: ReactNode;
  /**
   * 设置选项属性，如 disabled;
   */
  onOption: (props: onOptionProps) => OptionProps;
  /**
   * 下拉时自动重新查询
   */
  noCache?: boolean;
  /**
   * 用tooltip显示选项内容
   * 可选值：`none` `always` `overflow`
   */
  optionTooltip?: OptionTooltip;
  /**
   * 是否默认高亮第一个选项
   * @default true
   */
  defaultActiveFirstOption?: boolean;
  children?: ReactNode;
  /**
   * 是否开启选项滚动加载
   */
  scrollLoad?: boolean;
  /**
   * popup 弹窗中的选项是否显示 combo 复合值;
   * 当不展示复合值时, defaultActiveFirstOption 无效, enter 或者 失焦选中复合值;
   */
  popupShowComboValue?: boolean;
  /**
   * 可输入时，下拉框中是否显示输入提示
   */
  showInputPrompt?: boolean | ReactNode | (({ searchable, combo }) => boolean | ReactNode);
}

export class Select<T extends SelectProps = SelectProps> extends TriggerField<T> {
  static displayName = 'Select';

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'select',
    combo: false,
    checkValueOnOptionsChange: true,
    onOption: defaultOnOption,
    selectAllButton: true,
    popupShowComboValue: true,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  static __PRO_SELECT = true;

  @observable comboOptions?: DataSet;

  menu?: Menu | null;

  @observable $searchText?: string | string[] | undefined;

  @observable moreQuerying?: boolean;

  get range(): boolean | [string, string] {
    if (this.multiple && super.range) {
      return false;
    }
    return super.range;
  }

  get searchText(): string | string[] | undefined {
    if (this.isSearchFieldInPopup()) {
      return this.$searchText;
    }
    return this.text;
  }

  set searchText(searchText: string | string[] | undefined) {
    this.$searchText = searchText;
  }

  get searchMatcher(): SearchMatcher {
    const { searchMatcher = defaultSearchMatcher } = this.observableProps;
    return searchMatcher;
  }

  get paramMatcher(): ParamMatcher {
    const { paramMatcher } = this.observableProps;
    return paramMatcher;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Select', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  get textField(): string {
    return this.getProp('textField') || 'meaning';
  }

  get valueField(): string {
    return this.getProp('valueField') || 'value';
  }

  get currentComboOption(): Record | undefined {
    const { comboOptions } = this;
    return comboOptions && comboOptions.filter(record => !this.isSelected(record))[0];
  }

  @computed
  get filteredOptions(): Record[] {
    const { optionsWithCombo, optionsFilter } = this;
    return this.searchData(optionsFilter ? optionsWithCombo.filter(optionsFilter) : optionsWithCombo);
  }

  @computed
  get optionsWithCombo(): Record[] {
    const { comboOptions, popupShowComboValue } = this;
    return comboOptions && popupShowComboValue ? [...comboOptions.data, ...this.cascadeOptions] : this.cascadeOptions;
  }

  @computed
  get cascadeOptions(): Record[] {
    const { record, field, options, searchMatcher } = this;
    const { data } = options;
    if (field && !isString(searchMatcher)) {
      const cascadeMap = field.get('cascadeMap', this.record);
      if (cascadeMap) {
        if (record) {
          const cascades = Object.keys(cascadeMap);
          return data.filter(item =>
            cascades.every(cascade => {
              if (isArrayLike(record.get(cascadeMap[cascade]))) {
                return record.get(cascadeMap[cascade]).some(parentValue => isSameLike(parentValue, item.get(cascade)));
              }
              return isSameLike(record.get(cascadeMap[cascade]), item.get(cascade));
            }),
          );
        }
        return [];
      }
    }
    return data;
  }

  get searchable(): boolean {
    const { searchable = this.getContextConfig('selectSearchable') } = this.observableProps;
    return !!searchable;
  }

  get reserveParam(): boolean {
    const { reserveParam = this.getContextConfig('selectReserveParam') } = this.observableProps;
    return reserveParam;
  }

  get multiple(): boolean {
    return !!this.getProp('multiple');
  }

  get menuMultiple(): boolean {
    return this.multiple;
  }

  @computed
  get options(): DataSet {
    const {
      field,
      textField,
      valueField,
      multiple,
      observableProps: { children, options },
    } = this;
    return (
      options ||
      (field && field.getOptions(this.record)) ||
      normalizeOptions({ textField, valueField, disabledField: DISABLED_FIELD, multiple, children, getConfig: this.getContextConfig })
    );
  }

  get primitive(): boolean {
    return this.observableProps.primitiveValue !== false && this.getProp('type') !== FieldType.object;
  }

  get scrollLoad(): boolean | undefined {
    const { displayName } = this.constructor as any;
    const { scrollLoad } = this.observableProps;
    return displayName === 'Select' && (!isNil(scrollLoad) ? scrollLoad : this.getContextConfig('selectScrollLoad'));
  }

  get popupShowComboValue(): boolean {
    const { popupShowComboValue } = this.observableProps;
    return !!popupShowComboValue;
  }

  get inputPromptText(): string | undefined {
    const { searchable, observableProps: { combo } } = this;
    if (searchable && combo) {
      return $l('Select', 'input_prompt');
    }
    if (searchable) {
      return $l('Select', 'input_prompt_searchable');
    }
    if (combo) {
      return $l('Select', 'input_prompt_combo');
    }
  }

  get showInputPrompt(): ReactNode | undefined {
    const { searchable, observableProps: { combo, showInputPrompt: showInputPromptProp } } = this;
    const showInputPrompt = !isNil(showInputPromptProp) ? showInputPromptProp : this.getContextConfig('selectShowInputPrompt');
    if (!searchable && !combo) return;
    if (showInputPrompt === true) {
      return this.inputPromptText;
    }
    if (isFunction(showInputPrompt)) {
      const result = showInputPrompt({ searchable, combo });
      if (result === true) {
        return this.inputPromptText;
      }
      if (!isNil(result) && result !== false) {
        return result;
      }
    } else if (!isNil(showInputPrompt) && showInputPrompt !== false) {
      return showInputPrompt;
    }
  }

  checkValueReaction?: IReactionDisposer;

  checkComboReaction?: IReactionDisposer;

  @autobind
  saveMenu(node) {
    this.menu = node;
  }

  @autobind
  handlePopupSaveRef(popup) {
    if (!popup || !popup.element || !this.scrollLoad) return;
    let listDom = popup.element.querySelector(`.${this.getMenuPrefixCls()}`);
    if (this.virtual && listDom) {
      listDom = listDom.firstChild;
    }
    if (listDom && listDom.addEventListener) {
      listDom.addEventListener("scroll", this.handleScroll);
      this.handleScroll({ target: listDom });
    }
  }

  handleScroll = ({ target }) => {
    if (this.moreQuerying) {
      return;
    }
    const {
      options,
    } = this;
    const { strictPageSize = this.getContextConfig('strictPageSize') } = options.props;
    const showQueryMore = (strictPageSize && options.paging && options.currentPage < options.totalPage) || (options.cacheAllData.length > options.originalData.length);
    if (showQueryMore && target) {
      const listDom = target;
      if ((listDom.scrollTop + listDom.clientHeight + 32) >= listDom.scrollHeight) {
        this.handleMenuClick({
          key: MORE_KEY,
          item: {
            props: { value: null },
          },
        });
      }
    }
  }

  getSearchFieldProps(): TextFieldProps {
    const { searchFieldProps = {} } = this.props;
    return searchFieldProps;
  }

  isSearchFieldInPopup(): boolean | undefined {
    const { searchFieldInPopup } = this.props;
    return searchFieldInPopup;
  }

  isEmpty() {
    return (this.isEditableLike() || isEmpty(this.text)) && isFieldValueEmpty(this.getValue(), this.range, this.multiple, this.valueField, this.textField) && this.isRenderEmpty();
  }

  isEditable(): boolean {
    return super.isEditable() && ((this.searchable && !this.isSearchFieldInPopup()) || !!this.observableProps.combo);
  }

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
      delete this.checkValueReaction;
    }
  }

  clearCheckCombo() {
    if (this.checkComboReaction) {
      this.checkComboReaction();
      delete this.checkComboReaction;
    }
  }

  clearReaction() {
    this.clearCheckValue();
    this.clearCheckCombo();
  }

  componentWillMount() {
    const { checkValueOnOptionsChange, combo } = this.props;
    if (checkValueOnOptionsChange) {
      this.checkValue();
    }
    if (combo) {
      this.checkCombo();
      this.generateComboOption(this.getValue());
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.doSearchDebounce.cancel();
    this.clearReaction();

    if (this.scrollLoad && this.trigger && this.trigger.popup && this.trigger.popup.element) {
      let listDom = this.trigger.popup.element.querySelector(`.${this.getMenuPrefixCls()}`);
      if (this.virtual && listDom) {
        listDom = listDom.firstChild;
      }
      if (listDom && listDom.removeEventListener) {
        listDom.removeEventListener("scroll", this.handleScroll);
      }
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    const { checkValueOnOptionsChange, combo } = this.props;
    if (checkValueOnOptionsChange && !nextProps.checkValueOnOptionsChange) {
      this.clearCheckValue();
    }
    if (!checkValueOnOptionsChange && nextProps.checkValueOnOptionsChange) {
      this.checkValue();
    }
    if (combo && !nextProps.combo) {
      this.removeComboOptions();
      this.clearCheckCombo();
    }
    if (!combo && nextProps.combo) {
      this.checkCombo();
      if ('value' in nextProps) {
        this.generateComboOption(nextProps.value);
      }
    }
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    this.forcePopupAlign();
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'searchable',
      'reserveParam',
      'searchMatcher',
      'searchFieldInPopup',
      'searchFieldProps',
      'paramMatcher',
      'combo',
      'commonItem',
      'maxCommonTagPlaceholder',
      'maxCommonTagCount',
      'maxCommonTagTextLength',
      'multiple',
      'value',
      'name',
      'options',
      'optionsFilter',
      'dropdownMatchSelectWidth',
      'virtual',
      'dropdownMenuStyle',
      'checkValueOnOptionsChange',
      'primitiveValue',
      'optionRenderer',
      'notFoundContent',
      'pagingOptionContent',
      'onOption',
      'noCache',
      'reverse',
      'selectAllButton',
      'optionTooltip',
      'defaultActiveFirstOption',
      'scrollLoad',
      'popupShowComboValue',
      'showInputPrompt',
    ]);
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      children: props.children,
      options: props.options,
      combo: props.combo,
      commonItem: props.commonItem,
      primitiveValue: props.primitiveValue,
      searchMatcher: props.searchMatcher,
      paramMatcher: props.paramMatcher,
      searchable: props.searchable,
      reserveParam: props.reserveParam,
      dropdownMatchSelectWidth: props.dropdownMatchSelectWidth,
      virtual: props.virtual,
      defaultActiveFirstOption: props.defaultActiveFirstOption,
      selectReverse: props.reverse,
      optionsFilter: props.optionsFilter,
      scrollLoad: props.scrollLoad,
      popupShowComboValue: props.popupShowComboValue,
      showInputPrompt: props.showInputPrompt,
    };
  }

  getMenuPrefixCls() {
    return `${this.prefixCls}-dropdown-menu`;
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

  getPagingOptionContent() {
    const { pagingOptionContent } = this.props;
    if (pagingOptionContent !== undefined) {
      return pagingOptionContent;
    }
    return this.getContextConfig('selectPagingOptionContent');
  }

  getOtherNextNode(): ReactNode {
    const { commonItem } = this.observableProps;
    if (commonItem) {
      const { options } = this;
      if (!options) {
        return undefined;
      }
      const {
        textField,
        valueField,
        props: { maxCommonTagCount, maxCommonTagPlaceholder, maxCommonTagTextLength },
      } = this;
      const values = this.getValues();
      const valueLength = commonItem.length;
      const tags = commonItem.slice(0, maxCommonTagCount).map((item) => {
        let text = item;
        let textRecord: Record;
        options.map((record) => {
          if (record.get(valueField) === item) {
            text = maxCommonTagTextLength &&
            isString(record.get(textField)) &&
            record.get(textField).length > maxCommonTagTextLength
              ? `${record.get(textField).slice(0, maxCommonTagTextLength)}...`
              : record.get(textField);
            textRecord = record;
          }
          return null;
        });
        return (
          <Tag
            key={item}
            className={values.includes(item) ? `${this.prefixCls}-common-item ${this.prefixCls}-common-item-selected` : `${this.prefixCls}-common-item`}
            // @ts-ignore
            onClick={() => this.handleCommonItemClick(textRecord)}
          >
            {text}
          </Tag>
        );
      });
      if (maxCommonTagCount && valueLength > maxCommonTagCount) {
        let content: ReactNode = `+ ${valueLength - Number(maxCommonTagCount)} ...`;
        if (maxCommonTagPlaceholder) {
          const omittedValues = commonItem.slice(maxCommonTagCount, valueLength);
          content =
            typeof maxCommonTagPlaceholder === 'function'
              ? maxCommonTagPlaceholder(omittedValues)
              : maxCommonTagPlaceholder;
        }
        tags.push(
          <Tag className={`${this.prefixCls}-common-item`} key="maxCommonTagPlaceholder">
            {content}
          </Tag>,
        );
      }
      return (
        <div className={`${this.prefixCls}-common-item-wrapper`}>
          <span className={`${this.prefixCls}-common-item-label`}>{$l('Select', 'common_item')}</span>
          {tags}
        </div>
      );
    }
  }

  getMenuItem({ record, text, value }): string | ReactNode {
    const {
      options,
      props: { optionRenderer },
    } = this;
    return optionRenderer
      ? optionRenderer({ dataSet: options, record, text, value })
      : text;
  }

  @autobind
  getMenu(menuProps: object = {}): ReactNode {
    const {
      options,
      props: { groupRenderer },
    } = this;
    if (!options) {
      return null;
    }
    const { getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
    const {
      disabled: menuDisabled,
      textField,
      valueField,
      props: { dropdownMenuStyle, onOption, optionTooltip = getTooltip('select-option') },
    } = this;
    const groups = options.getGroups();
    const optGroups: ReactElement<any>[] = [];
    const selectedKeys: Key[] = [];
    /**
     * fixed when ie the scroll width would cover the item width
     */
    const IeMenuStyle = !this.dropdownMatchSelectWidth && isIE() ? { padding: '.08rem' } : {};
    const IeItemStyle = !this.dropdownMatchSelectWidth && isIE() ? { overflow: 'visible' } : {};
    const optGroupKeyMap: Map<ReactNode, string> = new Map();
    this.filteredOptions.forEach(record => {
      let previousGroup: ReactElement<any> | undefined;
      groups.every(field => {
        const label = record.get(field);
        let renderLable: ReactNode = toJS(label);
        if (groupRenderer && typeof groupRenderer === 'function') {
          renderLable = groupRenderer({ record, dataSet: options, text: label, value: label });
        }
        if (label !== undefined) {
          let groupKey = optGroupKeyMap.get(label);
          if (!groupKey) {
            groupKey = typeof label === 'object'
              ? `group-${record.id}-${field}`
              : `group-${label}`;
            optGroupKeyMap.set(label, groupKey);
          }
          if (!previousGroup) {
            previousGroup = optGroups.find(item => item.key === groupKey);
            if (!previousGroup) {
              previousGroup = (
                <ItemGroup key={groupKey} title={renderLable}>
                  {[]}
                </ItemGroup>
              );
              optGroups.push(previousGroup);
            }
          } else {
            const { children } = previousGroup.props;
            previousGroup = children.find(item => item.key === groupKey);
            if (!previousGroup) {
              previousGroup = (
                <ItemGroup key={groupKey} title={renderLable}>
                  {[]}
                </ItemGroup>
              );
              children.push(previousGroup);
            }
          }
          return true;
        }
        return false;
      });
      const value = record.get(valueField);
      const text = record.get(textField);
      const optionProps = onOption({ dataSet: options, record });
      const key: Key = getItemKey(record, text, value);
      if (!('selectedKeys' in menuProps) && this.isSelected(record)) {
        selectedKeys.push(key);
      }
      const itemContent = this.getMenuItem({ record, text, value });
      const recordValues = record.get(OTHER_OPTION_PROPS) || {};
      const itemProps = {
        ...recordValues,
        style: {
          ...IeItemStyle,
          ...recordValues.style,
        },
        key,
        value: record,
        disabled: menuDisabled,
        tooltip: optionTooltip,
        tooltipTheme: getTooltipTheme('select-option'),
        tooltipPlacement: getTooltipPlacement('select-option'),
      };
      const mergedProps = optionProps ? {
        ...optionProps,
        ...itemProps,
        className: classNames(optionProps.className, itemProps.className, {
          [`${this.prefixCls}-current`]: record.isCurrent,
        }),
        style: {
          ...optionProps.style,
          ...itemProps.style,
        },
        disabled: itemProps.disabled || optionProps.disabled,
      } : itemProps;
      const option: ReactElement = (
        <Item {...mergedProps}>
          {toJS(itemContent)}
        </Item>
      );
      if (previousGroup) {
        const { children } = previousGroup.props;
        children.push(option);
      } else {
        optGroups.push(option);
      }
    });
    if (!optGroups.length) {
      optGroups.push(
        <Item key="no_data" disabled checkable={false}>
          {this.loading ? ' ' : this.getNotFoundContent()}
        </Item>,
      );
    }
    const menuPrefix = this.getMenuPrefixCls();
    const { strictPageSize = this.getContextConfig('strictPageSize') } = options.props;
    const showQueryMore = (strictPageSize && options.paging && options.currentPage < options.totalPage) || (options.cacheAllData.length > options.originalData.length);
    return (
      <Menu
        virtual={this.virtual}
        ref={this.saveMenu}
        disabled={menuDisabled}
        defaultActiveFirst={this.defaultActiveFirstOption}
        forceClearActiveKey={this.forceClearActiveKey}
        multiple={this.menuMultiple}
        selectedKeys={selectedKeys}
        prefixCls={menuPrefix}
        onClick={this.handleMenuClick}
        onMouseDown={preventDefault}
        style={{ ...IeMenuStyle, ...dropdownMenuStyle }}
        focusable={false}
        {...menuProps}
      >
        {optGroups}
        {
          showQueryMore && (
            <Item
              disabled={this.moreQuerying}
              key={MORE_KEY}
              checkable={false}
              className={`${menuPrefix}-item-more`}
            >
              <Spin style={{ left: 0 }} size={Size.small} spinning={this.moreQuerying === true}>
                {this.getPagingOptionContent()}
              </Spin>
            </Item>
          )
        }
      </Menu>
    );
  }

  /**
   * 增加lov popupContent 回调参数 用于控制对应交互
   */
  @autobind
  getPopupProps(): SelectPopupContentProps {
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

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    const { multiple, prefixCls } = this;
    return classNames(defaultClassName, {
      [`${prefixCls}-popup-multiple`]: multiple,
      [`${prefixCls}-popup-single`]: !multiple,
    });
  }

  get dropdownMatchSelectWidth(): boolean | undefined {
    const { dropdownMatchSelectWidth = this.getContextConfig('dropdownMatchSelectWidth') } = this.observableProps;
    return dropdownMatchSelectWidth;
  }

  get virtual(): boolean | undefined {
    const { virtual = false } = this.observableProps;
    return virtual;
  }

  /**
   * 每次刷新后清除 menu 的 activeKey
   */
  get forceClearActiveKey(): boolean {
    const { popupShowComboValue, observableProps: { combo } } = this;
    return combo && !popupShowComboValue;
  }

  get defaultActiveFirstOption(): boolean | undefined {
    if (this.forceClearActiveKey) {
      return false;
    }
    const { defaultActiveFirstOption = this.getContextConfig('defaultActiveFirstOption') } = this.observableProps;
    return defaultActiveFirstOption && this.options.currentPage === 1 && !this.moreQuerying;
  }

  get optionsFilter(): (record: Record, index: number, records: Record[]) => boolean {
    const { optionsFilter = this.getContextConfig('selectOptionsFilter') } = this.observableProps;
    return optionsFilter;
  }

  get selectReverse(): boolean | undefined {
    const { selectReverse = this.getContextConfig('selectReverse') } = this.observableProps;
    return selectReverse;
  }

  get loading(): boolean {
    return this.options.status === DataSetStatus.loading;
  }

  get customShowErrorTooltip(): boolean {
    const { field, record } = this;
    if (field && record) {
      const isLookupFetchError = field.getIsLookupFetchError(record);
      return isLookupFetchError;
    }
    return false;
  }

  get showSelectLoading(): boolean | undefined {
    const { displayName } = this.constructor as any;
    const { field, record } = this;
    const showSelectLoading = field && field.getShowSelectLoading(record);
    const value = this.getValues();
    if (displayName === 'Select' && value.length > 0 && showSelectLoading) {
      return true;
    }
    return false;
  }

  get doSearchUseDebounce(): boolean {
    return true;
  }

  @autobind
  @action
  handlePopupSearch(value) {
    this.searchText = value;
    this.doSearch(value);
  }

  renderSearchFieldPrefix(_props: any): ReactNode {
    return undefined;
  }

  @autobind
  renderSearchField(props?: any): ReactNode {
    const { searchText, prefixCls } = this;
    const searchFieldProps = this.getSearchFieldProps();
    const { multiple, className } = searchFieldProps;
    return (
      <div className={`${prefixCls}-search-bar`}>
        {this.renderSearchFieldPrefix(props)}
        <ObserverTextField
          value={searchText}
          onChange={this.handlePopupSearch}
          prefix={<Icon type="search" />}
          valueChangeAction={multiple ? ValueChangeAction.blur : ValueChangeAction.input}
          labelLayout={LabelLayout.none}
          border={false}
          {...searchFieldProps}
          className={classNames(`${prefixCls}-search-field`, className)}
        />
      </div>
    );
  }

  renderSelectAll(): ReactNode | void {
    const { selectAllButton } = this.props;
    if (this.multiple && selectAllButton) {
      const builtInButtons: ButtonProps[] = [
        { key: 'select_all', onClick: this.chooseAll, children: $l('Select', 'select_all') },
      ];
      if (this.selectReverse) {
        builtInButtons.push(
          { key: 'select_re', onClick: this.chooseRe, children: $l('Select', 'select_re') },
        );
      }
      builtInButtons.push(
        { key: 'unselect_all', onClick: this.unChooseAll, children: $l('Select', 'unselect_all') },
      );
      const buttons = typeof selectAllButton === 'function' ? selectAllButton(builtInButtons) : builtInButtons;
      return (
        <div key="check-all" className={`${this.prefixCls}-select-all-none`}>
          {
            buttons.map(({ key, onClick, children }, index) => (
              <span key={key || String(index)} onClick={onClick}>{children}</span>
            ))
          }
        </div>
      );
    }
  }

  renderInputPrompt(): ReactNode | void {
    const { showInputPrompt  } = this;
    if (isNil(showInputPrompt) || showInputPrompt === false) return;
    return (
      <OverflowTip title={showInputPrompt} key='select-notice'>
        <div key='select-notice-inner' className={`${this.prefixCls}-select-prompt`}>
          {showInputPrompt}
        </div>
      </OverflowTip>
    );
  }

  getPopupContent(): ReactNode {
    const menu = (
      <Spin key="menu" spinning={this.loading}>
        {this.getMenu()}
      </Spin>
    );
    return [
      this.searchable && this.isSearchFieldInPopup() && this.renderSearchField(),
      this.renderSelectAll(),
      menu,
      this.renderInputPrompt(),
    ];
  }

  @autobind
  getPopupStyleFromAlign(target): CSSProperties | undefined {
    if (target) {
      const width = pxToRem(target.getBoundingClientRect().width, true);
      if (width !== undefined) {
        const { isFlat } = this.props;
        if (!isFlat && this.dropdownMatchSelectWidth) {
          return {
            width,
          };
        }
        return {
          minWidth: width,
        };
      }
    }
  }

  getDefaultAction(): Action[] {
    return this.getContextConfig('selectTrigger') || super.getDefaultAction();
  }

  getTriggerIconFont(): string {
    return this.searchable && !this.isSearchFieldInPopup() && this.isFocused && !this.readOnly ? 'search' : 'baseline-arrow_drop_down';
  }

  @autobind
  handleKeyDown(e) {
    const { menu } = this;
    /**
     * 修复ie出现点击backSpace的页面回到上一页问题
     */
    if (isIE()) {
      if (e.keyCode === KeyCode.BACKSPACE) {
        e.preventDefault();
      }
    }
    if (!this.disabled && !this.readOnly && menu) {
      if (this.popup && menu.onKeyDown(e)) {
        stopEvent(e);
      } else {
        switch (e.keyCode) {
          case KeyCode.RIGHT:
          case KeyCode.DOWN:
            this.handleKeyDownPrevNext(e, menu, 1);
            break;
          case KeyCode.LEFT:
          case KeyCode.UP:
            this.handleKeyDownPrevNext(e, menu, -1);
            break;
          case KeyCode.END:
          case KeyCode.PAGE_DOWN:
            this.handleKeyDownFirstLast(e, menu, 1);
            break;
          case KeyCode.HOME:
          case KeyCode.PAGE_UP:
            this.handleKeyDownFirstLast(e, menu, -1);
            break;
          // case KeyCode.ENTER:
          //   this.handleKeyDownEnter(e);
          //   break;
          case KeyCode.ESC:
            this.handleKeyDownEsc(e);
            break;
          case KeyCode.SPACE:
            this.handleKeyDownSpace(e);
            break;
          default:
        }
      }
    }
    super.handleKeyDown(e);
  }

  getPlaceholders(): string[] {
    const { disabled, readOnly } = this;
    const superPlaceholders = super.getPlaceholders();
    if (!disabled && !readOnly && (!superPlaceholders || superPlaceholders.length === 0)) {
      const { showInputPrompt } = this;
      if (typeof showInputPrompt === 'string') {
        return [showInputPrompt];
      }
    }
    return superPlaceholders;
  }

  @autobind
  isMultipleBlockDisabled(v) {
    const {
      props: { onOption },
    } = this;
    const findRecord = this.findByValue(v);
    const optionProps = findRecord ? onOption === defaultOnOption ? defaultOnOption({ record: findRecord }) : onOption({
      dataSet: this.options,
      record: findRecord,
    }) : undefined;
    const optionDisabled = (optionProps && optionProps.disabled);
    return (findRecord && findRecord.get(DISABLED_FIELD) === true) || optionDisabled || this.disabled;
  }

  handleKeyDownFirstLast(e, menu: Menu, direction: number) {
    stopEvent(e);
    // TreeSelect event conflict
    if (!menu.tree) {
      const children = menu.getFlatInstanceArray();
      const activeItem = children[direction < 0 ? 0 : children.length - 1];
      if (activeItem) {
        if (!this.editable || this.popup) {
          updateActiveKey(menu, activeItem.props.eventKey);
        }
        if (!this.editable && !this.popup) {
          this.choose(activeItem.props.value);
        }
      }
    }
  }

  handleKeyDownPrevNext(e, menu: Menu, direction: number) {
    if (!this.multiple && !this.editable && !menu.tree) {
      const activeItem = menu.step(direction);
      if (activeItem) {
        updateActiveKey(menu, activeItem.props.eventKey);
        this.choose(activeItem.props.value);
      }
      e.preventDefault();
    } else if (e.keyCode === KeyCode.DOWN) {
      this.expand();
      e.preventDefault();
    }
  }

  // handleKeyDownEnter(_e) {
  // }

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
    const { filteredOptions } = this;
    if (filteredOptions && filteredOptions.length) {
      super.expand();
    }
  }

  @autobind
  syncValueOnBlur(text, event?: any) {
    const { popupShowComboValue, multiple, comboOptions, valueField, observableProps: { combo } } = this;
    const value = this.getValue();
    if (event && event.type === 'blur' && multiple && combo && !popupShowComboValue && value && value.length > 0) {
      // 聚合输入(popupShowComboValue为false时):
      // 默认失焦会选中聚合值; 在下拉中选择有具体值后，需要按回车才能选中聚合值，失焦不默认选中;
      if (!comboOptions || value.some(val => !comboOptions.find(com => com.get(valueField) === val[valueField]))) {
        runInAction(() => {
          this.searchText = undefined;
          this.setText(undefined);
        });
        return;
      }
    }

    if (text) {
      if (value !== text) {
        if (!isObject(value) || value[this.textField] !== text) {
          const { comboOptions } = this;
          const data = comboOptions ? comboOptions.data : [];
          this.options.ready().then(() => {
            const record = this.findByTextWithValue(text, data);
            if (record) {
              this.choose(record);

              if (multiple && combo && !popupShowComboValue) {
                runInAction(() => {
                  this.searchText = undefined;
                  this.setText(undefined);
                  this.collapse();
                });
              }
            }
          });
        }
      }
    } else if (!this.multiple || (value && value.length === 0) || !value) {
      this.setValue(this.emptyValue);
    }
  }

  findByTextWithValue(text, data: Record[]): Record | undefined {
    const { textField } = this;
    const records = [
      ...data.filter(comRecord => this.filteredOptions.every(record => record.get(textField) !== comRecord.get(textField))),
      ...this.filteredOptions,
    ].filter(record =>
      isSameLike(record.get(textField), text),
    );
    if (records.length > 1) {
      const { valueField, primitive } = this;
      const value = this.getValue();
      if (value) {
        const found = records.find(record =>
          isSameLike(record.get(valueField), primitive ? value : value[valueField]),
        );
        if (found) {
          return found;
        }
      }
    }
    return records[0];
  }

  findByText(text): Record | undefined {
    const { textField } = this;
    return this.optionsWithCombo.find(record => isSameLike(record.get(textField), text));
  }

  findByValue(value): Record | undefined {
    const { valueField } = this;
    const autoType = this.getProp('type') === FieldType.auto;
    value = getSimpleValue(value, valueField);
    return this.optionsWithCombo.find(record =>
      autoType ? isSameLike(record.get(valueField), value) : isSame(record.get(valueField), value),
    );
  }

  isSelected(record: Record) {
    const { valueField } = this;
    const autoType = this.getProp('type') === FieldType.auto;
    return this.getValues().some(value => {
      const simpleValue = getSimpleValue(value, valueField);
      return autoType
        ? isSameLike(record.get(valueField), simpleValue)
        : isSame(record.get(valueField), simpleValue);
    });
  }

  generateComboOption(value: string | object | any[], callback?: (text: string) => void): void {
    const { currentComboOption, textField, valueField } = this;
    if (value) {
      if (isArrayLike(value)) {
        const loopValue = [...value];
        if (!isEmpty(this.text)) {
          loopValue.push(this.text);
        }
        loopValue.forEach(v => !isNil(v) && this.generateComboOption(v));
      } else {
        if (isObservableObject(value)) {
          value = get(value, textField);
        } else if (isObject(value)) {
          value = value[textField];
        }
        const found = this.findByText(value) || this.findByValue(value);
        if (found) {
          const text = found.get(textField);
          if (text !== value && callback) {
            callback(text);
          }
          this.removeComboOption();
        } else if (currentComboOption) {
          currentComboOption.set(textField, value);
          currentComboOption.set(valueField, value);
        } else {
          this.createComboOption(value);
        }
      }
    } else {
      this.removeComboOption();
    }
  }

  @action
  createComboOption(value): void {
    const { textField, valueField, menu } = this;
    const comboOptions = getIf<Select, DataSet>(this, 'comboOptions', () => new DataSet(undefined, { getConfig: this.getContextConfig as any }));
    const initData = !this.primitive && isObservableObject(value) ? value : {
      [textField]: value,
      [valueField]: value,
    };
    const findOption = comboOptions.find(record => record.get(valueField) === ((isNil(value) || !isString(value)) ? value : value.trim()));
    if (findOption) return;
    const record = comboOptions.create(initData, 0);
    if (menu) {
      updateActiveKey(menu, getItemKey(record, initData[valueField], initData[valueField]));
    }
  }

  removeComboOptions() {
    const { comboOptions } = this;
    if (comboOptions) {
      comboOptions.forEach(record => this.removeComboOption(record));
    }
  }

  removeComboOption(record?: Record): void {
    if (!record) {
      record = this.currentComboOption;
    }
    if (record && !this.isSelected(record)) {
      const { comboOptions } = this;
      if (comboOptions) {
        comboOptions.remove(record);
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

  @autobind
  @action
  handleMenuClick({
    key,
    item: {
      props: { value },
    },
  }) {
    if (key === MORE_KEY) {
      const { searchMatcher, searchText, options } = this;
      const { cacheAllData, originalData, currentPage, pageSize } = options;
      if (originalData.length < cacheAllData.length) {
        const nextPageData = cacheAllData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        options.appendData(nextPageData);
        options.currentPage = currentPage + 1;
      } else {
        runInAction(() => {
          this.moreQuerying = true;
          options.queryMore(options.currentPage + 1, isString(searchMatcher) ? this.getSearchPara(searchMatcher, searchText) : undefined)
            .finally(() => {
              runInAction(() => this.moreQuerying = false);
            });
        });
      }
    } else if (this.multiple && this.isSelected(value)) {
      this.unChoose(value);
    } else {
      this.choose(value);
    }
  }

  @autobind
  handleCommonItemClick(value) {
    if (this.multiple && this.isSelected(value)) {
      this.unChoose(value);
    } else {
      this.choose(value);
    }
  }

  handleOptionSelect(record: Record | Record[]) {
    this.prepareSetValue(...(isArrayLike(record) ? record.map(this.processRecordToObject, this) : [this.processRecordToObject(record)]));
  }

  handleOptionUnSelect(record: Record | Record[]) {
    const { valueField } = this;
    const newValues = isArrayLike(record) ? record.map(r => r.get(valueField)) : [record.get(valueField)];
    this.removeValues(newValues, -1);
  }

  multipleSearch(text: string) {
    if (this.multiple && this.searchable && !isSearchTextEmpty(text)) {
      this.setText(text);
    }
  }

  handleSearch(_text?: string | string[] | undefined) {
    // noop
  }

  @action
  setValue(value: any, noVaidate?: boolean): void {
    if (this.reserveParam && this.multiple && this.searchable && !isSearchTextEmpty(this.searchText)) {
      super.setValue(value, noVaidate, true);
    } else {
      const { triggerHiddenDelay } = this.props;
      super.setValue(value, noVaidate, undefined, triggerHiddenDelay);
    }
  }

  @action
  setText(text?: string): void {
    const isDifference = this.searchText !== text;
    super.setText(text);
    if (this.searchable && !this.isSearchFieldInPopup() && isDifference) {
      this.doSearch(text);
    }
  }

  doSearch = (value?: string | string[] | undefined) => {
    if (this.doSearchUseDebounce) {
      this.doSearchDebounce(value);
    } else {
      this.doSearchFunc(value);
    }
  };

  doSearchFunc = (value?: string | string[] | undefined) => {
    if (isString(this.searchMatcher)) {
      this.searchRemote(value);
    }
    this.handleSearch(value);
  };

  doSearchDebounce = debounce(this.doSearchFunc, 500);

  getSearchPara(searchMatcher: string, value?: string | string[] | undefined): object {
    const { paramMatcher } = this;
    if (isString(paramMatcher)) {
      if (isArrayLike(value)) {
        return { [searchMatcher]: value.map(v => `${v || ''}${paramMatcher}`) };
      }
      return { [searchMatcher]: `${value || ''}${paramMatcher}` };
    }
    if (isFunction(paramMatcher)) {
      const { record, textField, valueField } = this;
      const searchPara = paramMatcher({ record, text: value, textField, valueField, key: searchMatcher });
      if (searchPara) {
        if (isString(searchPara)) {
          return { [searchMatcher]: value };
        }
        return searchPara;
      }
    }
    return { [searchMatcher]: value };
  }

  searchRemote(text?: string | string[] | undefined) {
    const { searchMatcher } = this;
    if (isString(searchMatcher)) {
      const searchPara = this.getSearchPara(searchMatcher, text);
      const { field, record } = this;
      const options = field && field.get('options', record) || this.observableProps.options;
      Object.keys(searchPara).forEach(key => {
        const value = searchPara[key];
        const lovPara = value === '' ? undefined : value;
        if (options) {
          options.query(undefined, { [key]: lovPara });
        } else if (field) {
          field.setLovPara(key, lovPara);
        }
      });
    }
  }

  /**
   * 该方法会被onChange和onCompositionend触发
   * @param e 改变事件
   */
  @autobind
  @action
  handleChange(e) {
    const {
      target,
      target: { value },
    } = e;
    const beforeText = this.text;
    const restricted = this.restrictInput(value);
    if (restricted !== value) {
      const selectionEnd = target.selectionEnd + restricted.length - value.length;
      target.value = restricted;
      target.setSelectionRange(selectionEnd, selectionEnd);
    }
    this.setText(restricted);
    if (this.observableProps.combo) {
      if (restricted !== beforeText) {
        this.generateComboOption(restricted, text => this.setText(text));
      }
    }
    if (!this.popup) {
      this.expand();
    }
  }

  processRecordToObject(record: Record) {
    // 如果为原始值那么 restricted 失效
    return this.primitive ? this.restrictInput(record.get(this.valueField)) : record.toData();
  }

  processObjectValue(value, textField) {
    if (!isNil(value)) {
      if (isPlainObject(value)) {
        return ObjectChainValue.get(value, textField);
      }
      const found = this.findByValue(value);
      if (found) {
        return found.get(textField);
      }
    }
  }

  processLookupValue(value) {
    const { field, textField, primitive, record } = this;
    if (primitive && field && field.getLookup(record)) {
      return super.processValue(field.getText(value, undefined, record));
    }
    return super.processValue(this.processObjectValue(value, textField));
  }

  processValue(value: any): ReactNode {
    const text = this.processLookupValue(value);
    if (isEmpty(text)) {
      if (isPlainObject(value)) {
        return ObjectChainValue.get(value, this.valueField) || '';
      }
      return super.processValue(value);
    }
    return text;
  }

  @action
  clear() {
    const values = this.getValues();
    const {
      props: { maxTagCount = this.getContextConfig('fieldMaxTagCount'), onClear = noop, onOption = noop },
      options,
    } = this;
    this.setText(undefined);
    if (this.multiple) {
      const valuesDisabled = values.slice(0, maxTagCount).filter(v => {
        const recordItem = this.findByValue(v);
        const findRecord = this.findByValue(v);
        const optionProps = findRecord ? onOption({ dataSet: options, record: findRecord }) : undefined;
        const optionDisabled = (optionProps && optionProps.disabled);
        return (recordItem && recordItem.get(DISABLED_FIELD) === true) || optionDisabled;
      });
      const multipleValue = valuesDisabled.length > 0 ? valuesDisabled : this.emptyValue;
      this.setValue(multipleValue);
    } else {
      this.setValue(this.emptyValue);
    }
    this.rangeValue = this.isFocused ? [undefined, undefined] : undefined;
    onClear();
    this.removeComboOptions();
  }

  // 当触发清空操作时候会导致两次触发onchange可搜索不需要设置值
  setRangeTarget(target) {
    if (this.text !== undefined) {
      if (!this.searchable || this.isSearchFieldInPopup()) {
        this.prepareSetValue(this.text);
      }
      this.setText();
    }
    super.setRangeTarget(target);
    defer(() => this.isFocused && this.select());
  }

  resetFilter() {
    this.setText(undefined);
    this.removeComboOption();
    this.forcePopupAlign();
  }

  @autobind
  reset() {
    super.reset();
    this.resetFilter();
  }

  unChoose(record?: Record | Record[] | null) {
    if (record) {
      this.handleOptionUnSelect(record);
    }
  }

  choose(record?: Record | Record[] | null) {
    if (!this.multiple) {
      this.collapse();
    }
    if (record) {
      this.handleOptionSelect(record);
    }
  }

  optionIsSelected(record: Record, values: any[]): boolean {
    const { valueField } = this;
    const value = record.get(valueField);
    return values.some((v) => {
      if (typeof v === 'object') {
        return v[valueField] === value;
      }
      return v === value;
    });
  }

  @autobind
  chooseAll() {
    const {
      options,
      props: { onOption },
    } = this;
    const values = this.getValues();
    const selectedOptions = this.filteredOptions.filter((record) => {
      const optionProps = onOption({ dataSet: options, record });
      const optionDisabled = (optionProps && optionProps.disabled);
      return !optionDisabled && !this.optionIsSelected(record, values);
    });
    this.choose(selectedOptions);
  }

  /**
   * 反选
   */
  @autobind
  chooseRe() {
    const {
      options,
      props: { onOption },
    } = this;
    const values = this.getValues();
    const selectedOptions = this.filteredOptions.filter((record) => {
      const optionProps = onOption({ dataSet: options, record });
      const optionDisabled = (optionProps && optionProps.disabled);
      const optionIsSelect = this.optionIsSelected(record, values);
      return (!optionDisabled && !optionIsSelect) || (optionDisabled && optionIsSelect);
    });
    this.setValue(selectedOptions.map(this.processRecordToObject, this));
  }

  @autobind
  unChooseAll() {
    this.clear();
  }

  @autobind
  handlePopupHiddenChange(hidden: boolean) {
    const noCache = this.getProp('noCache');
    if (!hidden) {
      const { field } = this;
      const { searchMatcher, searchText } = this;
      const optionsProp = field && field.get('options', this.record) || this.observableProps.options;
      if (noCache && optionsProp) {
        optionsProp.query(undefined, isString(searchMatcher) ? this.getSearchPara(searchMatcher, searchText) : undefined);
      } else if (field) {
        field.fetchLookup(noCache, this.record);
      }
      this.forcePopupAlign();
    }
    super.handlePopupHiddenChange(hidden);
  }

  async processSelectedData() {
    const { comboOptions } = this;
    if (comboOptions) {
      comboOptions.removeAll();
    }
    const values = this.getValues();
    const { field } = this;
    if (field) {
      await field.ready();
    }
    const {
      filteredOptions,
      observableProps: { combo },
    } = this;
    runInAction(() => {
      const newValues = values.filter(value => {
        const record = this.findByValue(value);
        if (record) {
          return true;
        }
        if (combo) {
          this.createComboOption(value);
          return true;
        }
        return false;
      });
      if (this.text && combo) {
        this.generateComboOption(this.text);
      }
      if (
        field &&
        field.get('cascadeMap', this.record) &&
        filteredOptions.length &&
        !isEqual(newValues, values)
      ) {
        this.setValue(this.multiple ? newValues : newValues[0]);
      }
    });
  }

  searchData(data: Record[]): Record[] {
    const {
      searchable,
      searchMatcher,
      searchText,
    } = this;
    return searchable && typeof searchMatcher === 'function' && !isSearchTextEmpty(searchText) ? data.filter((r) => this.matchRecordBySearch(r, searchText)) : data;
  }

  @autobind
  matchRecordBySearch(record: Record, text: string | string[]): boolean {
    const {
      textField,
      valueField,
      searchable,
      searchMatcher,
    } = this;
    return !searchable || typeof searchMatcher !== 'function' || searchMatcher({
      record,
      text,
      textField,
      valueField,
      value: record.get(valueField),
      props: record.get(OTHER_OPTION_PROPS),
    });
  }

  renderLengthInfo(_maxLength?: number): ReactNode {
    return undefined;
  }
}

@observer
export default class ObserverSelect extends Select<SelectProps> {
  static defaultProps = Select.defaultProps;

  static Option = Option;

  static OptGroup = OptGroup;

  static __PRO_SELECT = true;
}
