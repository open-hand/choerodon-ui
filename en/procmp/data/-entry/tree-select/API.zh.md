---
title: API
---

### TreeSelect

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| treeCheckable | 显示 checkbox | boolean | false |
| treeDefaultExpandAll | 默认展开所有树节点 | boolean | false |
| treeDefaultExpandedKeys | 默认展开的树节点, 对应TreeNode的key或value | string\[] | - |

更多属性请参考  [Select](/zh/procmp/data-entry/select/#Select)。

### TreeSelect.TreeNode

| 参数  | 说明       | 类型   | 默认值 |
| ----- | ---------- | ------ | ------ |
| disableCheckbox | 禁掉 checkbox | boolean | false |
| disabled | 是否禁用 | boolean | false |
| isLeaf | 是否是叶子节点 | boolean | false |
| title | 树节点显示的内容 | string\|ReactNode | |
| value | 默认根据此属性值进行筛选（其值在整个树范围内唯一） | string | |
