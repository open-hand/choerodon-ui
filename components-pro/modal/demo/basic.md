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

````jsx
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

const ModalContent = ({ modal }) => {
  modal.handleOk(() => {
    console.log('do OK');
    return false;
  });
  modal.handleCancel(() => {
    console.log('do Cancel');
  });
  function toggleOkDisabled() {
    modal.update({ okProps:{ disabled: !modal.props.okProps.disabled } });
  }
  
  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <Button color="blue" onClick={modal.close}>custom button for close modal</Button>
      <Button onClick={toggleOkDisabled}>{modal.props.okProps.disabled ? 'enable' : 'disable'}</Button>
    </div>
  );
};

function openModal() {
  Modal.open({
    key: modalKey,
    title: 'Basic',
    children: <ModalContent />,
    okProps: { disabled: true, children: '保存' },
  });
}

ReactDOM.render(
  <Button onClick={openModal}>Open</Button>,
  mountNode,
);
````
