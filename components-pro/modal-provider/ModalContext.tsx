import { getContext, Symbols } from 'choerodon-ui/shared';
import { ModalProps } from '../modal/Modal';
import { ModalProxy } from '../modal/interface';
import { open } from '../modal-container/ModalContainer';

export interface ModalContextValue {
  open: (props: ModalProps) => ModalProxy | void;
  location?: { pathname: string };
}

const ModalContext = getContext<ModalContextValue>(Symbols.ModalContext, { open });

export default ModalContext;
