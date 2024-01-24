import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  memo,
} from 'react';
import noop from 'lodash/noop';
import ModalContainer, { ModalContainerProps } from '../modal-container/ModalContainer';
import Modal, { ModalProps } from '../modal/Modal';
import ModalContext, { ModalContextValue } from './ModalContext';

export interface ModalProviderProps extends ModalContainerProps {
  children?: ReactNode;
}

const ModalProvider = (props: ModalProviderProps) => {
  const { location: contextLocation } = useContext(ModalContext);
  const { location = contextLocation, children, getContainer } = props;
  const ref = useRef<ModalContainer | null>(null);
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
        container.open(modalProps);
      };

      const update = newProps => {
        container.update({ ...modalProps, ...newProps });
      };

      modalProps = {
        close,
        update,
        ...Modal.defaultProps as ModalProps,
        ...modalProps,
      };
      container.open(modalProps);

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

  const context = {
    open,
    location,
  };

  return (
    <ModalContext.Provider value={context}>
      <ModalContainer ref={ref} location={location} getContainer={getContainer} />
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextValue => {
  return useContext(ModalContext);
};

export const injectModal = Target => {
  const Hoc = props => {
    const modal = useModal();
    return <Target {...props} Modal={modal} />;
  };

  Hoc.displayName = `${Target.displayName || Target.name || 'Anonymous'}-with-inject-modal`;

  return Hoc;
};

type ExtendedModalProviderMemo = React.MemoExoticComponent<React.FC<ModalProviderProps>> & {
  useModal: () => ModalContextValue;
  injectModal: (Target: any) => {
    (props: any): JSX.Element;
    displayName: string;
  };
};

// @ts-ignore
const ModalProviderMemo: ExtendedModalProviderMemo = memo(ModalProvider, (props, nextProps) => {
  if (typeof props.getContainer === 'function' && typeof nextProps.getContainer === 'function') {
    return props.getContainer() === nextProps.getContainer() &&
      props.location === nextProps.location;
  }
  return props.getContainer === nextProps.getContainer &&
    props.location === nextProps.location;
});

ModalProviderMemo.displayName = 'ModalProvider';

ModalProviderMemo.useModal = useModal;

ModalProviderMemo.injectModal = injectModal;

export default ModalProviderMemo;
