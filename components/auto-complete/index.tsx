import React, { Children, ClassicComponentClass, cloneElement, Component, FormEventHandler, isValidElement, ReactElement } from 'react';
import classNames from 'classnames';
import Select, { AbstractSelectProps, OptGroupProps, OptionProps, SelectValue } from '../select';
import Input, { InputProps } from '../input';
import InputElement from './InputElement';
import { OptGroup, Option } from '../rc-components/select';
import { Size } from '../_util/enum';
import { SelectMode } from '../select/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface DataSourceItemObject {
  value: string;
  text: string;
}

export type DataSourceItemType = string | DataSourceItemObject | ReactElement<OptionProps> | ReactElement<OptGroupProps>;

export interface AutoCompleteInputProps {
  onChange?: FormEventHandler<any>;
  value: any;
}

export type ValidInputElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | ReactElement<AutoCompleteInputProps>;

export interface AutoCompleteProps extends AbstractSelectProps {
  value?: SelectValue;
  defaultValue?: SelectValue;
  dataSource?: DataSourceItemType[];
  backfill?: boolean;
  optionLabelProp?: string;
  onChange?: (value: SelectValue) => void;
  onSelect?: (value: SelectValue, option: Record<string, any>) => any;
  children?: ValidInputElement | ReactElement<OptionProps> | ReactElement<OptionProps>[];
  inputProps?: InputProps;
}

function isSelectOptionOrSelectOptGroup(child: any): boolean {
  return child && child.type && (child.type.isSelectOption || child.type.isSelectOptGroup);
}

export default class AutoComplete extends Component<AutoCompleteProps, {}> {
  static displayName = 'AutoComplete';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Option = Option as ClassicComponentClass<OptionProps>;

  static OptGroup = OptGroup as ClassicComponentClass<OptGroupProps>;

  static defaultProps = {
    transitionName: 'slide-up',
    optionLabelProp: 'children',
    choiceTransitionName: 'zoom',
    showSearch: false,
    filterOption: false,
  };

  context: ConfigContextValue;

  private select: any;

  getInputElement = () => {
    const { children, inputProps } = this.props;
    const element =
      children && isValidElement(children) && children.type !== Option ? (
        cloneElement<any>(Children.only(children), { labelLayout: 'none' })
      ) : (
        <Input {...inputProps} border={false} />
      );
    const elementProps = { ...(element as ReactElement<any>).props };

    delete elementProps.children;
    return <InputElement {...elementProps}>{element}</InputElement>;
  };

  focus() {
    this.select.focus();
  }

  blur() {
    this.select.blur();
  }

  saveSelect = (node: any) => {
    this.select = node;
  };

  render() {
    const {
      size,
      className = '',
      notFoundContent,
      prefixCls: customizePrefixCls,
      optionLabelProp,
      dataSource,
      children,
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('select', customizePrefixCls);

    const cls = classNames({
      [`${prefixCls}-lg`]: size === Size.large,
      [`${prefixCls}-sm`]: size === Size.small,
      [className]: !!className,
      [`${prefixCls}-show-search`]: true,
      [`${prefixCls}-auto-complete`]: true,
    });

    let options;
    const childArray = Children.toArray(children);
    if (childArray.length && isSelectOptionOrSelectOptGroup(childArray[0])) {
      options = children;
    } else {
      options = dataSource
        ? dataSource.map(item => {
          if (isValidElement(item)) {
            return item;
          }
          switch (typeof item) {
            case 'string':
              return <Option key={item as string}>{item}</Option>;
            case 'object':
              return (
                <Option key={(item as DataSourceItemObject).value}>
                  {(item as DataSourceItemObject).text}
                </Option>
              );
            default:
              throw new Error(
                'AutoComplete[dataSource] only supports type `string[] | Object[]`.',
              );
          }
        })
        : [];
    }

    return (
      <Select
        {...this.props}
        prefixCls={prefixCls}
        className={cls}
        mode={SelectMode.combobox}
        optionLabelProp={optionLabelProp}
        getInputElement={this.getInputElement}
        notFoundContent={notFoundContent}
        ref={this.saveSelect}
      >
        {options}
      </Select>
    );
  }
}
