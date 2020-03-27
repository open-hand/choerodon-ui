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
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

const ModalContent = ({ modal }) => {
  modal.handleOk(() => {
    console.log('do OK');
    return false;
  });
  modal.handleCancel(() => {
    console.log('do Cancel');
    modal.close();
  });
  function toggleOkDisabled() {
    modal.update({
      okProps: { disabled: !modal.props.okProps.disabled, children: '保存11' },
    });
  }
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

let modalNew;

function openModal() {
  modalNew = Modal.open({
    key: modalKey,
    title: 'Basic',
    children: <ModalContent />,
    okText: '点击',
    okProps: { disabled: true },
  });
  // setTimeout(() => {
  //   modalNew.update({
  //     title: 'update',
  //     // children: (
  //     //   <div>
  //     //     <p>Some contents...</p>
  //     //     <p>Some contents...</p>
  //     //     <p>Some contents...</p>
  //     //   </div>
  //     // ),
  //   });
  // }, 2000);
}

ReactDOM.render(<Button onClick={openModal}>Open</Button>, mountNode);
```
