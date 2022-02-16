import { ReactNode, CSSProperties, SFC } from 'react';

export interface OptionProps {
  value?: string;
  key?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Option: SFC<OptionProps> = () => null;

export default Option;
