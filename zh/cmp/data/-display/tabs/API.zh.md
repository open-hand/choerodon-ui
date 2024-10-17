---
title: API
---

### Tabs

| 属性名 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| activeKey | 当前激活 tab 面板的 key | string | 无 | |
| animated | 是否使用动画切换 Tabs，在 `tabPosition=top|bottom` 时有效 | boolean \| {inkBar:boolean, tabPane:boolean} | true, 当 type="card" 时为 false | |
| defaultActiveKey | 初始化选中面板的 key，如果没有设置 activeKey | string | 第一个面板 | |
| hideAdd | 是否隐藏加号图标，在 `type="editable-card"` 时有效 | boolean | false | |
| hideOnlyGroup | 是否隐藏单独的组 | boolean | false | 1.4.5 |
| size | 大小，提供 `large` `default` 和 `small` 三种大小 | string | 'default' | |
| tabBarExtraContent | tab bar 上额外的元素 | React.ReactNode | 无 | |
| tabBarStyle | tab bar 的样式对象 | object |  | |
| inkBarStyle | ink bar 的样式对象 | object |  | 1.4.5 |
| tabPosition | 页签位置，可选值有 `top` `right` `bottom` `left` | string | 'top' | |
| type | 页签的基本样式，可选 `line`、`card`、`editable-card`、`second-level`(1.5.0) 类型 | string | 'line' |
| onChange | 切换面板的回调 | (activeKey) => void | 无 | |
| onEdit | 新增和删除页签的回调，在 `type="editable-card"` 时有效 | (targetKey, action): void | 无 | |
| onTabClick | tab 被点击的回调 | (tabKey) => void | 无 | |
| tabBarGutter | tabs 之间的间隙 | number | 无 | |
| keyboard| keyboard events| boolean | true | |
| customizable | 是否显示个性化设置入口按钮  | boolean | | 1.4.5 |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/zh/procmp/configure/configure)中的表格个性化钩子： `customizedSave` `customizedLoad` | string | | 1.4.5 |
| tabDraggable | &lt;个性化&gt;是否可拖拽  | boolean | true | 1.5.0 |
| tabTitleEditable | &lt;个性化&gt;是否可编辑标题  | boolean | true | 1.5.0 |
| tabCountHideable | &lt;个性化&gt;是否可隐藏计数  | boolean | true | 1.5.0 |
| defaultChangeable | &lt;个性化&gt;是否可改变默认显示  | boolean | true | 1.5.0 |
| restoreDefault | &lt;个性化&gt;是否开启恢复默认  | boolean | true | 1.6.3 |
| showMore | 页签超过容器宽度是否显示更多 | boolean | false | 1.5.0-beta.0 |
| flex | 是否柔性布局 | boolean |  | 1.5.4 |
| renderTabBar | 替换 TabBar，用于二次封装标签头。DefaultTabBar 为组件库默认 TabBar 组件，props 为组件默认参数 | (props: TabBarProps, DefaultTabBar: React.ComponentType<TabBarProps>) => React.ReactElement |  | 1.6.5 |
| showMorePopupClassName | showMore 下拉 popup 的自定义类名 | string |  | 1.6.5 |
| showInvalidTips | 是否开启 DataSet 校验  | boolean | [全局配置](/zh/procmp/configure/configure) tabsShowInvalidTips | 1.6.5 |

### Tabs.TabPane

| 属性名       | 说明                      | 类型              | 默认值 | 版本 |
| ----------- | ------------------------- | ----------------- | ------ | ------ |
| forceRender | 被隐藏时是否渲染 DOM 结构 | boolean           | false  | |
| key         | 对应 activeKey            | string            | 无     | |
| tab         | 选项卡头显示文字或钩子          | string\|ReactNode \| (title) => ReactNode | 无     | 1.4.5 |
| title         | 选项卡头显示文字          | string | 无     | 1.4.5 |
| disabled         | 是否禁用          | boolean | 无     | |
| count         | 选项卡头内显示数字          | number\| () => number | 无     | |
| countRenderer | 数字渲染器 | ({ text, count, overflowCount }) => ReactNode | ({ text }) => { if (text) return text; } | 1.5.0-beta.0 |
| overflowCount         | 展示封顶的数字值         | number | 99     | |
| showCount         | 显示数字        | boolean | true     | 1.4.5 |
| dataSet	| 数据集对象，当数据集校验失败时会出现提示标记 | DataSet \| DataSet[] |  | 1.5.3 |
| hidden | 是否隐藏 | boolean  | false | 1.5.7 |

### Tabs.TabGroup

> 1.4.4 版本支持

| 属性名       | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| tab         | 选项组显示文字          | string\|ReactNode | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| dot         | 是否显示小红点          | boolean | 无     |
| defaultActiveKey         | 初始化组时默认展示的 TabPane 对应的 key          | string | 无     |
| hidden | 是否隐藏 | boolean  | false | 1.5.7 |
