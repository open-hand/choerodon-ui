---
order: 8
title:
  zh-CN: 全屏显示
  en-US: Full Screen
---

## zh-CN

全屏显示。

## en-US

Full screen.

````jsx
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

function openModal() {
  Modal.open({
    key: modalKey,
    title: 'Full screen',
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
    fullScreen: true,
  });
}

ReactDOM.render(
  <Button onClick={openModal}>Open</Button>,
  mountNode,
);
````
