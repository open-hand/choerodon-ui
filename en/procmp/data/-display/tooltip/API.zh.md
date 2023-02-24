---
title: API
---

| 参数  | 说明     | 类型                               |
| ----- | -------- | ---------------------------------- | 
| title | 提示文字 | string\|ReactNode\|() => ReactNode |     
| theme | 主题 | dark \| light |

### 共同的 API

以下 API 为 Tooltip、Popconfirm、Popover 共享的 API。

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| arrowPointAtCenter | 箭头是否指向目标元素中心 | boolean | false | |
| autoAdjustOverflow | 气泡被遮挡时自动调整位置 | boolean | true | |
| defaultHidden | 默认是否显隐 | boolean | true | |
| mouseEnterDelay | 鼠标移入后延时多少才显示 Tooltip，单位：秒 | number | 0 | |
| mouseLeaveDelay | 鼠标移出后延时多少才隐藏 Tooltip，单位：秒 | number | 0.1 | |
| popupClassName | 卡片类名 | string |  | |
| popupStyle | 卡片样式 | object |  | |
| popupInnerStyle | 卡片内容样式 | object | | 1.6.0 |
| placement | 气泡框位置，可选 top \| left \| right \| bottom \| topLeft \| topRight \| bottomLeft \| bottomRight \| leftTop \| leftBottom \| rightTop \| rightBottom | string | top | |
| trigger | 触发行为，可选 hover/focus/click/contextMenu | string | hover | |
| hidden | 用于手动控制浮层显隐 | boolean | true | |
| onHiddenBeforeChange | 显示隐藏状态改变前的回调， 返回false将阻止该改变 | (hidden) => boolean | | |
| onHiddenChange | 显示隐藏的回调 | (hidden) => void | | |

## 注意

请确保 `Tooltip` 的子元素能接受 `onMouseEnter`、`onMouseLeave`、`onFocus`、`onClick` 事件。

### static Methods

| 名称 | 说明 |
| --- | --- |
| show(target, tooltipProps, duration) | 显示单例 Tooltip， duration 默认 100 |
| hide(duration) | 隐藏单例 Tooltip， duration 默认 100 |
