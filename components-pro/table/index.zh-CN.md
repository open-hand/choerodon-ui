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

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| header | 表头 | ReactNode \| (records) => ReactNode |  |
| footer | 表脚 | ReactNode \| (records) => ReactNode |  |
| border | 是否显示边框 | boolean | true |
| autoFocus | 是否新增行自动获焦至第一个可编辑字段 | boolean | false |
| selectionMode | 选择记录的模式, 可选值: `rowbox` `click` `dblclick` `mousedown` `none` | string | 'rowbox' |
| alwaysShowRowBox | 是否一直显示rowbox,开启后在其他模式下也会显示rowbox | boolean | false |
| onRow | 设置行属性 | ({ dataSet, record, index, expandedRow }) => object |  |
| buttons | 功能按钮，内置按钮可添加 `afterClick` 钩子，用于执行除了默认行为外的动作，可选值：`add` `delete` `remove` `save` `query` `reset` `expandAll` `collapseAll` `export` 或 数组 或 自定义按钮，数组为可选值字符串+按钮配置属性对象 | string \| \[string, object\] \| ReactNode \| object |  |
| queryFields | 自定义查询字段组件或默认组件属性，默认会根据 queryDataSet 中定义的 field 类型自动匹配组件 | ReactNode[] \| object |  |
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number |  |
| queryBar | 查询条, 可选值为钩子或者内置类型：`filterBar` `professionalBar` `advancedBar` `normal` `bar` `none` | string \| ({ dataSet, queryDataSet, buttons, pagination, queryFields, queryFieldsLimit }) => ReactNode | 'normal' |
| summaryBar | 汇总条, 可选值为钩子或者字段 name | string \| ({ dataSet, summaryFieldsLimit }) => ReactNode |  |
| summaryFieldsLimit | 头部显示的汇总字段的数量，超出限制的查询字段收起 | number |  |
| useMouseBatchChoose | 是否使用鼠标批量选择,开启后在rowbox的情况下可以进行鼠标拖动批量选择,在起始的rowbox处按下,在结束位置松开 | boolean | false |
| rowHeight | 行高 | number \| auto | 30 |
| defaultRowExpanded | 默认行是否展开，当 dataSet 没有设置 expandField 时才有效 | boolean | false |
| expandRowByClick | 通过点击行来展开子行 | boolean | false |
| expandedRowRenderer | 展开行渲染器 | ({ dataSet, record }) => ReactNode |  |
| expandIcon | 自定义展开图标 | ({ prefixCls, expanded, expandable, needIndentSpaced, record, onExpand }) => ReactNode |  |
| expandIconColumnIndex | 展开图标所在列索引 | number |  |
| expandIconAsCell | 展开图标是否单独单元格展示 | boolean | （非Tree mode）true \| false |
| indentSize | 展示树形数据时，每层缩进的宽度 | number | 15 |
| filter | 数据过滤， 返回值 true - 显示 false - 不显示 | (record) => boolean |  |
| mode | 表格展示的模式, tree 需要配合 dataSet 的`idField`和`parentField`来展示，可选值: `list` `tree` | string | 'list' |
| editMode | 表格编辑的模式，可选值: `cell` `inline` | string | 'cell' |
| filterBarFieldName | `queryBar`为`bar`时，直接输入的过滤条件的字段名 | string | 'params' |
| filterBarPlaceholder | `queryBar`为`bar`时输入框的占位符 | string |  |
| pagination | 分页器，参考[配置项](#pagination)或 [pagination](/components/pagination/)，设为 false 时不展示分页 | object \| false |  |
| highLightRow | 当前行高亮, 可选值: boolean \| focus \| click  | boolean \| string | true |
| selectedHighLightRow | 勾选行高亮 | boolean | false |
| parityRow | 奇偶行 | boolean |  |
| columnResizable | 可调整列宽 | boolean |  |
| columnHideable | 可调整列显示, customizable 为 true 才起作用 | boolean | true |
| columnTitleEditable | 可编辑列标题, customizable 为 true 才起作用 | boolean |  |
| columnDraggable | 列拖拽, customizable 为 true 才起作用 | boolean | false |
| rowDraggable | 行拖拽，实现行的拖拽， 树形数据无法使用 | boolean | false |
| dragColumnAlign | 增加一个可拖拽列，实现行拖拽 | 'left'\|'right' |  |
| pristine | 显示原始值 | boolean | false |
| onExpand | 点击展开图标时触发 | (expanded, record) => void |  |
| virtual | 是否开启虚拟滚动,当设置表格高度 `style={{ height: xxx }}` 时有效 | boolean | false |
| virtualCell | 虚拟单元格 | boolean | false |
| virtualSpin | 是否开启虚拟滚动Spin | boolean | false |
| autoHeight | 是否开启高度自适应 | boolean \| { type: 'minHeight' \| 'maxHeight', diff: number(80) } | false |
| autoFootHeight | 是否开启是否单独处理 column footer | boolean | false |
| autoMaxWidth | 是否开启双击侧边栏宽度最大自适应,初次双击为最大值再次双击为`minWidth` | boolean | false |
| editorNextKeyEnterDown            | 是否开启回车跳转下一行编辑                                                                                                                                                                                                             | boolean                                     | true    |
| onDragEnd | 完成拖拽后的触发事件，可以通过 resultDrag.destination.droppableId === 'table' or ‘tableHeader’ 来判断是行拖拽还是列拖拽 | (dataSet:DataSet,columns:ColumnProps[],resultDrag: DropResult, provided: ResponderProvided) => void |  |
| columnsDragRender | 控制列的拖拽渲染，从这里可以实现对默认的拖拽的一些自定义的设置，需要参阅react-beautiful-dnd | 请查看DragRender[配置项](#DragRender)  |  |
| rowDragRender | 控制列的拖拽渲染，从这里可以实现对默认的拖拽的一些自定义的设置，需要参阅react-beautiful-dnd | 请查看DragRender[配置项](#DragRender) |  |
| onDragEndBefore |完成拖拽后,切换位置之前的触发事件，可以通过 resultDrag.destination.droppableId === 'table' or ‘tableHeader’ 来判断是行拖拽还是列拖拽,返回false阻止拖拽换位置 | (dataSet:DataSet,columns:ColumnProps[],resultDrag: DropResult, provided: ResponderProvided) => false \| void \|resultDrag   | - |
| keyboard | 开启关闭新增的快捷按钮事件 | boolean | false |
| dynamicFilterBar | `queryBar`为`filterBar`时筛选条属性配置 | DynamicFilterBarConfig | |
| treeLoadData | 树形异步加载数据 | ({ record, dataSet }) => Promise | |
| treeAsync | 树形异步加载，需要后端接口配合，对应的数据源会自动调用查询接口，接口参数中会带有 parentField 对应的参数名和 idField 对应的参数值，接口返回的数据会附加到已有的数据之中 | boolean |  |
| rowNumber | 显示行号 | boolean \| ({ record, dataSet, text, pathNumbers }) => ReactNode | |
| clientExportQuantity | 导出一次轮询数量 | number | 100 |
| showSelectionTips | 是否显示选中记录提示  | boolean | |
| customizable | 是否显示个性化设置入口按钮  | boolean | |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/components/configure)中的表格个性化钩子： `tableCustomizedSave` `tableCustomizedLoad` | string | |
| clientExportQuantity | 客户端查询导出，查询数目设置  | number | |
| virtualRowHeight | 可以修改由于样式导致的虚拟高度和rowHeight不一致  | number | |

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

### Table.Column

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 列对照的字段名 | string |  |
| width | 列宽，不推荐给所有列设置宽度，而是给某一列不设置宽度达到自动宽度的效果 | number |  |
| minWidth | 最小列宽 | number | 100 |
| title | 列头文字，优先级高于 header， 便于列头文字通过 header 钩子渲染的情况下可编辑 | string |  |
| header | 列头 | ReactNode \| (dataSet, name, title) => ReactNode |  |
| footer | 列脚 | ReactNode \| (dataSet, name) => ReactNode |  |
| renderer | 单元格渲染回调 | ({ value, text, name, record, dataSet }) => ReactNode |  |
| editor | 编辑器, 设为`true`时会根据 field 的 type 自动匹配编辑器。不可编辑请使用 `false` 值，而不是在控件上加 disabled。 | FormField \| ((record, name) => FormField \| boolean) \| boolean |  |
| lock | 是否锁定， 可选值 `false` `true` `left` `right` | boolean\| string | false |
| align | 文字对齐方式，可选值： `left` `center` `right` | string |  |
| resizable | 是否可调整宽度 | boolean | true |
| sortable | 是否可排序（后端请求排序，前端排序请自定义 header 自行实现） | boolean | false |
| hideable | 是否可隐藏 | boolean |  |
| titleEditable | 是否可编辑标题 | boolean |  |
| style | 列单元格内链样式 | object |  |
| className | 列单元格样式名 | string |  |
| headerStyle | 列头内链样式 | string |  |
| headerClassName | 列头样式名 | string |  |
| footerStyle | 列脚内链样式 | string |  |
| footerClassName | 列脚样式名 | string |  |
| help | 额外信息，常用于提示 | `string` |  |
| showHelp | 展示提示信息的方式。可选值 `tooltip` `newLine` `none` | string | 'tooltip' |
| onCell | 设置单元格属性 | ({ dataSet, record, column }) => object |  |
| command | 行操作按钮集，该值为数组 或 返回数组的钩子，内置按钮可添加 `afterClick` 钩子，用于执行除了默认行为外的动作，数组可选值：`edit` `delete` 或 \[`edit`\| `delete` , 按钮配置属性对象\] 或 自定义按钮 | (string \| \[string, object\] \| ReactNode)[] \| ({ dataSet, record }) => (string \| \[string, object\] \| ReactNode \| object )[] |  |
| hidden | 隐藏 | boolean |  |
| tooltip | 用 Tooltip 显示单元格内容。可选值 `none` `always` `overflow` | string | 'none' |

### Table.FilterBar

| 参数        | 说明                   | 类型   | 默认值   |
| ----------- | ---------------------- | ------ | -------- |
| paramName   | 输入的过滤条件的字段名 | string | 'params' |
| placeholder | 输入框的占位符         | string | '过滤表' |

更多属性请参考 `Table` `queryBar` 属性的钩子参数。

### Table.AdvancedQueryBar & Table.ProfessionalBar

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
| queryFieldsLimit | 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口 | number | 2 |

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
| indicator | 加载指示符 | ReactElement | -      |
| spinning | 是否旋转 | boolean | -      |

更多案列和属性请参考 [Spin](/components-pro/spin/)。

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
