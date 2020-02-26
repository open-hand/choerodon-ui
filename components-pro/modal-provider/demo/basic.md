---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

```jsx
import { createContext, useContext, useCallback } from 'react';
import { ModalProvider, Modal, Button } from 'choerodon-ui/pro';

const Context = createContext('');

const { injectModal, useModal } = ModalProvider;

const ModalContent = () => {
  const context = useContext(Context);
  return context ? `Modal with context<${context}>` : 'Modal without context';
};

const openModal = (modal, title, context) => {
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
class OuterModal extends React.Component {
  handleClick = () => {
    const { Modal: modal } = this.props;
    openModal(modal, 'Outer');
  };

  render() {
    return (
      <>
        <Button onClick={this.handleClick}>Open outer modal</Button>
        <Context.Provider value="provider">
          <ModalProvider>
            <InnerModal />
          </ModalProvider>
        </Context.Provider>
      </>
    );
  }
}

ReactDOM.render(<OuterModal />, mountNode);
```
