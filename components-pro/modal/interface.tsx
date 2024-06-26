import BigNumber from 'bignumber.js';
import { ModalProps, DrawerTransitionName } from './Modal';

export { ModalProps, DrawerTransitionName };

export {
  confirmProps,
} from './utils';

export type ModalChildrenProps = {
  close: () => void;
  update: (modalProps?: Partial<ModalProps>) => void;
  props: Readonly<ModalProps>;
  handleOk: (ok: Function) => void;
  handleCancel: (cancel: Function) => void;
}

/**
 * @deprecated
 */
export {
  ModalChildrenProps as modalChildrenProps,
};

export type ModalProxy = {
  open: (props?: ModalProps) => void;
  update: (props: ModalProps) => void;
  close: (destroy?: boolean) => void;
}

export interface ModalCustomized {
  width?: BigNumber | string | number;
  height?: BigNumber | string | number;
}

export enum  ModalButtonTrigger {
  CLICK = 'click',
  MOUSEDOWN = 'mouseDown',
}

export type ModalOkAndCancelIcon = undefined | boolean | { okIconType?: string | boolean, cancelIconType?: string | boolean };
