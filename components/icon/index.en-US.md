---
category: Components
type: General
title: Icon
cols: 1
toc: false
---

Semantic vector graphics.

## Icons naming convention

We provide semantic name for every icon, and naming rules are as follows:

- Scanning line icon has the similar name with its solid one，but it's distinguished by `-o`, for example, `question-circle` (a full circle) and `question-circle-o` (an empty circle);
- Naming sequence：`[name]-[shape?]-[outline?]-[direction?]`.

> `?` means is optional.

See more design detail at [here](/docs/spec/icon).

## How To Use

Use tag `<Icon />` to create an icon and set its type in the type prop, for example:

```html
<Icon type="add_location" />
```

## List of icons

> Click the icon and copy the code。

```__react
import IconSet from 'site/theme/template/IconSet';
ReactDOM.render(<IconSet className="icons" />, mountNode);
```

## API

You can set `style` and `className` for size and color of icons because they are still fonts in essence.

```jsx
<Icon type="add_location" style={{ fontSize: 16, color: '#08c' }} />
```

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| type | Type of choerodon ui icon | string | - |

<style>
.c7n-icon-block {
  display: inline-block;
  width: 200px;
  text-align: center;
  font-size: 14px;
}
.c7n-icon-block .icon {
  line-height: 80px;
  transition: font-size .2s;
}
</style>
