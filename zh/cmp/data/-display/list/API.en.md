---
title: API
---

### List

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| bordered | Toggles rendering of the border around the list | boolean | false |
| footer | List footer renderer | string\|ReactNode | - |
| empty | display while dataSource has't data | string\|ReactNode | - |
| grid | The grid type of list. You can set grid to something like {gutter: 16, column: 4} | object | - |
| header | List header renderer | string\|ReactNode | - |
| itemLayout | The layout of list, default is `horizontal`, If a vertical list is desired, set the itemLayout property to `vertical` | string | - |
| loading | Shows a loading indicator while the contents of the list are being fetched | boolean\|[object](/zh/procmp/feedback/spin/#API) | false |
| loadMore | Shows a load more content | string\|ReactNode | - |
| pagination | Pagination [config](#pagination), hide it by setting it to false | boolean \| object | false |
| split | Toggles rendering of the split under the list item | boolean | true |

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
| actions | The actions content of list item. If `itemLayout` is `vertical`, shows the content on bottom, otherwise shows content on the far right. | Array<ReactNode> | - |
| extra | The extra content of list item. If `itemLayout` is `vertical`, shows the content on right, otherwise shows content on the far right. | string\|ReactNode | - |

### List.Item.Meta

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| avatar | The avatar of list item | ReactNode | - |
| description | The description of list item | string\|ReactNode | - |
| title | The title of list item | string\|ReactNode | - |

### Pagination

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| current | current page number | number | - |
| defaultCurrent | default initial page number | number | 1 |
| defaultPageSize | default number of data items per page | number | 10 |
| hideOnSinglePage | Whether to hide pager on single page | boolean | false |
| itemRender | to customize item innerHTML | (page, type: 'page' \| 'prev' \| 'next', originalElement) => React.ReactNode | - |
| pageSize | number of data items per page | number | - |
| pageSizeOptions | specify the sizeChanger options | string\[] | ['10', '20', '30', '40'] |
| showQuickJumper | determine whether you can jump to pages directly | boolean | false |
| showSizeChanger | determine whether `pageSize` can be changed | boolean | false |
| showTotal | to display the total number and range | Function(total, range) | - |
| simple | whether to use simple mode | boolean | - |
| tiny | whether to use simple mode | boolean | true |
| size | specify the size of `Pagination`, can be set to `small` | string | "" |
| total | total number of data items | number | 0 |
| onChange | a callback function, executed when the page number is changed, and it takes the resulting page number and pageSize as its arguments | Function(page, pageSize) | noop |
| onShowSizeChange | a callback function, executed when `pageSize` is changed | Function(current, size) | noop |

### rowSelection

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| selectedRowKeys | Specify the key array of the selected item, which needs to be matched with onchange | string[] \| number[] | - |
| defaultSelectedRowKeys | Key array of default selected items | string[] \| number[] | |
| onChange | Callback when the selected item changes | function(selectedRowKeys) | - |
