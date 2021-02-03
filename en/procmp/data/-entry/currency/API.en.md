---
title: API
---

### Currency

| 参数     | 说明                                                                                                           | 类型   | 默认值 |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| currency | 货币代码，详见[Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string |

更多属性请参考 [NumberField](/zh/procmp/data-entry/number-field/#NumberField)。

### Static method

| 名称                         | 说明       | 参数                                                                                                                                                                       |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| format(value, lang, options) | 货币格式化 | `value` - 数值 `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

