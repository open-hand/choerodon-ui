---
title: API
---

### Tree props

| 属性名 | 说明                                                      | 类型                                                                                      | 默认值   | 版本 |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- | -------- |
| dataSet             | 绑定的数据源                                              | DataSet                                                                                   |          |
| renderer            | 节点 title 渲染钩子，只在绑定数据源时起效                 | ({ dataSet, record, text }) => ReactNode                                                  |          |
| titleField          | 节点文字对应数据源的字段，只在绑定数据源时起效              | string                                                                                    |        |
| defaultExpandAll    | 默认展开所有树节点当 dataSet 绑定 expandField 时候忽略    | boolean                                                                                   | false    |
| defaultExpandedKeys | 默认展开指定的树节点当 dataSet 绑定 expandField 时候忽略  | string[]                                                                                  | []       |
| defaultCheckedKeys  | 默认选中复选框的树节点当 dataSet 绑定 checkField 时候忽略 | string[]                                                                                  | []       |
| defaultSelectKeys   | 默认选择节点当，默认绑定 dataSet 的 idField               | string[]                                                                                  | []       |
| onTreeNode(1.1.0) | 对于 TreeNode 结点的属性覆盖 | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps ) | () => {} |
| async | 异步加载，需要后端接口配合，对应的数据源会自动调用查询接口，接口参数中会带有 parentField 对应的参数名和 idField 对应的参数值，接口返回的数据会附加到已有的数据之中 | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps )|() => {} |
| selectable(1.4.4) | 是否可选中 | boolean | true |
| filter(1.5.0) | 数据过滤， 返回值 true - 显示 false - 不显示 | (record) => boolean | |
| autoExpandParent | 是否自动展开父节点 | boolean | true |
| blockNode | 是否节点占据一行 | boolean | false |
| checkable | 节点前添加 Checkbox 复选框 | boolean | false |
| checkedKeys | （受控）选中复选框的树节点（注意：父子节点有关联，如果传入父节点 key，则子节点自动选中；相应当子节点 key 都传入，父节点也自动选中。当设置`checkable`和`checkStrictly`，它是一个有`checked`和`halfChecked`属性的对象，并且父子节点的选中与否不再关联 | string\[] \| {checked: string\[], halfChecked: string\[]} | \[] |
| checkStrictly | checkable 状态下节点选择完全受控（父子节点选中状态不再关联）（如果关联了 DataSet, 且设置了 checkField, 需要在 DataSet 设置 treeCheckStrictly 属性） | boolean | false |
| defaultExpandParent | 默认展开父节点 | bool | true |
| defaultSelectedKeys | 默认选中的树节点 | string\[] | \[] |
| disabled | 将树禁用 | bool | false |
| draggable | 设置节点可拖拽（IE>8） | boolean \| ((node?: DataNode) => boolean) \| {nodeDraggable: boolean \| ((node?: DataNode) => boolean), icon: boolean \| ReactNode} | false |
| expandedKeys | （受控）展开指定的树节点 | string\[] | \[] |
| filterTreeNode | 按需筛选树节点,配置后返回 true 的会新增类名上去（高亮） | function(node) | - |
| loadData | 异步加载数据 | function(node) | - |
| loadedKeys | （受控）已经加载的节点，需要配合 `loadData` 使用 | string\[] | \[] |
| multiple | 支持点选多个节点（节点本身） | boolean | false |
| selectedKeys | （受控）设置选中的树节点 | string\[] | - |
| showIcon | 是否展示 TreeNode title 前的图标，没有默认样式，如设置为 true，需要自行定义图标相关样式 | boolean | false |
| switcherIcon | 自定义树节点的展开/折叠图标 | React.ReactElement | - |
| showLine | 是否展示连接线 | boolean \| {showLeafIcon: boolean} | false |
| onCheck | 点击复选框触发`(1.4.4新增 oldCheckedKeys参数)` | function(checkedKeys, e:{checked: bool, checkedNodes, node, event, halfCheckedKeys}, oldCheckedKeys) | - |
| onDragEnd | dragend 触发时调用 | function({event, node}) | - |
| onDragEnter | dragenter 触发时调用 | function({event, node, expandedKeys}) | - |
| onDragEnterBefore | dragenter 触发完成前调用。可用于处理是否允许拖到节点上方，拖入节点或者拖入到下方。参数中的 dragNode 是拖拽的节点信息，node 是拖入的节点信息，其中 node 中的 dragOver 代表是否拖入，dragOverGapTop 是否拖入到节点上方，dragOverGapBottom 是否拖入节点下方 | function({event, node, dragNode, dragNodesKeys}) => boolean | - | 1.6.6 |
| onDragLeave | dragleave 触发时调用 | function({event, node}) | - |
| onDragOver | dragover 触发时调用 | function({event, node}) | - |
| onDragStart | 开始拖拽时调用 | function({event, node}) | - |
| onDragOverBefore | dragover 触发完成前调用。可用于处理是否允许拖到节点上方，拖入节点或者拖入到下方。参数中的 dragNode 是拖拽的节点信息，node 是拖入的节点信息，其中 node 中的 dragOver 代表是否拖入，dragOverGapTop 是否拖入到节点上方，dragOverGapBottom 是否拖入节点下方 | function({event, node, dragNode, dragNodesKeys}) => boolean | - | 1.6.6 |
| onDrop | drop 触发时调用 | function({event, node, dragNode, dragNodesKeys}) | - |
| onDropBefore(1.5.0) | drop 触发之前时调用 | ({event, node, dragNode, dragNodesKeys}) => boolean | - |
| onExpand | 展开/收起节点时触发 | function(expandedKeys, {expanded: bool, node}) | - |
| onLoad | 节点加载完毕时触发 | function(loadedKeys, {event, node}) | - |
| onRightClick | 响应右键点击 | function({event, node}) | - |
| onSelect | 点击树节点触发 | function(selectedKeys, e:{selected: bool, selectedNodes, node, event}) | - |
| treeData | treeNodes 数据，如果设置则不需要手动构造 TreeNode 节点（key 在整个树范围内唯一） | array\<{key, title, children, \[disabled, selectable]}> | - |
| checkboxPosition | checkbox 显示位置：默认显示在折叠 icon 后面；设置 left 显示在最前面左对齐 | 'default' \| 'left' | [全局配置](/zh/procmp/configure/configure) treeCheckboxPosition | 1.6.5 |

