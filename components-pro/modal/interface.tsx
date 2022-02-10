import { ModalProps, DrawerTransitionName } from './Modal';

export { ModalProps, DrawerTransitionName };

export {
  confirmProps,
} from './utils';

export type modalChildrenProps = {
  close: () => void;
  update: (modalProps?: Partial<ModalProps>) => void;
  props: Readonly<ModalProps>;
  handleOk: (ok: Function) => void;
  handleCancel: (cancel: Function) => void;
}

export interface ModalCustomized {
  width?: string | number;
  height?: string | number;
}