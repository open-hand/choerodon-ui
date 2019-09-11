---
order: 2
title:
  zh-CN: 带图标的步骤条
  en-US: With icon
---

## zh-CN

通过设置 `Steps.Step` 的 `icon` 属性，可以启用自定义图标。

## en-US

You can use your own custom icons by setting the property `icon` for `Steps.Step`.

```jsx
import { Steps, Icon } from 'choerodon-ui';

const Step = Steps.Step;

ReactDOM.render(
  <Steps>
    <Step status="finish" title="Login" icon={<Icon type="person_outline" />} />
    <Step status="finish" title="Verification" icon={<Icon type="panorama_vertical" />} />
    <Step status="process" title="Pay" icon={<Icon type="schedule" />} />
    <Step status="wait" title="Done" icon={<Icon type="tag_faces" />} />
  </Steps>,
  mountNode,
);
```
