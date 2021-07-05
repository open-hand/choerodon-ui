import React, { ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, isArrayLike } from 'mobx';
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

const GroupIdGen = (function* (id) {
  while (true) {
    yield `__group-${id++}__`;
  }
})(1);

export interface SelectBoxProps extends SelectProps {
  /**
   * 是否垂直显示
   */
  vertical?: boolean;
  mode?: ViewMode;
}

@observer
export default class SelectBox extends Select<SelectBoxProps> {
  static displayName = 'SelectBox';

  static propTypes = {
    /**
     * 是否垂直显示
     */
    vertical: PropTypes.bool,
    ...Select.propTypes,
  };

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'select-box',
    vertical: false,
    selectAllButton: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('SelectBox', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
    };
  }

  @computed
  get name(): string | undefined {
    return this.observableProps.name || GroupIdGen.next().value;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'vertical',
    ]);
  }

  getClassName() {
    const {
      prefixCls,
      props: { vertical },
    } = this;
    return super.getClassName({
      [`${prefixCls}-vertical`]: vertical,
    });
  }

  isEmpty() {
    return false;
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

  renderWrapper(): ReactNode {
    const { name, options, filteredOptions, textField, valueField, readOnly, disabled } = this;
    const { autoFocus, mode, onOption, optionRenderer, optionsFilter } = this.props;
    const highlight = this.getProp('highlight');
    const items = filteredOptions.reduce<ReactElement<any>[]>((arr, record, index, data) => {
      if (!optionsFilter || optionsFilter(record, index, data)) {
        const optionProps = onOption({ dataSet: options, record });
        const text = record.get(textField);
        const value = record.get(valueField);
        const children = optionRenderer
          ? optionRenderer({ dataSet: options, record, text, value })
          : text;
        const itemProps: OptionProps = {
          ...record.get(OTHER_OPTION_PROPS),
          key: index,
          dataSet: null,
          record: null,
          value,
          checked: this.isChecked(this.getValue(), value),
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
    const className = this.getClassName();
    const Element = this.context.formNode ? 'div' : 'form';
    return (
      <span key="wrapper" {...this.getWrapperProps()}>
        {this.renderSearcher()}
        {this.renderSelectAll()}
        <Element className={className} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>{items}</Element>
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
