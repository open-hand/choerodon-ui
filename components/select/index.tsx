import React, { ClassicComponentClass, Component, CSSProperties, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import RcSelect, { OptGroup, Option } from '../rc-components/select';
import { SelectMode } from './enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface AbstractSelectProps {
  prefixCls?: string;
  spinPrefixCls?: string;
  className?: string;
  size?: Size;
  notFoundContent?: ReactNode | null;
  transitionName?: string;
  choiceTransitionName?: string;
  showSearch?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  style?: CSSProperties;
  tabIndex?: number;
  placeholder?: ReactNode;
  defaultActiveFirstOption?: boolean;
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
  dropdownMenuStyle?: CSSProperties;
  dropdownMatchSelectWidth?: boolean;
  onDropdownMouseDown?: (e: MouseEvent<any>) => void;
  onSearch?: (value: string) => any;
  filterOption?: boolean | ((inputValue: string, option: ReactElement<OptionProps>) => any);
  id?: string;
  blurChange?: boolean;
  showCheckAll?: boolean;
  autoClearSearchValue?: boolean,
  dropdownMenuRippleDisabled?: boolean,
  dropdownMenuItemCheckable?: boolean,
  choiceRemove?: boolean;
  border?: boolean;
  builtinPlacements?: object,
  labelLayout?: 'none' | 'float',
}

export interface LabeledValue {
  key: string;
  label: ReactNode;
}

export type SelectValue = string | number | any[] | LabeledValue | LabeledValue[];

export interface SelectProps extends AbstractSelectProps {
  form?: any,
  value?: SelectValue;
  defaultValue?: SelectValue;
  mode?: SelectMode | string;
  optionLabelProp?: string;
  firstActiveValue?: string | string[];
  onInput?: (value: SelectValue) => void;
  onChange?: (value: SelectValue, option: ReactElement<any> | ReactElement<any>[]) => void;
  onSelect?: (value: SelectValue, option: ReactElement<any>) => any;
  onDeselect?: (value: SelectValue) => any;
  onBlur?: () => any;
  onFocus?: () => any;
  onPopupScroll?: () => any;
  onInputKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLInputElement>) => any;
  onMouseLeave?: (e: MouseEvent<HTMLInputElement>) => any;
  onChoiceItemClick?: (value: SelectValue, option: ReactElement<any>) => void;
  onClear?: () => any;
  maxTagCount?: number;
  maxTagPlaceholder?: ReactNode | ((omittedValues: SelectValue[]) => ReactNode);
  optionFilterProp?: string;
  labelInValue?: boolean;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  tokenSeparators?: string[];
  getInputElement?: () => ReactElement<any>;
  autoFocus?: boolean;
  showNotFindInputItem?: boolean;
  showNotFindSelectedItem?: boolean;
  getRootDomNode?: () => HTMLElement;
  filter?: boolean;
  footer?: ReactNode | string;
  choiceRender?: (label: ReactElement<any>, value: SelectValue) => any;
  loading?: boolean | object;
  onFilterChange?: (value: string) => void;
  filterValue?: string;
  children?: ReactNode;
}

export interface OptionProps {
  disabled?: boolean;
  value?: string | number;
  title?: string;
  children?: ReactNode;
  className?: string;
  style?: object;
}

export interface OptGroupProps {
  label?: ReactNode;
}

export interface SelectLocale {
  notFoundContent?: string;
  filterPlaceholder?: string;
}

// => It is needless to export the declaration of below two inner components.
// export { Option, OptGroup };

export default class Select extends Component<SelectProps, {}> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'Select';

  static Option = Option as ClassicComponentClass<OptionProps>;

  static OptGroup = OptGroup as ClassicComponentClass<OptGroupProps>;

  static SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

  static defaultProps = {
    blurChange: true,
    showSearch: false,
    transitionName: 'slide-up',
    choiceTransitionName: 'zoom',
    filter: false,
    showCheckAll: true,
    choiceRemove: true,
    border: true,
  };

  context: ConfigContextValue;

  private rcSelect: any;

  focus() {
    this.rcSelect.focus();
  }

  blur() {
    this.rcSelect.blur();
  }

  saveSelect = (node: any) => {
    this.rcSelect = node;
  };

  getNotFoundContent(locale: SelectLocale) {
    const { notFoundContent } = this.props;
    if (this.isCombobox()) {
      // AutoComplete don't have notFoundContent defaultly
      return notFoundContent === undefined ? null : notFoundContent;
    }
    return notFoundContent === undefined ? locale.notFoundContent : notFoundContent;
  }

  isCombobox() {
    const { mode } = this.props;
    return mode === 'combobox' || mode === Select.SECRET_COMBOBOX_MODE_DO_NOT_USE;
  }

  renderSelect = (locale: SelectLocale) => {
    const { prefixCls: customizePrefixCls, className = '', size, mode, ...restProps } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('select', customizePrefixCls);
    const cls = classNames(
      {
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-sm`]: size === Size.small,
      },
      className,
    );

    let { optionLabelProp } = this.props;
    const isCombobox = this.isCombobox();
    if (isCombobox) {
      // children 带 dom 结构时，无法填入输入框
      optionLabelProp = optionLabelProp || 'value';
    }

    const modeConfig = {
      multiple: mode === SelectMode.multiple,
      tags: mode === SelectMode.tags,
      combobox: isCombobox,
    };
    delete restProps.form;
    return (
      <RcSelect
        {...restProps}
        {...modeConfig}
        prefixCls={prefixCls}
        className={cls}
        optionLabelProp={optionLabelProp || 'children'}
        filterPlaceholder={locale.filterPlaceholder}
        notFoundContent={this.getNotFoundContent(locale)}
        ref={this.saveSelect}
      />
    );
  };

  render() {
    return (
      <LocaleReceiver componentName="Select" defaultLocale={getRuntimeLocale().Select || {}}>
        {this.renderSelect}
      </LocaleReceiver>
    );
  }
}
