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
| hideOnlyGroup | Hide individual groups | boolean | false | 1.4.5 |
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
| customizable | Whether to display the personalized settings entry button | boolean | | 1.4.5 |
| customizedCode | Personalized code. After setting, it will by default store changes to personalized settings such as column drag-and-drop in localStorage. If you want to store it on the backend, please override the table personalization hooks in the [Global Configuration](/en/procmp/configure/configure): `customizedSave` `customizedLoad` | string | | 1.4.5 |
| tabDraggable | &lt;个性化&gt;是否可拖拽  | boolean | true | 1.5.0 |
| tabTitleEditable | &lt;customize&gt;Is the title editable  | boolean | true | 1.5.0 |
| tabCountHideable | &lt;customize&gt;Is it possible to hide the count  | boolean | true | 1.5.0 |
| defaultChangeable | &lt;Personalization&gt; Whether the default display can be changed | boolean | true | 1.5.0 |
| restoreDefault | &lt;Personalization&gt; Whether the restore default option is enabled | boolean | true | 1.6.3 |
| showMore | Display more tabs than the width of the container | boolean | false | 1.5.0-beta.0 |
| flex | Whether to use flexible layout | boolean |  | 1.5.4 |
| renderTabBar | Replace TabBar for secondary encapsulation of the tab header. DefaultTabBar is the default TabBar component from the library, props are the default parameters of the component | (props: TabBarProps, DefaultTabBar: React.ComponentType<TabBarProps>) => React.ReactElement |  | 1.6.5 |
| showMorePopupClassName | Custom class name for the showMore dropdown popup | string |  | 1.6.5 |
| showInvalidTips | Whether to enable DataSet validation | boolean | [Global Configuration](/en/procmp/configure/configure) tabsShowInvalidTips | 1.6.5 |
| tabBarStartExtraContent | Additional elements on the left side of the tab bar | React.ReactNode |  | 1.6.7 |

### Tabs.TabPane

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| forceRender | Force rendering of content in tabs, instead of lazy rendering after clicking the tab | boolean | false |
| key | Key of TabPane | string | - |
| tab         | Show text in the TabPane's header          | string\|ReactNode \| (title) => ReactNode | None     |
| title         | Text displayed on the tab header          | string | None     |1.4.5 |
| disabled         | Whether it is disabled          | boolean | None     |
| count         | Number displayed in the tab header          | number\| () => number | None     |
| countRenderer | Number renderer | ({ text, count, overflowCount }) => ReactNode | ({ text }) => { if (text) return text; } | 1.5.0-beta.0 |
| overflowCount         | Maximum number to display         | number | 99     |
| showCount         | Display number        | boolean | true     | 1.4.5 |
| dataSet  | Data set object, shows validation mark when data set validation fails | DataSet \| DataSet[] |  | 1.5.3 |
| hidden | Whether hidden | boolean  | false | 1.5.7 |

### Tabs.TabGroup

> Added in 1.4.4.

| Property       | Description                      | Type              | Default |
| ----------- | ------------------------- | ----------------- | ------ |
| tab         | Text displayed for the tab group          | string\|ReactNode | None     |
| disabled         | Whether it is disabled          | boolean | None     |
| dot         | Whether to show a small red dot          | boolean | None     |
| defaultActiveKey         | The key of the TabPane displayed by default when initializing the group          | string | None     |