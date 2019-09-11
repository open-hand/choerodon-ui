import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';
import Radio from './radio';
import { RadioChangeEvent } from './interface';
import { getPrefixCls } from '../configure';

export type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;

export default class RadioButton extends PureComponent<RadioButtonProps, any> {
  static displayName = 'RadioButton';

  static contextTypes = {
    radioGroup: PropTypes.any,
  };

  render() {
    const { props } = this;
    const { radioGroup } = this.context;
    const radioProps: RadioButtonProps = { ...props };
    if (radioGroup) {
      radioProps.onChange = radioGroup.onChange;
      radioProps.checked = props.value === radioGroup.value;
      radioProps.disabled = props.disabled || radioGroup.disabled;
    }

    return <Radio prefixCls={getPrefixCls('radio-button')} {...radioProps} />;
  }
}
