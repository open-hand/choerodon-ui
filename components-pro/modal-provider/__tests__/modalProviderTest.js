import React, { createContext, useContext, useCallback } from 'react';
import ModalProvider from '..';
import Modal from '../../modal';
import Button from '../../button';

const Context = createContext('');

const { injectModal, useModal } = ModalProvider;

const ModalContent = () => {
  const context = useContext(Context);
  return context ? `Modal with context<${context}>` : 'Modal without context';
};

const openModal = (modal, title) => {
  modal.open({
    title,
    children: <ModalContent />,
    onOk: () => Modal.confirm('This is normal Modal confirm'),
  });
};

const InnerModal = () => {
  const modal = useModal();
  const handleClick = useCallback(() => openModal(modal, 'Inner'), []);
  return <Button onClick={handleClick}>Open inner modal</Button>;
};

@injectModal
class ModalProviderTest extends React.Component {
  handleClick = () => {
    const { Modal: modal } = this.props;
    openModal(modal, 'Outer');
  };

  render() {
    return (
      <React.Fragment>
        <Button onClick={this.handleClick}>Open outer modal</Button>
        <Context.Provider value="provider">
          <ModalProvider>
            <InnerModal />
          </ModalProvider>
        </Context.Provider>
      </React.Fragment>
    );
  }
}

export default ModalProviderTest;
