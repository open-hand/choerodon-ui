---
title: API
---

| 属性     | 说明                                                                     | 类型             | 默认值 | 版本    |
| -------- | ------------------------------------------------------------------------ | ---------------- | ------ | ----- |
| cols     | 文本域宽                                                                 | number           |      | |
| rows     | 文本域高                                                                 | number           |      | |
| resize   | 是否能够拖拽调整大小，可选值：none \| both \| vertical \| horizontal     | string           | none   | |
| autoSize | 自适应内容高度，可设置为 true\| false 或对象：{ minRows: 2, maxRows: 6 } | boolean\| object | false  | |
| onResize | 大小调整回调 | (width, height) => void |  | |
| clearButton | 是否显示清除按钮 | boolean  | false | 1.5.1  |
| maxLength | 最大长度 | number |   | 1.5.1  |
| showLengthInfo | 是否显示长度信息 | boolean | | 1.5.1 |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。
