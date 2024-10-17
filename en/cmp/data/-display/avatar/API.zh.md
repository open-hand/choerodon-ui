---
title: API
---

| 属性名 | 说明                                 | 类型                                | 默认值    |
| ----- | ------------------------------------ | ----------------------------------- | --------- |
| icon  | 设置头像的图标类型，参考 `Icon` 组件 | string                              | -         |
| shape | 指定头像的形状                       | Enum{ 'circle', 'square' }          | `circle`  |
| size  | 设置头像的大小                       | Enum{ 'large', 'small', 'default' } | `default` |
| src   | 图片类头像的资源地址                 | string                              | -         |
| alt   | 图像无法显示时的替代文本             | string                              | -         |

### Avatar.Group (1.5.6)

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| maxCount | 显示的最大头像个数 | number | - |
| maxPopoverPlacement | 多余头像气泡弹出位置 | `top` \| `bottom` | `top` |
| maxPopoverTrigger | 设置多余头像 Popover 的触发方式 | `hover` \| `focus` \| `click` | `hover` |
| maxStyle | 多余头像样式 | CSSProperties | - |
| size | 设置头像的大小 | Enum{ 'large', 'small', 'default' } \| number | `default` |
