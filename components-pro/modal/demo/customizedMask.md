---
order: 12
title:
  zh-CN: 自定义遮罩样式
  en-US: Customized mask
---

## zh-CN

自定义遮罩样式

## en-US

Customized mask.

```jsx
import { useModal, Button, Modal, ModalProvider } from 'choerodon-ui/pro';

const maskStyle = {
  backgroundColor: 'rgb(0, 193, 255,.3)',
}

const App = () => {
  const modal = useModal();

  const openModal = React.useCallback((mask = true) => {
    (mask ? modal : Modal).open({
      title: mask ? 'Customized mask' : 'No mask',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          { mask && <ModalProvider /> }
          <Button onClick={openNoMask}>No mask</Button>
        </div>
      ),
      okText: '确定',
      maskStyle,
      mask,
      maskClosable: true,
      maskClassName:'mask-class-name',
    });
  }, [modal]);

  const openMask = React.useCallback(() => {
    openModal();
  }, [openModal]);

  const openNoMask = React.useCallback(() => {
    openModal(false);
  }, [openModal]);

  return (
    <div>
      <Button onClick={openMask}> Customized mask style </Button>
      <Button onClick={openNoMask}>No mask</Button>
    </div>
  );
}

ReactDOM.render(<App />, mountNode);
```
