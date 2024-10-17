---
title: API
---

### List

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bordered | 是否展示边框 | boolean | false |
| footer | 列表底部 | string\|ReactNode | - |
| empty | 当数据源为空时显示的内容 | string\|ReactNode | - |
| grid | 列表栅格配置 | object | - |
| header | 列表头部 | string\|ReactNode | - |
| itemLayout | 设置 `List.Item` 布局, 设置成 `vertical` 则竖直样式显示, 默认横排 | string | - |
| loading | 当卡片内容还在加载中时，可以用 `loading` 展示一个占位 | boolean\|[object](/zh/procmp/feedback/spin/#API) | false |
| loadMore | 加载更多 | string\|ReactNode | - |
| pagination | 对应的 `pagination` [配置](#pagination), 设置 `false` 不显示 | boolean\|object | false |
| size | list 的尺寸 | `default` \| `large` \| `small` | `default` |
| split | 是否展示分割线 | boolean | true |

### List grid props

| 属性名 | 说明 | 类型 | 默认值 |
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

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| actions | 列表操作组，根据 `itemLayout` 的不同, 位置在卡片底部或者最右侧 | Array&lt;ReactNode> | - |
| extra | 额外内容, 通常用在 `itemLayout` 为 `vertical` 的情况下, 展示右侧内容; `horizontal` 展示在列表元素最右侧 | string\|ReactNode | - |

### List.Item.Meta

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| avatar | 列表元素的图标 | ReactNode | - |
| description | 列表元素的描述内容 | string\|ReactNode | - |
| title | 列表元素的标题 | string\|ReactNode | - |

### Pagination

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| current | 当前页数 | number | - |
| defaultCurrent | 默认的当前页数 | number | 1 |
| defaultPageSize | 默认的每页条数 | number | 10 |
| hideOnSinglePage | 只有一页时是否隐藏分页器 | boolean | false |
| itemRender | 用于自定义页码的结构，可用于优化 SEO | (page, type: 'page' \| 'prev' \| 'next', originalElement) => React.ReactNode | - |
| pageSize | 每页条数 | number | - |
| pageSizeOptions | 指定每页可以显示多少条 | string\[] | ['10', '20', '30', '40'] |
| showQuickJumper | 是否可以快速跳转至某页 | boolean | false |
| showSizeChanger | 是否可以改变 pageSize | boolean | false |
| showTotal | 用于显示数据总量和当前数据顺序 | Function(total, range) | - |
| simple | 当添加该属性时，显示为简单分页 | boolean | - |
| tiny | 当添加该属性时，显示为简单分页 | boolean | true |
| size | 当为「small」时，是小尺寸分页 | string | "" |
| total | 数据总数 | number | 0 |
| onChange | 页码改变的回调，参数是改变后的页码及每页条数 | Function(page, pageSize) | noop |
| onShowSizeChange | pageSize 变化的回调 | Function(current, size) | noop |

### rowSelection

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| selectedRowKeys | 指定选中项的 key 数组，需要和 onChange 进行配合 | string[] \| number[] | - |
| defaultSelectedRowKeys | 默认选中项的 key 数组 | string[] \| number[] | |
| onChange | 选中项发生变化时的回调 | function(selectedRowKeys) | - |
