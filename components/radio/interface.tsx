import { ChangeEventHandler, MouseEventHandler, ReactNode } from 'react';
import { Size } from '../_util/enum';
import { AbstractCheckboxGroupProps } from '../checkbox/Group';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';

export interface RadioGroupProps extends AbstractCheckboxGroupProps {
  defaultValue?: any;
  value?: any;
  onChange?: (e: RadioChangeEvent) => void;
  size?: Size;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  name?: string;
  children?: ReactNode;
  id?: string;
  label?: string;
}

export interface RadioGroupState {
  value: any;
}

export interface RadioGroupContext {
  radioGroup: {
    onChange: ChangeEventHandler<HTMLInputElement>;
    value: any;
    disabled: boolean;
    name: string;
  };
}

export type RadioProps = AbstractCheckboxProps<RadioChangeEvent>;

export interface RadioChangeEventTarget extends RadioProps {
  checked: boolean;
}

export interface RadioChangeEvent {
  target: RadioChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}
