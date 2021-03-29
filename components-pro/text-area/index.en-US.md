---
category: Pro Components
type: Data Entry
cols: 2
title: TextArea
subtitle: 文本域
---

文本域用于输入一段文字。

## 何时使用



## API


### TextArea

属性 | 说明 | 类型 | 默认值
-----|-----|-----|------
| cols | 文本域宽 | number  | - |
| rows | 文本域高 | number  | - |
| resize | 是否能够拖拽调整大小，可选值： `none` `both` `vertical` `horizontal` | string  | none |
| autoSize | 自适应内容高度，可设置为 true\| false 或对象：{ minRows: 2, maxRows: 6 } | boolean\| object  | false |
| onResize | 大小调整回调 | (width, height) => void |  |

更多属性请参考 [FormField](/components-pro/field/#FormField)。

<style>
[id^="components-button-demo-"] .c7n-pro-btn, [id^="components-button-demo-"] .c7n-pro-button {
  margin-right: 8px;
  margin-bottom: 12px;
}
[id^="components-button-demo-"] .c7n-pro-btn-group > .c7n-pro-btn {
  margin-right: 0;
}
</style>
