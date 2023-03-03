---
category: Pro Components
cols: 1
type: Data Display
title: Table
subtitle: 表格
---

展示行列数据，导出和分页配置参见底部。

## 何时使用

- 当有大量结构化的数据需要展现时；
- 当需要对数据进行排序、搜索、分页、自定义操作等复杂行为时。

## API

### Table

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| columns | 列组， 优先级和性能高于children | ColumnProps[] |  |
| groups | 分组 | [TableGroup](#TableGroup)[] |  |
| header | 表头 | ReactNode \| (records) => ReactNode |  |
| footer | 表脚 | ReactNode \| (records) => ReactNode |  |
| border | 是否显示边框 | boolean | [globalConfig.tableBorder](/components/configure#API) |
| columnEditorBorder | 是否显示编辑器边框 | boolean | [globalConfig.tableColumnEditorBorder](/components/configure#API) |
| autoFocus | 是否新增行自动获焦至第一个可编辑字段 | boolean | false |
| selectionMode | 选择记录的模式, 可选值: `rowbox` `treebox` `click` `dblclick` `mousedown` `none` | string | 'rowbox' |
| selectionBoxRenderer | 勾选框渲染器  | ({ record, element }) => ReactNode | |
| alwaysShowRowBox | 是否一直显示rowbox,开启后在其他模式下也会显示rowbox | boolean | false |
| onRow | 设置行属性 | ({ dataSet, record, index, expandedRow }) => object |  |
| buttons | 功能按钮，内置按钮可添加 `afterClick` 钩子，用于执行除了默认行为外的动作，可选值：`add` `delete` `remove` `save` `query` `reset` `expandAll` `collapseAll` `export` 或 数组 或 自定义按钮，数组为可选值字符串+按钮配置属性对象 | string \| \[string, object\] \| ReactNode \| object |  |
| buttonsLimit | 头部显示功能按钮的数量，超出限制放入更多下拉 | number |  |
| queryFields | 自定义查询字段组件或默认组件属性，默认会根据 queryDataSet 中定义的 field 类型自动匹配组件 | ReactNode[] \| object |  |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number |  |
| queryBar | 查询条, 可选值为钩子或者内置类型：`filterBar` `professionalBar` `advancedBar` `normal` `bar` `comboBar` `none` | string \| ({ dataSet, queryDataSet, buttons, pagination, queryFields, queryFieldsLimit }) => ReactNode | [globalConfig.queryBar](/components/configure#API) |
| queryBarProps | 查询条自定义参数。 当查询条是全局配置的自定义查询条，需要传递自定义参数时可以用此属性 | object |  |
| summaryBar | 汇总条, 可选值为钩子或者字段 name | string \| ({ dataSet, summaryFieldsLimit, summaryBarFieldWidth }) => ReactNode |  |
| summaryBarFieldWidth | 汇总条单字段宽度 | number | 170 |
| summaryFieldsLimit | 头部显示的汇总字段的数量，超出限制的查询字段收起 | number |  |
| useMouseBatchChoose | 是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 | boolean | [globalConfig.tableUseMouseBatchChoose](/components/configure#API) |
| rowHeight | 行高 | number \| auto \| ({ size }) => number \| auto | [globalConfig.tableRowHeight](/components/configure#API) |
| headerRowHeight | 头行高 | number \| auto \| ({ size }) => number \| auto | rowHeight |
| footerRowHeight | 脚行高 | number \| auto \| ({ size }) => number \| auto | rowHeight |
| onScrollLeft | 横向滚动事件 | (scrollLeft, getScrollInfo) => void |  |
| onScrollTop | 纵向滚动事件 | (scrollTop, getScrollInfo) => void |  |
| defaultRowExpanded | 默认行是否展开，当 dataSet 没有设置 expandField 时才有效 | boolean | false |
| expandRowByClick | 通过点击行来展开子行 | boolean | false |
| expandedRowRenderer | 展开行渲染器 | ({ dataSet, record }) => ReactNode |  |
| expandIcon | 自定义展开图标 | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode |  |
| expandIconColumnIndex | 展开图标所在列索引 | number |  |
| expandIconAsCell | 展开图标是否单独单元格展示 | boolean | （非Tree mode）true \| false |
| bodyExpandable | 表格体是否可展开 | boolean | |
| defaultBodyExpanded | 默认表格体是否展开 | boolean | true |
| bodyExpanded | 表格体是否展开 | boolean |  |
| indentSize | 展示树形数据时，每层缩进的宽度 | number | 15 |
| filter | 数据过滤， 返回值 true - 显示 false - 不显示 | (record) => boolean |  |
| treeFilter | 树形数据过滤, 优先级高于 filter, 返回值 true - 显示 false - 不显示 | (record) => boolean |  |
| mode | 表格展示的模式, tree 需要配合 dataSet 的`idField`和`parentField`来展示，可选值: `list` `tree` | string | 'list' |
| editMode | 表格编辑的模式，可选值: `cell` `inline` | string | 'cell' |
| filterBarFieldName | `queryBar`为`bar`时，直接输入的过滤条件的字段名 | string | 'params' |
| filterBarPlaceholder | `queryBar`为`bar`时输入框的占位符 | string |  |
| pagination | 分页器，参考[配置项](#pagination)或 [pagination](/components/pagination/)，设为 false 时不展示分页 | object \| false |  |
| highLightRow | 当前行高亮, 可选值: boolean \| focus \| click,  true - 始终显示高亮行, 'click' - 点击行后始终显示高亮行， 'focus' - 表格获焦时显示高亮行  | boolean \| string | [globalConfig.tableHighLightRow](/components/configure#API) |
| selectedHighLightRow | 勾选行高亮 | boolean | [globalConfig.tableSelectedHighLightRow](/components/configure#API) |
| parityRow | 奇偶行 | boolean | [globalConfig.tableParityRow](/components/configure#API) |
| columnResizable | 可调整列宽 | boolean | [globalConfig.tableColumnResizable](/components/configure#API) |
| columnHideable | 可调整列显示, customizable 为 true 才起作用 | boolean | [globalConfig.tableColumnHideable](/components/configure#API) |
| columnTitleEditable | 可编辑列标题, customizable 为 true 才起作用 | boolean | [globalConfig.tableColumnTitleEditable](/components/configure#API) |
| columnDraggable | 列拖拽, customizable 为 true 才起作用 | boolean | [globalConfig.tableColumnDraggable](/components/configure#API) |
| rowDraggable | 行拖拽，实现行的拖拽， 树形数据无法使用 | boolean | [globalConfig.tableRowDraggable](/components/configure#API) |
| heightChangeable | 高度设置, customizable 为 true 才起作用 | boolean | [globalConfig.tableHeightChangeable](/components/configure#API) |
| dragColumnAlign | 增加一个可拖拽列，实现行拖拽 | 'left'\|'right' |  |
| pristine | 显示原始值 | boolean | false |
| onExpand | 点击展开图标时触发 | (expanded, record) => void |  |
| onBodyExpand | 点击表格体展开图标时触发 | (expanded) => void |  |
| virtual | 是否开启虚拟滚动,当设置表格高度 `style={{ height: xxx }}` 时有效 | boolean | [globalConfig.tableVirtual(/components/configure#API) |
| virtualCell | 虚拟单元格 | boolean | [globalConfig.tableVirtualCell](/components/configure#API) |
| virtualSpin | 是否开启虚拟滚动Spin | boolean | false |
| autoWidth | 是否开启宽度自适应， 功能同 width: 'min-content' | boolean | false |
| autoHeight | 是否开启高度自适应 | boolean \| { type: 'minHeight' \| 'maxHeight', diff: number(80) } | false |
| autoFootHeight | 是否开启是否单独处理 column footer | boolean | false |
| editorNextKeyEnterDown            | 是否开启回车跳转下一行编辑                                                                                                                                                                                                             | boolean                                     | true    |
| onDragEnd | 完成拖拽后的触发事件 | (dataSet:DataSet,columns:ColumnProps[],resultDrag: DropResult, provided: ResponderProvided) => void |  |
| onDragEndBefore |完成拖拽后,切换位置之前的触发事件，可以通过 resultDrag.destination.droppableId === 'table' or ‘tableHeader’ 来判断是行拖拽还是列拖拽,返回false阻止拖拽换位置 | (dataSet:DataSet,columns:ColumnProps[],resultDrag: DropResult, provided: ResponderProvided) => false \| void \|resultDrag   | - |
| dragDropContextProps | react-beautiful-dnd DragDropContextProps | [DragDropContextProps](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/drag-drop-context.md) |  |
| columnsDragRender | 控制列的拖拽渲染，从这里可以实现对默认的拖拽的一些自定义的设置，需要参阅react-beautiful-dnd | 请查看DragRender[配置项](#DragRender)  |  |
| rowDragRender | 控制列的拖拽渲染，从这里可以实现对默认的拖拽的一些自定义的设置，需要参阅react-beautiful-dnd | 请查看DragRender[配置项](#DragRender) |  |
| keyboard | 开启关闭新增的快捷按钮事件 | boolean | [globalConfig.tableKeyboard](/components/configure#API) |
| treeLoadData | 树形异步加载数据 | ({ record, dataSet }) => Promise | |
| treeAsync | 树形异步加载，需要后端接口配合，对应的数据源会自动调用查询接口，接口参数中会带有 parentField 对应的参数名和 idField 对应的参数值，接口返回的数据会附加到已有的数据之中 | boolean |  |
| rowNumber | 显示行号 | boolean \| ({ record, dataSet, text, pathNumbers }) => ReactNode | |
| clientExportQuantity | 导出一次轮询数量 | number | 100 |
| showSelectionTips | 是否显示选中记录提示  | boolean | [globalConfig.tableShowSelectionTips](/components/configure#API) |
| showCachedTips | 是否显示缓存记录提示， 优先级高于 showSelectionTips  | boolean | [globalConfig.tableShowCachedTipsTips](/components/configure#API) |
| showCachedSelection | 是否显示缓存选中记录  | boolean | |
| onShowCachedSelectionChange | 缓存选中记录显示回调  | (boolean) => void | |
| showSelectionCachedButton | 是否显示缓存选中记录按钮  | boolean | true |
| showAllPageSelectionButton | 是否显示切换跨页全选按钮  | boolean | |
| customizable | 是否显示个性化设置入口按钮  | boolean | [globalConfig.customizable](/components/configure#API) |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/components/configure)中的表格个性化钩子： `customizedSave` `customizedLoad` | string | |
| clientExportQuantity | 客户端查询导出，查询数目设置  | number | |
| treeQueryExpanded | 树形结构下queryBar触发查询,自动展开树形结构  | boolean | |
| aggregation | 是否是聚合视图， 若有个性化则以个性化配置为主  | boolean | |
| onAggregationChange | 聚合视图变更钩子， 在个性化配置变更时触发  | (aggregation) => void | |
| cellHighlightRenderer | 单元格高亮渲染器  | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode | |
| showHeader |	是否显示表头 |	boolean |	true |
| showRemovedRow |	是否显示临时移除的行，默认置灰显示 |	boolean |	 |
| onColumnResize | 列宽改变的回调事件  | ({ column, width, index }) => void | |
| searchCode | 动态筛选条后端接口唯一编码  | string | |
| rowBoxPlacement | 行选择框位置  | `start` \| `end` \| number | start |
| renderEmpty | 自定义渲染数据为空的状态  | () => ReactNode |  |
| autoValidationLocate | 校验失败自动定位。如果多个组件的定位有冲突， 可以关闭自动定位， 通过手动调用 focus 方法来定位  | boolean | true |
| boxSizing | 样式高度影响的范围，默认 content， 如果指定为 wrapper, 样式的高度会包括表格前后内容的高度， 且该高度发生变化会自动调整表格高度  | 'content' \| 'wrapper' | 'content' |
| fullColumnWidth | 所有列都设置列宽且没有超出表格宽度时最后一列宽度是否自动填满表格  | boolean | true |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

### Table.Column

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 子列组， JSX模式下请对应 ReactElement<ColumnProps>[] | ColumnProps[] \| ReactElement<ColumnProps>[] |  |
| name | 列对照的字段名 | string |  |
| width | 列宽，不推荐给所有列设置宽度，而是给某一列不设置宽度达到自动宽度的效果 | number |  |
| defaultWidth | 默认列宽, 只在出横向滚动条时起作用 | number | [globalConfig.tableColumnDefaultWidth](/components/configure#API) \| [globalConfig.tableAggregationColumnDefaultWidth](/components/configure#API) |
| minWidth | 最小列宽 | number | [globalConfig.tableColumnDefaultMinWidth](/components/configure#API) \| [globalConfig.tableAggregationColumnDefaultMinWidth](/components/configure#API) |
| title | 列头文字，优先级高于 header， 便于列头文字通过 header 钩子渲染的情况下可编辑 | string |  |
| header | 列头 | ReactNode \| ({ dataSet, name, title, aggregation, group: [Group](/components-pro/data-set#Group-Values), aggregationTree: ReactElement[] }) => ReactNode |  |
| footer | 列脚 | ReactNode \| ({ dataSet, name, aggregationTree: ReactElement[] }) => ReactNode |  |
| renderer | 单元格渲染回调 | ({ value, text, name, record, dataSet, rowGroup: [Group](/components-pro/data-set#Group-Values), headerGroup: [Group](/components-pro/data-set#Group-Values), aggregationTree: ReactElement[] }) => ReactNode |  |
| editor | 编辑器, 设为`true`时会根据 field 的 type 自动匹配编辑器。不可编辑请使用 `false` 值，而不是在控件上加 disabled。 | FormField \| ((record, name) => FormField \| boolean) \| boolean |  |
| lock | 是否锁定， 可选值 `false` `true` `left` `right` | boolean\| string | false |
| align | 文字对齐方式，可选值： `left` `center` `right` | string | [globalConfig.tableColumnAlign](/components/configure#API) |
| resizable | 是否可调整宽度 | boolean | [globalConfig.tableColumnResizable](/components/configure#API) |
| sortable | 是否可排序，前端排序请定义 CompareFn | boolean \|CompareFn  | false |
| filter | 是否可前端过滤 | boolean \| ((props: { record: Record, filterText?: string }) => boolean)  | false |
| filterPopover | 前端过滤自定义筛选，此函数只负责渲染图层，需要自行编写各种交互 | ReactNode \| ((props: FilterPopoverProps) => ReactNode)  |  |
| hideable | 是否可隐藏 | boolean | [globalConfig.tableColumnHideable](/components/configure#API) |
| titleEditable | 是否可编辑标题 | boolean | [globalConfig.tableColumnTitleEditable](/components/configure#API) |
| style | 列单元格内链样式 | object |  |
| className | 列单元格样式名 | string |  |
| headerStyle | 列头内链样式 | string |  |
| headerClassName | 列头样式名 | string |  |
| footerStyle | 列脚内链样式 | string |  |
| footerClassName | 列脚样式名 | string |  |
| help | 额外信息，常用于提示 | `string` |  |
| showHelp | 展示提示信息的方式。可选值 `tooltip` `newLine` `none` | string | 'tooltip' |
| onCell | 设置单元格属性 | ({ dataSet, record, column }) => object | [globalConfig.tableColumnOnCell](/components/configure#API) |
| command | 行操作按钮集，该值为数组 或 返回数组的钩子，内置按钮可添加 `afterClick` 钩子，用于执行除了默认行为外的动作，数组可选值：`edit` `delete` 或 \[`edit`\| `delete` , 按钮配置属性对象\] 或 自定义按钮 | (string \| \[string, object\] \| ReactNode)[] \| ({ dataSet, record, aggregation }) => (string \| \[string, object\] \| ReactNode \| object )[] |  |
| hidden | 隐藏 | boolean |  |
| tooltip | 用 Tooltip 显示单元格内容。可选值 `none` `always` `overflow` | string | [globalConfig.tooltip](/components/configure#API) |
| tooltipProps | 用于配置 Tooltip 相关参数 | [TooltipProps](/components-pro/tooltip#API) | |
| aggregation | 是否是聚合列， 平铺视图下不显示  | boolean | |
| aggregationLimit | 聚合显示条目数量上限，超过限制的条目可通过展开按钮来显示  | number | 4 |
| aggregationLimitDefaultExpanded | 聚合超过限制的条目默认是否展开显示  | boolean \| (record) => boolean | |
| aggregationDefaultExpandedKeys | 默认展开指定的聚合列下的树节点  | (string \| number)[] |  |
| aggregationDefaultExpandAll | 默认展开所有聚合列下的树节点  | boolean |  |
| aggregationTreeIndex | 聚合单元格中的列索引  | number | 0 |
| hiddenInAggregation | 在聚合列下是否隐藏  | boolean \| (record) => boolean |  |
| highlightRenderer | 单元格高亮渲染器  | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode | |

### TableGroup

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 分组类型， 可选值 `column` `row` `header` `none` | string | 'none' |
| name | 分组对照的字段名 | string |  |
| parentField | 树形分组对照的父字段名 | string |  |
| hidden | 隐藏组, 只适用于类型为 header 的分组 | boolean |  |
| columnProps | 列属性 | ColumnProps |  |

### Table.FilterBar

| 参数        | 说明                   | 类型   | 默认值   |
| ----------- | ---------------------- | ------ | -------- |
| paramName   | 输入的过滤条件的字段名 | string | 'params' |
| placeholder | 输入框的占位符         | string | '过滤表' |
| editable    | 查询条是否可编辑         | boolean | true |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.AdvancedQueryBar

| 参数             | 说明                                                     | 类型   | 默认值 |
| ---------------- | -------------------------------------------------------- | ------ | ------ |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 1      |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.ToolBar

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 1 |
| pagination | 分页器，参考[pagination](/components-pro/pagination/) | PaginationComponent | null |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.DynamicFilterBar

| 参数        | 说明                   | 类型   | 默认值   |
| ----------- | ---------------------- | ------ | -------- |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 3 |
| dynamicFilterBar | 筛选条属性配置 | DynamicFilterBarConfig | |
| autoQueryAfterReset | 重置后自动查询 | boolean | true |
| fuzzyQuery | 是否开启模糊查询 | boolean | true |
| fuzzyQueryOnly | 是否仅使用模糊查询 | boolean | false |
| fuzzyQueryPlaceholder | 模糊查询 placeholder  | string |  |
| autoQuery | 条件变更是否自动查询  | boolean | true |
| refreshBtn | 刷新按钮  | boolean | true |
| onQuery | 查询回调 | () => void |  |
| onReset | 重置回调 | () => void |  |
| onRefresh | 刷新按钮回调，返回false | Promise.resolve(false)或Promise.reject()不会刷新查询， 其他自动查询 | () => Promise&lt;boolean&gt; |  |

#### DynamicFilterBarConfig

| 参数        | 说明                   | 类型   | 默认值   |
| ----------- | ---------------------- | ------ | -------- |
| searchText | 模糊查询参数名 | string | params |
| suffixes | 过滤条后缀渲染区 | | filter \| ReactElement |  |
| prefixes | 过滤条前缀渲染区 | React.ReactElement<any>[] |  |
| tableFilterAdapter | 过滤条请求适配器 | TransportProps |  |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.ProfessionalBar

| 参数             | 说明                                                     | 类型   | 默认值 |
| ---------------- | -------------------------------------------------------- | ------ | ------ |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 3      |
| autoQueryAfterReset | 重置后自动查询 | boolean | true |
| defaultExpanded | 默认展开 | boolean | false |
| formProps | 查询条表单属性 | FormProps | { labelTooltip: 'overflow', labelWidth: 80  } |
| onQuery | 查询回调 | () => void |  |
| onReset | 重置回调 | () => void |  |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.ComboBar

| 参数             | 说明                                                     | 类型   | 默认值 |
| ---------------- | -------------------------------------------------------- | ------ | ------ |
| title | 头部标题 | string | |
| dropDownArea | 自定义下拉菜单区域 | () => ReactNode | |
| buttonArea | 自定义按钮区域 | () => ReactNode | |
| searchable | 筛选条头部是否配置查询  | boolean | true |
| fold | 表格是否开启折叠收缩 | boolean | false |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### pagination

分页的配置项。

| 参数     | 说明               | 类型                        | 默认值   |
| -------- | ------------------ | --------------------------- | -------- |
| position | 指定分页显示的位置 | 'top' \| 'bottom' \| 'both' | 'bottom' |

### DragRender

可以满足自定义更多的渲染需求，注意会覆盖默认值，建议阅读 中文地址[react-beautiful-dnd](https://github.com/chinanf-boy/react-beautiful-dnd-zh)或者英文地址[react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) 以及当前table[代码示例](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/table/TableTBody.tsx)

可以注意一下设置
新增拖拽例的key值 DRAG_KEY = '__drag-column__';
防止拖拽在dom结构外报错的table 类名 c7n-pro-table-drag-container


| 参数     | 说明               | 类型                        | 默认值   |
| -------- | ------------------ | --------------------------- | -------- |
| droppableProps | droppableProps 参考文档 | object |  |
| draggableProps | DraggableProps 参考文档 | object |  |
| renderClone | 拖拽起来的时候会在body下面新增加一个table 会在这个table注入元素 | `(DragTableRowProps \| DragTableHeaderCellProps) => ReactElement<any>` | |
| renderIcon | 可以自定义图标图标 | 当为row时候`（{record}）=> ReactElement<any>`   为column 时候 `（{column，dataSet, snapshot}）=> ReactElement<any>` |  |

### spin

spin的配置项。

| 参数      | 说明       | 类型         | 默认值 |
| --------- | ---------- | ------------ | ------ |
| indicator | React node of the spinning indicator | ReactElement | - |
| spinning | whether Spin is spinning | boolean | - |

More cases and properties please refer to [Spin](/components-pro/spin/)。

### instance methods

| 名称 | 说明 | 参数 | 返回值类型 |
| --- | --- | --- | --- |
| setScrollLeft(scrollLeft) | 设置横向滚动值。 | `scrollLeft` - 横向滚动值 |  |
| setScrollTop(scrollTop) | 设置纵向滚动值。 | `scrollTop` - 纵向滚动值 |  |
| setColumnWidth(width, indexOrKeyOrName, saveToCustomization) | 设置列宽。 | `width` - 宽度 `indexOrKeyOrName` - 索引或key或name  `saveToCustomization` - 是否保存到个性化，默认true |  |

### 分页配置

分页功能配置可以按照如下配置进行全局配置


```js
import { configure } from 'choerodon-ui';

configure({
  pagination: {pageSizeOptions: ['10', '20', '50', '100', '1000']},
});

```

全局配置操作，建议在初始化的时候进行。更多的配置参考[pagination](/components-pro/pagination/);

### 导出配置

可以根据需求进行全局配置，和局部配置

```js
import { configure } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

// 全局配置

const basicUrl = ``;

configure(
  {
    transport: {
      exports: ({ dataSet, name: fieldName }) => {
        const _token = dataSet.current.get('_token');
        return {
          url: `${basicUrl}/v1/export`,
          method: 'POST',
          params: { _token, fieldName },
          transformResponse: res => {
            try {
             const aLink = document.createElement("a");
             const blob = new Blob([res.data], {type: "application/vnd.ms-excel"})
             aLink.href = URL.createObjectURL(blob)
             aLink.download = fieldName
             aLink.click()
             document.body.appendChild(aLink)
            } catch (e) {
              // do nothing, use default error deal
            }
          },
        };
      },
    },
  })

  // 局部使用
  // eslint-disable-next-line no-unused-vars
  const tableDs = new DataSet({
    primaryKey: 'userid',
    name: 'user',
    autoQuery: true,
    pageSize: 5,
    cacheSelection: true,
    transport: {
    exports: ({dataSet }) => {
        const fileId = dataSet.name
        return ({
            url: `/_api/table/${fileId}`,
            method: 'get',
        })
    },
   },
  })

```
### 新增快捷键

> keyboard 控制是否开启

- Alt + n，焦点在 table 单元格内（非 querybar 区）时，新增行（代码可配置是首行还是末行新建）
- Ctrl + s，焦点在table单元格，则保存当前 table
- Ctrl + d（或 Command + d）：
- 焦点在 table 单元格，则复制上一行的单元格内容
- 焦点在 table 某行， 则复制上一行的所有单元格内容
- Delete，当前焦点元素内时，删除 1 个字符
- Alt + delete，焦点在 table 单元格内，删除当前行，弹出二次提示框
- Shift + 方向键，焦点在 table 某行，当前 table 可多选的情况，可选择多行

局部的使用 demo 方法参见[Table](/zh/procmp/data-display/table#components-pro-table-demo-basic);