### TreeNodeRenderer Props

| 属性名            | 说明                                               | 类型                                | 默认值                                      |
| --------------- | -------------------------------------------------- | ----------------------------------- | ------------------------------------------- |
| checkable       | 当树为 checkable 时，设置独立节点是否展示 Checkbox | boolean                             |                                            |
| disableCheckbox | 禁掉 checkbox                                      | boolean                             | false                                       |
| disabled        | 禁掉响应                                           | boolean                             | false                                       |
| icon            | 自定义图标。可接收组件，props 为当前节点 props     | ReactNode/Function(props):ReactNode |                                            |
| isLeaf          | 设置为叶子节点(设置了loadData时有效)             | boolean                             | false                                       |
| title           | 标题                                               | string\|ReactNode                   |                                        |
| switcherIcon    | 自定义树节点的展开/折叠图标                        | React.ReactNode                     | ((props: TreeNodeProps) => React.ReactNode) |  |
| className       | 子节点类名                                         | string                              |                                             |
| style           | 子节点样式                                         | React.CSSProperties                 |                                             |
| key | 被树的 (default)ExpandedKeys / (default)CheckedKeys / (default)SelectedKeys 属性所用。注意：整个树范围内的所有节点的 key 值不能重复！ | string | 内部计算出的节点位置 |
| selectable | 设置节点是否可被选中 | boolean | true |

### DataSet 相关

| 属性名       | 说明                                                                           | 类型                |
| ---------- | ------------------------------------------------------------------------------ | ------------------- | 
| selection  | selection 为 false Tree checkable 为 true 可以实现整个 treenode 点击触发 check | string \| boolean |  

### DirectoryTree props

| 属性名        | 说明                                                 | 类型   | 默认值 |
| ------------ | ---------------------------------------------------- | ------ | ------ |
| expandAction | 目录展开逻辑，可选 `false` `'click'` `'doubleClick'` | string | click  |

## 注意


在之前：树节点可以有很多，但在设置`checkable`时，将会花费更多的计算时间，因此我们缓存了一些计算结果（`this.treeNodesStates`）来复用，避免多次重复计算，以此提高性能。但这也带来了一些限制，当你异步加载树节点时，你需要这样渲染树：


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

### 在 showLine 时，如何隐藏子节点图标？

文件图标通过 switcherIcon 来实现，如果不需要你可以覆盖对应的样式：https://codesandbox.io/s/883vo47xp8

### defaultExpandedAll 在异步加载数据时为何不生效？

`default` 前缀属性只有在初始化时生效，因而异步加载数据时 `defaultExpandedAll` 已经执行完成。你可以通过受控 `expandedKeys` 或者在数据加载完成后渲染 Tree 来实现全部展开。
