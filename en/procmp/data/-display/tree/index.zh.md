---
title: Tree
subtitle: 树形控件
order: 0
---

## 何时使用

文件夹、组织架构、生物分类、国家地区等等，世间万物的大多数结构都是树形结构。使用`树控件`可以完整展现其中的层级关系，并具有展开收起选择等交互功能。

 - Tree 组件关联 dataSet，数据形式可采用打平或属性嵌套的结构。
    -  打平数据通过 Id 和 parentId 字段声明来帮助组件内部构成树形处理
    -  嵌套数据通过 childrenField 字段声明来帮助组件内部构成树形处理
 > 字段属性详解：https://open.hand-china.com/choerodon-ui/zh/datasetapi/dataset-props/id-field
 > 官网 mock 源数据 https://github.com/open-hand/choerodon-ui/blob/master/site/theme/mock/tree.js


