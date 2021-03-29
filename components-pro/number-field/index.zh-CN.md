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
| nonStrictStep | 非严格步距，在非严格步距下，允许输入值不为步距的倍数加上最小值，也允许在设置整数步距的情况下输入小数   | boolean | false |
| formatter | 格式器,默认值为static的[format](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx)   | FormatNumberFunc: (value: string, lang: string, options: Intl.NumberFormatOptions) => string |        |
| formatterOptions | 格式器参数,可以与全局值以及默认值进行合并,默认值[参考](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx)   | FormatNumberFuncOptions: { lang?: string, options?: Intl.NumberFormatOptions } |        |
| precision | 小数点位数 | number |  |
| numberGrouping | 千分位分组显示 | boolean | true |


更多属性请参考 [TextField](/components-pro/text-field/#TextField)。

### static method

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| format(value, lang, options) | 数字格式化 | `value` - 数值 `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

<style>
.code-box .c7n-pro-input-number-wrapper {
  margin-bottom: .1rem;
}
</style>
