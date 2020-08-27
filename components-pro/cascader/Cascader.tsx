import React, { CSSProperties, isValidElement, Key, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';
import isPlainObject from 'lodash/isPlainObject';
import { observer } from 'mobx-react';
import { action, observable, computed, IReactionDisposer, isArrayLike, reaction, runInAction, toJS } from 'mobx';
import { Menus, SingleMenu } from 'choerodon-ui/lib/rc-components/cascader';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import cloneDeep from 'lodash/cloneDeep';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { MenuMode } from 'choerodon-ui/lib/cascader';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import { DataSetStatus, FieldType } from '../data-set/enum';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import { stopEvent } from '../_util/EventManager';
import normalizeOptions from '../option/normalizeOptions';
import { $l } from '../locale-context';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import isEmptyUtil from '../_util/isEmpty';
import isSameLike from '../_util/isSameLike';
import { OptionProps } from '../option/Option';
import { ExpandTrigger } from './enum';

export interface OptionObject {
  value: any,
  meaning: string,
}

export interface ProcessOption extends OptionObject {
  parent: any,
  children?: any,
  disabled?: boolean,
}

export interface CascaderOptionType {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  children?: Array<CascaderOptionType>;
  parent?: Array<CascaderOptionType>;
  __IS_FILTERED_OPTION?: boolean;
}


const disabledField = '__disabled';

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
  if ( isArrayLike(arr) &&  isArrayLike(arrNext)) {
    return arr.toString() === arrNext.toString();
  }
  return false;
}

export type onOptionProps = { dataSet: DataSet; record: Record };


export interface CascaderProps extends TriggerFieldProps {
  /**
   * 次级菜单的展开方式，可选 'click' 和 'hover'
   */
  expandTrigger?: ExpandTrigger
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
  onOption: (props: onOptionProps) => OptionProps;
  /** 单框弹出形式切换 */
  menuMode?: MenuMode;
  /** 由于渲染在body下可以方便按照业务配置弹出框的大小 */
  singleMenuStyle: CSSProperties,
  /** 由于渲染在body下可以方便按照业务配置超出大小样式和最小宽度等 */
  singleMenuItemStyle: CSSProperties,
  /** 设置需要的提示问题配置 */
  singlePleaseRender: ({key,className,text}:{key: string,className: string,text: string}) => ReactElement<any>,
  /** 头部可以渲染出想要的tab样子 */
  singleMenuItemRender: (title:string) => ReactElement<any>,
}

export class Cascader<T extends CascaderProps> extends TriggerField<T> {
  static displayName = 'Cascader';

