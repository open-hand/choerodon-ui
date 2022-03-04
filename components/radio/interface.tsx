import { MouseEventHandler, ReactNode } from 'react';
import { Size } from '../_util/enum';
import { AbstractCheckboxGroupProps } from '../checkbox/Group';
import { AbstractCheckboxProps } from '../checkbox/Checkbox';

export type RadioGroupButtonStyle = 'outline' | 'solid';

export interface RadioGroupProps extends AbstractCheckboxGroupProps {
  defaultValue?: any;
  value?: any;
  onChange?: (ev: RadioChangeEvent) => void;
  size?: Size;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  name?: string;
  children?: ReactNode;
  id?: string;
  label?: string;
  buttonStyle?: RadioGroupButtonStyle;
}

export interface RadioGroupState {
  value: any;
}

export { RadioGroupContext } from './RadioContext';

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
