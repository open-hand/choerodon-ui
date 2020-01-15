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
import { ModalProvider, Button } from 'choerodon-ui/pro';

const Context = React.createContext({});

const { injectModal, useModal } = ModalProvider;

const openModal = (Modal, title, context) => {
  Modal.open({
    title: 'Inner',
    children: context.value ? `Modal with context<${context.value}>` : 'Modal without context',
  });
};

const InnterModal = () => {
  const Modal = useModal();
  const context = React.useContext(Context);
  const handleClick = React.useCallback(() => openModal(Modal, 'Inner', context), []);
  return <Button onClick={handleClick}>Open inner modal</Button>;
};

@injectModal
class OuterModal extends React.Component {
  static contextType = Context;

  handleClick = () => {
    const context = this.context;

    const { Modal } = this.props;
    openModal(Modal, 'Outer', context);
  };

  render() {
    const context = { value: 'provider' };
    return (
      <>
        <Button onClick={this.handleClick}>Open outer modal</Button>
        <Context.Provider value={context}>
          <InnterModal />
        </Context.Provider>
      </>
    );
  }
}

ReactDOM.render(<OuterModal />, mountNode);
```
