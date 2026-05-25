---
title: API
---

### Currency

| Property | Description | Type | Default |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| currency | Currency code, see [Current currency & funds code list.](https://www.currency-iso.org/en/home/tables/table-a1.html) | string |

For more properties, please refer to [NumberField](/en/procmp/data-entry/number-field/#NumberField).

### Static Methods

| Name | Description | Properties |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| format(value, lang, options) | Currency formatting | value - number; lang - language code; options - see [Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |
| bigNumberFormat(value, lang, options, bigNumberTarget) | stringMode string formatting (when component is `Currency`, set `bigNumberTarget` to `currency`) | `value` - string; `lang` - language code; `options` - see [Intl.NumberFormatOptions](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat); `BigNumberTarget` options: `currency` \| `number-field` |


<style>
.Pane.horizontal.Pane1 .c7n-row {
  margin-bottom: .24rem;
}
.Pane.horizontal.Pane1 div[class^="c7n-col"] {
  margin-bottom: .1rem;
}
</style>