  static propTypes = {
    /**
     * 次级菜单的展开方式，可选 'click' 和 'hover'
     */
    expandTrigger: PropTypes.oneOf([
      ExpandTrigger.hover,
      ExpandTrigger.click,
    ]),
    /**
     * 下拉框匹配输入框宽度
     * @default true
     */
    dropdownMatchSelectWidth: PropTypes.bool,
    /**
     * 下拉框菜单样式名
     */
    dropdownMenuStyle: PropTypes.object,
    /**
     * 选项数据源
     */
    options: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object),
    ]),
    /**
     * 是否为原始值
     * true - 选项中valueField对应的值
     * false - 选项值对象
     */
    primitiveValue: PropTypes.bool,
    /**
     * 当下拉列表为空时显示的内容
     */
    notFoundContent: PropTypes.node,
    /**
     * 设置选项属性，如 disabled;
     */
    onOption: PropTypes.func,
    singleMenuStyle: PropTypes.object,
    singleMenuItemStyle: PropTypes.object,
    singlePleaseRender: PropTypes.func,
    singleMenuItemRender: PropTypes.func,
    ...TriggerField.propTypes,
  };

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'cascader',
    dropdownMatchSelectWidth: false,
    expandTrigger: ExpandTrigger.click,
    onOption: defaultOnOption,
  };


  @observable activeValues;

  @observable menuItemWith: number;

  @observable clickTab;

  @computed 
  get isClickTab() {
    return this.clickTab;
  }

  @computed
  get activeValue(): any {
    return this.activeValues;
  }

  @computed
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
    this.activeValues = activeValues;
  }

  @action setIsClickTab(isClickTab: boolean) {
    this.clickTab = isClickTab;
  }

  @action
  setItemMenuWidth(width: number) {
    this.menuItemWith = width;
  }

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Cascader', label ? 'value_missing' : 'value_missing_no_label', { label }),
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

  @computed
  get cascadeOptions(): Record[] {
    const { record, field, options } = this;
    const { data } = options;
    if (field) {
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
    return false;
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
    let dealOption;
    if (isArrayLike(options)) {
      dealOption = this.addOptionsParent(options, undefined);
    } else {
      dealOption = options;
    }
    return (
      dealOption ||
      (field && field.options) ||
      normalizeOptions({ textField, valueField, disabledField, multiple, children })
    );
  }

  // 增加父级属性
  addOptionsParent(options, parent) {
    if (options.length > 0) {
      const optionPrent = options.map((ele) => {
        ele.parent = parent || undefined;
        if (ele.children) {
          this.addOptionsParent(ele.children, ele);
        }
        return ele;
      });
      return optionPrent;
    }
  }

  @computed
  get primitive(): boolean {
    const type = this.getProp('type');
    if (this.options instanceof DataSet) {
      return this.observableProps.primitiveValue !== false && type !== FieldType.object;
    }
    return this.observableProps.primitiveValue !== false;
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

  componentWillMount() {
    super.componentWillMount();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.clearReaction();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
  }

  componentDidUpdate() {
    this.forcePopupAlign();
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'multiple',
      'value',
      'name',
      'dropdownMatchSelectWidth',
      'dropdownMenuStyle',
      'primitiveValue',
      'notFoundContent',
      'onOption',
      'expandTrigger',
      'dropdownMatchSelectWidth',
      'dropdownMenuStyle',
      'menuMode',
      'singleMenuStyle',
      'singleMenuItemStyle',
      'singlePleaseRender',
      'singleMenuItemRender', 
    ]);
    return otherProps;
  }

  getObservableProps(props, context) {
    return {
      ...super.getObservableProps(props, context),
      children: props.children,
      options: props.options,
      primitiveValue: props.primitiveValue,
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

  /**
   * 返回一个打平tree返回层级
   * @param record
   * @param fn
   */
  findParentRecodTree(record: Record, fn?: any) {
    const recordTree: any[] = [];
    if (record) {
      if ( isFunction(fn)) {
        recordTree.push(fn(record));
      } else {
        recordTree.push(record);
      }
    }
    if (record && record.parent) {
      if (isFunction(fn)) {
        return [...this.findParentRecodTree(record.parent, fn), ...recordTree];
      }
      return [...this.findParentRecodTree(record.parent), ...recordTree];
    }
    return recordTree;
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
    // 暂时不用考虑分组情况 groups
    const {
      options,
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
        singleMenuItemRender,
      },
    } = this;
    if (!options) {
      return null;
    }
    const menuDisabled = this.isDisabled();
    let optGroups: any[] = [];
    let selectedValues: any[] = [];
    // 确保tabkey唯一
    let deepindex = 0;
    const treePropsChange = (treeRecord: ProcessOption[] | Record[]) => {
      let treeRecords: any = [];
      if (treeRecord.length > 0) {
        // @ts-ignore
        treeRecords = treeRecord.map((recordItem, index) => {
          deepindex++
          const value = this.getRecordOrObjValue(recordItem, valueField);
          const text = this.getRecordOrObjValue(recordItem, textField);
          if (recordItem instanceof Record) {
            const optionProps = onOption({ dataSet: options, record: recordItem });
            const optionDisabled = menuDisabled || (optionProps && optionProps.disabled);
            const key: Key = getItemKey(recordItem, text, value);
            let children;
            if (recordItem.isSelected) {
              selectedValues.push(recordItem);
            }
            if (recordItem.children) {
              children = treePropsChange(recordItem.children);
            }
            return (children ? {
              ...optionProps,
              disabled: optionDisabled,
              key,
              label: text,
              value: recordItem,
              children,
            } : {
              ...optionProps,
              disabled: optionDisabled,
              key,
              label: text,
              value: recordItem,
            });
          }
          const optionProps = onOption({ dataSet: options, record: recordItem });
          const optionDisabled = recordItem.disabled || optionProps;
          const key: Key = `${deepindex}-${index}`;
          let children: any;
          if (recordItem.children) {
            children = treePropsChange(recordItem.children);
          }
          return (children ? {
            ...optionDisabled,
            key,
            label: text,
            value: recordItem,
            children,
            disabled: optionDisabled,
          } : {
            ...optionDisabled,
            key,
            label: text,
            value: recordItem,
            disabled: optionDisabled,
          });
        });
      }
      return treeRecords;
    };
    if (isArrayLike(options)) {
      optGroups = treePropsChange(options);
    } else if (options instanceof DataSet) {
      optGroups = treePropsChange(options.treeData);
    } else {
      optGroups = [];
    }

    /**
     * 获取当前激活的menueItem
     * 以及value 展示激活状态的判断
     * 按钮能够控制不受值的影响
     * inputValue：输入框的值
     * activeValue：激活值（choose和键盘影响）
     * this.popup:开启状态有激活值那么为激活值
     */
    const getActiveValue = (inputValue) => {
      let activeValue = [];
      if (!isEmpty(inputValue)) {
        if (inputValue && arraySameLike(this.treeValueToArray(this.activeValue), inputValue) || this.activeValue.children) {
          activeValue = this.findParentRecodTree(this.activeValue);
        } else if (this.activeValue) {
          if (isArrayLike(options)) {
            activeValue = this.findParentRecodTree(this.findActiveRecord(inputValue, this.options));
          } else if (options instanceof DataSet) {
            activeValue = this.findParentRecodTree(this.findActiveRecord(inputValue, this.options.treeData));
          } else {
            activeValue = [];
          }
        }
      } else if (inputValue) {
        activeValue = this.findParentRecodTree(this.activeValue);
      }
      return activeValue;
    };
    if (this.popup && !isEmpty(this.activeValue)) {
      selectedValues = this.findParentRecodTree(this.activeValue);
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
      selectedValues = this.findParentRecodTree(this.activeValue);
    }
    let dropdownMenuStyleMerge = dropdownMenuStyle;
    if ((this.itemMenuWidth > 0)) {
      dropdownMenuStyleMerge = { ...dropdownMenuStyle, width: pxToRem(this.itemMenuWidth) };
    }
    // 渲染成单项选择还是多项选择组件以及空组件
    if(options && options.length){
      if(!this.multiple && menuMode === MenuMode.single ){
        return (
          <SingleMenu
          {...menuProps}
          singleMenuStyle = {singleMenuStyle}
          singleMenuItemStyle = {singleMenuItemStyle}
          singlePleaseRender = {singlePleaseRender}
          singleMenuItemRender ={singleMenuItemRender}
          prefixCls={this.prefixCls}
          expandTrigger={expandTrigger}
          activeValue={toJS(selectedValues)}
          options={optGroups}
          locale={{pleaseSelect:$l('Cascader', 'please_select')}}
          onSelect={this.handleMenuClick}
          isTabSelected={this.isClickTab}
          dropdownMenuColumnStyle={dropdownMenuStyleMerge}
          visible={this.popup} />
        )
      }
      return (
        <Menus
          {...menuProps}
          prefixCls={this.prefixCls}
          expandTrigger={expandTrigger}
          activeValue={selectedValues}
          options={optGroups}
          onSelect={this.handleMenuClick}
          dropdownMenuColumnStyle={dropdownMenuStyleMerge}
          visible={this.popup}
        />
      )
    }
    return (
      <div key="no_data">
        {this.loading ? ' ' : this.getNotFoundContent()}
      </div>
    )
  }

  // 遍历出父亲节点
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
          <span onClick={this.chooseAll}>{$l('Cascader', 'select_all')}</span>
          <span onClick={this.unChooseAll}>{$l('Cascader', 'unselect_all')}</span>
        </div>,
        menu,
      ];
    }
    return menu;
  }

  @autobind
  getPopupStyleFromAlign(target): CSSProperties | undefined {
    if (target) {
      if (this.props.dropdownMatchSelectWidth) {
        this.setItemMenuWidth(target.getBoundingClientRect().width);
        return {
          minWidth: pxToRem(target.getBoundingClientRect().width),
        };
      }
      return undefined;
    }
  }

  getTriggerIconFont() {
    return 'baseline-arrow_drop_down';
  }

  @autobind
  handleKeyDown(e) {
    if (!this.isDisabled() && !this.isReadOnly()) {
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
    if (isArrayLike(this.options)) {
      if (isEmpty(toJS(this.activeValue))) {
        this.setActiveValue(this.options[0]);
      } else {
        const activeItem = this.findTreeDataFirstLast(this.options, this.activeValue, direction);
        if (!this.editable || this.popup) {
          this.setActiveValue(activeItem);
        }
      }
    } else if (this.options instanceof DataSet) {
      if (isEmpty(toJS(this.activeValue))) {
        this.setActiveValue(this.options.treeData[0]);
      } else {
        const activeItem = this.findTreeDataFirstLast(this.options.treeData, this.activeValue, direction);
        if (!this.editable || this.popup) {
          this.setActiveValue(activeItem);
        }
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
      if (isArrayLike(this.options)) {
        if (isEmpty(toJS(this.activeValue))) {
          this.setActiveValue(this.options[0]);
        } else {
          this.setActiveValue(this.findTreeDataUpDown(this.options, this.activeValue, direction, this.sameKeyRecordIndex(this.options, this.activeValue, 'value')));
        }
      } else if (this.options instanceof DataSet) {
        if (isEmpty(toJS(this.activeValue))) {
          this.setActiveValue(this.options.treeData[0]);
        } else {
          this.setActiveValue(this.findTreeDataUpDown(this.options.treeData, this.activeValue, direction, this.sameKeyRecordIndex(this.options.treeData, this.activeValue, 'key')));
        }
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
      if (isArrayLike(this.options)) {
        if (isEmpty(toJS(this.activeValue))) {
          this.setActiveValue(this.options[0]);
        } else {
          this.setActiveValue(this.findTreeParentChidren(this.options, this.activeValue, direction));
        }
      } else if (this.options instanceof DataSet) {
        if (isEmpty(toJS(this.activeValue))) {
          this.setActiveValue(this.options.treeData[0]);
        } else {
          this.setActiveValue(this.findTreeParentChidren(this.options.treeData, this.activeValue, direction));
        }
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
      if (this.isSelected(value)) {
        this.unChoose(value);
      } else if (value.children) {
        this.setPopup(true);
      } else if (value instanceof Record && !value.get(disabledField)) {
        this.choose(value);
      } else if (!value.disabled && isObject(value)) {
        // @ts-ignore
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
    if (value) {
      if (this.options instanceof DataSet) {
        this.options.ready().then(() => {
          const record = this.findByTextWithValue(value);
          if (record) {
            this.choose(record);
          }
        });
      } else {
        const record = this.findByTextWithValue(value);
        if (record) {
          this.choose(record);
        }
      }
    } else if (!this.multiple) {
      this.setValue(this.emptyValue);
    }
  }

  findByTextWithValue(text): Record | undefined {
    if (text) {
      const found = this.findByText(text);
      if (found) {
        return found;
      }
    }
  }

  findByText(text): Record | undefined {
    const { textField } = this;
    const findTreeItem = (options, valueItem, index) => {
      let sameItemTreeNode;
      if (valueItem.length > 0) {
        sameItemTreeNode = options.find(ele => {
          return isSameLike(this.getRecordOrObjValue(ele, textField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], textField) : valueItem[index]);
        });
        if (sameItemTreeNode) {
          if (sameItemTreeNode.children) {
            return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
          }
          return sameItemTreeNode;
        }
      }
    };
    const textArray = text.split('/');
    if (textArray && textArray.length > 0) {
      if (this.options instanceof DataSet) {
        return findTreeItem(this.options.treeData, textArray, 0);
      }
      return findTreeItem(this.options, textArray, 0);
    }
  }


  findByValue(value): Record | undefined {
    const { valueField } = this;
    const findTreeItem = (options, valueItem, index) => {
      let sameItemTreeNode;
      if (valueItem.length > 0) {
        sameItemTreeNode = options.find(ele => {
          return isSameLike(this.getRecordOrObjValue(ele, valueField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], valueField) : valueItem[index]);
        });
        if (sameItemTreeNode) {
          if (sameItemTreeNode.children) {
            return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
          }
          return sameItemTreeNode;
        }
      }
    };
    value = getSimpleValue(value, valueField);
    if (this.options instanceof DataSet) {
      return findTreeItem(this.options.treeData, value, 0);
    }
    return findTreeItem(this.options, value, 0);
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
  }

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
  }

  // 触发下拉框的点击事件
  @autobind
  handleMenuClick(targetOption, _menuIndex, isClickTab) {
    if (!targetOption || targetOption.disabled) {
      return;
    }
    if (!this.isSelected(targetOption.value) || isClickTab) {
      if (targetOption.children) {
        this.setPopup(true);
        this.setActiveValue(targetOption.value);
        this.setIsClickTab(isClickTab);
      } else {
        if(!isClickTab){
          this.setActiveValue(targetOption.value);
          this.choose(targetOption.value);
        }else{
          this.setPopup(true);
        }
        this.setIsClickTab(isClickTab);
      }
    } else {
      this.setactiveEmpty()
      this.unChoose(targetOption.value);
    }
  }

  setactiveEmpty(){
    if(this.multiple){
      this.setActiveValue([])
    }else{
      this.setActiveValue({})
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
  removeValues(values: any[], index: number = 0) {
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
    this.setActiveValue({});
    this.collapse();
  }

  @action
  setText(text?: string): void {
    super.setText(text);
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

  processRecordToObject(record: Record | ProcessOption) {
    const { primitive } = this;
    if (record instanceof Record && record.dataSet!.getFromTree(0)) {
      return primitive ? this.treeValueToArray(record) : this.treeToArray(record);
    }
    if (isObject(record)) {
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
  treeToArray(record: Record | ProcessOption, allArray?: ProcessOption[] | Record[]) {
    if (!allArray) {
      allArray = [];
    }
    if (record) {
      if (record instanceof Record) {
        allArray = [record.toData(), ...allArray];
      } else {
        allArray = [this.removeObjParentChild(record), ...allArray];
      }
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
      return super.processValue(field.getText(value));
    }
  }

  // 处理value
  processValue(value: any) {
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
    const chooseAll = [];
    if (isArrayLike(this.options)) {
      const findLeafItem = (option) => {
        option.forEach((item: CascaderOptionType) => {
          if (isEmpty(item.children) && !item.disabled) {
            // @ts-ignore
            chooseAll.push(this.processRecordToObject(item));
          } else {
            findLeafItem(item.children);
          }
        });
      };
      findLeafItem(this.options);
    } else if (this.options instanceof DataSet) {
      this.options.forEach(item => {
        if (isEmpty(item.children) && !item.get(disabledField)) {
          // @ts-ignore
          chooseAll.push(this.processRecordToObject(item));
        }
      }, this);
    }
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
        if (record) {
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
        !isEqual(newValues, values)
      ) {
        this.setValue(this.multiple ? newValues : newValues[0]);
      }
    });
  }
}

@observer
export default class ObserverCascader extends Cascader<CascaderProps> {
  static defaultProps = Cascader.defaultProps;
}
