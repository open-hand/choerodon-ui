---
category: Pro Components
subtitle: 性能表格
type: Data Display
title: PerformanceTable
cols: 1
---

展示行列数据。

## 何时使用

展示大量行列数据，对性能有要求。

## API

### PerformanceTable

| 属性名称                 | 类型 `(默认值)`                                                                   | 描述                                                         |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| columns | Column\[] | 表格列的配置描述，具体项见下表
| affixHeader              | boolean,number                                                                    | 将表头固定到页面上的指定位置                                 |
| affixHorizontalScrollbar | boolean,number                                                                    | 将横向滚动条固定在页面底部的指定位置                         |
| autoHeight               | boolean                                                                           | 自动高度                                                     |
| bodyRef                  | React.Ref                                                                         | 表格主体部分上的 ref                                         |
| bordered                 | boolean`(true)`                                                                           | 表格边框                                                     |
| data \*                  | Array&lt;Object&gt;                                                               | 表格数据                                                     |
| defaultExpandAllRows     | boolean                                                                           | 默认展开所有节点                                             |
| defaultExpandedRowKeys   | string[]                                                                          | 通过 rowKey 指定默认展开的行                                 |
| defaultSortType          | enum: 'desc', 'asc'                                                               | 排序类型                                                     |
| expandedRowKeys          | string[]                                                                          | 通过 rowKey 指定展开的行 (受控)                              |
| headerHeight             | number`(33)`                                                                      | 表头高度                                                     |
| height                   | number`(200)`                                                                     | 高度                                                         |
| hover                    | boolean `(true)`                                                                  | 表格的行设置鼠标悬停效果                                     |
| isTree                   | boolean                                                                           | 是否展示为树表格                                             |
| loading                  | boolean                                                                           | 显示 loading 状态                                            |
| locale                   | object                                                                            | 本地化语言配置                                               |
| minHeight                | number `(0)`                                                                      | 最小高度                                                     |
| onDataUpdated            | (nextData: object[], scrollTo: (coord: { x: number; y: number }) => void) => void | 数据更新后的回调函数                                         |
| onExpandChange           | (expanded:boolean, rowData:object) => void                                        | 树形表格，在展开节点的回调函数                               |
| onRowClick               | (rowData:object) => void                                                          | 行点击后的回调函数， 返回 `rowDate`                          |
| onScroll                 | (scrollX:object, scrollY:object) => void                                          | 滚动条滚动时候的回调函数                                     |
| onSortColumn             | (dataKey:string, sortType:string) => void                                         | 点击排序列的回调函数，返回 `sortColumn`, `sortType` 这两个值 |
| renderEmpty              | (info: React.Node) => React.Node                                                  | 自定义渲染数据为空的状态                                     |
| renderLoading            | (loading: React.Node) => React.Node                                               | 自定义渲染数据加载中的状态                                   |
| renderRowExpanded        | (rowDate?: Object) => React.Node                                                  | 自定义可以展开区域的内容                                     |
| renderTreeToggle         | (icon:node, rowData:object, expanded:boolean) => node                             | 树形表格，在展开节点的回调函数                               |
| rowClassName             | string , (rowData:object) => string                                               | 为行自定义 className                                         |
| rowExpandedHeight        | number `(100)`                                                                    | 设置可展开区域的高度                                         |
| rowHeight                | (rowData:object) => number, number`(30)`                                          | 行高                                                         |
| rowKey                   | string `('key')`                                                                  | 每一个行对应的 `data` 中的唯一 `key`                         |
| shouldUpdateScroll       | boolean`(true)`                                                                   | 数据更新后更新滚动条位置                                     |
| showHeader               | boolean `(true)`                                                                  | 显示表头                                                     |
| showScrollArrow          | boolean `(false)`                                                                 | 显示滚动条箭头                                             |
| sortColumn               | string                                                                            | 排序列名称                                                   |
| sortType                 | enum: 'desc', 'asc'                                                               | 排序类型（受控）                                             |
| clickScrollLength        | object `({horizontal?: 100;vertical?: 30;})`                                      | 滚动条箭头点击滚动距离                                        |
| virtualized              | boolean                                                                           | 呈现大表格数据                                               |
| width                    | number                                                                            | 宽度                                                         |
| wordWrap                 | boolean                                                                           | 单元格自动换行                                               |
| highLightRow             | boolean`(true)`                                                                   | 点击行显示高亮行                                             |
| queryBar                 | queryBarProps                                                                     | 配置查询条                                                  |
| toolbar                  | toolBarProps                                                                     | 配置工具栏                                                  |
| toolBarRender            | (props: object) => React.ReactNode[]                                             | 工具栏渲染                                                  |
| columnHideable | boolean`(true)` | 可调整列显示, customizable 为 true 才起作用 |
| columnTitleEditable | boolean | 可编辑列标题, customizable 为 true 才起作用 |
| columnDraggable| boolean `(false)`  | 列拖拽, customizable 为 true 才起作用 |
| customizable | boolean | 是否显示个性化设置入口按钮  |  |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写全局配置中的表格个性化钩子： `tableCustomizedSave` `tableCustomizedLoad` | string | |


