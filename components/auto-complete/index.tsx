import React, {
  Children,
  ClassicComponentClass,
  Component,
  FormEventHandler,
  isValidElement,
  ReactElement,
} from 'react';
import classNames from 'classnames';
import Select, { AbstractSelectProps, OptGroupProps, OptionProps, SelectValue } from '../select';
import Input from '../input';
import InputElement from './InputElement';
import { OptGroup, Option } from '../rc-components/select';
import { Size } from '../_util/enum';
import { SelectMode } from '../select/enum';
import { getPrefixCls } from '../configure';

export interface DataSourceItemObject {
  value: string;
  text: string;
}

export type DataSourceItemType = string | DataSourceItemObject | ReactElement;

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
  optionLabelProp?: string;
  onChange?: (value: SelectValue) => void;
  onSelect?: (value: SelectValue, option: Object) => any;
  children?: ValidInputElement | ReactElement<OptionProps> | ReactElement<OptionProps>[];
}

function isSelectOptionOrSelectOptGroup(child: any): Boolean {
  return child && child.type && (child.type.isSelectOption || child.type.isSelectOptGroup);
}

export default class AutoComplete extends Component<AutoCompleteProps, {}> {
  static displayName = 'AutoComplete';

  static Option = Option as ClassicComponentClass<OptionProps>;

  static OptGroup = OptGroup as ClassicComponentClass<OptGroupProps>;

  static defaultProps = {
    transitionName: 'slide-up',
    optionLabelProp: 'children',
    choiceTransitionName: 'zoom',
    showSearch: false,
    filterOption: false,
  };

  private select: any;

  getInputElement = () => {
    const { children } = this.props;
    const element =
      children && isValidElement(children) && children.type !== Option ? (
        Children.only(children)
      ) : (
          <Input border={false} />
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
