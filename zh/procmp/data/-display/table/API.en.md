---
title: API
---

### Table

| 参数                  | 说明                                                                                                                                                                                                                           | 类型                                                                                                   | 默认值   | 版本   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------- | ----- |
| columns | 列组， 优先级和性能高于children | ColumnProps[] |  ||
| groups | 分组 | [TableGroup](#tablegroup)[] |  | 1.5.1 |
| header                | 表头                                                                                                                                                                                                                           | ReactNode \| (records) => ReactNode                                                                    |          |    |
| footer                | 表脚                                                                                                                                                                                                                           | ReactNode \| (records) => ReactNode                                                                    |          |    |
| border                | 是否显示边框                                                                                                                                                                                                                   | boolean                                                                                                | [globalConfig.tableBorder](/en/procmp/configure/configure)      |    |
| columnEditorBorder | 是否显示编辑器边框 | boolean | [globalConfig.tableBorder](/zh/procmp/configure/configure) | 1.4.0 |
| [selectionMode](/en/tutorials/table-select-record)         | 选择记录的模式, 可选值: rowbox \| treebox \| click \| dblclick \| mousedown \| none                                                                                                                                                         | string                                                                                                 | rowbox |    |
| selectionBoxRenderer | 勾选框渲染器  | ({ record, element }) => ReactNode | | 1.5.4 |
| [alwaysShowRowBox](/en/tutorials/table-select-record)      | 是否一直显示 rowbox, 开启后在其他模式下也会显示 rowbox。selectionMode 为 rowbox 和 dblclick 时，勾选框常显 | boolean | false    |    |
| onRow                 | 设置行属性                                                                                                                                                                                                                     | ({ dataSet, record, index, expandedRow }) => object                                                    |          |    |
| buttons               | 功能按钮，内置按钮可添加 afterClick 钩子，用于执行除了默认行为外的动作，可选值：add \| delete \| remove \| save \| query \| reset \| expandAll \| collapseAll \| export 或 数组 或 自定义按钮，数组为可选值字符串+按钮配置属性对象 | string \| \[string, object\] \| ReactNode \| object                                                    |          |    |
| buttonsLimit | 头部显示功能按钮的数量，超出限制放入更多下拉 | number |  | 1.4.5 |
| queryFields           | 自定义查询字段组件或默认组件属性，默认会根据 queryDataSet 中定义的 field 类型自动匹配组件                                                                                                                                      | ReactNode[] \| object                                                                                  |          |    |
| queryFieldsLimit      | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口                                                                                                                                                                       | number                                                                                                 |          |    |
| queryBar              | 查询条, 可选值为钩子或者内置类型：filterBar \| professionalBar \| advancedBar \| normal \| bar \| comboBar | none                                                                                                                                                          | string \| ({ dataSet, queryDataSet, buttons, pagination, queryFields, queryFieldsLimit }) => ReactNode | [globalConfig.queryBar](/en/procmp/configure/configure) |   |
| queryBarProps | 查询条参数，不同查询条参数配置应对应。当查询条是全局配置的自定义查询条，需要传递自定义参数时可以用此属性。 | object | | 1.4.1  |
| summaryBar | 汇总条, 可选值为钩子或者字段 name | string \| ({ dataSet, summaryFieldsLimit }) => ReactNode |  |    |
| summaryBarFieldWidth | 汇总条单字段宽度 | number | 170 | |
| summaryFieldsLimit | 头部显示的汇总字段的数量，超出限制的查询字段收起 | number |  |   |
| useMouseBatchChoose   | 是否使用鼠标批量选择,开启后在 rowbox 的情况下可以进行鼠标拖动批量选择,在起始的 rowbox 处按下,在结束位置松开                                                                                                                    | boolean                                                                                                | [globalConfig.tableUseMouseBatchChoose](/zh/procmp/configure/configure)    |    |
| rowHeight             | 行高                                                                                                                                                                                                                           | number \| auto \| ({ size }) => number \| auto                                                                                         | [globalConfig.tableRowHeight](/zh/procmp/configure/configure)       |  1.5.2(支持钩子)  |
| headerRowHeight | 头行高 | number \| auto \| ({ size }) => number \| auto | rowHeight | 1.5.1 |
| footerRowHeight | 脚行高 | number \| auto \| ({ size }) => number \| auto | rowHeight | 1.5.1 |
| defaultRowExpanded    | 默认行是否展开，当 dataSet 没有设置 expandField 时才有效                                                                                                                                                                       | boolean                                                                                                | false    |    |
| expandRowByClick      | 通过点击行来展开子行                                                                                                                                                                                                           | boolean                                                                                                | false    |    |
| expandedRowRenderer   | 展开行渲染器                                                                                                                                                                                                                   | ({ dataSet, record }) => ReactNode                                                                     |          |    |
| expandIcon            | 自定义展开图标                                                                                                                                                                                                                 | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode                 |          |    |
| expandIconColumnIndex | 展开图标所在列索引                                                                                                                                                                                                             | number                                                                                                 |          |    |
| expandIconAsCell | 展开图标是否单独单元格展示 | boolean | true \| false(tree mode) |    |
| indentSize            | 展示树形数据时，每层缩进的宽度                                                                                                                                                                                                 | number                                                                                                 | 15       |    |
| filter                | 数据过滤， 返回值 true - 显示 false - 不显示                                                                                                                                                                                   | (record) => boolean                                                                                    |          |    |
| treeFilter | 树形数据过滤, 优先级高于 filter, 返回值 true - 显示 false - 不显示 | (record) => boolean |  | 1.5.4 |
| mode                  | 表格展示的模式，tree 需要配合 dataSet 的 idField 和 parentField 来展示，可选值: list \| tree                                                                                                                                  | string                                                                                                 | list   |   |
| editMode              | 表格编辑的模式，可选值: cell \| inline                                                                                                                                                                                        | string                                                                                                 | cell   |   |
| filterBarFieldName    | queryBar为bar时，直接输入的过滤条件的字段名                                                                                                                                                                                | string                                                                                                 | params |    |
| filterBarPlaceholder  | queryBar为bar时输入框的占位符                                                                                                                                                                                              | string                                                                                                 |          |    |
| pagination            | 分页器，参考[配置项](#pagination)或 [pagination](/zh/procmp/navigation/pagination/)，设为 false 时不展示分页                                                                                                                             | object \| false                                                                                        |          |    |
| highLightRow | 当前行高亮, 可选值: boolean \| focus \| click, true - 始终显示高亮行, 'click' - 点击行后始终显示高亮行， 'focus' - 表格获焦时显示高亮行 | boolean \| string | [globalConfig.tableHighLightRow](/zh/procmp/configure/configure) |   |
| selectedHighLightRow  | 勾选行高亮                                                                                                                                                                                                                     | boolean                                                                                                | [globalConfig.tableSelectedHighLightRow](/zh/procmp/configure/configure)    |    |
| columnResizable       | 可调整列宽                                                                                                                                                                                                                     | boolean                                                                                                | [globalConfig.tableColumnResizable](/zh/procmp/configure/configure)    |   |
| columnHideable | 可调整列显示, customizable 为 true 才起作用 | boolean | [globalConfig.tableColumnHideable](/zh/procmp/configure/configure) | 1.2.0  |
| columnTitleEditable | 可编辑列标题, customizable 为 true 才起作用 | boolean | [globalConfig.tableColumnTitleEditable](/zh/procmp/configure/configure) | 1.2.0   |
| columnDraggable | 列拖拽, customizable 为 true 才起作用 | boolean | [globalConfig.tableColumnDraggable](/zh/procmp/configure/configure) | 1.2.0  |
| rowDraggable | 行拖拽，实现行的拖拽 | boolean | [globalConfig.tableRowDraggable](/zh/procmp/configure/configure) | 1.2.0   |
| dragColumnAlign | 增加一个可拖拽列，实现行拖拽 | left\|right |  |   |
| pristine              | 显示原始值                                                                                                                                                                                                                     | boolean                                                                                                | false    |    |
| onExpand              | 点击展开图标时触发                                                                                                                                                                                                             | (expanded, record) => void                                                                             |          |    |
| virtual               | 是否开启虚拟滚动，当设置表格高度时有效                                                                                                                                                               | boolean                                                                                                | [globalConfig.tableVirtual](/zh/procmp/configure/configure)    |    |
| virtualCell | 虚拟单元格 | boolean | [globalConfig.tableVirtualCell](/zh/procmp/configure/configure) | 1.3.0  |
| columnBuffer | 列的缓冲区。开启虚拟滚动后，在可见区域之前/之后要呈现的额外列数。且 columnBuffer 的值大于或等于 columnThreshold 的值| number | [globalConfig.tableVirtualBuffer](/zh/procmp/configure/configure) | 1.6.2 |
| columnThreshold | 列的阈值。开启虚拟滚动后，在呈现新列之前可见的列数。且 columnThreshold 的值小于或等于 columnBuffer 的值 | number | [globalConfig.tableVirtualBuffer](/zh/procmp/configure/configure) | 1.6.2 |
| virtualSpin           | 是否开启虚拟滚动 Spin                                                                                                                                                                                                          | boolean                                                                                                | false    |    |
| autoHeight            | 是否开启高度自适应                                                                                                                                                                                                             | boolean \| { type: 'minHeight' \| 'maxHeight', diff: number(80) }                                      | false    |    |
| autoWidth | 是否开启宽度自适应， 功能同 width: 'min-content' | boolean | false | 1.4.5 |
| autoFootHeight | 是否开启是否单独处理 column footer | boolean | false |   |
| autoFocus | 是否新增行自动获焦至第一个可编辑字段 | boolean | false |    |
| editorNextKeyEnterDown            | 是否开启回车跳转下一行编辑                                                                                                                                                                                                             | boolean                                     | true    |    |
| onDragEnd | 完成拖拽后的触发事件 | (dataSet, columns, resultDrag, provided) => void |  |    |
| columnsDragRender | 控制列的拖拽渲染 | 请查看DragRender[配置项](#dragrender)  |  |    |
| rowDragRender | 控制行的拖拽渲染| 请查看DragRender[配置项](#dragrender) |  |    |
| onDragEndBefore | 完成拖拽后,切换位置之前的触发事件，可以通过 resultDrag.destination.droppableId === 'table' or ‘tableHeader’ 来判断是行拖拽还是列拖拽,返回false阻止拖拽换位置。树形拖拽可通过 recordIndexFromTo 获取到正确的记录索引: \[sourceRecordIndex, destinationRecordIndex\] | (dataSet, columns, resultDrag, provided, recordIndexFromTo: \[number?, number?\]) => false \| void \|resultDrag   |  |    |
| dragDropContextProps | react-beautiful-dnd DragDropContextProps | [DragDropContextProps](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/drag-drop-context.md) | | 1.5.1 |
| keyboard | 开启关闭新增的快捷按钮事件 | boolean | [globalConfig.tableKeyboard](/zh/procmp/configure/configure) |   |
| treeLoadData | 树形异步加载数据 | ({ record, dataSet }) => Promise | | 1.1.0   |
| treeAsync | 树形异步加载，需要后端接口配合，对应的数据源会自动调用查询接口，接口参数中会带有 parentField 对应的参数名和 idField 对应的参数值，接口返回的数据会附加到已有的数据之中 | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps )|() => {} | 1.1.0  |
| parityRow | 奇偶行 | boolean | [globalConfig.tableParityRow](/zh/procmp/configure/configure)  | 1.1.0  |
| rowNumber | 显示行号 | boolean \| ({ record, dataSet, text, pathNumbers }) => ReactNode | | 1.1.0  |
| clientExportQuantity | 导出一次轮询数量 | number | 100 | 1.3.0   |
| showSelectionTips | 是否显示选中记录提示  | boolean | [globalConfig.tableShowSelectionTips](/zh/procmp/configure/configure) | 1.3.0  |
| showCachedTips | 是否显示缓存记录提示， 优先级高于 showSelectionTips | boolean | [globalConfig.tableShowCachedTipsTips](/zh/procmp/configure/configure) | 1.5.6 |
| showCachedSelection | 是否显示缓存选中记录  | boolean | | 1.4.4 |
| onShowCachedSelectionChange | 缓存选中记录显示回调  | (boolean) => void | |1.4.4 |
| showSelectionCachedButton | 是否显示缓存选中记录按钮 | boolean | true | 1.4.1   |
| showAllPageSelectionButton | 是否显示切换跨页全选按钮 | boolean | | 1.4.0  |
| customizable | 是否显示个性化设置入口按钮  | boolean | [globalConfig.customizable](/zh/procmp/configure/configure) | 1.3.0   |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/zh/procmp/configure/configure)中的表格个性化钩子： customizedSave \| customizedLoad | string | | 1.2.0   |
| onCustomizedLoad | 表格个性化接口请求回调函数 | (TableCustomized) => Promise<any> | | 1.6.3 |
| treeQueryExpanded | 树形结构下queryBar触发查询,自动展开树形结构  | boolean | | 1.3.1   |
| aggregation | 是否是聚合视图， 若有个性化则以个性化配置为主  | boolean | | 1.4.0   |
| onAggregationChange | 聚合视图变更钩子， 在个性化配置变更时触发  | (aggregation) => void | | 1.4.0   |
| cellHighlightRenderer | 单元格高亮渲染器  | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode | | 1.4.0  |
| showHeader |	是否显示表头 |	boolean |	true | 1.4.2 |
| showRemovedRow |	是否显示临时移除的行，默认置灰显示 |	boolean | true | 1.4.4 |
| onColumnResize | 列宽改变的回调事件  | ({ column, width, index }) => void | | 1.4.4 |
| searchCode | 动态筛选条后端接口唯一编码 | string | | 1.4.5 |
| rowBoxPlacement | 行选择框位置  | 可选值: start, end \| number | start | 1.4.5 |
| heightChangeable | 高度设置, customizable 为 true 才起作用 | boolean | [globalConfig.tableHeightChangeable](/en/procmp/configure/configure) | 1.5.1 |
| bodyExpandable | 表格体是否可展开 | boolean | | 1.5.1 |
| defaultBodyExpanded | 默认表格体是否展开 | boolean | true | 1.5.1 |
| bodyExpanded | 表格体是否展开 | boolean |  | 1.5.1 |
| onScrollTop | 纵向滚动事件(getScrollInfo - 1.5.6) | (scrollTop, getScrollInfo) => void | | 1.5.1 |
| onScrollLeft | 横向滚动事件(getScrollInfo - 1.5.6) | (scrollLeft, getScrollInfo) => void | | 1.5.1 |
| onBodyExpand | 点击表格体展开图标时触发 | (expanded) => void | | 1.5.1 |
| renderEmpty | 自定义渲染数据为空的状态  | () => ReactNode |  | 1.5.2 |
| autoValidationLocate | 校验失败自动定位。如果多个组件的定位有冲突， 可以关闭自动定位， 通过手动调用 focus 方法来定位 | boolean | true | 1.5.3 |
| boxSizing | 样式高度影响的范围，默认 content， 如果指定为 wrapper, 样式的高度会包括表格前后内容的高度， 且该高度发生变化会自动调整表格高度 | 'content' \| 'wrapper' | 'content' | 1.5.6 |
| fullColumnWidth | 所有列都设置列宽且没有超出表格宽度时最后一列宽度是否自动填满表格  | boolean | true | 1.5.6 |
| clipboard | 配置 Table 是否可复制粘贴。参考[配置项](#clipboard)  | Clipboard | { copy: false, paste: false } | 1.6.4 |
| customDragDropContenxt | 是否开启自定义 DragDropContenxt, 一般用于自定义 react-beautiful-dnd 的 DragDropContenxt 实现多表拖拽 | boolean | false | 1.6.4 |
| selectionColumnProps | 行选择列属性扩展  | ColumnProps  |  | 1.6.4 |

更多属性请参考 [DataSetComponent](/zh/procmp/abstract/ViewComponent#datasetcomponent)。

### Table.Column

| 参数            | 说明                                                                                                                                                                                              | 类型                                                                                                                               | 默认值    | 版本 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------- | --- |
| children | 子列组， JSX模式下请对应 ReactElement<ColumnProps>[] | ColumnProps[] \| ReactElement<ColumnProps>[] | | 1.5.1 |
| name            | 列对照的字段名                                                                                                                                                                                    | string                                                                                                                             |           |  |
| width           | 列宽，不推荐给所有列设置宽度，而是给某一列不设置宽度达到自动宽度的效果                                                                                                                            | number                                                                                                                             |           |  |
| defaultWidth | 列的默认宽度  | number | [globalConfig.tableColumnDefaultWidth](/zh/procmp/configure/configure) \| [globalConfig.tableAggregationColumnDefaultWidth](/zh/procmp/configure/configure)  | 1.5.1 |
| minWidth        | 最小列宽                                                                                                                                                                                          | number                                                                                                                             | [globalConfig.tableColumnDefaultMinWidth](/zh/procmp/configure/configure) \| [globalConfig.tableAggregationColumnDefaultMinWidth](/zh/procmp/configure/configure)       |  |
| title | 列头文字，优先级高于 header， 便于列头文字通过 header 钩子渲染的情况下可编辑 | string |  |  |
| header | 列头 | ReactNode \| ({ dataSet, name, title, aggregation, group: [Group](/zh/procmp/dataset/dataset#group-values), aggregationTree: ReactElement[] }) => ReactNode |  |  |
| footer          | 列脚                                                                                                                                                                                              | ReactNode \| ({ dataSet, name, aggregationTree: ReactElement[] }) => ReactNode                                                                                           |           |  |
| renderer        | 单元格渲染回调                                                                                                                                                                                    | ({ value, text, name, record, dataSet, rowGroup: [Group](/zh/procmp/dataset/dataset#group-values), headerGroup: [Group](/zh/procmp/dataset/dataset#group-values), aggregationTree: ReactElement[]  }) => ReactNode                                                                              |           |  |
| tagRenderer        | 多值 Tag 渲染器 | ({ value, text, key, readOnly, invalid, disabled, onClose, className }: TagRendererProps) => ReactNode |  | 1.6.2 |
| editor          | 编辑器, 设为 true 时会根据 field 的 type 自动匹配编辑器。不可编辑请使用 false 值，而不是在控件上加 disabled。                                                                                   | FormField \| ((record, name) => FormField \| boolean) \| boolean                                                                   |           |  |
| lock            | 是否锁定， 可选值 false \| true \| 'left' \| 'right'                                                                                                                                                   | boolean\| string                                                                                                                   | false     | |
| align           | 文字对齐方式，可选值： left \| center \| right                                                                                                                                                    | string                                                                                                                             |      [globalConfig.tableColumnAlign](/zh/procmp/configure/configure)     |  |
| resizable       | 是否可调整宽度                                                                                                                                                                                    | boolean                                                                                                                            | [globalConfig.tableColumnResizable](/zh/procmp/configure/configure)      |  |
| sortable | 是否可排序，前端排序(1.6.0)请定义 [CompareFn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn): (v1, v2, order) => number | boolean \| CompareFn  | false | |
| filter | 是否可前端过滤 | boolean \| ((props: { record: Record, filterText?: string }) => boolean)  | false | 1.6.0 |
| filterPopover | 前端过滤自定义筛选，此函数只负责渲染图层，需要自行编写各种交互 | ReactNode \| ((props: FilterPopoverProps) => ReactNode)  |  | 1.6.0 |
| hideable | 是否可隐藏 | boolean | [globalConfig.tableColumnHideable](/zh/procmp/configure/configure)  |  |
| titleEditable | 是否可编辑标题 | boolean | [globalConfig.tableColumnTitleEditable](/zh/procmp/configure/configure) | 1.2.0 |
| style           | 列单元格内链样式                                                                                                                                                                                  | object                                                                                                                             |           |  |
| className       | 列单元格样式名                                                                                                                                                                                    | string                                                                                                                             |           |  |
| headerStyle     | 列头内链样式                                                                                                                                                                                      | object                                                                                                                             |           |  |
| headerClassName | 列头样式名                                                                                                                                                                                        | string                                                                                                                             |           |  |
| footerStyle     | 列脚内链样式                                                                                                                                                                                      | object                                                                                                                             |           |  |
| footerClassName | 列脚样式名                                                                                                                                                                                        | string                                                                                                                             |           |  |
| help            | 额外信息，常用于提示                                                                                                                                                                              | ReactNode                                                                                                                           |           |  |
| showHelp        | 展示提示信息的方式。可选值 tooltip \| newLine \| none                                                                                                                                             | string                                                                                                                             | tooltip |  |
| onCell          | 设置单元格属性                                                                                                                                                                                    | ({ dataSet, record, column }) => object                                                                                            |    [globalConfig.tableColumnOnCell](/zh/procmp/configure/configure)       |  |
| command | 行操作按钮集，该值为数组 或 返回数组的钩子，内置按钮可添加 afterClick 钩子，用于执行除了默认行为外的动作，数组可选值：edit delete 或 \[edit\| delete , 按钮配置属性对象\] 或 自定义按钮 | (string \| \[string, object\] \| ReactNode)[] \| ({ dataSet, record, aggregation }) => (string \| \[string, object\] \| ReactNode \| object )[] | | |
| hidden          | 隐藏                                                                                                                                                                                              | boolean                                                                                                                            |           |  |
| tooltip         | 用 Tooltip 显示单元格内容。可选值 none \| always \| overflow                                                                                                                                      | string                                                                                                                             |  [globalConfig.tooltip](/zh/procmp/configure/configure)    |  |
| tooltipProps | 用于配置 Tooltip 相关参数  | [TooltipProps](/en/procmp/data-display/tooltip/#API) | | 1.5.6 |
| aggregation | 是否是聚合列， 平铺视图下不显示  | boolean | |  |
| aggregationLimit | 聚合显示条目数量上限，超过限制的条目可通过展开按钮来显示  | number | 4 | |
| aggregationDefaultExpandedKeys | 默认展开指定的聚合列下的树节点  | (string \| number)[] |  |  |
| aggregationDefaultExpandAll | 默认展开所有聚合列下的树节点  | boolean |  |  |
| aggregationTreeIndex | 聚合单元格中的列索引  | number | 0 | 1.5.2 |
| hiddenInAggregation | 在聚合列下是否隐藏  | boolean \| (record) => boolean |  | |
| highlightRenderer | 单元格高亮渲染器 | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode | |  |
| aggregationLimitDefaultExpanded | 聚合超过限制的条目默认是否展开显示  | boolean \| (record) => boolean | 1.5.1 |

### TableGroup

> 1.5.1 版本新增方法。

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
| paramName   | 输入的过滤条件的字段名 | string | params |
| placeholder | 输入框的占位符         | string | 过滤表 |
| queryBarProps.editorProps(1.6.4) | 扩展弹出编辑器属性         | (props: { name: string, record?: Record, editor: ReactElement<FormFieldProps> }) => object; |  |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.AdvancedQueryBar

| 参数             | 说明                                                     | 类型   | 默认值 |
| ---------------- | -------------------------------------------------------- | ------ | ------ |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 1      |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.ToolBar

| 参数             | 说明                                                     | 类型                | 默认值 |
| ---------------- | -------------------------------------------------------- | ------------------- | ------ |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number              | 1      |
| pagination       | 分页器，参考[pagination](/zh/procmp/navigation/pagination/)    | PaginationComponent |   |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.DynamicFilterBar

| 参数        | 说明                   | 类型   | 默认值   | 版本 |
| ----------- | ---------------------- | ------ | -------- | --- |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 3 | |
| autoQueryAfterReset | 重置后自动查询 | boolean | true | 1.4.4 |
| dynamicFilterBar | 筛选条属性配置 | DynamicFilterBarConfig | | 1.4.5 |
| fuzzyQuery | 是否开启模糊查询 | boolean | true | 1.4.5 |
| fuzzyQueryOnly | 是否仅使用模糊查询 | boolean | false | 1.5.1 |
| fuzzyQueryPlaceholder | 模糊查询 placeholder  | string |  | 1.4.5 |
| autoQuery | 条件变更是否自动查询  | boolean | true |1.4.5 |
| refreshBtn | 刷新按钮  | boolean | true | 1.5.1 |
| onQuery | 查询回调 | () => void |  | 1.4.5 |
| onReset | 重置回调 | () => void |  | 1.4.5 |
| onRefresh | 刷新按钮回调，返回false \| Promise.resolve(false)或Promise.reject()不会刷新查询， 其他自动查询 | () => Promise&lt;boolean&gt; | | 1.5.7 |
| onFieldEnterDown | 字段回车回调 | () => void  | | 1.6.4 |

#### DynamicFilterBarConfig

| 参数        | 说明                   | 类型   | 默认值   |
| ----------- | ---------------------- | ------ | -------- |
| searchText | 模糊查询参数名 | string | params |
| suffixes | 过滤条后缀渲染区 | React.ReactElement<any>[]，数组元素支持 'filter' |  |
| prefixes | 过滤条前缀渲染区 | React.ReactElement<any>[]，数组元素支持 'filter' |  |
| tableFilterAdapter | 过滤条请求适配器 | TransportProps |  |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.ProfessionalBar

| 参数             | 说明                                                     | 类型   | 默认值 | 版本 |
| ---------------- | -------------------------------------------------------- | ------ | ------ | --- |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 3      | |
| autoQueryAfterReset | 重置后自动查询 | boolean | true | 1.4.4 |
| defaultExpanded | 默认展开 | boolean | false | 1.3.1 |
| formProps | 查询条表单属性 | FormProps | { labelTooltip: 'overflow', labelWidth: 80  } | 1.4.4 |
| onQuery | 查询回调 | () => void |  |
| onReset | 重置回调 | () => void |  |


### pagination

分页的配置项。

| 参数     | 说明               | 类型                        | 默认值   |
| -------- | ------------------ | --------------------------- | -------- |
| position | 指定分页显示的位置 | top \| bottom \| both | bottom |

### dragRender

> 可以满足自定义更多的渲染需求，注意会覆盖默认值，建议阅读中文地址[react-beautiful-dnd](https://github.com/chinanf-boy/react-beautiful-dnd-zh) 以及当前[代码示例](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/table/TableTBody.tsx)。
控制 renderClone 拖拽起来的时候会在 body 下面新增加一个 table 会在这个 table 注入元素比如下面的示例可以实现在类名为 c7n-pro-table-drag-container 的 table 里面渲染对应的元素，这里你可以增加样式覆盖完成你想要的拖拽样式，由于拖拽使用的 Fixed 定位所以会导致 table 长度变化，可以根据业务修改合适的 columns 的宽度来让表现更加自然。renderIcon 来渲染拖拽的自定义 Icon。
在 1.5.7 版本扩展 draggableProps.isDragDisabled 属性支持回调函数：(record?: Record) => boolean，可以更灵活地对每一行进行拖拽控制。

可以注意一下设置
新增拖拽例的key值 DRAG_KEY = '__drag-column__';
防止拖拽在dom结构外报错的table 类名 c7n-pro-table-drag-container


| 参数     | 说明               | 类型                        |
| -------- | ------------------ | --------------------------- |
| droppableProps | droppableProps 参考文档 | object |
| draggableProps | DraggableProps 参考文档 | object |
| renderClone | 拖拽起来的时候会在 body 下面新增加一个 table 会在这个 table 注入元素 | (DragTableRowProps \| DragTableHeaderCellProps) => ReactElement<any> |
| renderIcon | 可以自定义图标 | 当为 row 时候（{record}）=> ReactElement<any> 为column 时候 （{column，dataSet, snapshot}）=> ReactElement<any> |


### spin

spin 的配置项。

| 参数      | 说明       | 类型         |
| --------- | ---------- | ------------ |
| indicator | 加载指示符 | ReactElement |
| spinning  | 是否旋转   | boolean      |

更多案列和属性请参考 [Spin](/zh/procmp/feedback/spin/)。

### instance methods

| 名称 | 说明 | 参数 | 返回值类型 | 版本 |
| --- | --- | --- | --- | --- |
| setScrollLeft(scrollLeft) | 设置横向滚动值。 | `scrollLeft` - 横向滚动值 |  | 1.5.1 |
| setScrollTop(scrollTop) | 设置纵向滚动值。 | `scrollTop` - 纵向滚动值 |  | 1.5.1 |
| setColumnWidth(width, indexOrKeyOrName, saveToCustomization) | 设置列宽。 | `width` - 宽度 `indexOrKeyOrName` - 索引或key或name `saveToCustomization`(1.5.6) - 是否保存到个性化，默认true | | 1.5.2 |
| getHeaderGroups() | 获取所有头分组 |  | Group[] | 1.5.6 |
| getGroups() | 获取所有列分组 |  | Group[] | 1.5.6 |

### 分页配置

分页功能配置可以按照如下配置进行全局配置

```js
import { configure } from 'choerodon-ui';

configure({
  pagination: { pageSizeOptions: ['10', '20', '50', '100', '1000'] },
});
```

全局配置操作，建议在初始化的时候进行。更多的配置参考[pagination](/zh/procmp/navigation/pagination/);

### clipboard

剪贴板配置项

| 参数      | 说明       | 类型         | 默认值 |
| --------- | ---------- | ------------ | ------ |
| copy | 是否开启表格复制 | boolean | false |
| paste | 是否开启表格粘贴，开启后只有可编辑的单元格才能被粘贴数据。 | boolean | false |
| description | 开启表格复制或粘贴，自定义修改描述信息 | string \| ReactNode | - |

### 导出配置

可以根据需求进行全局配置，和局部配置

```js
import { configure } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

// 全局配置

const basicUrl = ``;

configure({
  transport: {
    exports: ({ dataSet, name: fieldName }) => {
      const _token = dataSet.current.get('_token');
      return {
        url: `${basicUrl}/v1/export`,
        method: 'POST',
        params: { _token, fieldName },
        transformResponse: (res) => {
          try {
            const aLink = document.createElement('a');
            const blob = new Blob([res.data], {
              type: 'application/vnd.ms-excel',
            });
            aLink.href = URL.createObjectURL(blob);
            aLink.download = fieldName;
            aLink.click();
            document.body.appendChild(aLink);
          } catch (e) {
            // do nothing, use default error deal
          }
        },
      };
    },
  },
});

// 局部使用
// eslint-disable-next-line no-unused-vars
const tableDs = new DataSet({
  primaryKey: 'userid',
  name: 'user',
  autoQuery: true,
  pageSize: 5,
  cacheSelection: true,
  transport: {
    exports: ({ dataSet }) => {
      const fileId = dataSet.name;
      return {
        url: `/_api/table/${fileId}`,
        method: 'get',
      };
    },
  },
});
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

局部的使用 demo 方法参见[Table](/zh/procmp/data-display/table#基础);