### Form methods

- scrollTop

垂直滚动条滚动到指定位置

```ts
scrollTop: (top: number) => void;
```

- scrollLeft

横向滚动条滚动到指定位置

```ts
scrollLeft: (left: number) => void;
```

### Column

| 属性名称      | 类型 `(默认值)`                                  | 描述                                                                                  |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| align         | enum: 'left','center','right'                    | 对齐方式                                                                              |
| colSpan       | number                                           | 合并列单元格，当被合并列的 `dataKey` 对应的值为 `null` 或者 `undefined`时，才会合并。 |
| fixed         | boolean, 'left', 'right'                         | 固定列                                                                                |
| flexGrow      | number                                           | 设置列宽自动调节，当设置了 `flexGrow` 就不能设置 `resizable` 与 `width` 属性          |
| minWidth      | number`(200)`                                    | 当使用了 `flexGrow` 以后，可以通过 `minWidth` 设置一个最小宽度                        |
| onResize      | (columnWidth?: number, dataKey?: string) => void | 列宽改变后的回调                                                                      |
| resizable     | boolean                                          | 可自定义调整列宽                                                                      |
| sortable      | boolean                                          | 可排序                                                                                |
| treeCol       | boolean                                          | 指定列显示为 Tree                                                                     |
| verticalAlign | enum: 'top', 'middle', 'bottom'                  | 垂直对齐方式                                                                          |
| width         | number                                           | 列宽                                                                                  |
| hidden         | boolean                                           | 隐藏                                                                                  |
| hideable         | boolean`(true)`                                       | 是否可隐藏                                                                                  |
| titleEditable         | boolean`(true)`                                       | 个性化是否可编辑列头                                                                                |

> `sortable` 是用来定义该列是否可排序，但是根据什么 `key` 排序需要 在 `Cell` 设置一个 `dataKey`
> 这里的排序是服务端排序，所以需要在 `<Table>` 的 `onSortColumn` 回调函数中处理逻辑，回调函数会返回 `sortColumn`, `sortType` 这两个值。

### ColumnGroup

| 属性名称      | 类型 `(默认值)`                 | 描述         |
| ------------- | ------------------------------- | ------------ |
| align         | enum: 'left','center','right'   | 对齐方式     |
| fixed         | boolean, 'left', 'right'        | 固定列组     |
| verticalAlign | enum: 'top', 'middle', 'bottom' | 垂直对齐方式 |
| header        | React.ReactNode                 | 分组表头     |

### Cell

| 属性名称 | 类型 `(默认值)` | 描述                                    |
| -------- | --------------- | --------------------------------------- |
| dataKey  | string          | 数据绑定的 `key` ，同时也是排序的 `key` |
| rowData  | object          | 行数据                                  |
| rowIndex | number          | 行号                                    |

> 分页请结合 Pagination 组件。


### toolBarProps

| 属性名称 | 类型 `(默认值)` | 描述                                    |
| -------- | --------------- | --------------------------------------- |
| header  | React.ReactNode          | 表格标题 |
| hideToolbar  | boolean          | 是否显示工具栏                                  |
| buttons | React.ReactNode[]          | 工具栏右侧操作区                                     |
| settings | (ReactNode \| Setting)[]         | 工作栏右侧设置区                                    |

### queryBarProps

| 属性名称 | 类型 `(默认值)` | 描述                                    |
| -------- | --------------- | --------------------------------------- |
| type  | TableQueryBarType: filter, professionalBar   | 查询条类型 |
| renderer  | (props: TableQueryBarHookProps) => React.ReactNode          | 渲染覆盖                                  |
| dataSet | DataSet          | 数据源                                     |
| queryFormProps | FormProps         | 查询条表单属性                                    |
| defaultExpanded | Boolean         | 是否默认展开                                    |
| queryDataSet | DataSet         | 查询数据源                                   |
| queryFields | React.ReactElement<any>[]         | 自定义查询字段组件或默认组件属性                                    |
| queryFieldsLimit | ReactElement         | 显示的查询字段的数量                                    |
| onQuery | (props: object) => void         | 查询回调                                    |
| onReset | () => void         | 重置回调                                    |
