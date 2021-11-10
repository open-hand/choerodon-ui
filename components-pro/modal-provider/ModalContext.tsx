import { getContext, Symbols } from 'choerodon-ui/shared';
import { ModalProps } from '../modal/Modal';
import { open } from '../modal-container/ModalContainer';

export interface ModalContextValue {
  open: (props: ModalProps) => void;
  location?: { pathname: string };
}

const ModalContext = getContext<ModalContextValue>(Symbols.ModalContext, { open });

export default ModalContext;
