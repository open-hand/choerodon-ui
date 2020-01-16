---
order: 7
title:
  zh-CN: 手动移除
  en-US: Manual to destroy
---

## zh-CN

手动关闭 modal。

## en-US

Manually destroying a modal.

```jsx
import { Modal, Button } from 'choerodon-ui';

function success() {
  const modal = Modal.success({
    title: 'This is a notification message',
    content: 'This modal will be destroyed after 1 second',
  });
  setTimeout(() => modal.destroy(), 1000);
}

ReactDOM.render(<Button onClick={success}>Success</Button>, mountNode);
```
