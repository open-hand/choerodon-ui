---
order: 2
title:
  zh-CN: 自定义页脚
  en-US: Custom Footer
---

## zh-CN

自定义页脚。

## en-US

Custom Footer.

````jsx
import { Modal, Button } from 'choerodon-ui/pro';

const key1 = Modal.key();
const key2 = Modal.key();

let modal;

function closeModal() {
  modal.close();
}

function openModal() {
  modal = Modal.open({
    key: key1,
    title: 'Custom Footer',
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
    footer: (
      <Button onClick={closeModal}>关闭</Button>
    ),
  });
}

function openNoFooter() {
  Modal.open({
    key: key2,
    title: 'No Footer',
    maskClosable: true,
    destroyOnClose: true,
    children: (
      <div>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </div>
    ),
    footer: null,
  });
}

ReactDOM.render(
  <div>
    <Button onClick={openModal}>Custom</Button>
    <Button onClick={openNoFooter}>No Footer</Button>
  </div>,
  mountNode,
);
````
