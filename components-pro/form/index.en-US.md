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

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| action | 表单提交请求地址，当设置了dataSet时，该属性无作用 | string    |     |
| method | 表单提交的HTTP Method, 可选值 `GET` `POST` | string  | POST |
| target | 表单提交的目标，当表单设置了设置target且没有dataSet时作浏览器默认提交，否则作Ajax提交 | string |   |
| processParams | Ajax提交时的参数回调 | (event) => object |   |
| labelWidth | 内部控件的标签宽度。如果为数组则分别对应每列的标签宽度。数组长度不够列数，以默认值补全, 响应式参考[Responsive](#Form Responsive) | number\| number[] \| object | 100 |
| labelAlign | 标签文字对齐方式, 只在labelLayout为`horizontal`时起作用，可选值： `left` `center` `right`, 响应式参考[Responsive](#Form Responsive) | string \| object |  right  |
| labelLayout | 标签位置, 可选值 `horizontal` `vertical` `placeholder` `float` `none`, 响应式参考[Responsive](#Form Responsive) | string \| object |  horizontal |
| dataIndex | 对照record在DataSet中的index | number | ds.currentIndex |
| record | 对照record, 优先级高于dataSet和dataIndex | Record |  |
| columns | 列数, 响应式参考[Responsive](#Form Responsive) | number \| object |  1 |
| onSubmit | 提交回调 | Function  |  |
| onReset | 重置回调 | Function  |  |
| onSuccess | 提交成功回调 | Function  |  |
| onError | 提交失败回调 | Function  |  |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

### Form Layout

#### Form 子元素属性

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| rowSpan | 表单下控件跨越的行数 | number    |  1   |
| colSpan | 表单下控件跨越的列数 | number    |  1   |
| newLine | 另起新行 | boolean    |     |
| label | 标签 | string \| ReactNode    |     |

### Form Responsive

响应式可设置参数`columns` `labelWidth` `labelAlign` `labelLayout` 为一个键值对，键值如下：

| 键值      | 响应视宽                                     |
|-----------|------------------------------------------|
| xs  |  < 576px | 
| sm  | >= 576px |
| md  | >= 768px |
| lg  | >= 992px | 
| xl  | >= 1200px | 
| xxl | >= 1600px | 
