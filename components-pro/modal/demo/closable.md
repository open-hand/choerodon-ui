---
order: 5
title:
  zh-CN: 关闭按钮
  en-US: Close Button
---

## zh-CN

关闭按钮。

## en-US

No Close Button.

````jsx
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

function openModal() {
  Modal.open({
    key: modalKey,
    title: 'No close button',
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
    closable: true,
  });
}

ReactDOM.render(
  <Button onClick={openModal}>Open</Button>,
  mountNode,
);
````
