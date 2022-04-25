---
category: Pro Components
subtitle: 货币输入框
type: Data Entry
title: Currency
---

货币输入框。

## 何时使用



## API

### Currency

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| currency | 货币代码，详见[Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string  |  |

更多属性请参考 [NumberField](/components-pro/number-field/#NumberField)。

### static method

| 名称 | 说明 | 参数 |
| --- | --- | ------------------------------------------- |
| format(value, lang, options) | 货币格式化 | `value` - number \| BigNumber `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)  |

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
.code-box div[class^="c7n-col"] {
  margin-bottom: .1rem;
}
</style>
