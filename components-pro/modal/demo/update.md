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
  const handleUpdate = React.useCallback(() => {
    modal.update({
      title: 'update',
      children: (
        <div>
          <p>update contents...</p>
        </div>
      ),
      okText: '保存',
      cancelText: '退出',
      onOk: () => modal.close(),
    });
  }, [modal]);

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

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Basic',
      children: <ModalContent />,
    });
  }, [Modal]);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(<App />, mountNode);
```
