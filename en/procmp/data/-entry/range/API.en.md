---
title: API
---

### Range

| 属性名 | 说明                                     | 类型        | 默认值 | 版本 |
|-----------|------------------------------------------|------------|--------|--------|
| defaultValue | The default value of slider. When `range` is `false`, use `number`, otherwise, use `[number, number]` | number\|number\[] | 0 or \[0, 0\] | 1.5.0-beta.0 |
| disabled | If true, the slider will not be interactable. | boolean | false | 1.5.0-beta.0 |
| dots | Whether the thumb can drag over tick only. | boolean | false | 1.5.0-beta.0 |
| included | Make effect when `marks` not null，`true` means containment and `false` means coordinative | boolean | true | 1.5.0-beta.0 |
| marks | Tick mark of Slider, type of key must be `number`, and must in closed interval [min, max] ，each mark can declare its own style. | object | { number: string\|ReactNode } or { number: { style: object, label: string\|ReactNode } } | 1.5.0-beta.0 |
| max | The maximum value the slider can slide to | number | 100 | |
| min | The minimum value the slider can slide to. | number | 0 | |
| range | dual thumb mode | boolean | false | 1.5.0-beta.0 |
| step | The granularity the slider can step through values. Must greater than 0, and be divided by (max - min) . When  `marks` no null, `step` can be `null`. | number\|null | 1 ||
| tipFormatter | Slider will pass its value to `tipFormatter`, and display its value in Tooltip, and hide Tooltip when return value is null. | Function\|null | IDENTITY | 1.5.0-beta.0 |
| tooltipVisible | 值为 true 时，Tooltip 将会始终显示；否则始终不显示，哪怕在拖拽及移入时 | boolean | true | 1.5.3 |
| value | The value of slider. When `range` is `false`, use `number`, otherwise, use `[number, number]` | number\|number\[] |  | 1.5.0-beta.0 |
| vertical | If true, the slider will be vertical. | boolean | false ||
| onAfterChange | Fire when  `onmouseup` is fired. | Function(value) |  | 1.5.0-beta.0 |
| onChange | Callback function that is fired when the user changes the slider's value. | Function(value) |  | 1.5.0-beta.0 |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。
