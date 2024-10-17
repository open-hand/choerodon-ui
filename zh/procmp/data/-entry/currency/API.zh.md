---
title: API
---

### Currency

| 属性名 | 说明                                                                                                           | 类型   |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| currency | 货币代码，详见[Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string |

更多属性请参考 [NumberField](/zh/procmp/data-entry/number-field/#NumberField)。

### Static method

| 名称                         | 说明       | 属性名                                                                                                                                                                       |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| format(value, lang, options) | 货币格式化 | value - 数值 lang - 语言代码 options - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |
| bigNumberFormat(value, lang, options, bigNumberTarget) | stringMode 字符串格式化(组件为 `Currency` 时, `bigNumberTarget` 传入 `currency`) | `value` - 字符串 `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) - `BigNumberTarget` 可选值：`currency` \| `number-field` |


<style>
.Pane.horizontal.Pane1 .c7n-row {
  margin-bottom: .24rem;
}
.Pane.horizontal.Pane1 div[class^="c7n-col"] {
  margin-bottom: .1rem;
}
</style>
