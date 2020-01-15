import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import noop from 'lodash/noop';
import ModalContainer, { ModalContainerProps } from '../modal-container/ModalContainer';
import Modal, { ModalProps } from '../modal/Modal';

export interface ModalProviderProps extends ModalContainerProps {
  children?: ReactNode;
}

const ModalContext = createContext({ open: noop });

const ModalProvider = (props: ModalProviderProps) => {
  const { location, children } = props;
  const ref = useRef<ModalContainer>(null);
  const prepareToOpen = useMemo<(ModalProps & { children })[]>(
    () => [] as (ModalProps & { children })[],
    [],
  );

  const open = useCallback((modalProps: ModalProps & { children }) => {
    const container = ref.current;
    if (container) {
      const close = async (destroy?: boolean) => {
        const { onClose = noop } = modalProps;
        if ((await onClose()) !== false) {
          if (destroy) {
            container.close({ ...modalProps, destroyOnClose: true });
          } else {
            container.close(modalProps);
          }
        }
      };

      const show = () => {
        container.top().open(modalProps);
      };

      const update = newProps => {
        container.top().update({ ...modalProps, ...newProps });
      };

      modalProps = {
        close,
        update,
        ...Modal.defaultProps,
        ...modalProps,
      };
      container.top().open(modalProps);

      return {
        close,
        open: show,
        update,
      };
    }
    prepareToOpen.push(modalProps);
  }, []);

  useEffect(() => {
    if (ref.current) {
      prepareToOpen.forEach(prepare => open(prepare));
    }
  }, [ref, open]);

  const context = { open };

  return (
    <ModalContext.Provider value={context}>
      <ModalContainer ref={ref} location={location} />
      {children}
    </ModalContext.Provider>
  );
};

const useModal = () => {
  return useContext(ModalContext);
};

const injectModal = Target => {
  const Hoc = props => {
    const modal = useModal();
    return <Target {...props} Modal={modal} />;
  };

  Hoc.displayName = `${Target.displayName || 'Anonymous'}-with-inject-modal`;

  return Hoc;
};

ModalProvider.displayName = 'ModalProvider';

ModalProvider.useModal = useModal;

ModalProvider.injectModal = injectModal;

export default ModalProvider;
