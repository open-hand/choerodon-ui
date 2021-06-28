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
| autoHeight               | boolean                                                                           | Automatic height                                                                              |
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
| onRowClick               | (rowData:object) => void                                                          | Click the callback function after the row and return to `rowDate`                             |
| onScroll                 | (scrollX:object, scrollY:object) => void                                          | Callback function for scroll bar scrolling                                                    |
| onSortColumn             | (dataKey:string, sortType:string) => void                                         | Click the callback function of the sort sequence to return the value `sortColumn`, `sortType` |
| renderEmpty              | (info: React.Node) => React.Node                                                  | Customized data is empty display content                                                      |
| renderLoading            | (loading: React.Node) => React.Node                                               | Customize the display content in the data load                                                |
| renderRowExpanded        | (rowDate?: Object) => React.Node                                                  | Customize what you can do to expand a zone                                                    |
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
