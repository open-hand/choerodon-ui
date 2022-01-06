---
title: API
---

### NumberField

| 参数 | 说明   | 类型   | 默认值 | 版本    |
| ---- | ------ | ------ | ------ |------ |
| min  | 最小值( stringMode 开启后传入 string 类型) | number \| string |    MIN_SAFE_INTEGER   ||
| max  | 最大值( stringMode 开启后传入 string 类型) | number \| string |   MAX_SAFE_INTEGER     ||
| step | 步距( stringMode 开启后传入 string 类型)   | number \| string |        ||
| nonStrictStep | 非严格步距，在非严格步距下，允许输入值不为步距的倍数加上最小值，也允许在设置整数步距的情况下输入小数   | boolean | false ||
| longPressPlus | 长按累加开关  | boolean | true ||
| precision | 转换小数点位数 | number |  | 1.3.0 |
| numberGrouping | 千分位分组显示 | boolean | true | 1.3.0 |
| keyboard | 是否启用UP DOWN键盘事件 | boolean | true | 1.5.0 |
| stringMode| 字符值模式，开启后支持高精度小数和大数据。同时 onChange 将返回 string 类型 | boolean | false | 1.5.1 |

更多属性请参考 [TextField](/zh/procmp/data-entry/text-field/#TextField)。

### Static method

| 名称                         | 说明       | 参数    |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| format(value, lang, options) | 数字格式化 | value - 数值 lang - 语言代码 options - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |
| bigNumberFormat(value, lang, options, bigNumberTarget) | stringMode 字符串格式化(组件为 `NumberField` 时, `bigNumberTarget` 传入 `number-field`) | `value` - 字符串 `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) - `BigNumberTarget` 可选值：`currency` \| `number-field` |

### stringMode 说明

开启 `stringMode` 模式后，受控的值会变成string类型，并且支持长字符串数字和高精度字符串小数。

DataSet的field type属性设置成 `bigNumber` 后,效果同 `stringMode` 。

组件库使用外部库`bignumber.js`实现大数字，具体使用参见官网 [BigNumber](https://mikemcl.github.io/bignumber.js/)

<style>
.Pane.horizontal.Pane1 .c7n-pro-input-number-wrapper {
  margin-bottom: .1rem;
}
</style>
