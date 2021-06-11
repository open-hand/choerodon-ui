---
title: API
---

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 卡片内容 | ReactNode \| () => ReactNode | |
| title | 卡片标题 | ReactNode \| () => ReactNode | |

更多属性请参考 [Tooltip](/zh/cmp/data-display/tooltip/#API)。

## 注意

请确保 `Popover` 的子元素能接受 `onMouseEnter`、`onMouseLeave`、`onFocus`、`onClick` 事件。
