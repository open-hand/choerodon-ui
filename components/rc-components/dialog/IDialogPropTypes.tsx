import { CSSProperties, ReactInstance, ReactNode, SyntheticEvent } from 'react';

export default interface IDialogPropTypes {
  className?: string;
  keyboard?: boolean;
  style?: CSSProperties;
  mask?: boolean;
  children?: any;
  afterClose?: () => any;
  animationEnd?: () => any;
  onClose?: (e: SyntheticEvent<HTMLDivElement>) => any;
  closable?: boolean;
  maskClosable?: boolean;
  visible?: boolean;
  destroyOnClose?: boolean;
  mousePosition?: {
    x: number;
    y: number;
  } | null;
  title?: ReactNode;
  footer?: ReactNode;
  transitionName?: string;
  maskTransitionName?: string;
  animation?: any;
  maskAnimation?: any;
  wrapStyle?: {};
  bodyStyle?: {};
  maskStyle?: {};
  prefixCls?: string;
  wrapClassName?: string;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  bodyProps?: any;
  maskProps?: any;
  wrapProps?: any;
  getContainer?: (instance: ReactInstance) => HTMLElement;
  closeIcon?: ReactNode;
  movable?: boolean;
  autoCenter?: boolean;
  center?: boolean;
}
