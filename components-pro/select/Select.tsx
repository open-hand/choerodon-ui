import React, { CSSProperties, isValidElement, Key, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import { observer } from 'mobx-react';
import { action, computed, IReactionDisposer, isArrayLike, reaction, runInAction } from 'mobx';
import Menu, { Item, ItemGroup } from 'choerodon-ui/lib/rc-components/menu';
import Tag from 'choerodon-ui/lib/tag';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import Option, { OptionProps } from '../option/Option';
import OptGroup from '../option/OptGroup';
import { DataSetStatus, FieldType } from '../data-set/enum';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import { stopEvent } from '../_util/EventManager';
import normalizeOptions from '../option/normalizeOptions';
import { $l } from '../locale-context';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import isEmpty from '../_util/isEmpty';
import isSame from '../_util/isSame';
import isSameLike from '../_util/isSameLike';
import { Renderer } from '../field/FormField';
import isIE from '../_util/isIE';

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
  return record.get(textField).indexOf(text) !== -1;
}

const disabledField = '__disabled';

function defaultOnOption({ record }) {
  return {
    disabled: record.get(disabledField),
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
  text: string;
  textField: string;
  valueField: string;
}

export type ParamMatcher = string | ((props: ParamMatcherProps) => string);

export interface ParamMatcherProps {
  record: Record | undefined;
  text: string;
  textField: string;
  valueField: string;
}

export interface SelectProps extends TriggerFieldProps {
  /**
   * 复合输入值
   * @default false
   */
  combo?: boolean;
  /**
   * 常用项
   */
  commonItem?: string[],
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
   * 当下拉列表为空时显示的内容
   */
  notFoundContent?: ReactNode;
  /**
   * 设置选项属性，如 disabled;
   */
  onOption: (props: onOptionProps) => OptionProps;
}

export class Select<T extends SelectProps> extends TriggerField<T> {
  static displayName = 'Select';

  static propTypes = {
    /**
     * 复合输入值
     * @default false
     */
    combo: PropTypes.bool,
    /**
     * 常用项
     * @default undefined
     */
    commonItem: PropTypes.array,
    /**
     * 多值标签超出最大数量时的占位描述
     */
    maxCommonTagPlaceholder: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 多值标签最大数量
     */
    maxCommonTagCount: PropTypes.number,
    /**
     * 多值标签文案最大长度
     */
    maxCommonTagTextLength: PropTypes.number,
    /**
     * 过滤器
     * @default false
     */
    searchable: PropTypes.bool,
    /**
     * 搜索匹配器。 当为字符串时，作为lookup的参数名来重新请求值列表。
     */
    searchMatcher: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * 参数匹配器。 当为字符串时，参数拼接。
     */
    paramMatcher: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    /**
     * 是否为原始值
     * true - 选项中valueField对应的值
     * false - 选项值对象
     */
    primitiveValue: PropTypes.bool,
    /**
     * 渲染Option文本的钩子
     * @example
     * ```js
     * <Select
     *   {...props}
     *   optionRenderer={({ dataSet, record, text, value }) => text + '$'}
     * />
     * ```
     */
    optionRenderer: PropTypes.func,
    /**
     * 当下拉列表为空时显示的内容
     */
    notFoundContent: PropTypes.node,
    /**
     * 设置选项属性，如 disabled;
     */
    onOption: PropTypes.func,
    ...TriggerField.propTypes,
  };

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'select',
    combo: false,
    searchable: false,
    checkValueOnOptionsChange: true,
    onOption: defaultOnOption,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  comboOptions: DataSet = new DataSet();

  menu?: Menu | null;

  @computed
  get searchMatcher(): SearchMatcher {
    const { searchMatcher = defaultSearchMatcher } = this.observableProps;
    return searchMatcher;
  }

  @computed
  get paramMatcher(): ParamMatcher {
    const { paramMatcher } = this.observableProps;
    return paramMatcher;
  }

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Select', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  @computed
  get textField(): string {
    return this.getProp('textField') || 'meaning';
  }

  @computed
  get valueField(): string {
    return this.getProp('valueField') || 'value';
  }

  get currentComboOption(): Record | undefined {
    return this.comboOptions.filter(record => !this.isSelected(record))[0];
  }

  get filteredOptions(): Record[] {
    const { optionsWithCombo, text } = this;
    return this.filterData(optionsWithCombo, text);
  }

  @computed
  get optionsWithCombo(): Record[] {
    return [...this.comboOptions.data, ...this.cascadeOptions];
  }

  @computed
  get cascadeOptions(): Record[] {
    const { record, field, options, searchMatcher } = this;
    const { data } = options;
    if (field && !isString(searchMatcher)) {
      const cascadeMap = field.get('cascadeMap');
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

  @computed
  get editable(): boolean {
    const { combo } = this.observableProps;
    return !this.isReadOnly() && (!!this.searchable || !!combo);
  }

  @computed
  get searchable(): boolean {
    return !!this.props.searchable;
  }

  @computed
  get multiple(): boolean {
    return !!this.getProp('multiple');
  }

  @computed
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
      (field && field.options) ||
      normalizeOptions({ textField, valueField, disabledField, multiple, children })
    );
  }

  @computed
  get primitive(): boolean {
    const type = this.getProp('type');
    return this.observableProps.primitiveValue !== false && type !== FieldType.object;
  }

  checkValueReaction?: IReactionDisposer;

  checkComboReaction?: IReactionDisposer;

  @autobind
  saveMenu(node) {
    this.menu = node;
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

  componentWillMount() {
    super.componentWillMount();
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
    this.doSearch.cancel();
    this.clearReaction();
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
    this.forcePopupAlign();
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'searchable',
      'searchMatcher',
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
      'dropdownMenuStyle',
      'checkValueOnOptionsChange',
      'primitiveValue',
      'optionRenderer',
      'notFoundContent',
      'onOption',
    ]);
    return otherProps;
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
    return getConfig('renderEmpty')('Select');
  }

  getOtherNextNode(): ReactNode {
    const {
      options,
      textField,
      valueField,
      observableProps: { commonItem },
      props: { maxCommonTagCount, maxCommonTagPlaceholder, maxCommonTagTextLength },
    } = this;
    if (!options) {
      return undefined;
    }
    const values = this.getValues();
    if (commonItem) {
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
          return (<Tag
            key={item}
            className={values.includes(item) ? `${this.prefixCls}-common-item ${this.prefixCls}-common-item-selected` : `${this.prefixCls}-common-item`}
            // @ts-ignore
            onClick={() => this.handleCommonItemClick(textRecord)}
          >
            {text}
          </Tag>);
        });
      if (valueLength > maxCommonTagCount) {
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
      return (<div className={`${this.prefixCls}-common-item-wrapper`}>
        <span className={`${this.prefixCls}-common-item-label`}>{$l('Select', 'common_item')}</span>
        {tags}
      </div>);
    }
  }

  @autobind
  getMenu(menuProps: object = {}): ReactNode {
    const {
      options,
      textField,
      valueField,
      props: { dropdownMenuStyle, optionRenderer, onOption, dropdownMatchSelectWidth = getConfig('dropdownMatchSelectWidth') },
    } = this;
    if (!options) {
      return null;
    }
    const menuDisabled = this.isDisabled();
    const groups = options.getGroups();
    const optGroups: ReactElement<any>[] = [];
    const selectedKeys: Key[] = [];
    /**
     * fixed when ie the scroll width would cover the item width
     */
    const IeMenuStyle = !dropdownMatchSelectWidth && isIE() ? {padding: '.08rem'} : {} ; 
    const IeItemStyle = !dropdownMatchSelectWidth && isIE() ? {overflow:'visible'} : {} ; 
    this.filteredOptions.forEach(record => {
      let previousGroup: ReactElement<any> | undefined;
      groups.every(field => {
        const label = record.get(field);
        if (label !== undefined) {
          if (!previousGroup) {
            previousGroup = optGroups.find(item => item.props.title === label);
            if (!previousGroup) {
              previousGroup = (
                <ItemGroup key={`group-${label}`} title={label}>
                  {[]}
                </ItemGroup>
              );
              optGroups.push(previousGroup);
            }
          } else {
            const { children } = previousGroup.props;
            previousGroup = children.find(item => item.props.title === label);
            if (!previousGroup) {
              previousGroup = (
                <ItemGroup key={`group-${label}`} title={label}>
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
      const optionDisabled = menuDisabled || (optionProps && optionProps.disabled);
      const key: Key = getItemKey(record, text, value);
      if (!('selectedKeys' in menuProps) && this.isSelected(record)) {
        selectedKeys.push(key);
      }
      const itemContent = optionRenderer
        ? optionRenderer({ dataSet: this.options, record, text, value })
        : text;
      const option: ReactElement = (
        <Item style={IeItemStyle} {...optionProps}   key={key} value={record} disabled={optionDisabled}>
          {itemContent}
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
        <Item key="no_data" disabled>
          {this.loading ? ' ' : this.getNotFoundContent()}
        </Item>,
      );
    }

    return (
      <Menu
        ref={this.saveMenu}
        disabled={menuDisabled}
        defaultActiveFirst
        multiple={this.menuMultiple}
        selectedKeys={selectedKeys}
        prefixCls={this.getMenuPrefixCls()}
        onClick={this.handleMenuClick}
        style={{...IeMenuStyle,...dropdownMenuStyle}}
        focusable={false}
        {...menuProps}
      >
        {optGroups}
      </Menu>
    );
  }

  getPopupProps() {
    const { options, textField, valueField } = this;
    return {
      dataSet: options,
      textField,
      valueField,
    };
  }

  @computed
  get loading(): boolean {
    const { field, options } = this;
    return options.status === DataSetStatus.loading || (!!field && field.pending.length > 0);
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
          <span onClick={this.chooseAll}>{$l('Select', 'select_all')}</span>
          <span onClick={this.unChooseAll}>{$l('Select', 'unselect_all')}</span>
        </div>,
        menu,
      ];
    }

    return menu;
  }

  @autobind
  getPopupStyleFromAlign(target): CSSProperties | undefined {
    const { dropdownMatchSelectWidth = getConfig('dropdownMatchSelectWidth') } = this.props;
    if (target) {
      if (dropdownMatchSelectWidth) {
        return {
          width: pxToRem(target.getBoundingClientRect().width),
        };
      }
      return {
        minWidth: pxToRem(target.getBoundingClientRect().width),
      };
    }
  }

  getTriggerIconFont() {
    return 'baseline-arrow_drop_down';
  }

  @autobind
  handleKeyDown(e) {
    const { menu } = this;
    /**
     * 修复ie出现点击backSpace的页面回到上一页问题
     */
    if (isIE()){
      if(e.keyCode === KeyCode.BACKSPACE){
        e.preventDefault();
      }
    }
    if (!this.isDisabled() && !this.isReadOnly() && menu) {
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

  handleKeyDownFirstLast(e, menu: Menu, direction: number) {
    stopEvent(e);
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

  handleKeyDownPrevNext(e, menu: Menu, direction: number) {
    if (!this.multiple && !this.editable) {
      const activeItem = menu.step(direction);
      if (activeItem) {
        updateActiveKey(menu, activeItem.props.eventKey);
        this.choose(activeItem.props.value);
      }
      e.preventDefault();
    } else if (e === KeyCode.DOWN) {
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

  syncValueOnBlur(value) {
    if (value) {
      const { data } = this.comboOptions;
      this.options.ready().then(() => {
        const record = this.findByTextWithValue(value, data);
        if (record) {
          this.choose(record);
        }
      });
    } else if (!this.multiple) {
      this.setValue(this.emptyValue);
    }
  }

  findByTextWithValue(text, data: Record[]): Record | undefined {
    const { textField } = this;
    const records = [...data, ...this.filteredOptions].filter(record =>
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

  generateComboOption(value: string | any[], callback?: (text: string) => void): void {
    const { currentComboOption, textField, valueField } = this;
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

  createComboOption(value): void {
    const { textField, valueField, menu } = this;
    const record = this.comboOptions.create(
      {
        [textField]: value,
        [valueField]: value,
      },
      0,
    );
    if (menu) {
      updateActiveKey(menu, getItemKey(record, value, value));
    }
  }

  removeComboOptions() {
    this.comboOptions.forEach(record => this.removeComboOption(record));
  }

  removeComboOption(record?: Record): void {
    if (!record) {
      record = this.currentComboOption;
    }
    if (record && !this.isSelected(record)) {
      this.comboOptions.remove(record);
    }
  }

  handlePopupAnimateAppear() {}

  getValueKey(v) {
    if (isArrayLike(v)) {
      return v.map(this.getValueKey, this).join(',');
    }
    const autoType = this.getProp('type') === FieldType.auto;
    const value = getSimpleValue(v, this.valueField);
    return autoType && !isNil(value) ? value.toString() : value;
  }

  @autobind
  handlePopupAnimateEnd(_key, _exists) {}

  @autobind
  handleMenuClick({
    item: {
      props: { value },
    },
  }) {
    if (this.multiple && this.isSelected(value)) {
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

  handleOptionSelect(record: Record) {
    this.prepareSetValue(this.processRecordToObject(record));
  }

  handleOptionUnSelect(record: Record) {
    const { valueField } = this;
    const newValue = record.get(valueField);
    this.removeValue(newValue, -1);
  }

  @action
  setText(text?: string): void {
    super.setText(text);
    if (this.searchable && isString(this.searchMatcher)) {
      this.doSearch(text);
    }
  }

  doSearch = debounce(value => this.searchRemote(value), 500);

  searchRemote(value) {
    const { field, searchMatcher } = this;
    if (field && isString(searchMatcher)) {
      field.setLovPara(searchMatcher, value === '' ? undefined : value);
    }
  }

  @autobind
  @action
  handleChange(e) {
    const {
      target,
      target: { value },
    } = e;
    const restricted = this.restrictInput(value);
    if (restricted !== value) {
      const selectionEnd = target.selectionEnd + restricted.length - value.length;
      target.value = restricted;
      target.setSelectionRange(selectionEnd, selectionEnd);
    }
    this.setText(restricted);
    if (this.observableProps.combo) {
      this.generateComboOption(restricted, text => this.setText(text));
    }
    if (!this.popup) {
      this.expand();
    }
  }



  processRecordToObject(record: Record) {
    const { primitive, valueField } = this;
    // 如果为原始值那么 restricted 失效
    const restricted = this.restrictInput(record.get(valueField));
    return primitive ? restricted : record.toData();
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
    const { field, textField, primitive } = this;
    if (primitive && field && field.lookup) {
      return super.processValue(field.getText(value));
    }
    return super.processValue(this.processObjectValue(value, textField));
  }

  processValue(value: any): string {
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
    this.setText(undefined);
    super.clear();
    this.removeComboOptions();
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

  unChoose(record?: Record | null) {
    if (record) {
      this.handleOptionUnSelect(record);
    }
  }

  choose(record?: Record | null) {
    if (!this.multiple) {
      this.collapse();
    }
    if (record) {
      this.handleOptionSelect(record);
    }
  }

  @autobind
  chooseAll() {
    const {
      options,
      props: { onOption },
    } = this;
    const selectedOptions = this.filteredOptions.filter((record) => {
      const optionProps = onOption({ dataSet: options, record });
      const optionDisabled = (optionProps && optionProps.disabled);
      return !optionDisabled;
    });
    this.setValue(selectedOptions.map(this.processRecordToObject, this));
  }

  @autobind
  unChooseAll() {
    this.clear();
  }

  @autobind
  async handlePopupHiddenChange(hidden: boolean) {
    if (!hidden) {
      this.forcePopupAlign();
    }
    super.handlePopupHiddenChange(hidden);
  }

  async processSelectedData() {
    this.comboOptions.removeAll();
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
        field.get('cascadeMap') &&
        filteredOptions.length &&
        !isEqual(newValues, values)
      ) {
        this.setValue(this.multiple ? newValues : newValues[0]);
      }
    });
  }

  filterData(data: Record[], text?: string): Record[] {
    const {
      textField,
      valueField,
      searchable,
      searchMatcher,
      props: { optionsFilter },
    } = this;
    data = optionsFilter ? data.filter(optionsFilter!) : data;
    if (searchable && text && typeof searchMatcher === 'function') {
      return data.filter(record => searchMatcher({ record, text, textField, valueField }));
    }
    return data;
  }
}

@observer
export default class ObserverSelect extends Select<SelectProps> {
  static defaultProps = Select.defaultProps;

  static Option = Option;

  static OptGroup = OptGroup;
}
