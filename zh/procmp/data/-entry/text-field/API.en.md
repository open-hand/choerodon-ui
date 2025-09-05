---
title: API
---

| 属性名        | 说明                                      | 类型                | 默认值 | 版本    |
| ------------ | ----------------------------------------- | ------------------- | ------ | ----- |
| placeholder  | 占位词。当为 range 时，可以设定两个占位词 | string \| string[]    |        |       |
| prefix       | 前缀，一般用于放置图标                    | ReactNode           |        |     |
| suffix       | 后缀，一般用于放置图标                    | ReactNode           |        |     |
| clearButton  | 是否显示清除按钮                          | boolean             | false  |     |
| minLength    | 最小长度                                  | number              |        |     |
| maxLength    | 最大长度                                  | number              |        |     |
| pattern      | 正则校验                                  | string \| RegExp      |        |       |
| autoComplete | 自动完成，可选值：on \| off              | string              | off    |      |
| addonBefore  | 设置前置标签                              | string \| ReactNode |        |     |
| addonAfter   | 设置后置标签                              | string \| ReactNode |        |     |
| addonBeforeStyle | 设置前置标签样式 | CSSProperties |  |      |
| addonAfterStyle | 设置后置标签样式 | CSSProperties |  |       |
| restrict | 限制可输入的字符，string 类型的效果为允许输入的字符规则，RegExp 类型的效果为不允许输入的字符规则 | string \| RegExp |  |       |
| valueChangeAction | 触发值变更的动作, 可选值：blur \| input | blur |  | 1.1.0      |
| wait | 设置值变更间隔时间，只有在 valueChangeAction 为 input 时起作用 | number | | 1.1.0     |
| waitType | 设置值变更间隔类型，可选值：throttle \| debounce | string | debounce | 1.1.0    |
| showLengthInfo | 是否显示长度信息 | boolean | | 1.4.0      |
| border | 是否显示边框 | boolean | true | 1.4.4 |
| isFlat | 自动宽度模式 | boolean | false | 1.4.5 |
| forceShowRangeSeparator | range 字段是否强制显示分隔符, isFlat 模式下默认有 placeholder 或有值时才显示 | boolean |  | 1.6.7 |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。

<style>
.custom-suffix-button label .c7n-pro-input-suffix {
  height: 28px;
}
.custom-suffix-text label .c7n-pro-input-suffix {
  line-height: 20px;
}
</style>