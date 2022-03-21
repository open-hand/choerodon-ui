---
order: 2
title:
  zh-CN: 文本与超链接组件
  en-US: Text and Link Component
---

## zh-CN

内置不同样式的文本以及超链接组件。

## en-US

Provides multiple types of text and link.

```jsx
import React from 'react';
import { Typography } from 'choerodon-ui/pro';

const { Text, Link } = Typography;

ReactDOM.render(
  <main style={{display: "flex",flexDirection: "column"}}>
    <Text>Choerodon-ui (default)</Text>
    <Text type="secondary">Choerodon-ui (secondary)</Text>
    <Text type="success">Choerodon-ui (success)</Text>
    <Text type="warning">Choerodon-ui (warning)</Text>
    <Text type="danger">Choerodon-ui (danger)</Text>
    <Text disabled>Choerodon-ui (disabled)</Text>
    <Text mark>Choerodon-ui (mark)</Text>
    <Text code>Choerodon-ui (code)</Text>
    <Text keyboard>Choerodon-ui (keyboard)</Text>
    <Text underline>Choerodon-ui (underline)</Text>
    <Text delete>Choerodon-ui (delete)</Text>
    <Text strong>Choerodon-ui (strong)</Text>
    <Text italic>Choerodon-ui (italic)</Text>
    <Link href="https://open-hand.gitee.io/choerodon-ui/zh" target="_blank">
      Choerodon-ui (Link)
    </Link>
  </main>,
  mountNode,
);
```
