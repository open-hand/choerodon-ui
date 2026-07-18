---
category: Pro Components
subtitle: 树形选择框
type: Data Entry
title: TreeSelect
---

表单控件。

## 何时使用

- 类似 Select 的选择控件，可选择的数据结构是一个树形结构时，可以使用 TreeSelect，例如公司层级、学科系统、分类目录等等。

## API

### TreeSelect

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| multiple | 支持多选（当设置 treeCheckable 时自动变为 true）|	boolean |	false |
| treeCheckable | 显示 checkbox | boolean | false |
| showCheckedStrategy | 定义选中项回填的方式。`SHOW_CHILD`: 只显示子节点. `SHOW_PARENT`: 只显示父节点(当父节点下所有子节点都选中时). 默认显示所有选中节点(包括父节点). | string | SHOW_ALL |
| treeDefaultExpandAll | 默认展开所有树节点 | boolean | false |
| treeDefaultExpandedKeys | 默认展开的树节点, 对应TreeNode的key或value | string\[] | - |
| checkStrictly | checkable 状态下节点选择完全受控（父子节点选中状态不再关联）。此属性设置后 showCheckedStrategy 属性无效 | boolean |  |
| showLine | 是否展示连接线 | boolean \| {showLeafIcon: boolean} | false |
| async | 异步加载，需要后端接口配合，对应的数据源会自动调用查询接口，接口参数中会带有 parentField 对应的参数名和 idField 对应的参数值，接口返回的数据会附加到已有的数据之中 | boolean |  |
| loadData | 异步加载数据 | function(node) | - |
| optionRenderer | 渲染 Tree 节点文本的钩子（不同于 Select：参数为 `{ dataSet, record, text }`，无 `value`） | ({ dataSet, record, text }) => ReactNode | ({ text }) => text |
| onOption | 设置 TreeNode 节点的属性，详见下方"关于 onOption 与 Tree 节点属性"（不同于 Select：返回值会合并到 Tree 节点，而非 Select.Option） | ({ dataSet, record }) => TreeNodeProps | - |
| dropdownMenuStyle | 下拉框样式，会作为内联 style 作用于内部 Tree 组件（不同于 Select：作用于 Menu） | object |  |

#### 继承自 Select 的属性

下列继承自 Select 的属性在 TreeSelect 中不生效：`selectAllButton`、`scrollLoad`、`virtual`、`optionTooltip`、`groupRenderer`、`defaultActiveFirstOption`、`reverse`。

其他具体属性描述请参考 [Select](/components-pro/select/#Select)。

> 说明：在 TreeSelect 中，`searchable` 开启搜索时会自动展开所有匹配节点的祖先节点。

#### 关于 onOption 与 Tree 节点属性

TreeSelect 内部使用 [Tree](/components/tree/#Tree) 组件渲染下拉树，通过 `onOption({ dataSet, record })` 返回的对象会作为 TreeNode 的属性合并到对应节点上。可返回的 TreeNode 相关属性包括：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| disabled | 是否禁用节点（禁用后不可选中、不可勾选） | boolean |
| disableCheckbox | 禁掉 checkbox（仅 treeCheckable 时生效） | boolean |
| isLeaf | 是否为叶子节点（async 模式下失效，由 Tree 内部控制） | boolean |
| checkable | 当前节点是否显示 checkbox | boolean |
| icon | 节点图标 | ReactNode \| (props) => ReactNode |
| switcherIcon | 节点展开/折叠的切换图标 | ReactNode \| (props) => ReactNode |
| title | 节点标题（会覆盖 optionRenderer 的渲染结果） | ReactNode |
| className | 节点自定义类名 | string |
| style | 节点自定义样式 | CSSProperties |

> 注意：`selectedKeys`、`checkedKeys`、`expandedKeys`、`checkable`、`multiple`、`checkStrictly`、`loadData`、`showLine`、`defaultExpandAll`、`defaultExpandedKeys` 等 Tree 组件属性由 TreeSelect 根据自身属性及内部状态统一管理，请勿通过 `onOption` 覆盖。

更多属性请参考 [TriggerField](/components-pro/trigger-field/#TriggerField)。

### TreeSelect.TreeNode

| 参数  | 说明       | 类型   | 默认值 |
| ----- | ---------- | ------ | ------ |
| disableCheckbox | 禁掉 checkbox | boolean | false |
| disabled | 是否禁用 | boolean | false |
| isLeaf | 是否是叶子节点 | boolean | false |
| title | 树节点显示的内容 | string\|ReactNode | '---' |
| value | 默认根据此属性值进行筛选（其值在整个树范围内唯一） | string | - |

<style>
.code-box-demo .c7n-pro-tree-select-wrapper,
.code-box-demo .c7n-pro-btn-wrapper {
  margin-bottom: .1rem;
}
</style>
