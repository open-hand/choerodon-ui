---
category: Pro Components
cols: 1
type: Data Display
title: Table
subtitle: 表格
---

展示行列数据。

## 何时使用

- 当有大量结构化的数据需要展现时；
- 当需要对数据进行排序、搜索、分页、自定义操作等复杂行为时。

## API

### Table

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| header | 表头 | ReactNode \| (records) => ReactNode    |     |
| footer | 表脚 | ReactNode \| (records) => ReactNode  |  |
| border | 是否显示边框 | boolean | true  |
| selectionMode | 选择记录的模式, 可选值: `rowbox` `click` `dblclick` | string | rowbox  |
| onRow | 设置行属性 | ({ dataSet, record, index, expandedRow }) => object |   |
| buttons | 功能按钮，可选值：`add` `delete` `remove` `save` `query` `reset` `expandAll` `collapseAll` `export` 或 数组 或 自定义按钮，数组为可选值字符串+按钮配置属性对象 | string \| \[string, object\] \|ReactNode |   |
| queryFields | 自定义查询字段组件或默认组件属性，默认会根据queryDataSet中定义的field类型自动匹配组件 | ReactNode[] \| object |  |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 1 |
| queryBar | 查询条, 可选值：`normal` `bar` `none` | string | normal |
| rowHeight | 行高 | number \| auto | 30 |
| defaultRowExpanded | 默认行是否展开，当dataSet没有设置expandField时才有效 | boolean | false |
| expandRowByClick | 通过点击行来展开子行 | boolean | false |
| expandedRowRenderer | 展开行渲染器 | ({ dataSet, record }) => ReactNode |  |
| expandIconColumnIndex | 展开图标所在列索引 | number |  |
| indentSize | 展示树形数据时，每层缩进的宽度 | number | 15 |
| filter | 数据过滤， 返回值 true - 显示 false - 不显示 | (record) => boolean |  |
| mode | 表格展示的模式, tree需要配合dataSet的`idField`和`parentField`来展示，可选值: `list` `tree` | string | list |
| editMode | 表格编辑的模式，可选值: `cell` `inline` | string | cell |
| filterBarFieldName | `queryBar`为`bar`时，直接输入的过滤条件的字段名 | string | params |
| filterBarPlaceholder | `queryBar`为`bar`时输入框的占位符 | string |  |
| pagination | 分页器，参考[配置项](#pagination)或 [pagination](/components/pagination/)，设为 false 时不展示分页 | object \| false |  |
| highLightRow | 当前行高亮 | boolean | true |
| columnResizable | 可调整列宽 | boolean | true |
| rowClassName | 表格行的类名 | Function(record, index): string | () => '' |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

### Table.Column

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| name | 列对照的字段名 | string   |     |
| width | 列宽，不推荐给所有列设置宽度，而是给某一列不设置宽度达到自动宽度的效果 | number    |     |
| minWidth | 最小列宽 | number    |  100   |
| header | 列头 | ReactNode \| (dataSet, name) => ReactNode    |     |
| footer | 列脚 | ReactNode \| (dataSet, name) => ReactNode  |  |
| renderer | 单元格渲染回调 | ({ value, text, name, record, dataSet }) => ReactNode  |  |
| editor | 编辑器, 设为`true`时会根据field的type自动匹配编辑器 | FormField \| (record, name) => FormField \| `true`  |  |
| lock | 是否锁定， 可选值 `false` `true` `left` `right` | boolean\| string  | false |
| align | 文字对齐方式，可选值： `left` `center` `right` | string  |  |
| resizable | 是否可调整宽度 | boolean  | true |
| sortable | 是否可排序 | boolean  | false |
| style | 列单元格内链样式 | object  |  |
| className | 列单元格样式名 | string  |  |
| headerStyle | 列头内链样式 | string  |  |
| headerClassName | 列头样式名 | string  |  |
| footerStyle | 列脚内链样式 | string  |  |
| footerClassName | 列脚样式名 | string  |  |
| help | 额外信息，常用于提示 | `string` | `undefined` |
| showHelp | 展示提示信息的方式 | `'tooltip' \| 'newLine' \| 'none'` | `'tooltip'` |
| onCell | 设置单元格属性 | ({ dataSet, record, column }) => object |  |
| command | 行操作按钮，可选值：`edit` `delete` 或 数组 或 自定义按钮，数组为可选值字符串+按钮配置属性对象 | string \| \[string, object\] \|ReactNode |   |

### pagination

分页的配置项。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| position | 指定分页显示的位置 | 'top' \| 'bottom' \| 'both' | 'bottom' |
