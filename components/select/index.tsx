import React, { ClassicComponentClass, Component, CSSProperties, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import RcSelect, { OptGroup, Option } from '../rc-components/select';
import { SelectMode } from './enum';
import { getPrefixCls } from '../configure';

export interface AbstractSelectProps {
  prefixCls?: string;
  className?: string;
  size?: Size;
  notFoundContent?: ReactNode | null;
  transitionName?: string;
  choiceTransitionName?: string;
  showSearch?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  tabIndex?: number;
  placeholder?: string;
  defaultActiveFirstOption?: boolean;
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
  dropdownMenuStyle?: CSSProperties;
  onDropdownMouseDown?: (e: MouseEvent<any>) => void;
  onSearch?: (value: string) => any;
  filterOption?: boolean | ((inputValue: string, option: ReactElement<OptionProps>) => any);
}

export interface LabeledValue {
  key: string;
  label: ReactNode;
}

export type SelectValue = string | any[] | LabeledValue | LabeledValue[];

export interface SelectProps extends AbstractSelectProps {
  blurChange?: boolean;
  value?: SelectValue;
  defaultValue?: SelectValue;
  mode?: SelectMode;
  optionLabelProp?: string;
  onInput?: (value: SelectValue) => void;
  onChange?: (value: SelectValue, option: ReactElement<any> | ReactElement<any>[]) => void;
  onSelect?: (value: SelectValue, option: ReactElement<any>) => any;
  onDeselect?: (value: SelectValue) => any;
  onBlur?: () => any;
  onFocus?: () => any;
  onPopupScroll?: () => any;
  onInputKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onChoiceItemClick?: (value: SelectValue, option: ReactElement<any>) => void;
  onClear?: () => any;
  maxTagCount?: number;
  maxTagPlaceholder?: ReactNode | ((omittedValues: SelectValue[]) => ReactNode);
  dropdownMatchSelectWidth?: boolean;
  optionFilterProp?: string;
  labelInValue?: boolean;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  tokenSeparators?: string[];
  getInputElement?: () => ReactElement<any>;
  autoFocus?: boolean;
  showNotFindInputItem?: boolean;
  showNotFindSelectedItem?: boolean;
  getRootDomNode?: () => HTMLElement;
  showCheckAll?: boolean;
  filter?: boolean;
  footer?: ReactNode | string,
  choiceRender?: (label: ReactElement<any>, value: SelectValue) => any,
  loading?: boolean | object;
  onFilterChange?: (value: string) => void;
  choiceRemove?: boolean;
  filterValue?: string;
}

export interface OptionProps {
  disabled?: boolean;
  value?: any;
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

const SelectPropTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf([Size.default, Size.large, Size.small]),
  combobox: PropTypes.bool,
  notFoundContent: PropTypes.any,
  showSearch: PropTypes.bool,
  optionLabelProp: PropTypes.string,
  transitionName: PropTypes.string,
  choiceTransitionName: PropTypes.string,
  showNotFindInputItem: PropTypes.bool,
  showNotFindSelectedItem: PropTypes.bool,
  filter: PropTypes.bool,
  showCheckAll: PropTypes.bool,
  footer: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
  ]),
  choiceRender: PropTypes.func,
  loading: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  filterValue: PropTypes.string,
  onFilterChange: PropTypes.func,
  choiceRemove: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.func,
  ]),
  onChoiceRemove: PropTypes.func,
  onClear: PropTypes.func,
};

// => It is needless to export the declaration of below two inner components.
// export { Option, OptGroup };

export default class Select extends Component<SelectProps, {}> {
  static displayName = 'Select';
  static Option = Option as ClassicComponentClass<OptionProps>;
  static OptGroup = OptGroup as ClassicComponentClass<OptGroupProps>;

  static defaultProps = {
    blurChange: true,
    showSearch: false,
    transitionName: 'slide-up',
    choiceTransitionName: 'zoom',
    filter: false,
    showCheckAll: true,
    choiceRemove: true,
  };

  static propTypes = SelectPropTypes;

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
    const { notFoundContent, mode } = this.props;
    const isCombobox = mode === SelectMode.combobox;
    if (isCombobox) {
      // AutoComplete don't have notFoundContent defaultly
      return notFoundContent === undefined ? null : notFoundContent;
    }
    return notFoundContent === undefined ? locale.notFoundContent : notFoundContent;
  }

  renderSelect = (locale: SelectLocale) => {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      size,
      mode,
      ...restProps,
    } = this.props;
    const prefixCls = getPrefixCls('select', customizePrefixCls);
    const cls = classNames({
      [`${prefixCls}-lg`]: size === Size.large,
      [`${prefixCls}-sm`]: size === Size.small,
    }, className);

    let { optionLabelProp } = this.props;
    const isCombobox = mode === SelectMode.combobox;
    if (isCombobox) {
      // children 带 dom 结构时，无法填入输入框
      optionLabelProp = optionLabelProp || 'value';
    }

    const modeConfig = {
      multiple: mode === SelectMode.multiple,
      tags: mode === SelectMode.tags,
      combobox: isCombobox,
    };

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
      <LocaleReceiver
        componentName="Select"
        defaultLocale={defaultLocale.Select}
      >
        {this.renderSelect}
      </LocaleReceiver>
    );
  }
}
