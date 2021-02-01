import { createContext } from 'react';
import noop from "lodash/noop";

const ModalContext = createContext({ open: noop });

export default ModalContext;
