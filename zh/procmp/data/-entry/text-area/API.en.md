---
title: API
---

### TextArea

| Property | Description | Type | Default | Version |
| -------- | ------------------------------------------------------------------------ | ---------------- | ------ | ----- |
| cols     | Text area width | number           |      ||
| rows     | Text area height | number           |      ||
| resize   | Whether resizable by drag; options: none \| both \| vertical \| horizontal     | string           | none   ||
| autoSize | Auto fit content height; set to true \| false or object: { minRows: 2, maxRows: 6 } | boolean\| object | false  ||
| onResize | Resize callback | (width, height) => void |  | |
| clearButton | Whether to show clear button | boolean  | false | 1.5.1 |
| maxLength | Maximum length | number |   | 1.5.1 |
| showLengthInfo | Whether to show length info | boolean | | 1.5.1 |

For more properties, please refer to [FormField](/en/procmp/abstract/field#FormField).

<style>
[id^="components-button-demo-"] .c7n-pro-btn, [id^="components-button-demo-"] .c7n-pro-button {
  margin-right: 8px;
  margin-bottom: 12px;
}
[id^="components-button-demo-"] .c7n-pro-btn-group > .c7n-pro-btn {
  margin-right: 0;
}
</style>
