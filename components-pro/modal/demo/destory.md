---
order: 11
title:
  zh-CN: destroyAll
  en-US: Basic usage
---

## zh-CN

destroyAll 销毁所有弹出的Modal框。

## en-US

destroyAll Destroy all pop-up Modal boxes.

```jsx
import { Modal, Button } from 'choerodon-ui/pro';

function destroyAll() {
  Modal.destroyAll()
}

function destroyConfirm() {
  for (let i = 0; i < 4; i ++) {
    setTimeout(() => {
      Modal.confirm({
        title: 'Confirm',
        children: <Button onClick={destroyAll}>Click to destroy all</Button>,
      })
    }, i*600);
  }
}

ReactDOM.render(<Button onClick={destroyConfirm}>Open</Button>, mountNode);
```
