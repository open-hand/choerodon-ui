---
category: Components
type: Data Display
title: List 
subtitle: 列表
cols: 1
---

通用列表。

## 何时使用

最基础的列表展示，可承载文字、列表、图片、段落，常用于后台数据展示页面。

## API

### List

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bordered | 是否展示边框 | boolean | false |
| footer | 列表底部 | string\|ReactNode | - |
| empty | 当数据源为空时显示的内容 | string\|ReactNode | - |
| grid | 列表栅格配置 | object | - |
| header | 列表头部 | string\|ReactNode | - |
| itemLayout | 设置 `List.Item` 布局, 设置成 `vertical` 则竖直样式显示, 默认横排 | string | - |
| loading | 当卡片内容还在加载中时，可以用 `loading` 展示一个占位 | boolean\|[object](/components/spin-cn/#API) | false |
| loadMore | 加载更多 | string\|ReactNode | - |
| pagination | 对应的 `pagination` 配置, 设置 `false` 不显示 | boolean\|object | false |
| size | list 的尺寸 | `default` \| `large` \| `small` | `default` |
| split | 是否展示分割线 | boolean | true |
| rowKey | 配置可选择时需要指定主键字段 | string \| function(record):string | |
| rowSelection | 是否可选择，[配置项](/#rowSelection) | boolean\|object | false |

### List grid props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| column | 列数 | number | - |
| gutter | 栅格间隔 | number | 0 |
| xs | `<576px` 展示的列数 | number | - |
| sm | `≥576px` 展示的列数 | number | - |
| md | `≥768px` 展示的列数 | number | - |
| lg | `≥992px` 展示的列数 | number | - |
| xl | `≥1200px` 展示的列数 | number | - |
| xxl | `≥1600px` 展示的列数 | number | - |

### List.Item

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| actions | 列表操作组，根据 `itemLayout` 的不同, 位置在卡片底部或者最右侧 | Array&lt;ReactNode> | - |
| extra | 额外内容, 通常用在 `itemLayout` 为 `vertical` 的情况下, 展示右侧内容; `horizontal` 展示在列表元素最右侧 | string\|ReactNode | - |

### List.Item.Meta

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatar | 列表元素的图标 | ReactNode | - |
| description | 列表元素的描述内容 | string\|ReactNode | - |
| title | 列表元素的标题 | string\|ReactNode | - |

### rowSelection

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| selectedRowKeys | 指定选中项的 key 数组，需要和 onChange 进行配合 | string[] \| number[] | - |
| defaultSelectedRowKeys | 默认选中项的 key 数组 | string[] \| number[] | |
| onChange | 选中项发生变化时的回调 | function(selectedRowKeys) | - |
