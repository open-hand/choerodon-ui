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
| multiple | 支持多选（当设置 treeCheckable 时自动变为 true）|	boolean |	false
| showCheckedStrategy | 定义选中项回填的方式。`SHOW_CHILD`: 只显示子节点. `SHOW_PARENT`: 只显示父节点(当父节点下所有子节点都选中时). 默认显示所有选中节点(包括父节点). | string | SHOW_ALL |
| treeCheckable | 显示 checkbox | boolean | false |
| treeDefaultExpandAll | 默认展开所有树节点 | boolean | false |
| treeDefaultExpandedKeys | 默认展开的树节点, 对应TreeNode的key或value | string\[] | - |
| checkStrictly | checkable 状态下节点选择完全受控（父子节点选中状态不再关联）。此属性设置后 showCheckedStrategy 属性无效 | boolean |  |

更多属性请参考 [Select](/components-pro/select/#Select)。

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
