---
title: API
---

### Tabs

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| activeKey | Current TabPane's key | string | - | |
| animated | Whether to change tabs with animation. Only works while `tabPosition="top"\|"bottom"` | boolean \| {inkBar:boolean, tabPane:boolean} | `true`, `false` when `type="card"` ||
| defaultActiveKey | Initial active TabPane's key, if `activeKey` is not set. | string | - ||
| hideAdd | Hide plus icon or not. Only works while `type="editable-card"` | boolean | `false` ||
| hideOnlyGroup | 是否隐藏单独的组 | boolean | false | 1.4.5 |
| size | preset tab bar size | `large` \| `default` \| `small` | `default` ||
| tabBarExtraContent | Extra content in tab bar | React.ReactNode | - ||
| tabBarStyle | Tab bar style object | object | - ||
| inkBarStyle | Ink bar style object | object |  | 1.4.5 |
| tabPosition | Position of tabs | `top` \| `right` \| `bottom` \| `left` | `top` ||
| type | Basic style of tabs | `line` \| `card` \| `editable-card` \| `second-level`(1.5.0) | `line` |
| onChange | Callback executed when active tab is changed | (activeKey) => void | - ||
| onEdit | Callback executed when tab is added or removed. Only works while `type="editable-card"` | (targetKey, action): void | - ||
| onTabClick | Callback executed when tab is clicked | (tabKey) => void | - ||
| tabBarGutter | The gap between tabs | number | - ||
| keyboard| keyboard events| boolean | true | ||
| customizable | 是否显示个性化设置入口按钮  | boolean | | 1.4.5 |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/zh/procmp/configure/configure)中的表格个性化钩子： `customizedSave` `customizedLoad` | string | | 1.4.5 |
| tabDraggable | &lt;个性化&gt;是否可拖拽  | boolean | true | 1.5.0 |
| tabTitleEditable | &lt;个性化&gt;是否可编辑标题  | boolean | true | 1.5.0 |
| tabCountHideable | &lt;个性化&gt;是否可隐藏计数  | boolean | true | 1.5.0 |
| defaultChangeable | &lt;个性化&gt;是否可改变默认显示  | boolean | true | 1.5.0 |
| restoreDefault | &lt;个性化&gt;是否开启恢复默认  | boolean | true | 1.6.3 |
| showMore | Display more tabs than the width of the container | boolean | false | 1.5.0-beta.0 |
| flex | 是否柔性布局 | boolean |  | 1.5.4 |
| renderTabBar | 替换 TabBar，用于二次封装标签头。DefaultTabBar 为组件库默认 TabBar 组件，props 为组件默认参数 | (props: TabBarProps, DefaultTabBar: React.ComponentType<TabBarProps>) => React.ReactElement |  | 1.6.5 |
| showMorePopupClassName | showMore 下拉 popup 的自定义类名 | string |  | 1.6.5 |
| showInvalidTips | 是否开启 DataSet 校验  | boolean | [全局配置](/en/procmp/configure/configure) tabsShowInvalidTips | 1.6.5 |

### Tabs.TabPane

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| forceRender | Forced render of content in tabs, not lazy render after clicking on tabs | boolean | false |
| key | TabPane's key | string | - |
| tab         | Show text in TabPane's head          | string\|ReactNode \| (title) => ReactNode | 无     |
| title         | 选项卡头显示文字          | string | 无     |1.4.5 |
| disabled         | 是否禁用          | boolean | 无     |
| count         | 选项卡头内显示数字          | number\| () => number | 无     |
| countRenderer | 数字渲染器 | ({ text, count, overflowCount }) => ReactNode | ({ text }) => { if (text) return text; } | 1.5.0-beta.0 |
| overflowCount         | 展示封顶的数字值         | number | 99     |
| showCount         | 显示数字        | boolean | true     | 1.4.5 |
| dataSet	| 数据集对象，当数据集校验失败时会出现提示标记 | DataSet \| DataSet[] |  | 1.5.3 |
| hidden | 是否隐藏 | boolean  | false | 1.5.7 |

### Tabs.TabGroup

> 1.4.4 added.

| 属性名       | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| tab         | 选项组显示文字          | string\|ReactNode | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| dot         | 是否显示小红点          | boolean | 无     |
| defaultActiveKey         | 初始化组时默认展示的 TabPane 对应的 key          | string | 无     |
