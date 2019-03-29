---
category: Pro Components
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

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| total | 总数 | number |  |
| page | 当前页 | number |  |
| pageSize | 分页数 | number |  |
| onChange | 页码改变的回调，参数是改变后的页码及每页条数 | (page, pageSize) => void |  |
| pageSizeOptions | 指定每页可以显示多少条 | string\[] | \['10', '20', '50', '100'\] |
| showSizeChanger | 是否可以改变 pageSize | boolean | true |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

