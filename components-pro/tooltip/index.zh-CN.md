---
category: Pro Components
subtitle: 文字提示
type: Data Display
title: Tooltip
---

简单的文字提示气泡框。

## 何时使用

鼠标移入则显示提示，移出消失，气泡浮层不承载复杂文本和操作。

可用来代替系统默认的 `title` 提示，提供一个`按钮/文字/操作`的文案解释。

## API

| 参数  | 说明     | 类型                               | 默认值 |
| ----- | -------- | ---------------------------------- | ------ |
| title | 提示文字 | string\|ReactNode\|() => ReactNode | 无     |
| theme | 主题 | dark \| light |    |

### 共同的 API

以下 API 为 Tooltip、Popconfirm、Popover 共享的 API。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| arrowPointAtCenter | 箭头是否指向目标元素中心 | boolean | `false` |
| autoAdjustOverflow | 气泡被遮挡时自动调整位置 | boolean | `true` |
| defaultHidden | 默认是否显隐 | boolean | true |
| mouseEnterDelay | 鼠标移入后延时多少才显示 Tooltip，单位：秒 | number | 0 |
| mouseLeaveDelay | 鼠标移出后延时多少才隐藏 Tooltip，单位：秒 | number | 0.1 |
| popupClassName | 卡片类名 | string | 无 |
| popupStyle | 卡片样式 | object | 无 |
| popupInnerStyle(1.5.9) | 卡片内容样式 | object | 无 |
| placement | 气泡框位置，可选 `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom` | string | top |
| trigger | 触发行为，可选 `hover/focus/click/contextMenu` | string | hover |
| hidden | 用于手动控制浮层显隐 | boolean | `true` |
| onHiddenBeforeChange | 显示隐藏状态改变前的回调， 返回false将阻止该改变 | (hidden) => boolean | 无 |
| onHiddenChange | 显示隐藏状态改变的回调 | (hidden) => void | 无 |

## 注意

请确保 `Tooltip` 的子元素能接受 `onMouseEnter`、`onMouseLeave`、`onFocus`、`onClick` 事件。

### static Methods

| 名称 | 说明 |
| --- | --- |
| show(target, tooltipProps, duration) | 显示单例 Tooltip， duration 默认 100 |
| hide(duration) | 隐藏单例 Tooltip， duration 默认 100 |
