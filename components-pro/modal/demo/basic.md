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
import { useModal, Button } from 'choerodon-ui/pro';

const ModalContent = ({ modal }) => {
  modal.handleOk(() => {
    console.log('do OK');
    return false;
  });
  modal.handleCancel(() => {
    console.log('do Cancel');
    modal.close();
  });
  const toggleOkDisabled = React.useCallback(() => {
    modal.update({
      okProps: { disabled: !modal.props.okProps.disabled },
      okText: "保存",
    });
  },[]);
  console.log('modal', modal);

  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <Button color="primary" onClick={modal.close}>
        custom button for close modal
      </Button>
      <Button onClick={toggleOkDisabled}>
        {modal.props.okProps.disabled ? 'enable' : 'disable'}
      </Button>
    </div>
  );
};

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Basic',
      children: <ModalContent />,
      okText: '确定',
      maskClosable: 'dblclick',
      modalOkAndCancelIcon: true,
      okProps: { disabled: true },
      closeOnLocationChange: false,
      autoCenter: true,
    });
  }, [Modal]);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(<App />, mountNode);
```
