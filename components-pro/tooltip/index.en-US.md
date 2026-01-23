---
category: Pro Components
type: Data Display
title: Tooltip
---

A simple text popup tip.

## When To Use

- The tip is shown on mouse enter, and is hidden on mouse leave. The Tooltip doesn't support complex text or operations.
- To provide an explanation of a `button/text/operation`. It's often used instead of the html `title` attribute.

## API

| Property | Description                   | Type                               | Default |
| -------- | ----------------------------- | ---------------------------------- | ------- |
| title    | The text shown in the tooltip | string\|ReactNode\|() => ReactNode | -       |
| theme | theme | dark \| light |    |

### Common API

The following APIs are shared by Tooltip, Popconfirm, Popover.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| arrowPointAtCenter | Whether the arrow is pointed at the center of target | boolean | `false` |
| autoAdjustOverflow | 气泡被遮挡时自动调整位置; 可单独设置水平和垂直方向自动调整位置 | boolean \| { adjustX?: 0 \| 1; adjustY?: 0 \| 1; } | `true` |
| defaultHidden | Whether the floating tooltip card is hidden by default | boolean | `true` |
| getPopupContainer | The DOM container of the tip, the default behavior is to create a `div` element in `body`. Use `getTooltipContainer` if you are using `antd@<2.5.2` | Function(triggerNode) | () => document.body |
| mouseEnterDelay | Delay in seconds, before tooltip is shown on mouse enter | number | 0 |
| mouseLeaveDelay | Delay in seconds, before tooltip is hidden on mouse leave | number | 0.1 |
| popupClassName | Class name of the tooltip card | string | - |
| popupStyle | Style of the tooltip card | object | - |
| popupInnerStyle(1.5.9) | Style of the tooltip card content | object | - |
| placement | The position of the tooltip relative to the target, which can be one of `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom` | string | `top` |
| autoPlacement | Automatically select the best tooltip position | boolean | [tooltipAutoPlacement](/components/configure) |
| trigger | Tooltip trigger mode | `hover` \| `focus` \| `click` \| `contextMenu` | `hover` |
| hidden | Whether the floating tooltip card is visible or not | boolean | `true` |
| onHiddenBeforeChange | Callback executed before visibility of the tooltip card is changed. If return value is false, this change will be stopped. | (hidden) => boolean | 无 |
| onHiddenChange | Callback executed when visibility of the tooltip card is changed | (hidden) => void | - |

## Note

Please ensure that the child node of `Tooltip` accepts `onMouseEnter`, `onMouseLeave`, `onFocus`, `onClick` events.

### static Methods

| Name | Description |
| --- | --- |
| show(target, tooltipProps, duration) | show singleton Tooltip, duration is 100 by default. |
| hide(duration) |  hide singleton Tooltip, duration is 100 by default. |
