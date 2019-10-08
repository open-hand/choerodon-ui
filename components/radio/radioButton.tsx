import React from 'react';
import PropTypes from 'prop-types';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';
import Radio from './radio';
import { RadioChangeEvent } from './interface';
import { getPrefixCls } from '../configure';

export type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;

const RadioButton = function(props: RadioButtonProps, context) {
  const { radioGroup } = context;
  const radioProps: RadioButtonProps = { ...props };
  if (radioGroup) {
    radioProps.checked = props.value === radioGroup.value;
    radioProps.disabled = props.disabled || radioGroup.disabled;
  }

  return <Radio prefixCls={getPrefixCls('radio-button')} {...radioProps} />;
};

RadioButton.displayName = 'RadioButton';
RadioButton.contextTypes = {
  radioGroup: PropTypes.any,
};

export default RadioButton;
