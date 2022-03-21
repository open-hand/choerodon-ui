---
order: 1
title:
  zh-CN: 标题组件
  en-US: Title Component
---

## zh-CN

展示不同级别的标题。

## en-US

Display title in different level.

```jsx
import React from 'react';
import { Typography } from 'choerodon-ui/pro';

const { Title } = Typography;

ReactDOM.render(
  <>
    <Title>h1. Choerodon-ui</Title>
    <Title level={2}>h2. Choerodon-ui</Title>
    <Title level={3}>h3. Choerodon-ui</Title>
    <Title level={4}>h4. Choerodon-ui</Title>
    <Title level={5}>h5. Choerodon-ui</Title>
  </>,
  mountNode,
);
```
