---
title: API
---

### Tabs

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活 tab 面板的 key | string | 无 |
| animated | 是否使用动画切换 Tabs，在 `tabPosition=top|bottom` 时有效 | boolean \| {inkBar:boolean, tabPane:boolean} | true, 当 type="card" 时为 false |
| defaultActiveKey | 初始化选中面板的 key，如果没有设置 activeKey | string | 第一个面板 |
| hideAdd | 是否隐藏加号图标，在 `type="editable-card"` 时有效 | boolean | false |
| size | 大小，提供 `large` `default` 和 `small` 三种大小 | string | 'default' |
| tabBarExtraContent | tab bar 上额外的元素 | React.ReactNode | 无 |
| tabBarStyle | tab bar 的样式对象 | object | - |
| tabPosition | 页签位置，可选值有 `top` `right` `bottom` `left` | string | 'top' |
| type | 页签的基本样式，可选 `line`、`card` `editable-card` 类型 | string | 'line' |
| onChange | 切换面板的回调 | (newActiveKey, oldActiveKey) => void | 无 |
| onEdit | 新增和删除页签的回调，在 `type="editable-card"` 时有效 | (targetKey, action): void | 无 |
| onNextClick | next 按钮被点击的回调 | (e) => void | 无 |
| onPrevClick | prev 按钮被点击的回调 | (e) => void | 无 |
| onTabClick | tab 被点击的回调 | (tabKey) => void | 无 |
| tabBarGutter | tabs 之间的间隙 | number | 无 |

### Tabs.TabPane

| 参数        | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| forceRender | 被隐藏时是否渲染 DOM 结构 | boolean           | false  |
| key         | 对应 activeKey            | string            | 无     |
| tab         | 选项卡头显示文字          | string\|ReactNode | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| count         | 选项卡头内显示数字          | number | 无     |
| overflowCount         | 展示封顶的数字值         | number | 99     |

### Tabs.TabGroup

> 1.4.4 版本支持

| 参数        | 说明                      | 类型              | 默认值 |
| ----------- | ------------------------- | ----------------- | ------ |
| tab         | 选项组显示文字          | string\|ReactNode | 无     |
| disabled         | 是否禁用          | boolean | 无     |
| dot         | 是否显示小红点          | boolean | 无     |
| defaultActiveKey         | 初始化组时默认展示的 TabPane 对应的 key          | string | 无     |
