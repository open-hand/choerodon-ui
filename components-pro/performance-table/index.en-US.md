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

| Property                 | Type `(Default)`                                                                  | Description                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| columns |  Column\[] | Columns of table 
| affixHeader              | boolean,number                                                                    | Affix the table header to the specified location on the page                                  |
| affixHorizontalScrollbar | boolean,number                                                                    | Affix the table horizontal scrollbar to the specified position on the page                    |
| autoHeight               | boolean \| { type: 'minHeight' \| 'maxHeight', diff: number }                     | Automatic |
| bodyRef                  | React.Ref                                                                         | A ref attached to the table body element                                                      |
| bordered                 | boolean`(true)`                                                                           | Show border                                                                                   |
| data \*                  | Array&lt;Object&gt;                                                               | Table data                                                                                    |
| defaultExpandAllRows     | boolean                                                                           | Expand all nodes By default                                                                   |
| defaultExpandedRowKeys   | string[]                                                                          | Specify the default expanded row by `rowkey`                                                  |
| defaultSortType          | enum: 'desc', 'asc'                                                               | Sort type                                                                                     |
| expandedRowKeys          | string[]                                                                          | Specify the default expanded row by `rowkey` (Controlled)                                     |
| headerHeight             | number`(33)`                                                                      | Table Header Height                                                                           |
| height                   | number`(200)`                                                                     | Table height                                                                                  |
| hover                    | boolean `(true)`                                                                  | The row of the table has a mouseover effect                                                   |
| isTree                   | boolean                                                                           | Show as Tree table                                                                            |
| loading                  | boolean                                                                           | Show loading                                                                                  |
| minHeight                | number `(0)`                                                                      | Minimum height                                                                                |
| onDataUpdated            | (nextData: object[], scrollTo: (coord: { x: number; y: number }) => void) => void | Callback after table data update.                                                             |
| onExpandChange           | (expanded:boolean, rowData:object) => void                                        | Tree table, the callback function in the expanded node                                        |
| onRowClick               | (rowData:object) => void                                                          | Click the callback function after the row and return to `rowData`                             |
| onScroll                 | (scrollX:object, scrollY:object) => void                                          | Callback function for scroll bar scrolling                                                    |
| onSortColumn             | (dataKey:string, sortType:string) => void                                         | Click the callback function of the sort sequence to return the value `sortColumn`, `sortType` |
| renderEmpty              | (info: React.Node) => React.Node                                                  | Customized data is empty display content                                                      |
| renderLoading            | (loading: React.Node) => React.Node                                               | Customize the display content in the data load                                                |
| renderRowExpanded        | (rowData?: Object) => React.Node                                                  | Customize what you can do to expand a zone                                                    |
| renderTreeToggle         | (icon:node, rowData:object, expanded:boolean) => node                             | Tree table, the callback function in the expanded node                                        |
| rowClassName             | string , (rowData:object) => string                                               | Add an optional extra class name to row                                                       |
| rowExpandedHeight        | number `(100)`                                                                    | Set the height of an expandable area                                                          |
| rowHeight                | (rowData:object) => number, number`(30)`                                          | Row height                                                                                    |
| rowKey                   | string `('key')`                                                                  | Each row corresponds to the unique `key` in `data`                                            |
| shouldUpdateScroll       | boolean`(true)`                                                                   | Whether to update the scroll bar after data update                                            |
| showHeader               | boolean `(true)`                                                                  | Display header                                                                                |
| showScrollArrow          | boolean `(false)`                                                                 | Display ScrollBar arrow                                             |
| sortColumn               | string                                                                            | Sort column name                                                                              |
| sortType                 | enum: 'desc', 'asc'                                                               | Sort type (Controlled)                                                                        |
| clickScrollLength        | object `({horizontal?: 100;vertical?: 30;})`                                      | 滚动条箭头点击滚动距离                                        |
| virtualized              | boolean                                                                           | Effectively render large tabular data                                                         |
| width                    | number                                                                            | Table width                                                                                   |
| wordWrap                 | boolean                                                                           | The cell wraps automatically                                                                  |
| highLightRow             | boolean`(true)`                                                                   | Click on the row to display the highlighted row                                       |
| queryBar                 | queryBarProps                                                                     | 配置查询条                                                  |
| toolbar                  | toolBarProps                                                                     | 配置工具栏                                                  |
| toolBarRender            | (props: object) => React.ReactNode[]                                             | 工具栏渲染                                                  |
| queryBar                 | queryBarProps                                                                     | 配置查询条                                                  |
| toolbar                  | toolBarProps                                                                     | 配置工具栏                                                  |
| toolBarRender            | (props: object) => React.ReactNode[]                                             | 工具栏渲染                                                  |
| columnHideable | boolean`(true)` | 可调整列显示, customizable 为 true 才起作用 |
| columnTitleEditable | boolean | 可编辑列标题, customizable 为 true 才起作用 |
| columnDraggable| boolean `(false)`  | 列拖拽, customizable 为 true 才起作用 |
| customizable | boolean | 是否显示个性化设置入口按钮  |
| customizedCode | string | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写全局配置中的表格个性化钩子： `customizedSave` `customizedLoad`  |
| rowSelection | object | 表格行是否可选择，[配置项](#rowSelection)  |
| rowDraggable | boolean `(false)` | 行拖拽，实现行的拖拽  |
| onDragEnd |  (resultDrag: DropResult, provided: ResponderProvided, data) => void | 完成拖拽后的触发事件 |
| onDragEndBefore |  (resultDrag: DropResult, provided: ResponderProvided) => void | 完成拖拽前的触发事件 |
| onDragStart |  (initial: DragStart, provided: ResponderProvided) => void | 拖拽前触发事件 |
| components |  [TableComponents](#TableComponents) | 覆盖默认的 table 元素 |
| useMouseBatchChoose |  boolean`[globalConfig.performanceTableUseMouseBatchChoose](/components/configure#API)` |是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 |

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

| Property      | Type `(Default)`                                 | Description                                                                                                 |
| ------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| align         | enum: 'left','center','right'                    | Alignment                                                                                                   |
| colSpan       | number                                           | Merges column cells to merge when the `dataKey` value for the merged column is `null` or `undefined`.       |
| fixed         | boolean, 'left', 'right'                         | Fixed column                                                                                                |
| flexGrow      | number                                           | Set the column width automatically adjusts, when set `flexGrow` cannot set `resizable` and `width` property |
| minWidth      | number`(200)`                                    | When you use `flexGrow`, you can set a minimum width by `minwidth`                                          |
| onResize      | (columnWidth?: number, dataKey?: string) => void | Callback after column width change                                                                          |
| resizable     | boolean                                          | Customizable Resize Column width                                                                            |
| sortable      | boolean                                          | Sortable                                                                                                    |
| treeCol       | boolean                                          | A column of a tree.                                                                                         |
| verticalAlign | enum: 'top', 'middle', 'bottom'                  | Vertical alignment                                                                                          |
| width         | number                                           | Column width                                                                                                |
| hidden         | boolean                                           | 隐藏                                                                                  |
| hideable         | boolean`(true)`                                       | 是否可隐藏                                                                                  |
| onCell	| ({ rowData, dataIndex, rowIndex }) => object | 设置单元格属性	| 
| render	| ({ rowData, dataIndex, rowIndex }) => ReactNode | 覆盖渲染单元格内容	| 

> `sortable` is used to define whether the column is sortable, but depending on what `key` sort needs to set a `dataKey` in `Cell`.
> The sort here is the service-side sort, so you need to handle the logic in the ' Onsortcolumn ' callback function of `<Table>`, and the callback function returns `sortColumn`, `sortType` values.

### ColumnGroup

| Property      | Type `(Default)`                | Description        |
| ------------- | ------------------------------- | ------------------ |
| align         | enum: 'left','center','right'   | Alignment          |
| fixed         | boolean, 'left', 'right'        | Fixed column group |
| verticalAlign | enum: 'top', 'middle', 'bottom' | Vertical alignment |
| header        | React.ReactNode                 | Group header       |

### Cell

| Property | Type `(Default)` | Description                                  |
| -------- | ---------------- | -------------------------------------------- |
| dataKey  | string           | Data binding `key`, but also a sort of `key` |
| rowData  | object           | Row data                                     |
| rowIndex | number           | Row number                                   |
| rowSpan | number          | 行合并,设置为 0 时，不渲染     |

### rowSelection

选择功能的配置，使用请指明 rowKey。

| 参数 | 说明 | 类型 | 默认值 | 
| --- | --- | --- | --- | 
| columnWidth | 自定义列表选择框宽度 | string\|number | `60px` | 
| columnTitle | 自定义列表选择框标题 | string\|React.ReactNode |  | 
| columnIndex | 自定义列表选择框列顺序 | number |  | 
| fixed | 把选择框列固定在左边 | boolean | 'left' |  
| getCheckboxProps | 选择框的默认属性配置 | Function(record) |  |
| hideDefaultSelections | 自定义选择项时去掉『全选』『反选』两个默认选项 | boolean | false |
| selectedRowKeys | 指定选中项的 key 数组，需要和 onChange 进行配合 | string\[]\|number[] | \[] |
| selections | 自定义选择项 [配置项](#selection), 设为 `true` 时使用默认选择项 | object\[]\|boolean | true |
| type | 多选/单选，`checkbox` or `radio` | string | `checkbox` |  
| onChange | 选中项发生变化时的回调 | Function(selectedRowKeys, selectedRows) |  |  
| onSelect | 用户手动选择/取消选择某行的回调 | Function(record, selected, selectedRows, nativeEvent) |  |
| onSelectAll | 用户手动选择/取消选择所有行的回调 | Function(selected, selectedRows, changeRows) |  |
| onSelectInvert | 用户手动选择反选的回调 | Function(selectedRows) |  |  

> 使用请指明 rowKey。

### selection

| 参数     | 说明                       | 类型                        | 默认值 |
| -------- | -------------------------- | --------------------------- | ------ |
| key      | React 需要的 key，建议设置 | string                      |       |
| text     | 选择项显示的文字           | string\|React.ReactNode     |       |
| onSelect | 选择项点击回调             | Function(changeableRowKeys) |       |

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
| fuzzyQuery | 是否开启模糊查询 | boolean | true |
| fuzzyQueryOnly | 是否仅使用模糊查询 | boolean | false |
| fuzzyQueryPlaceholder | 模糊查询 placeholder  | string |  |
| queryFields | React.ReactElement<any>[]         | 自定义查询字段组件或默认组件属性                                    |
| queryFieldsLimit | ReactElement         | 显示的查询字段的数量                                    |
| onQuery | (props: object) => void         | 查询回调                                    |
| onRefresh | (props: object) => void         | 刷新回调                                    |
| onReset | () => void         | 重置回调                                    |

### TableComponents

| 属性名称 | 类型  | 描述 |
| -------- | ----- | ---- |
| table |  ReactNode          | 覆盖表格组件 |
| header | { wrapper: ReactNode; row: ReactNode; cell: ReactNode; }          | 覆盖表格 header 组件  |
| body | { wrapper: ReactNode; row: ReactNode; cell: ReactNode; }         | 覆盖表格 body 组件 |
