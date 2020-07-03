---
title: API
---

### TextArea

| 属性     | 说明                                                                     | 类型             | 默认值 |
| -------- | ------------------------------------------------------------------------ | ---------------- | ------ |
| cols     | 文本域宽                                                                 | number           | -      |
| rows     | 文本域高                                                                 | number           | -      |
| resize   | 是否能够拖拽调整大小，可选值： `none` `both` `vertical` `horizontal`     | string           | none   |
| autoSize | 自适应内容高度，可设置为 true\| false 或对象：{ minRows: 2, maxRows: 6 } | boolean\| object | false  |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。

<style>
[id^="components-button-demo-"] .c7n-pro-btn, [id^="components-button-demo-"] .c7n-pro-button {
  margin-right: 8px;
  margin-bottom: 12px;
}
[id^="components-button-demo-"] .c7n-pro-btn-group > .c7n-pro-btn {
  margin-right: 0;
}
</style>
