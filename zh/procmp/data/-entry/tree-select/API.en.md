---
title: API
---

### TreeSelect

| 属性名 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| multiple | 支持多选（当设置 treeCheckable 时自动变为 true）|	boolean |	false   | 1.0.0  |
| showCheckedStrategy | 定义选中项回填的方式。SHOW_CHILD: 只显示子节点. SHOW_PARENT: 只显示父节点(当父节点下所有子节点都选中时). 默认显示所有选中节点(包括父节点). | string | SHOW_ALL |  1.4.1  |
| treeCheckable | 显示 checkbox | boolean | false | 1.0.0 |
| treeDefaultExpandAll | 默认展开所有树节点 | boolean | false | 1.0.0 |
| treeDefaultExpandedKeys | 默认展开的树节点, 对应TreeNode的key或value | string\[] | - | 1.0.0  |
| checkStrictly | checkable 状态下节点选择完全受控（父子节点选中状态不再关联）。此属性设置后 showCheckedStrategy 属性无效 | boolean |  | 1.6.4 |
| showLine | 是否展示连接线 | boolean \| {showLeafIcon: boolean} | false | 1.6.7 |

更多属性请参考  [Select](/zh/procmp/data-entry/select/#Select)。

### TreeSelect.TreeNode

| 属性名 | 说明       | 类型   | 默认值 |
| ----- | ---------- | ------ | ------ |
| disableCheckbox | 禁掉 checkbox | boolean | false |
| disabled | 是否禁用 | boolean | false |
| isLeaf | 是否是叶子节点 | boolean | false |
| title | 树节点显示的内容 | string\|ReactNode | |
| value | 默认根据此属性值进行筛选（其值在整个树范围内唯一） | string | |
