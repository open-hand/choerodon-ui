---
category: Pro Components
subtitle: rich text editor
type: Data Display
title: RichText
cols: 1
---

Rich text editor.

## When to use

Rich text editor.

## API

### RichText

| Property | Description | Type | Default Value |
| ----- | -------- | -------- | ------------------ |
| options | Editor configuration, see [Quill Options](https://github.com/zenoamaro/react-quill#props)| object | |
| mode | Editor mode, optional value editor preview | string | `editor` |
| toolbar | Toolbar, optional value is hook or built-in type: normal none | string | ({ dataSet, id }) => ReactNode | `normal` |

For more attributes, please refer to [FormField](/components-pro/field/#FormField).

### RichText.RichTextViewer

| Parameters | Description | Type | Default Value |
| --- | --- | --- | --- |
| deltaOps | Editor rendering value | Delta.ops | None |

### toolbar

- Custom Toolbar Document [Custom Toolbar](https://github.com/zenoamaro/react-quill#custom-toolbar)


<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
