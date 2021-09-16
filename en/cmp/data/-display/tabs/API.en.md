---
title: API
---

### Tabs

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| activeKey | Current TabPane's key | string | - |
| animated | Whether to change tabs with animation. Only works while `tabPosition="top"\|"bottom"` | boolean \| {inkBar:boolean, tabPane:boolean} | `true`, `false` when `type="card"` |
| defaultActiveKey | Initial active TabPane's key, if `activeKey` is not set. | string | - |
| hideAdd | Hide plus icon or not. Only works while `type="editable-card"` | boolean | `false` |
| size | preset tab bar size | `large` \| `default` \| `small` | `default` |
| tabBarExtraContent | Extra content in tab bar | React.ReactNode | - |
| tabBarStyle | Tab bar style object | object | - |
| tabPosition | Position of tabs | `top` \| `right` \| `bottom` \| `left` | `top` |
| type | Basic style of tabs | `line` \| `card` \| `editable-card` | `line` |
| onChange | Callback executed when active tab is changed | (newActiveKey, oldActiveKey) => void | - |
| onEdit | Callback executed when tab is added or removed. Only works while `type="editable-card"` | (targetKey, action): void | - |
| onNextClick | Callback executed when next button is clicked | (e) => void | - |
| onPrevClick | Callback executed when prev button is clicked | (e) => void | - |
| onTabClick | Callback executed when tab is clicked | (tabKey) => void | - |
| tabBarGutter | The gap between tabs | number | - |

### Tabs.TabPane

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| forceRender | Forced render of content in tabs, not lazy render after clicking on tabs | boolean | false |
| key | TabPane's key | string | - |
| tab | Show text in TabPane's head | string\|ReactNode | - |
| disabled         | 是否禁用          | boolean | 无     |
| count         | 选项卡头内显示数字          | number | 无     |
| overflowCount         | 展示封顶的数字值         | number | 99     |

### Tabs.TabGroup

> 1.4.4 added.

| 参数        | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| tab         | 选项组显示文字          | string\|ReactNode | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| dot         | 是否显示小红点          | boolean | 无     |
| defaultActiveKey         | 初始化组时默认展示的 TabPane 对应的 key          | string | 无     |
