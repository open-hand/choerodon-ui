---
title: API
---

### NumberField

| Property | Description | Type | Default | Version |
| ---- | ------ | ------ | ------ |------ |
| min | Minimum value | number \| string | MIN_SAFE_INTEGER |  |
| max | Maximum value | number \| string | MAX_SAFE_INTEGER |  |
| step | Step | number \| string |  |  |
| nonStrictStep | Non-strict step. Allows input values not equal to multiples of step plus min, and allows decimals even when step is an integer. | boolean | false |  |
| longPressPlus | Long-press increment switch | boolean | true |  |
| formatter | Formatter. Default is static [format](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx). When stringMode is set, default is static [bigNumberFormat](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx). | FormatNumberFunc: (value: string, lang: string, options: Intl.NumberFormatOptions) => string |  |   |
| formatterOptions | Formatter parameters; can be merged with global values and defaults. Defaults [reference](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/number-field/NumberField.tsx). | FormatNumberFuncOptions: { lang?: string, options?: Intl.NumberFormatOptions } |  |     |
| precision | Decimal places to convert | number |  | 1.3.0 |
| numberGrouping | Thousands grouping display | boolean | true | 1.3.0 |
| keyboard | Enable UP/DOWN keyboard events | boolean | true | 1.5.0 |
| numberRoundMode | Number rounding mode; default is round half up | round \| ceil \| floor |  | 1.6.7 |

For more properties, please refer to [TextField](/en/procmp/data-entry/text-field/#TextField).

### Static method

| Name | Description | Properties |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| format(value, lang, options) | Number formatting | `value` - number \| BigNumber; `lang` - language code; `options` - see [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

The component library uses the external library `bignumber.js` to handle large numbers. See [Big Number Support](/en/docs/other/big-number).
