---
category: Pro Components
type: Data Display
title: Tree
---

## When To Use

Almost anything can be represented in a tree structure. Examples include directories, organization hierarchies, biological classifications, countries, etc. The `Tree` component is a way of representing the hierarchical relationship between these things. You can also  expand, collapse, and select a treeNode within a `Tree`.

## API

### Tree props

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| dataSet | The data source binded to the tree. | DataSet |  |
| renderer | Node render hooks, only works when binding data sources. | ({ dataSet, record, text }) => ReactNode |  |
| titleField | The node text corresponds to the field of the data source and only works when binding the data source. | string |  |

More cases and properties please refer to [Tree](/components/tree/)。
