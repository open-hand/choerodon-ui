---
title: API
---

### Tree props

| Property            | Description                                                                                            | Type                                                                                      | Default  | Version |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------- | -------- |
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
| autoExpandParent | Whether to automatically expand a parent treeNode | boolean | true |
| blockNode | Whether treeNode fill remaining horizontal space | boolean | false |
| checkable | Adds a `Checkbox` before the treeNodes | boolean | false |
| checkedKeys | (Controlled) Specifies the keys of the checked treeNodes (PS: When this specifies the key of a treeNode which is also a parent treeNode, all the children treeNodes of will be checked; and vice versa, when it specifies the key of a treeNode which is a child treeNode, its parent treeNode will also be checked. When `checkable` and `checkStrictly` is true, its object has `checked` and `halfChecked` property. Regardless of whether the child or parent treeNode is checked, they won't impact each other. | string\[] \| {checked: string\[], halfChecked: string\[]} | \[] |
| checkStrictly | Check treeNode precisely; parent treeNode and children treeNodes are not associated(If the `DataSet` is associated and `checkField` is set, the `treeCheckStrictly` property needs to be set in the `DataSet`) | boolean | false |
| defaultExpandParent | auto expand parent treeNodes when init | bool | true |
| defaultSelectedKeys | Specifies the keys of the default selected treeNodes | string\[] | \[] |
| disabled | whether disabled the tree | bool | false |
| draggable | Specifies whether this Tree is draggable (IE > 8) | boolean \| ((node?: DataNode) => boolean) \| {nodeDraggable: boolean \| ((node?: DataNode) => boolean), icon: boolean \| ReactNode} | false |
| expandedKeys | (Controlled) Specifies the keys of the expanded treeNodes | string\[] | \[] |
| filterTreeNode | Defines a function to filter (highlight) treeNodes. When the function returns `true`, the corresponding treeNode will be highlighted | function(node) | - |
| loadData | Load data asynchronously | function(node) | - |
| loadedKeys | (Controlled) Set loaded tree nodes. Need work with `loadData` | string\[] | \[] |
| multiple | Allows selecting multiple treeNodes | boolean | false |
| selectedKeys | (Controlled) Specifies the keys of the selected treeNodes | string\[] | - |
| showIcon | Shows the icon before a TreeNode's title. There is no default style; you must set a custom style for it if set to `true` | boolean | false |
| switcherIcon | customize collapse/expand icon of tree node | React.ReactElement | - |
| showLine | Shows a connecting line | boolean \| {showLeafIcon: boolean} | false |
| onCheck | 点击复选框触发`(oldCheckedKeys 1.4.4新增)` | function(checkedKeys, e:{checked: bool, checkedNodes, node, event, halfCheckedKeys}, oldCheckedKeys) | - |
| onDragEnd | Callback function for when the onDragEnd event occurs | function({event, node}) | - |
| onDragEnter | Callback function for when the onDragEnter event occurs | function({event, node, expandedKeys}) | - |
| onDragEnterBefore | dragenter 触发完成前调用。可用于处理是否允许拖到节点上方，拖入节点或者拖入到下方。参数中的 dragNode 是拖拽的节点信息，node 是拖入的节点信息，其中 node 中的 dragOver 代表是否拖入，dragOverGapTop 是否拖入到节点上方，dragOverGapBottom 是否拖入节点下方 | function({event, node, dragNode, dragNodesKeys}) => boolean | - | 1.6.6 |
| onDragLeave | Callback function for when the onDragLeave event occurs | function({event, node}) | - |
| onDragOver | Callback function for when the onDragOver event occurs | function({event, node}) | - |
| onDragOverBefore | dragover 触发完成前调用。可用于处理是否允许拖到节点上方，拖入节点或者拖入到下方。参数中的 dragNode 是拖拽的节点信息，node 是拖入的节点信息，其中 node 中的 dragOver 代表是否拖入，dragOverGapTop 是否拖入到节点上方，dragOverGapBottom 是否拖入节点下方 | function({event, node, dragNode, dragNodesKeys}) => boolean | - | 1.6.6 |
| onDragStart | Callback function for when the onDragStart event occurs | function({event, node}) | - |
| onDrop | Callback function for when the onDrop event occurs | function({event, node, dragNode, dragNodesKeys}) | - |
| onDropBefore(1.5.0) | Callback function for when the onDrop before event occurs | ({event, node, dragNode, dragNodesKeys}) => boolean | - |
| onExpand | Callback function for when a treeNode is expanded or collapsed | function(expandedKeys, {expanded: bool, node}) | - |
| onLoad | Callback function for when a treeNode is loaded | function(loadedKeys, {event, node}) | - |
| onRightClick | Callback function for when the user right clicks a treeNode | function({event, node}) | - |
| onSelect | Callback function for when the user clicks a treeNode | function(selectedKeys, e:{selected: bool, selectedNodes, node, event}) | - |
| treeData | treeNodes data Array, if set it then you need not to construct children TreeNode. (key should be unique across the whole array) | array\<{ key, title, children, \[disabled, selectable] }> | - |
| checkboxPosition | checkbox 显示位置：默认显示在折叠 icon 后面；设置 left 显示在最前面左对齐 | 'default' \| 'left' | [全局配置](/en/procmp/configure/configure) treeCheckboxPosition | 1.6.5 |

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
| key | Used with (default)ExpandedKeys / (default)CheckedKeys / (default)SelectedKeys. P.S.: It must be unique in all of treeNodes of the tree! | string | internal calculated position of treeNode |  |
| selectable | Set whether the treeNode can be selected | boolean | true |  |

### DataSet related

| 属性名       | 说明                                                                                                   | 类型              | 
| ---------- | ------------------------------------------------------------------------------------------------------ | ----------------- |         
| selection  | selection is false Tree checkable is true ,You can implement the whole treenode click to trigger check | string\|\|boolean |       

dataSet The data format adopts a flat structure, and there is a structure of Id and parentId

### DirectoryTree props

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| expandAction | Directory open logic, optional `false` `'click'` `'doubleClick'` | string | click |

## Note


The number of treeNodes can be very large, but when `checkable=true`, it will increase the compute time. So, we cache some calculations (e.g. `this.treeNodesStates`) to avoid double computing. But, this brings some restrictions. **When you load treeNodes asynchronously, you should render tree like this**:


```jsx
{
  this.state.treeData.length ? (
    <Tree>
      {this.state.treeData.map(data => (
        <TreeNode />
      ))}
    </Tree>
  ) : (
    'loading tree'
  );
}
```

## FAQ

### How to hide file icon when use showLine?


File icon realize by using switcherIcon. You can overwrite the style to hide it


### Why defaultExpandedAll not working on ajax data?

`default` prefix prop only works when inited. So `defaultExpandedAll` has already executed when ajax load data. You can control `expandedKeys` or render Tree when data loaded to realize expanded all.
