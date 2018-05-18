import Modal, { ModalFuncProps } from './Modal';
import confirm from './confirm';
import Sidebar from './Sidebar';

export { ActionButtonProps } from './ActionButton';
export { ModalProps, ModalFuncProps } from './Modal';

Modal.info = function (props: ModalFuncProps) {
  const config = {
    type: 'info',
    iconType: 'info',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.success = function (props: ModalFuncProps) {
  const config = {
    type: 'success',
    iconType: 'check_circle',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.error = function (props: ModalFuncProps) {
  const config = {
    type: 'error',
    iconType: 'error',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.warning = Modal.warn = function (props: ModalFuncProps) {
  const config = {
    type: 'warning',
    iconType: 'warning',
    okCancel: false,
    ...props,
  };
  return confirm(config);
};

Modal.confirm = function (props: ModalFuncProps) {
  const config = {
    type: 'confirm',
    okCancel: true,
    ...props,
  };
  return confirm(config);
};

Modal.Sidebar = Sidebar;
export default Modal;
