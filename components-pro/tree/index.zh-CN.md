---
category: Pro Components
type: Data Display
title: Tree
subtitle: 树形控件
---

## 何时使用

文件夹、组织架构、生物分类、国家地区等等，世间万物的大多数结构都是树形结构。使用`树控件`可以完整展现其中的层级关系，并具有展开收起选择等交互功能。如果不想使用dataSet绑定tree组件推荐使用基础组件的tree可以获得更多的视图控制权。

## API

### Tree props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| dataSet | 绑定的数据源 | DataSet |  |
| renderer | 节点title渲染钩子，只在绑定数据源时起效 | ({ dataSet, record, text }) => ReactNode |  |
| titleField | 节点文字对应数据源的字段，只在绑定数据源时起效 | string |  |
| defaultExpandAll | 默认展开所有树节点当dataSet绑定expandField 时候忽略 | boolean | false |
| defaultExpandedKeys | 默认展开指定的树节点当dataSet绑定expandField 时候忽略 | string[]	| [] |
| defaultCheckedKeys | 默认选中复选框的树节点当dataSet绑定checkField 时候忽略 | string[] | [] |
| defaultSelectKeys | 默认选择节点当，默认绑定dataSet的 idField | string[] | [] |
| onTreeNode(1.1.0) | 对于 TreeNode 结点的属性覆盖 | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps )|() => {} |
| async | 异步加载，需要后端接口配合，对应的数据源会自动调用查询接口，接口参数中会带有 parentField 对应的参数名和 idField 对应的参数值，接口返回的数据会附加到已有的数据之中 | ((props: {record?: Record \| null;dataSet?: DataSet \| null;}) => TreeNodeRendererProps )|() => {} |
| selectable | 是否可选中 | boolean | true |
| filter | 数据过滤， 返回值 true - 显示 false - 不显示 | (record) => boolean |  |
| checkboxShowBefore | checkbox 是否显示在最前面 | boolean |  |

### TreeNodeRenderer Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checkable | 当树为 checkable 时，设置独立节点是否展示 Checkbox | boolean | - |
| disableCheckbox | 禁掉 checkbox | boolean | false |
| disabled | 禁掉响应 | boolean | false |
| icon | 自定义图标。可接收组件，props 为当前节点 props | ReactNode/Function(props):ReactNode | - |
| isLeaf | 设置为叶子节点(设置了`loadData`时有效) | boolean | false |
| title | 标题 | string\|ReactNode | '---' |
| switcherIcon | 自定义树节点的展开/折叠图标 | React.ReactNode | ((props: TreeNodeProps) => React.ReactNode) |  |
| className | 子节点类名 | string |  |
| style | 子节点样式 | React.CSSProperties  |  |

### DataSet 相关

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| selection | selection 为 false  Tree checkable 为 true 可以实现整个treenode点击触发check  | string \|\| boolean | - |

更多案列和属性请参考 [Tree](/components/tree/)。



