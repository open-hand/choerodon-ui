---
category: Components
type: Data Display
title: Collapse
subtitle: 折叠面板
cols: 1
---

可以折叠/展开的内容区域。

## 何时使用

- 对复杂区域进行分组和隐藏，保持页面的整洁。
- `手风琴` 是一种特殊的折叠面板，只允许单个内容区域展开。

## API

### Collapse

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeKey | 当前激活 tab 面板的 key | string\[]\|string | 默认无，accordion模式下默认第一个元素 |
| defaultActiveKey | 初始化选中面板的 key | string | 无 |
| onChange | 切换面板的回调 | Function | 无 |
| bordered | 带边框风格的折叠面板 | boolean | true |
| accordion | 手风琴模式	 | boolean | false |
| expandIcon | 自定义切换图标 | (panelProps) => ReactNode \| `text`(预置icon + 展开收起文字) | 无 |
| expandIconPosition | 设置图标位置 | `left` \| `right` \| `text-right` | `left` |
| destroyInactivePanel | 销毁折叠隐藏的面板 | boolean | false |
| ghost | 使折叠面板透明且无边框 | boolean | false |
| collapsible(1.5.7) | 所有子面板是否可折叠或指定可折叠触发区域 | `header` \| `icon` \| `disabled` | |

### Collapse.Panel

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 禁用后的面板展开与否将无法通过用户交互改变 | boolean | false |
| header | 面板头内容 | string\|ReactNode | 无 |
| key | 对应 activeKey | string | 无 |
| forceRender | 被隐藏时是否渲染 DOM 结构 | boolean | false |
| showArrow	| 是否展示当前面板上的箭头	| boolean	|  true |
| extra	| 自定义渲染每个面板右上角的内容 | ReactNode | 无 |
| dataSet	| 数据集对象，当数据集校验失败时会自动展开 | DataSet \| DataSet[] | 无 |
| collapsible(1.5.7) | 是否可折叠或指定可折叠触发区域，优先级高于 disabled | `header` \| `icon` \| `disabled` | |
| hidden | 是否隐藏 | boolean  | false |
