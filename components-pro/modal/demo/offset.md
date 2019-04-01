---
order: 4
title:
  zh-CN: 自定义坐标
  en-US: Custom Position
---

## zh-CN

自定义坐标。

## en-US

Custom Position.

````jsx
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

function openModal() {
  Modal.open({
    key: modalKey,
    title: 'No Footer',
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
    style: {
      left: 100,
      top: 200,
    },
  });
}

ReactDOM.render(
  <Button onClick={openModal}>Open</Button>,
  mountNode,
);
````
