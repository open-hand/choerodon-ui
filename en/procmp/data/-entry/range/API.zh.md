---
title: API
---

| 属性名 | 说明                                            | 类型    | 默认值 | 版本 |
| -------- | ----------------------------------------------- | ------- | ------ | ------ |
| defaultValue | 设置初始取值。当 `range` 为 `false` 时，使用 `number`，否则用 `[number, number]` | number\|number\[] | 0 or \[0, 0\] | 1.5.0-beta.0 |
| disabled | 值为 `true` 时，滑块为禁用状态 | boolean | false | 1.5.0-beta.0 |
| dots | 是否只能拖拽到刻度上 | boolean | false | 1.5.0-beta.0 |
| included | `marks` 不为空对象时有效，值为 true 时表示值为包含关系，false 表示并列 | boolean | true | 1.5.0-beta.0 |
| marks | 刻度标记，key 的类型必须为 `number` 且取值在闭区间 [min, max] 内，每个标签可以单独设置样式 | object | { number: string\|ReactNode } or { number: { style: object, label: string\|ReactNode } } | 1.5.0-beta.0 |
| max | 最大值 | number    | 100    ||
| min | 最小值 | number  | 0 ||
| step | 步长，取值必须大于 0，并且可被 (max - min) 整除 | number | 1  ||
| vertical | 是否垂直 | boolean | false ||
| range | 双滑块模式 | boolean | false | 1.5.0-beta.0 |
| tipFormatter | Slider 会把当前值传给 `tipFormatter`，并在 Tooltip 中显示 `tipFormatter` 的返回值，若为 null，则隐藏 Tooltip。 | Function\|null | IDENTITY | 1.5.0-beta.0 |
| tooltipVisible | 值为 true 时，Tooltip 将会始终显示；否则始终不显示，哪怕在拖拽及移入时 | boolean | true | 1.5.3 |
| value | 设置当前取值。当 `range` 为 `false` 时，使用 `number`，否则用 `[number, number]` | number\|number\[] |  | 1.5.0-beta.0 |
| onAfterChange | 与 `onmouseup` 触发时机一致，把当前值作为参数传入。 | Function(value) |  | 1.5.0-beta.0 |
| onChange | 当 Slider 的值发生改变时，会触发 onChange 事件，并把改变后的值作为参数传入。 | Function(value) |  | 1.5.0-beta.0 |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。
