---
title: API
---

### RichText

| 属性  | 说明     | 类型     | 默认值             |
| ----- | -------- | -------- | ------------------ |
| options | 编辑器配置，详见[Quill Options](https://github.com/zenoamaro/react-quill#props)| object |  |
| mode | 编辑器模式，可选值 editor preview | string | editor |
| toolbar | 工具栏，可选值为钩子或者内置类型：normal none | string | ({ dataSet, id }) => ReactNode | normal |     

更多属性请参考 [FormField](/zh/procmp/abstract/field/#FormField)。

### RichText.RichTextViewer

| 参数 | 说明 | 类型 | 
| --- | --- | --- | 
| deltaOps | 编辑器渲染值 | Delta.ops |

### toolbar

自定义工具栏文档 [Custom Toolbar](https://github.com/zenoamaro/react-quill#custom-toolbar)
