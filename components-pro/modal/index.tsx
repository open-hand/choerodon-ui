import ModalManager from '../modal-manager';
import Modal from './Modal';
import { open } from '../modal-container/ModalContainer';
import confirm from './confirm';
import preview from './preview';
import { normalizeProps } from './utils';

Modal.key = ModalManager.getKey;
Modal.open = open;
Modal.confirm = confirm;
Modal.preview = preview;
Modal.info = function (props) {
  return confirm({
    type: 'info',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.success = function (props) {
  return confirm({
    type: 'success',
    iconType: 'check_circle',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.error = function (props) {
  return confirm({
    type: 'error',
    iconType: 'cancel',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.warning = function (props) {
  return confirm({
    type: 'warning',
    iconType: 'warning',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.destroyAll = function destroyAllFn() {
  ModalManager.clear();
};

export default Modal;
