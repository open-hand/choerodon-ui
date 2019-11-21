---
order: 10
title:
  zh-CN: 多层抽屉
  en-US: Drawer
---

## zh-CN

通过设定多个 drawer 类型的弹出框形成多层抽屉，可指定弹出层宽度，弹出动画。

## en-US

Drawer.

```jsx
import { Modal, Button } from 'choerodon-ui/pro';

const key1 = Modal.key();
const key2 = Modal.key();
const key3 = Modal.key();

function openSubModal2() {
  return new Promise(resolve => {
    Modal.open({
      key: key3,
      title: 'Sub Mode 2',
      style: {
        width: 600,
      },
      drawer: true,
      drawerTransitionName: 'slide-left',
      children: (
        <div>
          <p>Open Sub Modal2...</p>
          <p>Open Sub Modal2...</p>
        </div>
      ),
      onOk: resolve,
    });
  });
}

function openSubModal1() {
  return new Promise(resolve => {
    Modal.open({
      key: key2,
      title: 'Sub Mode 1',
      drawer: true,
      style: {
        width: 600,
      },
      children: (
        <div>
          <Button onClick={openSubModal2}>Open Sub Modal2...</Button>
          <p>Open Sub Modal1...</p>
          <p>Open Sub Modal1...</p>
        </div>
      ),
      onOk: resolve,
      onCancel: resolve,
    });
  });
}

function openModal() {
  Modal.open({
    closable: true,
    key: key1,
    title: 'Multilayer',
    drawer: true,
    style: {
      width: 300,
    },
    children: (
      <div>
        <Button onClick={openSubModal1}>Open Sub Modal1...</Button>
        <p>Modal...</p>
        <p>Modal...</p>
      </div>
    ),
    afterClose: () => {
      window.console.log('after close');
    },
  });
}

ReactDOM.render(<Button onClick={openModal}>Drawer</Button>, mountNode);
```
