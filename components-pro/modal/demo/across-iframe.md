---
order: 11
title:
  zh-CN: 穿越 iframe
  en-US: Across iframe
iframe: 200
across: true
---

## zh-CN

穿越 iframe, 跨域时不生效, 不支持 ModalProvider 提供的 modal， 保证顶层引入了 choerodon-ui/pro 的样式。

## en-US

Across iframe, Does not take effect when cross-domain.

```jsx
import { Modal, Button } from 'choerodon-ui/pro';

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
  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Basic',
      children: <ModalContent />,
      okText: '确定',
      maskClosable: 'dblclick',
      okProps: { disabled: true },
      closeOnLocationChange: false,
    });
  }, []);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(<App />, mountNode);
```
