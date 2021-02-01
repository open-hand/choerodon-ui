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
import { ModalProvider, Modal, Button, injectModal, useModal } from 'choerodon-ui/pro';

const Context = React.createContext('');

const ModalContent = () => {
  const context = React.useContext(Context);
  const modal = useModal();
  return context ? (
    <>
      {`Modal with context<${context}>`}
      <Button onClick={() => openModal(modal, 'Inner level 2', 300)}>open new provider</Button>
    </>
  ) : 'Modal without context';
};

const openModal = (modal, title, width) => {
  modal.open({
    drawer: true,
    title,
    children: <ModalProvider><ModalContent /></ModalProvider>,
    onOk: () => Modal.confirm('This is normal Modal confirm'),
    style: { width }
  });
};

const InnerModal = () => {
  const modal = useModal();
  const handleClick = React.useCallback(() => openModal(modal, 'Inner', 600), []);
  return <Button onClick={handleClick}>Open inner modal</Button>;
};

@injectModal
class App extends React.Component {
  handleClick = () => {
    const { Modal: modal } = this.props;
    openModal(modal, 'Outer', 600);
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

ReactDOM.render(<App />, mountNode);
```
