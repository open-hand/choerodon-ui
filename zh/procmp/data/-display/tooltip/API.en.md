---
title: API
---

| Property | Description                   | Type                               | 
| -------- | ----------------------------- | ---------------------------------- | 
| title    | The text shown in the tooltip | string\|ReactNode\|() => ReactNode | 
| theme | theme | dark \| light | |

### Common API

The following APIs are shared by Tooltip, Popconfirm, Popover.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| arrowPointAtCenter | Whether the arrow is pointed at the center of target | boolean | false | |
| autoAdjustOverflow | Whether to adjust popup placement automatically when popup is off screen | boolean | true |v
| defaultHidden | Whether the floating tooltip card is hidden by default | boolean | true | |
| getPopupContainer | The DOM container of the tip, the default behavior is to create a div element in body. Use getTooltipContainer if you are using antd@<2.5.2 | Function(triggerNode) | () => document.body | |
| mouseEnterDelay | Delay in seconds, before tooltip is shown on mouse enter | number | 0 | |
| mouseLeaveDelay | Delay in seconds, before tooltip is hidden on mouse leave | number | 0.1 | |
| popupClassName | Class name of the tooltip card | string |  | |
| popupStyle | Style of the tooltip card | object |  | |
| popupInnerStyle | Style of the tooltip card content | object | | 1.6.0 |
| placement | The position of the tooltip relative to the target, which can be one of top \| left \| right \| bottom \| topLeft \| topRight \| bottomLeft \| bottomRight \| leftTop \| leftBottom \| rightTop \| rightBottom | string | top | |
| trigger | Tooltip trigger mode | hover \| focus \| click \| contextMenu | hover | |
| hidden | Whether the floating tooltip card is visible or not | boolean | true | |
| onHiddenBeforeChange | Callback executed before visibility of the tooltip card is changed. If return value is false, this change will be stopped. | (hidden) => boolean | | |
| onHiddenChange | Callback executed when visibility of the tooltip card is changed | (hidden) => void | - | |

## Note

Please ensure that the child node of `Tooltip` accepts `onMouseEnter`, `onMouseLeave`, `onFocus`, `onClick` events.

### static Methods

| Name | Description |
| --- | --- |
| show(target, tooltipProps, duration) | show singleton Tooltip, duration is 100 by default. |
| hide(duration) |  hide singleton Tooltip, duration is 100 by default. |
