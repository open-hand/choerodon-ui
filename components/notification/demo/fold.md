---
order: 7
title:
  zh-CN: 折叠显示
  en-US: collapse display
---

## zh-CN

超过指定数量将会折叠滚动显示。

## en-US

Over count will collapse display, only use api of `notification.fold(config)` 

```jsx
import { Button, notification } from 'choerodon-ui';

const openNotification = () => {
  notification.config({
    foldCount: 3,
  });
  notification.open({
    message: 'Notification Title',
    description:
      'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    duration: null,
    style: {
      width: 500,
    },
  });
};

ReactDOM.render(
  <Button type="primary" onClick={openNotification}>
    Open the notification box
  </Button>,
  mountNode,
);
```
