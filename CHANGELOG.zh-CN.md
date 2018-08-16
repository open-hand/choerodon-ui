---
order: 6
title: 更新日志
toc: false
timeline: true
---

`choerodon-ui` 严格遵循 [Semantic Versioning 2.0.0](http://semver.org/lang/zh-CN/) 语义化版本规范。

#### 发布周期

* 修订版本号：每周末会进行日常 bugfix 更新。（如果有紧急的 bugfix，则任何时候都可发布）
* 次版本号：每月发布一个带有新特性的向下兼容的版本。
* 主版本号：含有破坏性更新和新特性，不在发布周期内。

---

##

`2018-08-16`

- 🌟 `Icon`: 增加新的图标。

## 0.3.5

`2018-08-03`

- 💄 `Switch`: 样式修改。
- 🌟 `Icon`: 增加新的图标。

## 0.3.4

`2018-07-19`

- 🌟 `Icon`: 增加新的图标。

## 0.3.3

`2018-07-06`

- 🌟 `Select`: 增加 `onChoiceRemove` 属性。
- 🌟 `Input`: 增加 `showLengthInfo` 属性。
- 🌟 `Modal`: 增加 `center` 属性。
- 💄 `Select`: 样式调整。
- 💄 `Tree`: 样式调整。
- 💄 `Modal.Sidebar`: 样式调整。
- 💄 `InputNumber`: 样式调整。
- 💄 `Select`: 实现 `filterInput` 自动获取焦点。
- 🐞 `Table`: 修复 `onChange` 返回值错误.
- 🐞 `Select`: 修复点击下拉按钮不能触发focus.
- 🐞 `Table`: 修复过滤框无法弹出默认过滤内容.

## 0.3.2

`2018-06-28`

- 🌟 `Icon`: 增加新的图标。
- 🌟 `Form`: 增加 `isModifiedFields` `isModifiedField` 方法。
- 💄 `Table`: 排序图标样式调整。
- 💄 `Select` `Input` `Radio` `DatePicker`: 样式调整。

## 0.3.1

`2018-06-08`

- 🐞 `Table`: 修复列选择下拉框一直会处于 loading 状态。

## 0.3.0

`2018-06-08`

- 🌟 `Select`: 增加 loading 属性。
- 💄 `Collapse`:修改 icon 图标样式。
- 💄 `Modal`: 调整 footer 的 button 样式。
- 🌟 增加 `IconSelect` 组件。
- 💄 `Table`: 调整 `FilterSelect` 功能。
- 💄 `Table`: 调整弹出窗位置。

## 0.2.4

`2018-06-01`

- 💄 `Select`: 调整 icon 样式。
- 💄 `Input`: 调整 icon 样式。
- 🌟 `Icon`: 增加新的图标。

## 0.2.2

`2018-05-31`

- 💄 `Radio`: 禁用样式调整。
- 💄 `Pagination`: 下选框样式调整。
- 💄 `Select`: 多选样式调整。
- 🐞 `Select`: 修复没有数据时不能选中输入值。

## 0.2.1

`2018-05-28`

- 💄 `Select`: 多选样式调整。

## 0.2.0

`2018-05-18`

- 🌟 迁移至npmjs

## 0.1.11

`2018-05-15`

- 💄 `Button`: 调整禁用时的背景色。
- 💄 `Modal.Sidebar`: title 样式调整。

## 0.1.10

`2018-05-14`

- 🐞 `Table`: 修正过滤条删除选中值时会影响当前`state`的`filteredValue`值。
- 💄 `Select`: 禁用时样式调整。

## 0.1.9

`2018-05-13`

- 💄 `Form`: 调整校验反馈时的图标。
- 💄 `Popover`: 调整图标。
- 🐞 `Table`: 修正当`column`的 `filters` 属性中 `value` 不是字符串时，过滤条选中的值显示错误。
- 🌟 `Table`: `column` 增加 `filterTitle` 属性。

## 0.1.8

`2018-05-12`

- 🐞 `Table`: 修正当`childrenColumnName`属性不是`children`，所有数据中第一层的选择框禁用而其他数据的选择框是启用的时候, 全选选择框为禁用状态。
- 🐞 `Select`: Form下全选拿不到值。

## 0.1.7

`2018-05-12`

- 💄 `Icon`: 样式属性font-weight改为inherit。
- 🐞 `Select`: 查询过后再次打开下拉框不能重查。

## 0.1.6

`2018-05-11`

- 💄 `Pagination`: 样式调整。
- 💄 `Modal.Sidebar`: content 滚动。
- 💄 `Select`: 样式调整。
- 🌟 `Select`: 增加 choiceRender 属性。

## 0.1.5

`2018-05-10`

- 🐞 `Ripple`: 修复引用Ripple的组件的样式依赖。
- 🐞 `Icon`: 修复不同字体大小下的图标尺寸不自适应。
- 🌟 `Checkbox`: 增加 label 属性。
- 🌟 `Radio`: 增加 label 属性。
- 💄 `Select`: 对于 label 不存在时的调整。
- 🐞 `Input`: 默认值和 label重叠。

## 0.1.4

`2018-05-08`

- 🐞 `Ripple`: 修正内部节点的样式属性position为static时的错误。

## 0.1.3

`2018-05-07`

- 🌟 `Model.Sidebar`: 新增 footer
- 💄 `Spin`: 调整旋转效果
- 🐞 `Table`: 修正过滤条无法过滤Column没有dataindex属性时数据的错误

## 0.1.2

`2018-05-03`

- 🌟 `Pagination`: 新增`tiny`属性，用于Table风格的分页
- 💄 `Tab`: 调整icon
- 🐞 `Table`: 修复过滤条选择的值的问题
- 🐞 `Ripple`: 修复子节点style的问题
- 🌟 `Icon`: 新增 icon 样式
- 🐞 `Input`: 前后缀问题

## 0.1.1

`2018-05-02`

- Table
  - 🌟 `FilterBar`: 新增设置`column.filterMultiple`可多选功能。
  - 🐞 `FilterBar`: 修复列过滤的问题。
  - 🐞 修复展开图标不按中心旋转的问题。
- 🐞 `Modal.Sidebar`: 按钮 loading 状态显示问题。

## 0.1.0

`2018-04-28`

- 💄 `Ripple`: 优化并抽象成组件.
- 🐞 `Select`: 修复内容超长显示问题。
- 💄 `Table`: 调整行的展开图标。
- 💄 `Table`: 当列的`filters`为空数组时，`filterBar`也能显示可选列。

## 0.0.5

`2018-04-26`

- 💄 调整 Table 行的展开图标。
- 🐞 修复 rc-components 在IE9下的bug.
- 🌟 message 新增 `placement` 用于消息位置。
- 🌟 message.config 新增 `bottom`。
- 🌟 Select 新增 `footer`。

## 0.0.4

`2018-04-25`

- 💄 调整 Table 的 filter bar，默认不能有OR逻辑。
- 💄 调整 Select 组件清除图标样式。
- 🌟 Modal 新增 `funcType` 用于按钮功能。

## 0.0.3

`2018-04-24`

- 🐞 修复 Form 的 Input 组件赋值问题。
- 🐞 修复 Select 组件主题样式兼容问题。
- 🐞 修复 Input 组件主题样式兼容问题。
- 🐞 修复 AutoComplete 组件主题样式兼容问题。
- 💄 调整 Radio 组件主题样式。
- 💄 调整 Upload 组件主题样式。
- 💄 调整 Dropdown 组件弹出位置。
- 💄 调整 Button 组件 loading 样式。

## 0.0.2

`2018-04-20`

- 🐞 修复 `rc-components` 各组件未引入的依赖。
- 🐞 修复 Table 的 filterBar的问题。
- 💄 调整 Button 组件主题样式。
- 💄 调整 Menu 组件主题样式。
- 💄 调整 Modal 组件主题样式。
- 💄 调整 Progress 组件主题样式。
- 💄 调整 Select 组件主题样式。
- 💄 调整 Input 组件主题样式。
- 🌟 Progress 的 `type` 属性新增 `loading` 值。
- 🌟 新增 Modal.SideBar组件。
- 🌟 Input 新增 `copy` 和 `onCopy` 用于复制。

## 0.0.1

`2018-04-11`

- Table
  - 🌟 新增 `filterBar` 用于开启过滤条功能。
  - 🌟 新增 `filters` 用于控制过滤条已选过滤条件。
- 🌟 各表单控件 新增 `label` 用于显示浮动文字。
- 💄 调整各组件主题样式。

## 0.0.0

`2018-04-01`

- 🌟 基于 [Ant Design@3.4.0](https://github.com/ant-design/ant-design/blob/master/CHANGELOG.zh-CN.md#340)
