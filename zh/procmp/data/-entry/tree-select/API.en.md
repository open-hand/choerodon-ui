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
| optionRenderer | Hook for rendering Tree node text (differs from Select: parameters are `{ dataSet, record, text }`, no `value`) | ({ dataSet, record, text }) => ReactNode | ({ text }) => text | 1.6.9 |
| onOption | Set properties for TreeNode. See "About onOption and Tree node properties" below (differs from Select: the return value is merged into Tree node, not Select.Option) | ({ dataSet, record }) => TreeNodeProps | - | 1.6.9 |
| dropdownMenuStyle | Style of the dropdown. Will be applied as inline style to the internal Tree component (differs from Select: applied to Menu) | object |  | 1.6.9 |

#### Properties inherited from Select

The following properties inherited from Select do not take effect in TreeSelect: `selectAllButton`, `scrollLoad`, `virtual`, `optionTooltip`, `groupRenderer`, `defaultActiveFirstOption`, `reverse`.

For other property descriptions, please refer to [Select](/en/procmp/data-entry/select/#Select).

> Note: In TreeSelect, when `searchable` is enabled, searching will automatically expand all ancestor nodes of matching nodes.

#### About onOption and Tree node properties

TreeSelect internally uses the [Tree](/en/cmp/data-display/tree/#Tree) component to render the dropdown tree. The object returned by `onOption({ dataSet, record })` will be merged as TreeNode properties onto the corresponding node. The available TreeNode properties include:

| Parameter | Description | Type | Version |
| --- | --- | --- | --- |
| disabled | Whether to disable the node (disabled nodes cannot be selected or checked) | boolean | 1.6.9 |
| disableCheckbox | Disable checkbox (only effective when treeCheckable is set) | boolean | 1.6.9 |
| isLeaf | Whether it is a leaf node. With async or loadData enabled, leaf status is not inferred by default; onOption can still set it explicitly. | boolean | 1.6.9 |
| checkable | Whether to show checkbox for the current node | boolean | 1.6.9 |
| icon | Node icon | ReactNode \| (props) => ReactNode | 1.6.9 |
| switcherIcon | Node expand/collapse switcher icon | ReactNode \| (props) => ReactNode | 1.6.9 |
| title | Node title (overrides the rendering result of optionRenderer) | ReactNode | 1.6.9 |
| className | Custom class name for the node | string | 1.6.9 |
| style | Custom style for the node | CSSProperties | 1.6.9 |

> Note: Tree component properties such as `selectedKeys`, `checkedKeys`, `expandedKeys`, `checkable`, `multiple`, `checkStrictly`, `loadData`, `showLine`, `defaultExpandAll`, `defaultExpandedKeys` are managed by TreeSelect based on its own properties and internal state. Do not override them via `onOption`.

For more properties, please refer to [TriggerField](/en/procmp/abstract/trigger-field/#TriggerField).

### TreeSelect.TreeNode

| Property | Description | Type | Default |
| ----- | ---------- | ------ | ------ |
| disableCheckbox | Disable checkbox | boolean | false |
| disabled | Disabled | boolean | false |
| isLeaf | Whether leaf node | boolean | false |
| title | Content displayed by tree node | string\|ReactNode | |
| value | By default, filter by this property (unique across the tree) | string | |
