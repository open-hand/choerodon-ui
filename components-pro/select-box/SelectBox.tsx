import React, { ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { isArrayLike } from 'mobx';
import classNames from 'classnames';
import { Select, SelectProps } from '../select/Select';
import ObserverRadio from '../radio/Radio';
import ObserverCheckBox from '../check-box/CheckBox';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import Option, { OptionProps } from '../option/Option';
import OptGroup from '../option/OptGroup';
import { ViewMode } from '../radio/enum';
import { $l } from '../locale-context';
import { LabelLayout } from '../form/enum';
import TextField from '../text-field';
import Icon from '../icon';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import { OTHER_OPTION_PROPS } from '../option/normalizeOptions';

export interface SelectBoxProps extends SelectProps {
  /**
   * 是否垂直显示
   */
  vertical?: boolean;
  mode?: ViewMode;
}

export class SelectBox<T extends SelectBoxProps = SelectBoxProps> extends Select<T> {
  static displayName = 'SelectBox';

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'select-box',
    vertical: false,
    selectAllButton: false,
    checkValueOnOptionsChange: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('SelectBox', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
    };
  }

  get searchable(): boolean {
    const { searchable = this.getContextConfig('selectBoxSearchable') } = this.observableProps;
    return !!searchable;
  }

  get mode(): ViewMode | undefined {
    return this.props.mode;
  }

  isSearchFieldInPopup(): boolean | undefined {
    return false;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'vertical',
    ]);
  }

  getClassName(...props): string | undefined {
    const {
      prefixCls,
      props: { vertical },
    } = this;
    return super.getClassName(
      {
        [`${prefixCls}-vertical`]: vertical,
      },
      ...props,
    );
  }

  getWrapperClassNamesExcludeOutput(prefixCls, _): object | undefined {
    return super.getWrapperClassNamesExcludeOutput(prefixCls, false);
  }

  renderSearcher(): ReactNode {
    if (this.searchable) {
      const { placeholder } = this.props;
      return (
        <TextField
          prefix={<Icon type="search" />}
          placeholder={placeholder}
          value={this.text}
          onInput={this.handleInput}
          labelLayout={this.labelLayout}
        />
      );
    }
  }

  getOptionOtherProps(_: boolean): OptionProps {
    return {};
  }

  renderWrapper(): ReactNode {
    const { name, options, filteredOptions, textField, valueField, readOnly, disabled, mode } = this;
    const { autoFocus, onOption, optionRenderer, optionsFilter } = this.props;
    const highlight = this.getDisplayProp('highlight');
    let hasRef = false;
    const items = filteredOptions.reduce<ReactElement<any>[]>((arr, record, index, data) => {
      if (!optionsFilter || optionsFilter(record, index, data)) {
        const optionProps = onOption({ dataSet: options, record });
        const text = record.get(textField);
        const value = record.get(valueField);
        const checked = this.isChecked(this.getValue(), value);
        const children = optionRenderer
          ? optionRenderer({ dataSet: options, record, text, value })
          : text;
        const itemProps: OptionProps = {
          ...record.get(OTHER_OPTION_PROPS),
          key: index,
          dataSet: null,
          record: null,
          value,
          checked,
          name,
          onChange: this.handleItemChange,
          children,
          autoFocus: autoFocus && index === 0,
          readOnly,
          disabled,
          mode,
          noValidate: true,
          labelLayout: LabelLayout.none,
          highlight,
        };
        if (!hasRef && !disabled && !(itemProps.disabled || optionProps.disabled)) {
          itemProps.ref = this.elementReference;
          hasRef = true;
        }
        Object.assign(itemProps, this.getOptionOtherProps(checked));
        arr.push(this.renderItem(optionProps ? {
          ...optionProps,
          ...itemProps,
          className: classNames(optionProps.className, itemProps.className),
          style: {
            ...optionProps.style,
            ...itemProps.style,
          },
          disabled: itemProps.disabled || optionProps.disabled,
        } : itemProps));
      }
      return arr;
    }, []);

    return (
      <span key="wrapper" {...this.getWrapperProps()}>
        {this.renderSearcher()}
        {this.renderSelectAll()}
        {this.renderSelectItems(items)}
        {this.renderFloatLabel()}
        {
          options.paging && options.currentPage < options.totalPage && (
            <Button funcType={FuncType.flat} icon="more_horiz" onClick={this.handleQueryMore} />
          )
        }
      </span>
    );
  }

  @autobind
  renderSelectItems(items: ReactNode): ReactNode {
    const className = this.getClassName();
    const Element = this.context.formNode ? 'div' : 'form';
    return (
      <Element className={className} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
        {items}
      </Element>
    );
  }

  @autobind
  handleQueryMore() {
    const { options } = this;
    options.queryMore(options.currentPage + 1);
  }

  @autobind
  handleInput(e) {
    const { value } = e.target;
    this.setText(value);
  }

  @autobind
  handleItemChange(value, oldValue) {
    if (this.multiple) {
      const values = this.getValues();
      if (!value) {
        values.splice(values.indexOf(oldValue), 1);
      } else {
        values.push(value);
      }
      this.setValue(values);
    } else {
      this.setValue(value);
    }
  }

  isChecked(value, checkedValue) {
    if (isArrayLike(value)) {
      return value.indexOf(checkedValue) !== -1;
    }
    return value === checkedValue;
  }

  renderItem(props) {
    if (this.multiple) {
      return <ObserverCheckBox {...props} />;
    }
    return <ObserverRadio {...props} />;
  }
}

@observer
export default class ObserverSelectBox extends SelectBox<SelectBoxProps> {
  static defaultProps = SelectBox.defaultProps;

  static Option = Option;

  static OptGroup = OptGroup;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;
}
