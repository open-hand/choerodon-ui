---
order: 10
title:
  zh-CN: 更新渲染
  en-US: Update Rendering
---

## zh-CN

更新渲染。

## en-US

Update rendering example.

```jsx
import { Modal, Button } from 'choerodon-ui/pro';

let _modal;
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
  function handleUpdate() {
    _modal.update({
      title: 'update',
      children: (
        <div>
          <p>update contents...</p>
        </div>
      ),
      okText: '保存',
      cancelText: '退出',
      onOk: () => _modal.close(),
    });
  }

  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <Button onClick={handleUpdate}>
        update modal
      </Button>
    </div>
  );
};

function openModal() {
  _modal = Modal.open({
    key: modalKey,
    title: 'Basic',
    children: <ModalContent />,
  });
}

ReactDOM.render(<Button onClick={openModal}>Open</Button>, mountNode);
```
