---
category: Pro Components
cols: 1
subtitle: 分页
type: Navigation
title: Pagination
---

采用分页的形式分隔长列表，每次只加载一个页面。

## 何时使用

- 当加载/渲染所有数据将花费很多时间时；
- 可切换页码浏览数据。

## API

### Pagination

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| total | 总数 | number |  |
| page | 当前页 | number |  |
| pageSize | 分页数 | number |  |
| maxPageSize | 最大可输入分页数 | number | 100 |
| pageSizeEditable | 可输入分页数 | boolean | false |
| onChange | 页码改变的回调，参数是改变后的页码及每页条数 | (page, pageSize) => void |  |
| pageSizeOptions | 指定每页可以显示多少条 | string\[] | \['10', '20', '50', '100'\] |
| showQuickJumper | 是否显示快速跳转至某页 | boolean \| { goButton: ReactNode } | false |
| hideOnSinglePage | 只有一页时是否隐藏分页器 | boolean | false |
| showSizeChanger | 是否显示分页大小选择器 | boolean | true |
| showSizeChangerLabel | 是否显示分页大小选择器的标签 | boolean | true |
| showTotal | 显示总数，当传入function时可自定义显示数据总量和当前数据顺序  | boolean \| Function(total, range, counting, page, pageSize) | true |
| showPager | 显示数字按钮。设置为 input 时，仅显示为输入框。设置为 selectAndInput 时，显示按钮，以及在最后一页前显示输入框，同时 showQuickJumper 失效 | boolean \| 'input' \| 'selectAndInput' | false |
| itemRender | 按钮渲染。`type` - 按钮类型，可选值：`first` `last` `prev` `next` `jump-prev` `jump-next` | (page, type) => ReactNode |  |
| sizeChangerPosition | 分页大小选择器的位置，可选值: `left` `right` | string | left |
| sizeChangerOptionRenderer | 分页大小选择器的选项渲染器 | ({ dataSet, record, text, value}) => ReactNode | ({ text }) => text |
| quickJumperPosition | 快速跳转至某页的位置，可选值: `left` `right` | string | right |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。
