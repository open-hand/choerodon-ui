---
title: Form
subtitle: 表单
order: 0
---

Form is used to collect, validate, and submit the user input, usually contains various form items including checkbox, radio, input, select, and etc.

## Basic Form is not under maintenance, it is recommended to use Pro Form

## Form

You can align the controls of a `form` using the `layout` prop：

- `horizontal`：to horizontally align the `label`s and controls of the fields. (Default)
- `vertical`：to vertically align the `label`s and controls of the fields.
- `inline`：to render form fields in one line.

## Form fields

A form consists of one or more form fields whose type includes input, textarea, checkbox, radio, select, tag, and more.
A form field is defined using `<Form.Item />`.

```jsx
<Form.Item {...props}>
  {children}
</Form.Item>
```

