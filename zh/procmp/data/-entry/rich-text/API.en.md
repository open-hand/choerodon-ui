---
title: API
---

### RichText

| Property | Description | Type | Default Value |
| ----- | -------- | -------- | ------------------ |
| options | Editor configuration, see [Quill Options](https://github.com/zenoamaro/react-quill#props)| object | |
| mode | Editor mode, optional value editor preview | string | `editor` |
| toolbar | Toolbar, optional value is hook or built-in type: normal none | string | ({ dataSet, id }) => ReactNode | `normal` |

For more attributes, please refer to [FormField](/zh/procmp/abstract/field/#FormField).


### RichText.RichTextViewer

| Parameters | Description | Type | Default Value |
| --- | --- | --- | --- |
| deltaOps | Editor rendering value | Delta.ops | None |

### toolbar

- Custom Toolbar Document [Custom Toolbar](https://github.com/zenoamaro/react-quill#custom-toolbar)
