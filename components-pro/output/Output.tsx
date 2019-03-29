import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import { FormField, FormFieldProps } from '../field/FormField';
import { FieldType } from '../data-set/enum';
import { CheckBox } from '../check-box/CheckBox';
import { formatCurrency, formatNumber } from '../number-field/utils';
import autobind from '../_util/autobind';

export interface OutputProps extends FormFieldProps {
}

@observer
export default class Output extends FormField<OutputProps> {
  static displayName = 'Output';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'pro-output',
  };

  @computed
  get editable(): boolean {
    return false;
  }

  @autobind
  handleChange() {
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['name']);
  }

  getText(): ReactNode {
    return this.processText(this.processValue(this.getValue()));
  }

  processValue(value) {
    if (!isNil(value)) {
      value = super.processValue(value);
      const { field } = this;
      if (field) {
        const { type } = field;
        const { name, record, lang } = this;
        if (type === FieldType.boolean) {
          return <CheckBox disabled name={name} record={record} />;
        } else if (type === FieldType.number) {
          return formatNumber(value, lang);
        } else if (type === FieldType.currency) {
          return formatCurrency(value, lang, {
            currency: this.getProp('currency'),
          });
        }
        return field.getText(value);
      }
    }
    return value;
  }

  getRenderedValue(): ReactNode {
    const { field } = this;
    if (field) {
      const multiple = field.get('multiple');
      if (multiple) {
        return this.renderMultipleValues(true);
      }
    }
    return this.getText();
  }

  renderWrapper(): ReactNode {
    return (
      <span {...this.getMergedProps()}>{this.getRenderedValue()}</span>
    );
  }
}
