import React, { forwardRef, ForwardRefExoticComponent, memo, useContext } from 'react';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';
import Radio from './radio';
import { RadioChangeEvent } from './interface';
import RadioContext from './RadioContext';

export type RadioButtonProps = AbstractCheckboxProps<RadioChangeEvent>;

const RadioButton: ForwardRefExoticComponent<RadioButtonProps> = forwardRef<Radio, RadioButtonProps>((props, ref) => {
  const { radioGroup, getPrefixCls } = useContext(RadioContext);
  const radioProps: RadioButtonProps = { ...props };
  if (radioGroup) {
    radioProps.checked = props.value === radioGroup.value;
    radioProps.disabled = props.disabled || radioGroup.disabled;
  }

  return <Radio prefixCls={getPrefixCls('radio-button')} {...radioProps} ref={ref} />;
});

RadioButton.displayName = 'RadioButton';

export default memo(RadioButton);
