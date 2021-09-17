import { createContext } from 'react';
import noop from 'lodash/noop';
import { ModalProps } from '../modal/Modal';

export interface ModalContextValue {
  open: (props: ModalProps) => void;
  location?: { pathname: string };
}

const ModalContext = createContext<ModalContextValue>({ open: noop });

export default ModalContext;
