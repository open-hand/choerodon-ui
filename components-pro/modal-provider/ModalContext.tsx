import { createContext } from 'react';
import noop from 'lodash/noop';
import { ModalProps } from '../modal/Modal';

const ModalContext = createContext<{ open: (props: ModalProps & { children }) => void, location?: { pathname: string } }>({ open: noop });

export default ModalContext;
