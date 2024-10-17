---
title: API
---

### RichText

| Property | Description | Type | Default Value |
| ----- | -------- | -------- | ------------------ |
| options | Editor configuration, see [Quill Options](https://github.com/zenoamaro/react-quill#props)| object | |
| mode | Editor mode, optional value editor preview | string | editor |
| toolbar | Toolbar, optional value is hook or built-in type: normal none | string | ({ dataSet, id }) => ReactNode | normal |

For more attributes, please refer to [FormField](/zh/procmp/abstract/field/#FormField).

### RichText static property

| 属性  | 说明     | 类型     | 默认值  | 版本 |
| ----- | -------- | -------- | ------ | ----- |
| Quill | Quill inside the component, which can be used to register the configuration | Quill | 1.6.6 |

When the Quill registration configuration is directly used in the project does not take effect on RichText, you can use RichText.Quill.

### RichText.RichTextViewer

| Parameters | Description | Type |
| --- | --- | --- | 
| deltaOps | Editor rendering value | Delta.ops | 

### toolbar

- Custom Toolbar Document [Custom Toolbar](https://github.com/zenoamaro/react-quill#custom-toolbar)
