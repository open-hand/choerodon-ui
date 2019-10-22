---
category: Pro Components
cols: 1
subtitle: 表单
type: Data Entry
title: Form
---

表单。

## 何时使用

## API

### Form

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| action | 表单提交请求地址，当设置了 dataSet 时，该属性无作用 | string |  |
| method | 表单提交的 HTTP Method, 可选值 `GET` `POST` | string | POST |
| target | 表单提交的目标，当表单设置了设置 target 且没有 dataSet 时作浏览器默认提交，否则作 Ajax 提交 | string |  |
| processParams | Ajax 提交时的参数回调 | (event) => object |  |
| labelWidth | 内部控件的标签宽度。如果为数组则分别对应每列的标签宽度。数组长度不够列数，以默认值补全, 响应式参考[Responsive](#Form Responsive) | number\| number[] \| object | 100 |
| labelAlign | 标签文字对齐方式, 只在 labelLayout 为`horizontal`时起作用，可选值： `left` `center` `right`, 响应式参考[Responsive](#Form Responsive) | string \| object | right |
| labelLayout | 标签位置, 可选值 `horizontal` `vertical` `placeholder` `float` `none`, 响应式参考[Responsive](#Form Responsive) | string \| object | horizontal |
| dataIndex | 对照 record 在 DataSet 中的 index | number | ds.currentIndex |
| record | 对照 record, 优先级高于 dataSet 和 dataIndex | Record |  |
| columns | 列数, 响应式参考[Responsive](#Form Responsive) | number \| object | 1 |
| pristine | 显示原始值 | boolean | false |
| onSubmit | 提交回调 | Function |  |
| onReset | 重置回调 | Function |  |
| onSuccess | 提交成功回调 | Function |  |
| onError | 提交失败回调 | Function |  |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

### Form Layout

#### Form 子元素属性

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| rowSpan | 表单下控件跨越的行数 | number | 1 |
| colSpan | 表单下控件跨越的列数 | number | 1 |
| newLine | 另起新行 | boolean |  |
| label | 标签 | string \| ReactNode |  |
| name | 字段名。可获取 DataSet 的字段属性，如 label，require 等，一般用于控件外需要嵌套其他元素时使用。 | string |  |
| labelWidth | 标签宽度。同列控件中标签宽度取最大设定值。 | number\| number[] \| object |  |

### Form Responsive

响应式可设置参数`columns` `labelWidth` `labelAlign` `labelLayout` 为一个键值对。

键值可参考 [Responsive BreakPoints](/components/responsive/#BreakPoints)。
