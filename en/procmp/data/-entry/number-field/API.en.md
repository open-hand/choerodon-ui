---
title: API
---

### NumberField

| 属性名 | 说明   | 类型   | 默认值 | 版本    |
| ---- | ------ | ------ | ------ |------ |
| min  | 最小值 | number \| string |    MIN_SAFE_INTEGER   ||
| max  | 最大值 | number \| string |   MAX_SAFE_INTEGER     ||
| step | 步距   | number \| string |        ||
| nonStrictStep | 非严格步距，在非严格步距下，允许输入值不为步距的倍数加上最小值，也允许在设置整数步距的情况下输入小数   | boolean | false ||
| longPressPlus | 长按累加开关  | boolean | true ||
| formatter | 格式器,默认值为static的[format](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx)。设置 stringMode 时，默认值为static的[bigNumberFormat](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx)  | FormatNumberFunc: (value: string, lang: string, options: Intl.NumberFormatOptions) => string |     |   |
| formatterOptions | 格式器参数,可以与全局值以及默认值进行合并,默认值[参考](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx)   | FormatNumberFuncOptions: { lang?: string, options?: Intl.NumberFormatOptions } |   |     |
| precision | 转换小数点位数 | number |  | 1.3.0 |
| numberGrouping | 千分位分组显示 | boolean | true | 1.3.0 |
| keyboard | 是否启用UP DOWN键盘事件 | boolean | true | 1.5.0 |
| numberRoundMode | 数字取整方式, 默认四舍五入 | round \| ceil \| floor |  | 1.6.7 |

更多属性请参考 [TextField](/zh/procmp/data-entry/text-field/#TextField)。

### Static method

| 名称                         | 说明       | 属性名 |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| format(value, lang, options) | 数字格式化 | `value` - number \| BigNumber `lang` - 语言代码 `options` - 详见[Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

组件库使用外部库`bignumber.js`实现大数字，具体使用参见文档[大数字支持](/zh/docs/other/big-number)。
