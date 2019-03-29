---
order: 3
title:
  zh-CN: 多层
  en-US: Multilayer
---

## zh-CN

多层。

## en-US

Multilayer.

````jsx
import { Modal, Button } from 'choerodon-ui/pro';

const modalKey = Modal.key();

async function openSubModal() {
  return await Modal.confirm('确认关闭？') === 'ok';
}

function openModal() {
  Modal.open({
    key: modalKey,
    title: 'Multilayer',
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
    onClose: openSubModal,
  });
}

ReactDOM.render(
  <Button onClick={openModal}>Open</Button>,
  mountNode,
);
````
