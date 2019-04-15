import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike, observable } from 'mobx';
import omit from 'lodash/omit';
import { FormField, FormFieldProps } from '../field/FormField';
import Radio from '../radio/Radio';
import CheckBox from '../check-box/CheckBox';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import { ViewMode } from '../radio/enum';
import DataSet from '../data-set/DataSet';
import normalizeOptions from '../option/normalizeOptions';
import { $l } from '../locale-context';

const GroupIdGen = function* (id) {
  while (true) {
    yield `__group-${id++}__`;
  }
}(1);

export interface SelectBoxProps extends FormFieldProps {
  /**
   * 是否垂直显示
   */
  vertical?: boolean;
  mode?: ViewMode;
}

@observer
export default class SelectBox extends FormField<SelectBoxProps> {
  static displayName = 'SelectBox';

  static propTypes = {
    /**
     * 是否垂直显示
     */
    vertical: PropTypes.bool,
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'pro-select-box',
    vertical: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    return {
      valueMissing: $l('SelectBox', 'value_missing'),
    };
  }

  @computed
  get options(): DataSet {
    const { field, textField, valueField, multiple, props: { children } } = this;
    return normalizeOptions({ field, textField, valueField, multiple, children });
  }

  @observable value?: any;

  @computed
  get textField(): string {
    const { field } = this;
    if (field) {
      return field.get('textField') || 'meaning';
    }
    return 'meaning';
  }

  @computed
  get valueField(): string {
    const { field } = this;
    if (field) {
      return field.get('valueField') || 'value';
    }
    return 'value';
  }

  @action
  setName(name) {
    super.setName(name || this.name || GroupIdGen.next().value);
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['vertical']);
  }

  @computed
  get multiple(): boolean {
    return !!this.getProp('multiple');
  }

  getClassName() {
    const { prefixCls, props: { vertical } } = this;
    return super.getClassName({
      [`${prefixCls}-vertical`]: vertical,
    });
  }

  renderWrapper(): ReactNode {
    const { options, textField, valueField } = this;
    const { autoFocus, mode } = this.props;
    const items = options.data.map((record, index) => (
      this.renderItem({
        key: index,
        dataSet: null,
        value: record.get(valueField),
        checked: this.isChecked(this.getValue(), record.get(valueField)),
        name: this.name,
        onChange: this.handleItemChange,
        children: record.get(textField),
        autoFocus: autoFocus && index === 0,
        readOnly: this.isReadOnly(),
        disabled: this.isDisabled(),
        mode,
        noValidate: true,
      })
    ));
    const { className } = this.getOtherProps();
    const Element = this.context.formNode ? 'div' : 'form';
    return (
      <span {...this.getWrapperProps()}>
        <Element className={className}>{items}</Element>
        {this.renderFloatLabel()}
      </span>
    );
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
    } else {
      return value === checkedValue;
    }
  }

  renderItem(props) {
    if (this.multiple) {
      return <CheckBox {...props} />;
    } else {
      return <Radio {...props} />;
    }
  }
}
