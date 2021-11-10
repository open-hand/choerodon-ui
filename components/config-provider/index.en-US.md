---
category: Components
subtitle: 配置提供程序
cols: 1
type: Other
title: ConfigProvider
---

为组件提供统一的全局化配置, 优先级高于 [configure](/components/configure#API)。

## 使用

```jsx
import { ConfigProvider } from 'choerodon-ui';

// ...

export default () => (
  <ConfigProvider prefixCls="c7n">
    <App />
  </ConfigProvider>
);

```

## API

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |

配置同 [configure](/components/configure#API)
