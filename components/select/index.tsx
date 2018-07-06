import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import RcSelect, { Option, OptGroup } from '../rc-components/select';

export interface AbstractSelectProps {
  prefixCls?: string;
  className?: string;
  size?: 'default' | 'large' | 'small';
  notFoundContent?: React.ReactNode | null;
  transitionName?: string;
  choiceTransitionName?: string;
  showSearch?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  tabIndex?: number;
  placeholder?: string;
  defaultActiveFirstOption?: boolean;
  dropdownClassName?: string;
  dropdownStyle?: React.CSSProperties;
  dropdownMenuStyle?: React.CSSProperties;
  onDropdownMouseDown?: (e: React.MouseEvent<any>) => void;
  onSearch?: (value: string) => any;
  filterOption?: boolean | ((inputValue: string, option: React.ReactElement<OptionProps>) => any);
}

export interface LabeledValue {
  key: string;
  label: React.ReactNode;
}

export type SelectValue = string | any[] | LabeledValue | LabeledValue[];

export interface SelectProps extends AbstractSelectProps {
  value?: SelectValue;
  defaultValue?: SelectValue;
  mode?: 'default' | 'multiple' | 'tags' | 'combobox';
  optionLabelProp?: string;
  onInput?: (value: SelectValue) => void;
  onChange?: (value: SelectValue, option: React.ReactElement<any> | React.ReactElement<any>[]) => void;
  onSelect?: (value: SelectValue, option: React.ReactElement<any>) => any;
  onDeselect?: (value: SelectValue) => any;
  onBlur?: () => any;
  onFocus?: () => any;
  onPopupScroll?: () => any;
  onInputKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChoiceItemClick?: (value: SelectValue, option: React.ReactElement<any>) => void;
  maxTagCount?: number;
  maxTagPlaceholder?: React.ReactNode | ((omittedValues: SelectValue[]) => React.ReactNode);
  dropdownMatchSelectWidth?: boolean;
  optionFilterProp?: string;
  labelInValue?: boolean;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  tokenSeparators?: string[];
  getInputElement?: () => React.ReactElement<any>;
  autoFocus?: boolean;
  showNotFindInputItem?: boolean;
  showNotFindSelectedItem?: boolean;
  getRootDomNode?: () => HTMLElement;
  showCheckAll?: boolean;
  filter?: boolean;
  footer?: React.ReactNode | string,
  choiceRender?: (liDom: HTMLElement, value: SelectValue) => any,
  loading?: boolean | object;
  choiceRemove?: boolean;
}

export interface OptionProps {
  disabled?: boolean;
  value?: any;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  style?: object;
}

export interface OptGroupProps {
  label?: React.ReactNode;
}

export interface SelectLocale {
  notFoundContent?: string;
}

const SelectPropTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(['default', 'large', 'small']),
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
};

// => It is needless to export the declaration of below two inner components.
// export { Option, OptGroup };

export default class Select extends React.Component<SelectProps, {}> {
  static Option = Option as React.ClassicComponentClass<OptionProps>;
  static OptGroup = OptGroup as React.ClassicComponentClass<OptGroupProps>;

  static defaultProps = {
    prefixCls: 'ant-select',
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
    const isCombobox = mode === 'combobox';
    if (isCombobox) {
      // AutoComplete don't have notFoundContent defaultly
      return notFoundContent === undefined ? null : notFoundContent;
    }
    return notFoundContent === undefined ? locale.notFoundContent : notFoundContent;
  }

  renderSelect = (locale: SelectLocale) => {
    const {
      prefixCls,
      className = '',
      size,
      mode,
      ...restProps,
    } = this.props;
    const cls = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    }, className);

    let { optionLabelProp } = this.props;
    const isCombobox = mode === 'combobox';
    if (isCombobox) {
      // children 带 dom 结构时，无法填入输入框
      optionLabelProp = optionLabelProp || 'value';
    }

    const modeConfig = {
      multiple: mode === 'multiple',
      tags: mode === 'tags',
      combobox: isCombobox,
    };

    return (
      <RcSelect
        {...restProps}
        {...modeConfig}
        prefixCls={prefixCls}
        className={cls}
        optionLabelProp={optionLabelProp || 'children'}
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
