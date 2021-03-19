import { ModalProps } from './Modal';

export { ModalProps };

export {
  confirmProps,
} from './utils';

export type modalChildrenProps = {
  close: (...args: any[]) => any;
  update: (...args: any[]) => any;
  props: Readonly<ModalProps> & Readonly<{
    children?: React.ReactNode;
  }>;
  handleOk: (ok: any) => void;
  handleCancel: (cancel: any) => void;
}
