---
category: Components
subtitle: 配置 css 变量
cols: 1
type: Other
title: configCssVars
---

配置 css 变量，生成到浏览器 style 标签中。

## 使用

```jsx
import { configCssVars } from 'choerodon-ui';

// 配置 css 变量
configCssVars({
    'primary-color': 'red',
  },
  1,
  'c7n-ui',
);

```

```jsx
// 颜色 css vars 级联关系 默认值
import { defaultColorCssVarsMap } from 'choerodon-ui/lib/style/color-vars-map';

// 类型
import {
  ColorConvertMode,
  ColorGradationStep,
  ColorCssVarsMap,
} from 'choerodon-ui/lib/style/interface';

// 查询 css 变量值
import { getValueByCssVars } from 'choerodon-ui/lib/config-css-vars/util';
```

## 方法参数

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| varsData | css 变量对象(不加--前缀) | Record< string, any > |  |
| cssVarsPriority | css 变量优先级 | number | 1 |
| styleFlagPrefix | style 标签 标识前缀 | string | 'c7n-ui' |
| colorVarsMap | 颜色 css vars 级联关系 | ColorCssVarsMap[] | 内置关系 |
