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
| defaultExpandAll | defalut expand all the node , when dataSet bind expandField ignore it | boolean | false |
| defaultExpandedKeys | defalut expand these node dataSetbind expandField ignore it  | string[]	| [] |
| defaultCheckedKeys | defalut check these node when dataSet bind checkField ignore it  | string[] | [] |
| defaultSelectKeys | defalut select these node when dataSet bind idField ignore it | string[] | [] |

### DataSet related

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| titleField | when there have dataSet ,the node text would bing titleField | string |  |
| selection | selection is false  Tree checkable is true ,You can implement the whole treenode click to trigger check   | string\|\|boolean | - |

More cases and properties please refer to [Tree](/components/tree/)。
