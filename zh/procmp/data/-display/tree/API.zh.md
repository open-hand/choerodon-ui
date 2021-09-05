---
title: API
---

### Tree props

| 参数                | 说明                                                      | 类型                                                                                      | 默认值   |
| ------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| dataSet             | 绑定的数据源                                              | DataSet                                                                                   |          |
| renderer            | 节点 title 渲染钩子，只在绑定数据源时起效                 | ({ dataSet, record, text }) => ReactNode                                                  |          |
| defaultExpandAll    | 默认展开所有树节点当 dataSet 绑定 expandField 时候忽略    | boolean                                                                                   | false    |
| defaultExpandedKeys | 默认展开指定的树节点当 dataSet 绑定 expandField 时候忽略  | string[]                                                                                  | []       |
| defaultCheckedKeys  | 默认选中复选框的树节点当 dataSet 绑定 checkField 时候忽略 | string[]                                                                                  | []       |
| defaultSelectKeys   | 默认选择节点当，默认绑定 dataSet 的 idField               | string[]                                                                                  | []       |
| treeNodeRenderer    | 对于 Treenode 结点的渲染覆盖                              | (({ record, dataSet }) => TreeNodeRendererProps ) | () => {} |
| selectable | 是否可选中 | boolean | true | 1.4.4 |

### TreeNodeRenderer Props

| 参数            | 说明                                               | 类型                                | 默认值                                      |
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

### DataSet 相关

| 参数       | 说明                                                                           | 类型                |
| ---------- | ------------------------------------------------------------------------------ | ------------------- | 
| titleField | 节点文字对应数据源的字段，只在绑定数据源时起效                                 | string              |   
| selection  | selection 为 false Tree checkable 为 true 可以实现整个 treenode 点击触发 check | string \| boolean |  

更多案例和属性请参考 [Tree](/zh/cmp/data-display/tree/)。
