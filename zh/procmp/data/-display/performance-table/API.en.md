---
title: API
---

### PerformanceTable

| Property                 | Type `(Default)`                                                                  | Description                                                                                   | Supported version  |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --- |
| columns |  Column\[] | Columns of table   |
| affixHeader              | boolean,number                                                                    | Affix the table header to the specified location on the page                                  |    |
| affixHorizontalScrollbar | boolean,number                                                                    | Affix the table horizontal scrollbar to the specified position on the page                    |    |
| autoHeight               | boolean                                                                           | Automatic height                                                                              |    |
| bodyRef                  | React.Ref                                                                         | A ref attached to the table body element                                                      |    |
| bordered                 | boolean`(true)`                                                                           | Show border                                                                                   |    |
| data \*                  | Array&lt;Object&gt;                                                               | Table data                                                                                    |    |
| defaultExpandAllRows     | boolean                                                                           | Expand all nodes By default                                                                   |    |
| defaultExpandedRowKeys   | string[]                                                                          | Specify the default expanded row by `rowkey`                                                  |    |
| defaultSortType          | enum: 'desc', 'asc'                                                               | Sort type                                                                                     |    |
| expandedRowKeys          | string[]                                                                          | Specify the default expanded row by `rowkey` (Controlled)                                     |    |
| headerHeight             | number`(33)`                                                                      | Table Header Height                                                                           |    |
| height                   | number`(200)`                                                                     | Table height                                                                                  |    |
| hover                    | boolean `(true)`                                                                  | The row of the table has a mouseover effect                                                   |    |
| isTree                   | boolean                                                                           | Show as Tree table                                                                            |    |
| loading                  | boolean                                                                           | Show loading                                                                                  |    |
| minHeight                | number `(0)`                                                                      | Minimum height                                                                                |    |
| onDataUpdated            | (nextData: object[], scrollTo: (coord: { x: number; y: number }) => void) => void | Callback after table data update.                                                             |    |
| onExpandChange           | (expanded:boolean, rowData:object) => void                                        | Tree table, the callback function in the expanded node                                        |    |
| onRowClick               | (rowData:object) => void                                                          | Click the callback function after the row and return to `rowData`                             |    |
| onRowDoubleClick`(1.6.7)`| (rowData:object) => void                                                          | DoubleClick the callback function after the row and return to `rowData`                       |    |
| onScroll                 | (scrollX:object, scrollY:object) => void                                          | Callback function for scroll bar scrolling                                                    |    |
| onSortColumn             | (dataKey:string, sortType:string) => void                                         | Click the callback function of the sort sequence to return the value `sortColumn`, `sortType` |    |
| renderEmpty              | (info: React.Node) => React.Node                                                  | Customized data is empty display content                                                      |    |
| renderLoading            | (loading: React.Node) => React.Node                                               | Customize the display content in the data load                                                |    |
| renderRowExpanded        | (rowData?: Object) => React.Node                                                  | Customize what you can do to expand a zone                                                    |    |
| renderTreeToggle         | (icon:node, rowData:object, expanded:boolean) => node                             | Tree table, the callback function in the expanded node                                        |    |
| rowClassName             | string , (rowData:object) => string                                               | Add an optional extra class name to row                                                       |    |
| rowExpandedHeight        | number `(100)`                                                                    | Set the height of an expandable area                                                          |    |
| rowHeight                | (rowData:object) => number, number`(33)`                                          | Row height                                                                                    |    |
| rowKey                   | string `('key')`                                                                  | Each row corresponds to the unique `key` in `data`                                            |    |
| shouldUpdateScroll       | boolean`(true)`                                                                   | Whether to update the scroll bar after data update                                            |    |
| showHeader               | boolean `(true)`                                                                  | Display header                                                                                |    |
| showScrollArrow          | boolean `(false)`                                                                 | Display ScrollBar arrow                                             |  |
| sortColumn               | string                                                                            | Sort column name                                                                              |    |
| sortType                 | enum: 'desc', 'asc'                                                               | Sort type (Controlled)                                                                        |    |
| clickScrollLength        | object `({horizontal?: 100;vertical?: 33;})`                                      | Scroll distance of scrollbar arrow click                                        |    |
| virtualized              | boolean                                                                           | Effectively render large tabular data                                                         |    |
| width                    | number                                                                            | Table width                                                                                   |    |
| wordWrap                 | boolean                                                                           | The cell wraps automatically                                                                  |    |
| highLightRow             | boolean`(true)`                                                                   | Click on the row to display the highlighted row, rowkey needs to be specified when virtual scrolling is enabled                                       | 1.4.1   |
| queryBar             | queryBarProps                                                                | Query bar                                  |   |
| toolbar             | toolbarProps                                                                | Toolbar                                  | |
| toolBarRender            | (props: object) => React.ReactNode[]                                             | Toolbar render                                                  |   |
| columnHideable | boolean`(true)` | Adjustable column display, only works when customizable is true |  |
| columnTitleEditable | boolean | Editable column title, only works when customizable is true | 1.4.3  |
| columnDraggable| boolean `(false)`  | Column draggable, only works when customizable is true | 1.4.3  |
| customizable | boolean | Whether to display the personalized setting entry button  |  | 1.4.3  |
| customizedCode |string | Personalized code. After setting, the personalized settings such as column dragging will be stored in localStorage by default. If you want to store it in the backend, please rewrite the table personalized hooks in the global configuration: `customizedSave` `customizedLoad` | 1.4.3   |
| rowSelection`(1.4.4)` | object | Whether table rows are selectable, [Configuration](#rowselection)  | 
| rowDraggable`(1.4.4)` | boolean `(false)` | Row draggable, implement row dragging  |
| customDragDropContenxt`(1.6.7)` | boolean \| undefined | Whether to enable custom DragDropContext, generally used for custom react-beautiful-dnd DragDropContext to implement multi-table dragging |
| onDragEnd`(1.4.4)` |  (resultDrag: DropResult, provided: ResponderProvided, data) => void | Trigger event after dragging is completed |
| onDragEndBefore`(1.4.4)` |  (resultDrag: DropResult, provided: ResponderProvided) => void | Trigger event before dragging is completed |
| onDragStart`(1.5.0-beta.0)` |  (initial: DragStart, provided: ResponderProvided) => void | Trigger event before dragging |
| components |  [TableComponents](#tablecomponents) | Override default table elements | 1.6.5 ｜
| useMouseBatchChoose`(1.6.7)` |  boolean`[globalConfig.performanceTableUseMouseBatchChoose](/components/configure#API)` | Whether to use mouse batch selection. When enabled, mouse drag batch selection can be performed in the case of rowbox. Press at the starting rowbox and release at the ending position |

### Form methods

- scrollTop

Scroll the vertical scrollbar to the specified position

```ts
scrollTop: (top: number) => void;
```

- scrollLeft

Scroll the horizontal scrollbar to the specified position

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
| hidden         | boolean                                           | Hidden                                                                                  |
| hideable         | boolean`(true)`                                       | Whether it is hideable                                                                                  |
| titleEditable         | boolean`(true)`                                       | Whether the column header is editable in personalization                                                                                |
| onCell`(1.4.4)` 	| ({ rowData, dataIndex, rowIndex }) => object | Set cell properties	| 
| render	| ({ rowData, dataIndex, rowIndex }) => ReactNode | Override render cell content	| 
| footer`(1.6.7)`	| ({ data, dataIndex }) => ReactNode | Table footer render content	| 

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
| rowSpan`(1.4.4)` | number          | Row merge, not rendered when set to 0     |

### toolBarProps

| Property | Type `(Default)` | Description                                    |
| -------- | --------------- | --------------------------------------- |
| header  | React.ReactNode          | Table title |
| hideToolbar  | boolean          | Whether to display toolbar                                  |
| buttons | React.ReactNode[]          | Toolbar right operation area                                     |
| settings | (ReactNode \| Setting)[]         | Toolbar right setting area                                    |

### queryBarProps

| Property | Type `(Default)` | Description                                    |
| -------- | --------------- | --------------------------------------- |
| type  | TableQueryBarType: filter, professionalBar   | Query bar type |
| renderer  | (props: TableQueryBarHookProps) => React.ReactNode          | Render override                                  |
| dataSet | DataSet          | DataSet                                     |
| queryFormProps | FormProps         | Query bar form properties                                    |
| defaultExpanded | Boolean         | Whether to expand by default                                    |
| queryDataSet | DataSet         | Query DataSet                                   |
| queryFields | React.ReactElement<any>[]         | Custom query field component or default component properties                                    |
| queryFieldsLimit | ReactElement         | Number of displayed query fields                                    |
| onQuery | (props: object) => void         | Query callback                                    |
| onReset | () => void         | Reset callback                                    |

### rowSelection

Configuration of selection function, please specify rowKey when using.

| Property | Description | Type | Default | 
| --- | --- | --- | --- | 
| columnWidth | Custom list selection box width | string\|number | `60px` | 
| columnTitle | Custom list selection box title | string\|React.ReactNode |  | 
| columnIndex | Custom list selection box column order | number | |
| fixed | Fix the selection box column to the left | boolean | left |  
| getCheckboxProps | Default property configuration of selection box | Function(record) |  |
| hideDefaultSelections | Remove the two default options of "Select All" and "Invert Selection" when customizing selection items | boolean | false |
| selectedRowKeys | Specify the key array of the selected item, which needs to be used with onChange | string\[]\|number[] | \[] |
| selections | Custom selection items [Configuration](#selection), use default selection items when set to true | object\[]\|boolean | true |
| type | Multiple/Single selection, checkbox or radio | string | `checkbox` |  |
| onChange | Callback when selected items change | Function(selectedRowKeys, selectedRows) |  |  |
| onSelect | Callback for user manually selecting/deselecting a row | Function(record, selected, selectedRows, nativeEvent) |  |
| onSelectAll | Callback for user manually selecting/deselecting all rows | Function(selected, selectedRows, changeRows) |  |
| onSelectInvert | Callback for user manually selecting invert selection | Function(selectedRows) |  |  |

> Please specify rowKey when using.

### selection

| Property | Description                       | Type                        |
| -------- | -------------------------- | --------------------------- |
| key      | Key required by React, recommended to set | string                      |
| text     | Text displayed for selection item           | string\|React.ReactNode     |
| onSelect | Selection item click callback             | Function(changeableRowKeys) |

### tablecomponents

| Property | Type  | Description |
| -------- | ----- | ---- |
| table |  ReactNode          | Override table component |
| header | { wrapper: ReactNode; row: ReactNode; cell: ReactNode; }          | Override table header component  |
| body | { wrapper: ReactNode; row: ReactNode; cell: ReactNode; }         | Override table body component |
