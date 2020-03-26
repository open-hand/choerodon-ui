import Modal, { destroyFns } from './Modal';
import { getKey, open } from '../modal-container/ModalContainer';
import confirm from './confirm';
import { normalizeProps } from './utils';

Modal.key = getKey;
Modal.open = open;
Modal.confirm = confirm;
Modal.info = function(props) {
  return confirm({
    type: 'info',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.success = function(props) {
  return confirm({
    type: 'success',
    iconType: 'check_circle',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.error = function(props) {
  return confirm({
    type: 'error',
    iconType: 'cancel',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.warning = function(props) {
  return confirm({
    type: 'warning',
    iconType: 'warning',
    okCancel: false,
    ...normalizeProps(props),
  });
};
Modal.destroyAll = function destroyAllFn() {
  while (destroyFns.length) {
    const close = destroyFns.pop();
    if (close) {
      close();
    }
  }
};

export default Modal;
