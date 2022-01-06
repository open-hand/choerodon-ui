---
title: API
---

### Tree props

| Property            | Description                                                                                            | Type                                                                                      | Default  |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- |
| dataSet             | The data source binded to the tree.                                                                    | DataSet                                                                                   |          |
| renderer            | Node render hooks, only works when binding data sources.                                               | ({ dataSet, record, text }) => ReactNode                                                  |          |
| titleField          | The node text corresponds to the field of the data source and only works when binding the data source. | string                                                                                    |          |
| defaultExpandAll    | defalut expand all the node , when dataSet bind expandField ignore it                                  | boolean                                                                                   | false    |
| defaultExpandedKeys | defalut expand these node dataSetbind expandField ignore it                                            | string[]                                                                                  | []       |
| defaultCheckedKeys  | defalut check these node when dataSet bind checkField ignore it                                        | string[]                                                                                  | []       |
| defaultSelectKeys   | defalut select these node when dataSet bind idField ignore it                                          | string[]                                                                                  | []       |
| onTreeNode(1.1.0)    | customize cover Tree node props                                                                        | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps ) | () => {} |
| async | Asynchronous loading requires the cooperation of the back-end interface. The corresponding data source will automatically call the query interface. The interface parameters will contain the parameter name corresponding to parentField and the parameter value corresponding to idField. The data returned by the interface will be appended to the existing data. | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps )|() => {} |
| selectable(1.4.4) | 是否可选中 | boolean | true |
| filter(1.5.0) | 数据过滤， 返回值 true - 显示 false - 不显示 | (record) => boolean | |

### TreeNodeRenderer props

| Property        | Description                                                                                               | Type                                | Default                                     |
| --------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------- |
| checkable       | When Tree is checkable, set TreeNode display Checkbox or not                                              | boolean                             | -                                           |
| disableCheckbox | Disables the checkbox of the treeNode                                                                     | boolean                             | false                                       |  |
| disabled        | Disables the treeNode                                                                                     | boolean                             | false                                       |  |
| icon            | customize icon. When you pass component, whose render will receive full TreeNode props as component props | ReactNode/Function(props):ReactNode | -                                           |  |
| isLeaf          | Determines if this is a leaf node(effective when loadData is specified)                                 | boolean                             | false                                       |  |
| title           | Title                                                                                                     | string\|ReactNode                   | '---'                                       |  |
| switcherIcon    | customize node expand icon                                                                                | React.ReactNode                     | ((props: TreeNodeProps) => React.ReactNode) |  |
| className       | child node classname                                                                                      | string                              |                                             |
| style           | child node style                                                                                          | React.CSSProperties                 |                                             |

### DataSet related

| 参数       | 说明                                                                                                   | 类型              | 
| ---------- | ------------------------------------------------------------------------------------------------------ | ----------------- |         
| selection  | selection is false Tree checkable is true ,You can implement the whole treenode click to trigger check | string\|\|boolean |       

dataSet The data format adopts a flat structure, and there is a structure of Id and parentId

More cases and properties please refer to [Tree](/zh/cmp/data-display/tree/)。
