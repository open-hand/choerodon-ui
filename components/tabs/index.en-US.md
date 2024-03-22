---
category: Components
type: Data Display
title: Tabs
cols: 1
---

Tabs make it easy to switch between different views.

### When To Use

Choerodon UI has 3 types of Tabs for different situations.

- Card Tabs: for managing too many closeable views.
- Normal Tabs: for functional aspects of a page.
- [RadioButton](/components/radio/#components-radio-demo-radiobutton): for secondary tabs.

## API

### Tabs

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| activeKey | Current TabPane's key | string | - |
| animated | Whether to change tabs with animation. Only works while `tabPosition="top"\|"bottom"` | boolean \| {inkBar:boolean, tabPane:boolean} | `true`, `false` when `type="card"` |
| defaultActiveKey | Initial active TabPane's key, if `activeKey` is not set. | string | - |
| hideAdd | Hide plus icon or not. Only works while `type="editable-card"` | boolean | `false` |
| hideOnlyGroup | 是否隐藏单独的组 | boolean | false |
| size | preset tab bar size | `large` \| `default` \| `small` | `default` |
| tabBarExtraContent | Extra content in tab bar | React.ReactNode | - |
| tabBarStyle | Tab bar style object | object | - |
| inkBarStyle | Ink bar style object | object | - |
| tabPosition | Position of tabs | `top` \| `right` \| `bottom` \| `left` | `top` |
| type | Basic style of tabs | `line` \| `card` \| `editable-card` \| `second-level` | `line` |
| onChange | Callback executed when active tab is changed | (activeKey) => void | - |
| onEdit | Callback executed when tab is added or removed. Only works while `type="editable-card"` | (targetKey, action): void | - |
| onTabClick | Callback executed when tab is clicked | (tabKey) => void | - |
| tabBarGutter | The gap between tabs | number | - |
| keyboard|  keyboard events| boolean | true |
| customizable | 是否显示个性化设置入口按钮  | boolean | |
| customizedCode | 个性化编码，设置后默认将会存储列拖拽等个性化设置更改到 localStorage，如果要存储到后端, 请重写[全局配置](/components/configure)中的表格个性化钩子： `customizedSave` `customizedLoad` | string | |
| tabDraggable | &lt;个性化&gt;是否可拖拽  | boolean | true |
| tabTitleEditable | &lt;个性化&gt;是否可编辑标题  | boolean | true |
| tabCountHideable | &lt;个性化&gt;是否可隐藏计数  | boolean | true |
| defaultChangeable | &lt;个性化&gt;是否可改变默认显示  | boolean | true |
| restoreDefault | &lt;个性化&gt;是否开启恢复默认  | boolean | true |
| showMore | Display more tabs than the width of the container | boolean | false |
| flex | Whether flexible layout | boolean | - |
| renderTabBar | 替换 TabBar，用于二次封装标签头。DefaultTabBar 为组件库默认 TabBar 组件，props 为组件默认参数 | (props: TabBarProps, DefaultTabBar: React.ComponentType<TabBarProps>) => React.ReactElement |  |
| showMorePopupClassName | showMore 下拉 popup 的自定义类名 | string |  |

### Tabs.TabPane

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| forceRender | Forced render of content in tabs, not lazy render after clicking on tabs | boolean | false |
| key | TabPane's key | string | - |
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
