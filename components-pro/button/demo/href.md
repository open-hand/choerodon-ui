---
order: 5
title:
  zh-CN: 超链接按钮
  en-US: Link Button
---

## zh-CN

超链接按钮。


## en-US

Link Button.


````jsx
import { Button } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Button href="https://choerodon.io" target="_blank">跳转按钮</Button>
    <Button funcType="flat" href="https://choerodon.io" target="_blank">跳转按钮</Button>
    <Button funcType="flat" href="https://choerodon.io" target="_blank" icon="link" />
  </div>,
  mountNode
);
````
