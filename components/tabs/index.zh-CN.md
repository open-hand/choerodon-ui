---
category: Components
subtitle: 标签页
type: Data Display
title: Tabs
cols: 1
---

选项卡切换组件。

## 何时使用

提供平级的区域将大块内容进行收纳和展现，保持界面整洁。

Choerodon UI 依次提供了三级选项卡，分别用于不同的场景。

- 卡片式的页签，提供可关闭的样式，常用于容器顶部。
- 标准线条式页签，用于容器内部的主功能切换，这是最常用的 Tabs。
- [RadioButton](/components/radio/#components-radio-demo-radiobutton) 可作为更次级的页签来使用。

## API

### Tabs

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活 tab 面板的 key | string | 无 |
| animated | 是否使用动画切换 Tabs，在 `tabPosition=top|bottom` 时有效 | boolean \| {inkBar:boolean, tabPane:boolean} | true, 当 type="card" 时为 false |
| defaultActiveKey | 初始化选中面板的 key，如果没有设置 activeKey | string | 第一个面板 |
| hideAdd | 是否隐藏加号图标，在 `type="editable-card"` 时有效 | boolean | false |
| hideOnlyGroup | 是否隐藏单独的组 | boolean | false |
| size | 大小，提供 `large` `default` 和 `small` 三种大小 | string | 'default' |
| tabBarExtraContent | tab bar 上额外的元素 | React.ReactNode | 无 |
| tabBarStyle | tab bar 的样式对象 | object | - |
| inkBarStyle | ink bar 的样式对象 | object | - |
| tabPosition | 页签位置，可选值有 `top` `right` `bottom` `left` | string | 'top' |
| type | 页签的基本样式，可选 `line`、`card`、`editable-card`、`second-level` 类型 | string | 'line' |
| onChange | 切换面板的回调 | (activeKey) => void | 无 |
| onEdit | 新增和删除页签的回调，在 `type="editable-card"` 时有效 | (targetKey, action): void | 无 |
| onTabClick | tab 被点击的回调 | (tabKey) => void | 无 |
| tabBarGutter | tabs 之间的间隙 | number | 无 |
| keyboard| tabs的快捷键盘| boolean | true |
| customizable | 是否显示个性化设置入口按钮  | boolean | |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/components/configure)中的表格个性化钩子： `customizedSave` `customizedLoad` | string | |
| tabDraggable | &lt;个性化&gt;是否可拖拽  | boolean | true |
| tabTitleEditable | &lt;个性化&gt;是否可编辑标题  | boolean | true |
| tabCountHideable | &lt;个性化&gt;是否可隐藏计数  | boolean | true |
| defaultChangeable | &lt;个性化&gt;是否可改变默认显示  | boolean | true |
| showMore | 页签超过容器宽度是否显示更多 | boolean | false |
| flex | 是否柔性布局 | boolean | 无 |

### Tabs.TabPane

| 参数        | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| forceRender | 被隐藏时是否渲染 DOM 结构 | boolean           | false  |
| key         | 对应 activeKey            | string            | 无     |
| tab         | 选项卡头显示文字或钩子          | string\|ReactNode \| (title) => ReactNode | 无     |
| title         | 选项卡头显示文字          | string | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| count         | 选项卡头内显示数字          | number \| () => number | 无     |
| countRenderer         | 数字渲染器          | ({ text, count, overflowCount }) => ReactNode  | ({ text }) => { if (text) return text; }     |
| overflowCount         | 展示封顶的数字值         | number | 99     |
| showCount         | 显示数字        | boolean | true     |
| dataSet	| 数据集对象，当数据集校验失败时会出现提示标记 | DataSet \| DataSet[] | 无 |	
| hidden | 是否隐藏 | boolean  | false |

### Tabs.TabGroup

| 参数        | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| tab         | 选项组显示文字          | string\|ReactNode | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| dot         | 是否显示小红点          | boolean | 无     |
| defaultActiveKey         | 初始化组时默认展示的 TabPane 对应的 key          | string | 无     |
| hidden | 是否隐藏 | boolean  | false |
