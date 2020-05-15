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
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

const maskStyle = {
  background:'rgb(0, 193, 255,.3)',
}

const ModalContent = () => {

  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </div>
  );
};

function openModal(mask=true) {
  Modal.open({
    key: modalKey,
    title: 'Customized mask',
    children: <ModalContent />,
    okText: '确定',
    maskStyle,
    mask,
    maskClassName:'mask-class-name',
  });
}

ReactDOM.render(
  <div>
   <Button onClick={()=>openModal()}> Customized mask style </Button>
   <Button onClick={()=>openModal(false)}>No mask</Button>
  </div>, mountNode);
```
