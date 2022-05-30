---
category: Components
type: Data Display
title: List 
cols: 1
---

Simple List.

## When To Use

A list can be used to display content related to a single subject. The content can consist of multiple elements of varying type and size.

## API

### List

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| bordered | Toggles rendering of the border around the list | boolean | false |
| footer | List footer renderer | string\|ReactNode | - |
| empty | display while dataSource has't data | string\|ReactNode | - |
| grid | The grid type of list. You can set grid to something like {gutter: 16, column: 4} | object | - |
| header | List header renderer | string\|ReactNode | - |
| itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string | - |
| loading | Shows a loading indicator while the contents of the list are being fetched | boolean\|[object](/components/spin/#API) | false |
| loadMore | Shows a load more content | string\|ReactNode | - |
| pagination | Pagination [config](/components/pagination/), hide it by setting it to false | boolean \| object | false |
| split | Toggles rendering of the split under the list item | boolean | true |
| rowSelection | 是否可选择，[config](/#rowSelection) | boolean\|object | false |

### List grid props

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| column | column of grid | number | - |
| gutter | spacing between grid | number | 0 |
| size | Size of list | `default` \| `large` \| `small` | `default` |
| xs | `<576px` column of grid | number | - |
| sm | `≥576px` column of grid | number | - |
| md | `≥768px` column of grid | number | - |
| lg | `≥992px` column of grid | number | - |
| xl | `≥1200px` column of grid | number | - |
| xxl | `≥1600px` column of grid | number | - |

### List.Item

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| value | Unique key value. Assignment is required when using `rowSelection` | string \| number | - |
| actions | The actions content of list item. If `itemLayout` is `vertical`, shows the content on bottom, otherwise shows content on the far right. | Array<ReactNode> | - |
| extra | The extra content of list item. If `itemLayout` is `vertical`, shows the content on right, otherwise shows content on the far right. | string\|ReactNode | - |

### List.Item.Meta

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| avatar | The avatar of list item | ReactNode | - |
| description | The description of list item | string\|ReactNode | - |
| title | The title of list item | string\|ReactNode | - |

### rowSelection

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| selectedRowKeys | Selected value | Array[] | - |
| onChange | Callback of select | function(selectedRowKeys) | - |
