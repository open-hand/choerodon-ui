---
order: 6
title:
  zh-CN: 确认框
  en-US: Confirm
---

## zh-CN

确认框。

## en-US

Confirm.

```jsx
import { Modal, Button } from 'choerodon-ui/pro';

function doConfirm() {
  Modal.confirm({
    title: 'Confirm',
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
  }).then(button => {
    Modal.info(`Click ${button}`);
  });
}

function info() {
  Modal.info({
    title: 'This is title',
    children: '您的订单已经提交!',
  });
}

function success() {
  Modal.success('订单提交成功!');
}

function error() {
  Modal.error('订单提交失败!');
}

function warning() {
  Modal.warning('订单信息不完整!');
}

ReactDOM.render(
  <div>
    <Button onClick={doConfirm}>Confirm</Button>
    <Button onClick={info}>Info</Button>
    <Button onClick={success}>Success</Button>
    <Button onClick={error}>Error</Button>
    <br />
    <br />
    <Button onClick={warning}>Warning</Button>
  </div>,
  mountNode,
);
```
