---
category: Pro Components
subtitle: 富文本编辑器
type: Data Display
title: RichText
cols: 1
---

富文本编辑器。

## 何时使用

富文本编辑器。

## API

### RichText

| 属性  | 说明     | 类型     | 默认值             |
| ----- | -------- | -------- | ------------------ |
| options | 编辑器配置，详见[Quill Options](https://github.com/zenoamaro/react-quill#props)| object |  |
| mode | 编辑器模式，可选值 editor preview | string | `editor` |
| toolbar | 工具栏，可选值为钩子或者内置类型：normal none | string | ({ dataSet, id }) => ReactNode | `normal` |

更多属性请参考 [FormField](/components-pro/field/#FormField)。

### RichText.RichTextViewer

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| deltaOps | 编辑器渲染值 | Delta.ops | 无 |

### toolbar

- 自定义工具栏文档 [Custom Toolbar](https://github.com/zenoamaro/react-quill#custom-toolbar)


<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
