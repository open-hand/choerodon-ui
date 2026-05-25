---
title: API
---

### Table

| Property | Description                                                                                                                                                                                                                           | Type                                                                                                   | Default   | Version   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------- | ----- |
| columns | Column group, priority and performance are higher than children | ColumnProps[] |  ||
| groups | Grouping | [TableGroup](#tablegroup)[] |  | 1.5.1 |
| header                | Table header                                                                                                                                                                                                                           | ReactNode \| (records) => ReactNode                                                                    |          |    |
| footer                | Table footer                                                                                                                                                                                                                           | ReactNode \| (records) => ReactNode                                                                    |          |    |
| border                | Whether to show border                                                                                                                                                                                                                   | boolean                                                                                                | [globalConfig.tableBorder](/en/procmp/configure/configure)      |    |
| columnEditorBorder | Whether to show editor border | boolean | [globalConfig.tableBorder](/en/procmp/configure/configure) | 1.4.0 |
| [selectionMode](/en/tutorials/table-select-record)         | Record selection mode, optional values: rowbox \| treebox \| click \| dblclick \| mousedown \| none                                                                                                                                                         | string                                                                                                 | rowbox |    |
| selectionBoxRenderer | Checkbox renderer  | ({ record, element }) => ReactNode | | 1.5.4 |
| [alwaysShowRowBox](/en/tutorials/table-select-record)      | Whether to always show rowbox, if enabled, rowbox will also be displayed in other modes. When selectionMode is rowbox and dblclick, the checkbox is always displayed | boolean | false    |    |
| onRow                 | Set row properties                                                                                                                                                                                                                     | ({ dataSet, record, index, expandedRow }) => object                                                    |          |    |
| buttons               | Function buttons, built-in buttons can add afterClick hooks to perform actions other than default behaviors, optional values: add \| delete \| remove \| save \| query \| reset \| expandAll \| collapseAll \| export or array or custom button, array optional value string + button configuration property object | string \| \[string, object\] \| ReactNode \| object                                                    |          |    |
| buttonsLimit | Number of function buttons displayed in the header, exceeding the limit will be put into the more dropdown | number |  | 1.4.5 |
| queryFields           | Custom query field component or default component properties, by default it will automatically match the component according to the field type defined in queryDataSet                                                                                                                                      | ReactNode[] \| object                                                                                  |          |    |
| queryFieldsLimit      | Number of query fields displayed in the header, exceeding the limit will be put into the popup window                                                                                                                                                                       | number                                                                                                 |          |    |
| queryBar              | Query bar, optional values are hooks or built-in types: filterBar \| professionalBar \| advancedBar \| normal \| bar \| comboBar | none                                                                                                                                                          | string \| ({ dataSet, queryDataSet, buttons, pagination, queryFields, queryFieldsLimit }) => ReactNode | [globalConfig.queryBar](/en/procmp/configure/configure) |   |
| queryBarProps | Query bar parameters, different query bar parameter configurations should correspond. When the query bar is a globally configured custom query bar and custom parameters need to be passed, this property can be used. | object | | 1.4.1  |
| summaryBar | Summary bar, optional values are hooks or field name | string \| ({ dataSet, summaryFieldsLimit }) => ReactNode |  |    |
| summaryBarFieldWidth | Summary bar single field width | number | 170 | |
| summaryFieldsLimit | Number of summary fields displayed in the header, exceeding the limit will be collapsed | number |  |   |
| summaryBarConfigProps | Summary bar configuration | { placement?: 'topLeft' \| 'topRight' \| 'bottomLeft' \| 'bottomRight'; separator?: ReactNode; groupStyle?: CSSProperties; moreStyle?: CSSProperties; useColon?: boolean; labelStyle?: CSSProperties; } |  | 1.6.8 |
| useMouseBatchChoose   | Whether to use mouse batch selection. When enabled, mouse drag batch selection can be performed in the case of rowbox. Press at the starting rowbox and release at the ending position                                                                                                                    | boolean                                                                                                | [globalConfig.tableUseMouseBatchChoose](/en/procmp/configure/configure)    |    |
| rowHeight             | Row height, when set to auto, if the content in the cell is too long, it will be wrapped  | number \| auto \| ({ size }) => number \| auto | [globalConfig.tableRowHeight](/en/procmp/configure/configure)       |  1.5.2(Hooks support)  |
| headerRowHeight | Header row height | number \| auto \| ({ size }) => number \| auto | rowHeight | 1.5.1 |
| footerRowHeight | Footer row height | number \| auto \| ({ size }) => number \| auto | rowHeight | 1.5.1 |
| defaultRowExpanded    | Whether the default row is expanded, valid only when dataSet does not set expandField                                                                                                                                                                       | boolean                                                                                                | false    |    |
| expandRowByClick      | Expand sub-rows by clicking on the row                                                                                                                                                                                                           | boolean                                                                                                | false    |    |
| expandedRowRenderer   | Expanded row renderer                                                                                                                                                                                                                   | ({ dataSet, record }) => ReactNode                                                                     |          |    |
| expandIcon            | Custom expand icon                                                                                                                                                                                                                 | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode                 |          |    |
| expandIconColumnIndex | Expand icon column index                                                                                                                                                                                                             | number                                                                                                 |          |    |
| expandIconAsCell | Whether the expand icon is displayed as a separate cell | boolean | true \| false(tree mode) |    |
| indentSize            | Width of each indentation level when displaying tree data                                                                                                                                                                                                 | number                                                                                                 | 15       |    |
| filter                | Data filtering, return value true - display false - do not display                                                                                                                                                                                   | (record) => boolean                                                                                    |          |    |
| treeFilter | Tree data filtering, priority is higher than filter, return value true - display false - do not display | (record) => boolean |  | 1.5.4 |
| mode                  | Table display mode, tree needs to cooperate with dataSet's idField and parentField to display, optional values: list \| tree                                                                                                                                  | string                                                                                                 | list   |   |
| editMode              | Table editing mode, optional values: cell \| inline                                                                                                                                                                                        | string                                                                                                 | cell   |   |
| filterBarFieldName    | Field name of the filter condition directly input when queryBar is bar                                                                                                                                                                                | string                                                                                                 | params |    |
| filterBarPlaceholder  | Placeholder of the input box when queryBar is bar                                                                                                                                                                                              | string                                                                                                 |          |    |
| pagination            | Paginator, refer to [Configuration](#pagination) or [pagination](/en/procmp/navigation/pagination/), not displayed when set to false                                                                                                                             | object \| false                                                                                        |          |    |
| highLightRow | Current row highlight, optional values: boolean \| focus \| click, true - always show highlighted row, 'click' - always show highlighted row after clicking row, 'focus' - show highlighted row when table gets focus | boolean \| string | [globalConfig.tableHighLightRow](/en/procmp/configure/configure) |   |
| selectedHighLightRow  | Selected row highlight                                                                                                                                                                                                                     | boolean                                                                                                | [globalConfig.tableSelectedHighLightRow](/en/procmp/configure/configure)    |    |
| columnResizable | Adjustable column width, xZoom can be passed in to correct the calculation error caused by horizontal scaling | boolean \| { xZoom: number } | [globalConfig.tableColumnResizable](/en/procmp/configure/configure)    |   |
| columnHideable | Adjustable column display, only works when customizable is true | boolean | [globalConfig.tableColumnHideable](/en/procmp/configure/configure) | 1.2.0  |
| columnTitleEditable | Editable column title, only works when customizable is true | boolean | [globalConfig.tableColumnTitleEditable](/en/procmp/configure/configure) | 1.2.0   |
| columnDraggable | Column draggable, only works when customizable is true | boolean | [globalConfig.tableColumnDraggable](/en/procmp/configure/configure) | 1.2.0  |
| rowDraggable | Row draggable, implement row dragging; multiDrag supports multi-row dragging selected records (tree does not support multi-drag) | boolean \| 'multiDrag' | [globalConfig.tableRowDraggable](/en/procmp/configure/configure) | 1.2.0   |
| multiDragSelectMode | Multi-row dragging, multi-select record method: keyboard: ctrl + click; checkbox: use table checkbox to select | 'keyboard' \| 'checkbox' | 'keyboard' | 1.6.6  |
| dragColumnAlign | Add a draggable column to implement row dragging | left\|right |  |   |
| pristine              | Display original value                                                                                                                                                                                                                     | boolean                                                                                                | false    |    |
| onExpand              | Triggered when clicking the expand icon                                                                                                                                                                                                             | (expanded, record) => void                                                                             |          |    |
| virtual               | Whether to enable virtual scrolling, valid when table height is set                                                                                                                                                               | boolean                                                                                                | [globalConfig.tableVirtual](/en/procmp/configure/configure)    |    |
| virtualCell | Virtual cell | boolean | [globalConfig.tableVirtualCell](/en/procmp/configure/configure) | 1.3.0  |
| columnBuffer | Column buffer. The number of extra columns to render before/after the visible area after virtual scrolling is enabled. And the value of columnBuffer is greater than or equal to the value of columnThreshold| number | [globalConfig.tableVirtualBuffer](/en/procmp/configure/configure) | 1.6.2 |
| columnThreshold | Column threshold. The number of columns visible before rendering new columns after virtual scrolling is enabled. And the value of columnThreshold is less than or equal to the value of columnBuffer | number | [globalConfig.tableVirtualBuffer](/en/procmp/configure/configure) | 1.6.2 |
| virtualSpin           | Whether to enable virtual scrolling Spin                                                                                                                                                                                                          | boolean                                                                                                | false    |    |
| autoHeight            | Whether to enable height adaptation                                                                                                                                                                                                             | boolean \| { type: 'minHeight' \| 'maxHeight', diff: number(80) }                                      | false    |    |
| autoWidth | Whether to enable width adaptation, function same as width: 'min-content' | boolean | false | 1.4.5 |
| autoFootHeight | Whether to enable separate processing of column footer | boolean | false |   |
| autoFocus | Whether the new row automatically gets focus to the first editable field | boolean | false |    |
| editorNextKeyEnterDown            | Whether to enable Enter to jump to the next line of editing                                                                                                                                                                                                             | boolean                                     | true    |    |
| onDragEnd | Trigger event after dragging is completed | (dataSet, columns, resultDrag, provided) => void |  |    |
| columnsDragRender | Control column drag rendering | Please check DragRender [Configuration](#dragrender)  |  |    |
| rowDragRender | Control row drag rendering| Please check DragRender [Configuration](#dragrender) |  |    |
| onDragEndBefore | Trigger event before switching position after dragging is completed, can judge whether it is row dragging or column dragging by resultDrag.destination.droppableId === 'table' or 'tableHeader', return false to prevent dragging position change. Tree dragging can get the correct record index through recordIndexFromTo: \[sourceRecordIndex, destinationRecordIndex\] | (dataSet, columns, resultDrag, provided, recordIndexFromTo: \[number?, number?\]) => false \| void \|resultDrag   |  |    |
| dragDropContextProps | react-beautiful-dnd DragDropContextProps | [DragDropContextProps](https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/drag-drop-context.md) | | 1.5.1 |
| keyboard | Enable/disable new shortcut button events | boolean | [globalConfig.tableKeyboard](/en/procmp/configure/configure) |   |
| treeLoadData | Tree asynchronous loading data | ({ record, dataSet }) => Promise | | 1.1.0   |
| treeAsync | Tree asynchronous loading, needs backend interface cooperation, the corresponding data source will automatically call the query interface, the interface parameters will carry the parameter name corresponding to parentField and the parameter value corresponding to idField, and the data returned by the interface will be appended to the existing data | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps )|() => {} | 1.1.0  |
| parityRow | Odd and even rows | boolean | [globalConfig.tableParityRow](/en/procmp/configure/configure)  | 1.1.0  |
| rowNumber | Display row number | boolean \| ({ record, dataSet, text, pathNumbers }) => ReactNode | | 1.1.0  |
| clientExportQuantity | Export one polling quantity | number | 100 | 1.3.0   |
| showSelectionTips | Whether to display selected record tips  | boolean | [globalConfig.tableShowSelectionTips](/en/procmp/configure/configure) | 1.3.0  |
| showCachedTips | Whether to display cached record tips, priority is higher than showSelectionTips | boolean | [globalConfig.tableShowCachedTipsTips](/en/procmp/configure/configure) | 1.5.6 |
| showCachedSelection | Whether to display cached selected records  | boolean | | 1.4.4 |
| onShowCachedSelectionChange | Cached selected record display callback  | (boolean) => void | |1.4.4 |
| showSelectionCachedButton | Whether to display cached selected record button | boolean | true | 1.4.1   |
| showAllPageSelectionButton | Whether to display switch cross-page select all button | boolean | | 1.4.0  |
| customizable | Whether to display personalized setting entry button  | boolean | [globalConfig.customizable](/en/procmp/configure/configure) | 1.3.0   |
| customizedCode | Personalized code, after setting, the personalized settings such as column dragging will be stored in localStorage by default. If you want to store it in the backend, please rewrite the table personalized hooks in the [Global Configuration](/en/procmp/configure/configure): customizedSave \| customizedLoad | string | | 1.2.0   |
| onCustomizedLoad | Table personalized interface request callback function | (TableCustomized) => Promise<any> | | 1.6.3 |
| treeQueryExpanded | Under the tree structure, queryBar triggers query, automatically expands the tree structure  | boolean | | 1.3.1   |
| aggregation | Whether it is an aggregation view, if there is personalization, the personalization configuration shall prevail  | boolean | | 1.4.0   |
| onAggregationChange | Aggregation view change hook, triggered when personalized configuration changes  | (aggregation) => void | | 1.4.0   |
| cellHighlightRenderer | Cell highlight renderer  | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode | | 1.4.0  |
| showHeader |	Whether to display table header |	boolean |	true | 1.4.2 |
| showRemovedRow |	Whether to display temporarily removed rows, grayed out by default |	boolean | true | 1.4.4 |
| onColumnResize | Column width change callback event  | ({ column, width, index }) => void | | 1.4.4 |
| searchCode | Dynamic filter bar backend interface unique code | string | | 1.4.5 |
| rowBoxPlacement | Row selection box position  | Optional values: start, end \| number | start | 1.4.5 |
| heightChangeable | Height setting, only works when customizable is true | boolean | [globalConfig.tableHeightChangeable](/en/procmp/configure/configure) | 1.5.1 |
| bodyExpandable | Whether the table body is expandable | boolean | | 1.5.1 |
| defaultBodyExpanded | Whether the table body is expanded by default | boolean | true | 1.5.1 |
| bodyExpanded | Whether the table body is expanded | boolean |  | 1.5.1 |
| onScrollTop | Vertical scroll event (getScrollInfo - 1.5.6) | (scrollTop, getScrollInfo) => void | | 1.5.1 |
| onScrollLeft | Horizontal scroll event (getScrollInfo - 1.5.6) | (scrollLeft, getScrollInfo) => void | | 1.5.1 |
| onBodyExpand | Triggered when clicking the table body expand icon | (expanded) => void | | 1.5.1 |
| renderEmpty | Custom rendering data empty status  | () => ReactNode |  | 1.5.2 |
| autoValidationLocate | Validation failure automatic positioning. If the positioning of multiple components conflicts, you can turn off automatic positioning and manually call the focus method to position | boolean | true | 1.5.3 |
| boxSizing | The scope of style height impact, default content, if specified as wrapper, the style height will include the height of the content before and after the table, and the table height will be automatically adjusted when the height changes | 'content' \| 'wrapper' | 'content' | 1.5.6 |
| fullColumnWidth | Whether the last column width automatically fills the table when all columns have column widths and do not exceed the table width  | boolean | true | 1.5.6 |
| clipboard | Configure whether the Table can copy and paste, only supported in common lists, data grouping, virtual scrolling and other special scenarios are not supported temporarily. Refer to [Configuration](#clipboard)  | Clipboard | { copy: false, paste: false } | 1.6.4 |
| customDragDropContenxt | Whether to enable custom DragDropContenxt, generally used for custom react-beautiful-dnd DragDropContenxt to implement multi-table dragging | boolean | false | 1.6.4 |
| selectionColumnProps | Row selection column property extension  | ColumnProps  |  | 1.6.4 |
| rowNumberColumn | Row number column properties |	ColumnProps \| ((defaultProps: ColumnProps) => ColumnProps) |	 | 1.6.5 |
| tableFilterBarButtonIcon | Whether the Table dynamic filter bar button displays an icon. true displays the default icon, false does not display, object type can set specific icons separately | boolean \| { saveIconType?: string \| boolean; saveAsIconType?: string \| boolean; resetIconType?: string \| boolean; } |  | 1.6.6 |
| combineColumnFilter | Whether to enable front-end combined filtering  | boolean  | true | 1.6.6 |
| combineSortConfig | Combined sorting configuration, default front-end and back-end sorting are enabled, showing sorting options; built-in front-end combined sorting function, if there is complex field sorting, please implement the sorting function yourself. currentDataSort: current page sorting (front-end sorting); allDataSort: all page sorting (back-end sorting); | { currentDataSort?: { show?: boolean; enable?: boolean; customFn?: ((props: { dataSet: DataSet, sortInfo: Map<string, SortOrder> }) => void); allDataSort?: { show?: boolean; enable?: boolean} }  |  | 1.6.7 |
| addNewButton | Add input row button in table body, replace renderEmpty when data is empty; invalid when pristine is set |	boolean |	 | 1.6.7 |
| customizedColumnProps | Custom column attributes of personalized columns, please note when setting: Personalized columns only have the header part, and only some attributes are effective |	ColumnProps \| ((defaultProps: ColumnProps) => ColumnProps) |	 | 1.6.8 |

For more properties, please refer to [DataSetComponent](/en/procmp/abstract/ViewComponent#datasetcomponent).

### Table.Column

| Property        | Description                                                                                                                                                                                                                           | Type                                                                                                   | Default   | Version   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------- | --- |
| children | Sub-column group, please correspond to ReactElement<ColumnProps>[] in JSX mode | ColumnProps[] \| ReactElement<ColumnProps>[] | | 1.5.1 |
| name            | Field name corresponding to the column                                                                                                                                                                                    | string                                                                                                                             |           |  |
| width           | Column width, it is not recommended to set the width for all columns, but to leave one column unset to achieve the automatic width effect                                                                                                                            | number                                                                                                                             |           |  |
| defaultWidth | Column default width  | number | [globalConfig.tableColumnDefaultWidth](/en/procmp/configure/configure) \| [globalConfig.tableAggregationColumnDefaultWidth](/en/procmp/configure/configure)  | 1.5.1 |
| minWidth        | Minimum column width                                                                                                                                                                                          | number                                                                                                                             | [globalConfig.tableColumnDefaultMinWidth](/en/procmp/configure/configure) \| [globalConfig.tableAggregationColumnDefaultMinWidth](/en/procmp/configure/configure)       |  |
| title | Column header text, priority is higher than header, easy to edit when column header text is rendered by header hook | string |  |  |
| header | Column header | ReactNode \| ({ dataSet, name, title, aggregation, group: [Group](/en/procmp/dataset/dataset#group-values), aggregationTree: ReactElement[] }) => ReactNode |  |  |
| footer          | Column footer                                                                                                                                                                                              | ReactNode \| ({ dataSet, name, aggregationTree: ReactElement[] }) => ReactNode                                                                                           |           |  |
| renderer        | Cell rendering callback                                                                                                                                                                                    | ({ value, text, name, record, dataSet, rowGroup: [Group](/en/procmp/dataset/dataset#group-values), headerGroup: [Group](/en/procmp/dataset/dataset#group-values), aggregationTree: ReactElement[]  }) => ReactNode                                                                              |           |  |
| tagRenderer        | Multi-value Tag renderer | ({ value, text, key, readOnly, invalid, disabled, onClose, className, inputBoxIsFocus, record(1.6.8), field(1.6.8) }: TagRendererProps) => ReactNode |  | 1.6.2 |
| editor          | Editor, when set to true, it will automatically match the editor according to the field type. Please use false value for non-editable instead of adding disabled on the control. If you need to re-encapsulate the input box component, you need to use React.forwardRef to forward ref.                                                                                   | FormField \| ((record, name) => FormField \| boolean) \| boolean                                                                   |           |  |
| lock            | Whether to lock, optional values false \| true \| 'left' \| 'right'                                                                                                                                                   | boolean\| string                                                                                                                   | false     | |
| align           | Text alignment, optional values: left \| center \| right                                                                                                                                                    | string                                                                                                                             |      [globalConfig.tableColumnAlign](/en/procmp/configure/configure)     |  |
| resizable       | Whether the width can be adjusted                                                                                                                                                                                    | boolean                                                                                                                            | [globalConfig.tableColumnResizable](/en/procmp/configure/configure)      |  |
| sortable | Whether it is sortable, front-end sorting (1.6.0) please define [CompareFn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#comparefn): (v1, v2, order) => number | boolean \| CompareFn  | false | |
| filter | Whether front-end filtering is possible | boolean \| ((props: { record: Record, filterText?: string }) => boolean)  | false | 1.6.0 |
| filterPopover | Front-end filtering custom screening, this function is only responsible for rendering the layer, you need to write various interactions yourself | ReactNode \| ((props: FilterPopoverProps) => ReactNode)  |  | 1.6.0 |
| hideable | Whether it can be hidden | boolean | [globalConfig.tableColumnHideable](/en/procmp/configure/configure)  |  |
| titleEditable | Whether the title is editable | boolean | [globalConfig.tableColumnTitleEditable](/en/procmp/configure/configure) | 1.2.0 |
| style           | Column cell inline style                                                                                                                                                                                  | object                                                                                                                             |           |  |
| className       | Column cell class name                                                                                                                                                                                    | string                                                                                                                             |           |  |
| headerStyle     | Column header inline style                                                                                                                                                                                      | object                                                                                                                             |           |  |
| headerClassName | Column header class name                                                                                                                                                                                        | string                                                                                                                             |           |  |
| footerStyle     | Column footer inline style                                                                                                                                                                                      | object                                                                                                                             |           |  |
| footerClassName | Column footer class name                                                                                                                                                                                        | string                                                                                                                             |           |  |
| help            | Extra information, often used for prompts                                                                                                                                                                              | ReactNode                                                                                                                           |           |  |
| showHelp        | The way to display prompt information. Optional values tooltip \| newLine \| none                                                                                                                                             | string                                                                                                                             | tooltip |  |
| onCell          | Set cell properties                                                                                                                                                                                    | ({ dataSet, record, column }) => object                                                                                            |    [globalConfig.tableColumnOnCell](/en/procmp/configure/configure)       |  |
| command | Row operation button set, the value is an array or a hook that returns an array, built-in buttons can add afterClick hooks to perform actions other than default behaviors, array optional values: edit delete or \[edit\| delete , button configuration property object\] or custom button | (string \| \[string, object\] \| ReactNode)[] \| ({ dataSet, record, aggregation }) => (string \| \[string, object\] \| ReactNode \| object )[] | | |
| hidden          | Hidden                                                                                                                                                                                              | boolean                                                                                                                            |           |  |
| tooltip         | Use Tooltip to display cell content. Optional values none \| always \| overflow                                                                                                                                      | string                                                                                                                             |  [globalConfig.tooltip](/en/procmp/configure/configure)    |  |
| tooltipProps | Used to configure Tooltip related parameters  | [TooltipProps](/en/procmp/data-display/tooltip/#API) \| ((type: 'header' \| 'cell', defaultTooltipProps: TooltipProps, field?: Field, record?: Record) => TooltipProps)(1.6.8) | | 1.5.6 |
| aggregation | Whether it is an aggregation column, not displayed in tile view  | boolean | |  |
| aggregationLimit | Aggregation display item quantity limit, items exceeding the limit can be displayed through the expand button  | number | 4 | |
| aggregationDefaultExpandedKeys | Default expand tree nodes under the specified aggregation column  | (string \| number)[] |  |  |
| aggregationDefaultExpandAll | Default expand all tree nodes under the aggregation column  | boolean |  |  |
| aggregationTreeIndex | Column index in aggregation cell  | number | 0 | 1.5.2 |
| hiddenInAggregation | Whether to hide under aggregation column  | boolean \| (record) => boolean |  | |
| highlightRenderer | Cell highlight renderer | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode | |  |
| aggregationLimitDefaultExpanded | Whether items exceeding the aggregation limit are expanded by default  | boolean \| (record) => boolean | 1.5.1 |
| sortableCallback | Callback function after sorting ends  | (props: { dataSet: DataSet, field: Field, order?: string }) => void  |  | 1.6.6 |
| showDetail | When editor is false, whether to view multi-language details. true displays icon when hovering; always displays icon always | boolean \| `always` |  | 1.6.7 |

### TableGroup

> New method in version 1.5.1.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| type | Group type, optional values `column` `row` `header` `none` | string | 'none' |
| name | Field name corresponding to the group | string |  |
| parentField | Parent field name corresponding to the tree group | string |  |
| hidden | Hide group, only applicable to groups of type header | boolean |  |
| columnProps | Column properties | ColumnProps |  |

### Table.FilterBar

| Property | Description | Type | Default |
| ----------- | ---------------------- | ------ | -------- |
| paramName   | Field name of the input filter condition | string | params |
| placeholder | Placeholder of the input box         | string | Filter Table |
| queryBarProps.editorProps(1.6.4) | Extended popup editor properties         | (props: { name: string, record?: Record, editor: ReactElement<FormFieldProps> }) => object; |  |

For more properties, please refer to the hook parameters of `Table` `queryBar` property.

### Table.AdvancedQueryBar

| Property | Description | Type | Default |
| ---------------- | -------------------------------------------------------- | ------ | ------ |
| queryFieldsLimit | Number of query fields displayed in the header, exceeding the limit will be put into the popup window | number | 1      |

For more properties, please refer to the hook parameters of `Table` `queryBar` property.

### Table.ToolBar

| Property | Description | Type | Default |
| ---------------- | -------------------------------------------------------- | ------------------- | ------ |
| queryFieldsLimit | Number of query fields displayed in the header, exceeding the limit will be put into the popup window | number              | 1      |
| pagination       | Paginator, refer to [pagination](/en/procmp/navigation/pagination/)    | PaginationComponent |   |

For more properties, please refer to the hook parameters of `Table` `queryBar` property.

### Table.DynamicFilterBar

| Property | Description | Type | Default | Version |
| ----------- | ---------------------- | ------ | -------- | --- |
| queryFieldsLimit | Number of query fields displayed in the header, exceeding the limit will be put into the popup window | number | 3 | |
| autoQueryAfterReset | Auto query after reset | boolean | true | 1.4.4 |
| dynamicFilterBar | Filter bar property configuration | DynamicFilterBarConfig | | 1.4.5 |
| fuzzyQuery | Whether to enable fuzzy query | boolean | true | 1.4.5 |
| fuzzyQueryOnly | Whether to use only fuzzy query | boolean | false | 1.5.1 |
| fuzzyQueryPlaceholder | Fuzzy query placeholder  | string |  | 1.4.5 |
| fuzzyQueryProps | Fuzzy query input box properties  | TextFieldProps |  | 1.6.6 |
| filterQueryCallback | Filter interface query callback  | ({ dataSet })=> void |  | 1.6.6 |
| autoQuery | Whether to auto query when condition changes  | boolean | true |1.4.5 |
| refreshBtn | Refresh button  | boolean | true | 1.5.1 |
| onBeforeQuery | Callback before query, return false to not query | () => (Promise<boolean \| void> \| boolean \| void) |  | 1.6.7 |
| onQuery | Query callback | () => void |  | 1.4.5 |
| onReset | Reset callback | () => void |  | 1.4.5 |
| onRefresh | Refresh button callback, return false \| Promise.resolve(false) or Promise.reject() will not refresh query, otherwise auto query | () => Promise&lt;boolean&gt; | | 1.5.7 |
| onFieldEnterDown | Field Enter callback | ({ e, name, dataSet(1.6.8) }) => void  | | 1.6.4 |
| showSingleLine | Whether the filter bar is displayed in a single line | boolean |  | 1.6.5 |
| tableFilterBarButtonIcon | Whether the Table dynamic filter bar button displays an icon. true displays the default icon, false does not display, object type can set specific icons separately | boolean \| { saveIconType?: string \| boolean; saveAsIconType?: string \| boolean; resetIconType?: string \| boolean; } |  | 1.6.6 |

#### DynamicFilterBarConfig

| Property | Description | Type | Default |
| ----------- | ---------------------- | ------ | -------- |
| searchText | Fuzzy query parameter name, parameter value can be obtained through dataSet.getState('\_\_SEARCHTEXT\_\_') | string | params |
| suffixes | Filter bar suffix rendering area | React.ReactElement<any>[]，array elements support 'filter' |  |
| prefixes | Filter bar prefix rendering area | React.ReactElement<any>[]，array elements support 'filter' |  |
| tableFilterAdapter | Filter bar request adapter | TransportProps |  |

For more properties, please refer to the hook parameters of `Table` `queryBar` property.

### Table.ProfessionalBar

| Property | Description | Type | Default | Version |
| ---------------- | -------------------------------------------------------- | ------ | ------ | --- |
| queryFieldsLimit | Number of query fields displayed in the header, exceeding the limit will be put into the popup window | number | 3      | |
| autoQueryAfterReset | Auto query after reset | boolean | true | 1.4.4 |
| defaultExpanded | Default expanded | boolean | false | 1.3.1 |
| formProps | Query bar form properties | FormProps | { labelTooltip: 'overflow', labelWidth: 80  } | 1.4.4 |
| onBeforeQuery | Callback before query, return false to not query | () => (Promise<boolean \| void> \| boolean \| void) |  | 1.6.7 |
| onQuery | Query callback | () => void |  |
| onReset | Reset callback | () => void |  |


### pagination

Pagination configuration items.

| Property | Description | Type | Default |
| -------- | ------------------ | --------------------------- | -------- |
| position | Specify the position where pagination is displayed | top \| bottom \| both | bottom |

### dragRender

> Can meet more custom rendering requirements, note that it will overwrite the default value, it is recommended to read the Chinese address [react-beautiful-dnd](https://github.com/chinanf-boy/react-beautiful-dnd-zh) and the current [code example](https://github.com/open-hand/choerodon-ui/blob/master/components-pro/table/TableTBody.tsx).
Control renderClone when dragging, a new table will be added under the body, elements will be injected into this table, for example, the following example can implement rendering corresponding elements in the table with the class name c7n-pro-table-drag-container, here you can add style overrides to complete the drag style you want. Since dragging uses Fixed positioning, it will cause the table length to change, you can modify the appropriate columns width according to the business to make the performance more natural. renderIcon to render the drag custom Icon.
In version 1.5.7 extended draggableProps.isDragDisabled property supports callback function: (record?: Record) => boolean, can control dragging of each row more flexibly.

Please note the settings
New drag column key value DRAG_KEY = '__drag-column__';
Prevent table class name c7n-pro-table-drag-container from reporting errors outside the dom structure


| Property | Description | Type |
| -------- | ------------------ | --------------------------- |
| droppableProps | droppableProps reference document | object |
| draggableProps | DraggableProps reference document | object |
| renderClone | When dragging, a new table will be added under the body, and elements will be injected into this table | (DragTableRowProps \| DragTableHeaderCellProps) => ReactElement<any> |
| renderIcon | Can customize icon | When row ({record}) => ReactElement<any> When column ({column，dataSet, snapshot}) => ReactElement<any> |


### spin

Spin configuration items.

| Property | Description | Type |
| --------- | ---------- | ------------ |
| indicator | Loading indicator | ReactElement |
| spinning  | Whether to rotate   | boolean      |

For more cases and properties, please refer to [Spin](/en/procmp/feedback/spin/).

### instance methods

| Name | Description | Property | Return Type | Version |
| --- | --- | --- | --- | --- |
| setScrollLeft(scrollLeft) | Set horizontal scroll value. | `scrollLeft` - horizontal scroll value |  | 1.5.1 |
| setScrollTop(scrollTop) | Set vertical scroll value. | `scrollTop` - vertical scroll value |  | 1.5.1 |
| setColumnWidth(width, indexOrKeyOrName, saveToCustomization) | Set column width. | `width` - width `indexOrKeyOrName` - index or key or name `saveToCustomization`(1.5.6) - whether to save to personalization, default true | | 1.5.2 |
| getHeaderGroups() | Get all header groups |  | Group[] | 1.5.6 |
| getGroups() | Get all column groups |  | Group[] | 1.5.6 |

### Pagination Configuration

Pagination function configuration can be configured globally as follows

```js
import { configure } from 'choerodon-ui';

configure({
  pagination: { pageSizeOptions: ['10', '20', '50', '100', '1000'] },
});
```

Global configuration operation, recommended to be performed during initialization. For more configurations, refer to [pagination](/en/procmp/navigation/pagination/);

### clipboard

Clipboard configuration items

| Property | Description | Type | Default | Version |
| --------- | ---------- | ------------ | ------ | ------ |
| copy | Whether to enable table copy | boolean | false | ｜
| paste | Whether to enable table paste, only editable cells can be pasted with data after enabling. | boolean | false | ｜
| description | Enable table copy or paste, customize modification description information | string \| ReactNode | - | ｜
| arrangeCalc | Enable range counting | boolean \| ReactNode | false | 1.6.5 ｜
| hiddenTip | Close tip | boolean | false | 1.6.5 ｜
| tipCallback | copy and paste successful or failed callbacks | (type: 'copy' \| 'paste', success: boolean) => void | - | 1.6.7 |
| onlyTemplateHeader | only retain the template header | boolean | false | 1.6.7 |
| keepEmptyLines | Whether to keep blank lines when pasting | boolean | true | 1.6.8 |

### Export Configuration

Can be globally configured and locally configured according to requirements

```js
import { configure } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

// Global configuration

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

// Local usage
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

### New Shortcut Keys

> keyboard controls whether to enable

- Alt + n, when focus is in table cell (non-querybar area), add a new row (code can configure whether to create new at the first row or the last row)
- Ctrl + s, focus is in table cell, save current table
- Ctrl + d (or Command + d):
- Focus is in table cell, copy the cell content of the previous row
- Focus is in a row of table, copy all cell contents of the previous row
- Delete, when inside the current focus element, delete 1 character
- Alt + delete, focus is in table cell, delete current row, pop up secondary prompt box
- Shift + arrow keys, focus is in a row of table, current table can be multi-selected, can select multiple rows

For local usage demo method, see [Table](/en/procmp/data-display/table#Basic);
