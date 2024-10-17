---
title: API
---

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 卡片内容 | ReactNode \| () => ReactNode | |
| title | 卡片标题 | ReactNode \| () => ReactNode | |

## 共同的API

以下 API 为 Tooltip、Popconfirm、Popover 共享的 API。

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| arrowPointAtCenter | 箭头是否指向目标元素中心 | boolean | `false` |
| autoAdjustOverflow | 气泡被遮挡时自动调整位置 | boolean | `true` |
| defaultVisible | 默认是否显隐 | boolean | false |
| getPopupContainer | 浮层渲染父节点，默认渲染到 body 上。`2.5.2` 之前请使用 `getTooltipContainer` | Function(triggerNode) | () => document.body |
| mouseEnterDelay | 鼠标移入后延时多少才显示 Tooltip，单位：秒 | number | 0 |
| mouseLeaveDelay | 鼠标移出后延时多少才隐藏 Tooltip，单位：秒 | number | 0.1 |
| overlayClassName | 卡片类名 | string | 无 |
| overlayStyle | 卡片样式 | object | 无 |
| placement | 气泡框位置，可选 `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom` | string | top |
| trigger | 触发行为，可选 `hover/focus/click/contextMenu` | string | hover |
| visible | 用于手动控制浮层显隐 | boolean | false |
| onVisibleChange | 显示隐藏的回调 | (visible) => void | 无 |

## 注意

请确保 `Popover` 的子元素能接受 `onMouseEnter`、`onMouseLeave`、`onFocus`、`onClick` 事件。
