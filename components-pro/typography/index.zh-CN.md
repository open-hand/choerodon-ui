---
category:  Pro Components
subtitle: 排版
type: General
title: Typography
cols: 1
---

文本的基本格式。

## 何时使用

- 当需要展示标题、段落、列表内容时使用，如文章/博客/日志的文本样式。
- 当需要一列基于文本的基础操作时，如拷贝/省略等。

## API

### Typography.Text

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 添加代码样式 | boolean | false |
| copyable | 是否可拷贝，为对象时可进行各种自定义 | boolean \| [copyable](#copyable) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 自动溢出省略，为对象时能设置省略行数、是否可展开、onExpand 展开事件 | boolean \| [ellipsis](#ellipsis) | false |
| keyboard | 添加键盘样式 | boolean | false |
| mark | 添加标记样式 | boolean | false |
| onClick | 点击 Text 时的回调 | (event) => void | - |
| strong | 是否加粗 | boolean | false |
| italic | 是否斜体 | boolean | false |
| type | 文本类型 | `secondary` \| `success` \| `warning` \| `danger` | - |
| underline | 添加下划线样式 | boolean | false |

### Typography.Title

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 添加代码样式 | boolean | false |
| copyable | 是否可拷贝，为对象时可进行各种自定义 | boolean \| [copyable](#copyable) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 自动溢出省略，为对象时可设置省略行数、是否可展开、添加后缀等 | boolean \| [ellipsis](#ellipsis) | false |
| level | 重要程度，相当于 `h1`、`h2`、`h3`、`h4`、`h5` | number: 1, 2, 3, 4, 5 | 1 |
| mark | 添加标记样式 | boolean | false |
| onClick | 点击 Title 时的回调 | (event) => void | - |
| italic | 是否斜体 | boolean | false |
| type | 文本类型 | `secondary` \| `success` \| `warning` \| `danger` | - |
| underline | 添加下划线样式 | boolean | false |

### Typography.Paragraph

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| code | 添加代码样式 | boolean | false |
| copyable | 是否可拷贝，为对象时可进行各种自定义 | boolean \| [copyable](#copyable) | false |
| delete | 添加删除线样式 | boolean | false |
| disabled | 禁用文本 | boolean | false |
| ellipsis | 自动溢出省略，为对象时可设置省略行数、是否可展开、添加后缀等 | boolean \| [ellipsis](#ellipsis) | false |
| mark | 添加标记样式 | boolean | false |
| onClick | 点击 Paragraph 时的回调 | (event) => void | - |
| strong | 是否加粗 | boolean | false |
| italic | 是否斜体 | boolean | false |
| type | 文本类型 | `secondary` \| `success` \| `warning` \| `danger` | - |
| underline | 添加下划线样式 | boolean | false |

### copyable

    {
      text: string,
      onCopy: function,
      icon: ReactNode,
      tooltips: false | [ReactNode, ReactNode],
    }

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| icon | 自定义拷贝图标：\[默认图标, 拷贝后的图标] | \[ReactNode, ReactNode] | - |
| text | 拷贝到剪切板里的文本 | string | - |
| tooltips | 自定义提示文案，为 false 时隐藏文案 | \[ReactNode, ReactNode] | \[`复制`, `复制成功`] |
| onCopy | 拷贝成功的回调函数 | function | - |

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

| 参数       | 说明                 | 类型                 | 默认值 |
| ---------- | -------------------- | -------------------- | ------ |
| expandable | 是否可展开           | boolean              | -      |
| rows       | 最多显示的行数       | number               | -      |
| suffix     | 自定义省略内容后缀   | string               | -      |
| symbol     | 自定义展开描述文案   | ReactNode            | `展开` |
| tooltip    | 省略时，展示提示信息 | boolean \| ReactNode | -      |
| onEllipsis | 触发省略时的回调     | function(ellipsis)   | -      |
| onExpand   | 点击展开时的回调     | function(event)      | -      |

更多属性请参考 [FormField](/components-pro/field/#FormField)。
