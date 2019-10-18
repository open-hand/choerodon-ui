---
category: Pro Components
subtitle: 数字输入框
type: Data Entry
title: NumberField
---

数字输入框。

## 何时使用

需要输入普通数字的时候使用。

如果要输入保留两位小数格式的金额，请使用 [Currency](/components-pro/currency/#Currency) 组件

## API

### NumberField

| 参数 | 说明   | 类型   | 默认值 |
| ---- | ------ | ------ | ------ |
| min  | 最小值 | number |        |
| max  | 最大值 | number |        |
| step | 步距   | number |        |

更多属性请参考 [TextField](/components-pro/text-field/#TextField)。

### static method

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| format(value, lang, options) | 数字格式化 | `value` - 数值 `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
