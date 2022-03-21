---
category: Pro Components
type: General
title: Typography
subtitle: Typography
cols: 1
---

Basic text writing, including headings, body text, lists, and more.

## When To Use

- When need to display a title or paragraph contents in Articles/Blogs/Notes.
- When you need copyable/ellipsis texts.

## API

### Typography.Text

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| code | Code style | boolean | false |
| copyable | Whether to be copyable, customize it via setting an object | boolean \| [copyable](#copyable) | false |
| delete | Deleted line style | boolean | false |
| disabled | Disabled content | boolean | false |
| ellipsis | Display ellipsis when text overflows，can't configure expandable、rows and onExpand by using object | boolean \| [ellipsis](#ellipsis) | false |
| keyboard | Keyboard style | boolean | false |
| mark | Marked style | boolean | false |
| onClick | Set the handler to handle click event | (event) => void | - |
| strong | Bold style | boolean | false |
| italic | Italic style | boolean | false |
| type | Content type | `secondary` \| `success` \| `warning` \| `danger` | - |
| underline | Underlined style | boolean | false |

### Typography.Title

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| code | Code style | boolean | false |
| copyable | Whether to be copyable, customize it via setting an object | boolean \| [copyable](#copyable) | false |
| delete | Deleted line style | boolean | false |
| disabled | Disabled content | boolean | false |
| ellipsis | Display ellipsis when text overflows, can configure rows and expandable by using object | boolean \| [ellipsis](#ellipsis) | false |
| level | Set content importance. Match with `h1`, `h2`, `h3`, `h4`, `h5` | number: 1, 2, 3, 4, 5 | 1 |
| mark | Marked style | boolean | false |
| onClick | Set the handler to handle click event | (event) => void | - |
| italic | Italic style | boolean | false |
| type | Content type | `secondary` \| `success` \| `warning` \| `danger` | - |
| underline | Underlined style | boolean | false |

### Typography.Paragraph

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| code | Code style | boolean | false |
| copyable | Whether to be copyable, customize it via setting an object | boolean \| [copyable](#copyable) | false |
| delete | Deleted line style | boolean | false |
| disabled | Disabled content | boolean | false |
| ellipsis | Display ellipsis when text overflows, can configure rows and expandable by using object | boolean \| [ellipsis](#ellipsis) | false |
| mark | Marked style | boolean | false |
| onClick | Set the handler to handle click event | (event) => void | - |
| strong | Bold style | boolean | false |
| italic | Italic style | boolean | false |
| type | Content type | `secondary` \| `success` \| `warning` \| `danger` | - |
| underline | Underlined style | boolean | false |

### copyable

    {
      text: string,
      onCopy: function,
      icon: ReactNode,
      tooltips: false | [ReactNode, ReactNode],
    }

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| icon | Custom copy icon: \[copyIcon, copiedIcon] | \[ReactNode, ReactNode] | - |
| text | The text to copy | string | - |
| tooltips | Custom tooltip text, hide when it is false | \[ReactNode, ReactNode] | \[`Copy`, `Copied`] |
| onCopy | Called when copied text | function | - |

### ellipsis

    {
      rows: number,
      expandable: boolean,
      suffix: string,
      symbol: ReactNode,
      tooltip: boolean | ReactNode,
      onExpand: function(event),
      onEllipsis: function(ellipsis),
    }

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| expandable | Whether to be expandable | boolean | - |
| rows | Max rows of content | number | - |
| suffix | Suffix of ellipsis content | string | - |
| symbol | Custom description of ellipsis | ReactNode | `Expand` |
| tooltip | Show tooltip when ellipsis | boolean \| ReactNode | - |
| onEllipsis | Called when enter or leave ellipsis state | function(ellipsis) | - |
| onExpand | Called when expand content | function(event) | - |

More props [FormField](/components-pro/field/#FormField)。
