---
category: Pro Components
subtitle: TreeSelect
type: Data Entry
title: TreeSelect
---

Form control.

## When to use

- When the selectable data structure is a tree structure, TreeSelect can be used, similar to Select. Examples include company hierarchy, subject systems, classification directories, etc.

## API

### TreeSelect

| Parameter | Description | Type | Default |
| --- | --- | --- | --- |
| multiple | Support multiple selection (automatically becomes true when treeCheckable is set) | boolean | false |
| treeCheckable | Show checkbox | boolean | false |
| showCheckedStrategy | Defines the way selected items are backfilled. `SHOW_CHILD`: Only show child nodes. `SHOW_PARENT`: Only show parent node (when all child nodes under the parent node are selected). Default shows all selected nodes (including parent nodes). | string | SHOW_ALL |
| treeDefaultExpandAll | Expand all tree nodes by default | boolean | false |
| treeDefaultExpandedKeys | Tree nodes expanded by default, corresponding to TreeNode's key or value | string\[] | - |
| checkStrictly | Node selection is fully controlled when checkable (parent-child node selection status is no longer linked). When this property is set, showCheckedStrategy is invalid | boolean |  |
| showLine | Whether to show connecting lines | boolean \| {showLeafIcon: boolean} | false |
| async | Asynchronous loading, requires backend API support. The corresponding data source will automatically call the query API. The API parameters will include the parameter name corresponding to parentField and the parameter value corresponding to idField. The returned data will be appended to the existing data | boolean |  |
| loadData | Asynchronously load data | function(node) | - |
| optionRenderer | Hook for rendering Tree node text (differs from Select: parameters are `{ dataSet, record, text }`, no `value`) | ({ dataSet, record, text }) => ReactNode | ({ text }) => text |
| onOption | Set properties for TreeNode. See "About onOption and Tree node properties" below (differs from Select: the return value is merged into Tree node, not Select.Option) | ({ dataSet, record }) => TreeNodeProps | - |
| dropdownMenuStyle | Style of the dropdown. Will be applied as inline style to the internal Tree component (differs from Select: applied to Menu) | object |  |

#### Properties inherited from Select

The following properties inherited from Select do not take effect in TreeSelect: `selectAllButton`, `scrollLoad`, `virtual`, `optionTooltip`, `groupRenderer`, `defaultActiveFirstOption`, `reverse`.

For other property descriptions, please refer to [Select](/components-pro/select/#Select).

> Note: In TreeSelect, when `searchable` is enabled, searching will automatically expand all ancestor nodes of matching nodes.

#### About onOption and Tree node properties

TreeSelect internally uses the [Tree](/components/tree/#Tree) component to render the dropdown tree. The object returned by `onOption({ dataSet, record })` will be merged as TreeNode properties onto the corresponding node. The available TreeNode properties include:

| Parameter | Description | Type |
| --- | --- | --- |
| disabled | Whether to disable the node (disabled nodes cannot be selected or checked) | boolean |
| disableCheckbox | Disable checkbox (only effective when treeCheckable is set) | boolean |
| isLeaf | Whether it is a leaf node (ineffective in async mode, controlled internally by Tree) | boolean |
| checkable | Whether to show checkbox for the current node | boolean |
| icon | Node icon | ReactNode \| (props) => ReactNode |
| switcherIcon | Node expand/collapse switcher icon | ReactNode \| (props) => ReactNode |
| title | Node title (overrides the rendering result of optionRenderer) | ReactNode |
| className | Custom class name for the node | string |
| style | Custom style for the node | CSSProperties |

> Note: Tree component properties such as `selectedKeys`, `checkedKeys`, `expandedKeys`, `checkable`, `multiple`, `checkStrictly`, `loadData`, `showLine`, `defaultExpandAll`, `defaultExpandedKeys` are managed by TreeSelect based on its own properties and internal state. Do not override them via `onOption`.

For more properties, please refer to [TriggerField](/components-pro/trigger-field/#TriggerField).

### TreeSelect.TreeNode

| Parameter | Description | Type | Default |
| --- | --- | --- | --- |
| disableCheckbox | Disable checkbox | boolean | false |
| disabled | Whether to disable | boolean | false |
| isLeaf | Whether it is a leaf node | boolean | false |
| title | Content displayed by the tree node | string\|ReactNode | '---' |
| value | Filter based on this property value by default (the value is unique within the entire tree) | string | - |

<style>
.code-box-demo .c7n-pro-tree-select-wrapper,
.code-box-demo .c7n-pro-btn-wrapper {
  margin-bottom: .1rem;
}
</style>
