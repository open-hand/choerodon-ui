---
title: API
---

### TreeSelect

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| multiple | Support multiple selection (automatically true when treeCheckable is set) | boolean | false   | 1.0.0  |
| showCheckedStrategy | Defines how selected items are displayed. SHOW_CHILD: show only child nodes. SHOW_PARENT: show only parent nodes (when all child nodes under parent are selected). Default shows all selected nodes (including parent nodes). | string | SHOW_ALL |  1.4.1  |
| treeCheckable | Show checkbox | boolean | false | 1.0.0 |
| treeDefaultExpandAll | Expand all tree nodes by default | boolean | false | 1.0.0 |
| treeDefaultExpandedKeys | Default expanded tree nodes, corresponding to TreeNode key or value | string\[] | - | 1.0.0  |
| checkStrictly | In checkable state, node selection is fully controlled (parent-child selection states no longer linked). When set, showCheckedStrategy is ineffective. | boolean |  | 1.6.4 |
| showLine | Whether to display connecting lines | boolean \| {showLeafIcon: boolean} | false | 1.6.7 |
| async | Asynchronous loading requires the cooperation of the back-end interface. The corresponding data source will automatically call the query interface. The interface parameters will contain the parameter name corresponding to parentField and the parameter value corresponding to idField. The data returned by the interface will be appended to the existing data. | boolean |  |  |
| loadData | Load data asynchronously | function(node) | - |  |

For more properties, please refer to [Select](/en/procmp/data-entry/select/#Select).

### TreeSelect.TreeNode

| Property | Description | Type | Default |
| ----- | ---------- | ------ | ------ |
| disableCheckbox | Disable checkbox | boolean | false |
| disabled | Disabled | boolean | false |
| isLeaf | Whether leaf node | boolean | false |
| title | Content displayed by tree node | string\|ReactNode | |
| value | By default, filter by this property (unique across the tree) | string | |
