import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';
import Radio from './radio';
import { RadioChangeEvent } from './interface';
import { getPrefixCls } from '../configure';

export type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;

export default class RadioButton extends Component<RadioButtonProps, any> {
  static displayName = 'RadioButton';

  static contextTypes = {
    radioGroup: PropTypes.any,
  };

  render() {
    const radioProps: RadioButtonProps = { ...this.props };
    if (this.context.radioGroup) {
      radioProps.onChange = this.context.radioGroup.onChange;
      radioProps.checked = this.props.value === this.context.radioGroup.value;
      radioProps.disabled = this.props.disabled || this.context.radioGroup.disabled;
    }

    return (
      <Radio prefixCls={getPrefixCls('radio-button')} {...radioProps} />
    );
  }
}
