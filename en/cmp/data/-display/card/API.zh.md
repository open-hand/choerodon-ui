---
title: API
---

```html
<Card title="卡片标题">卡片内容</Card>
```

### Card

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| actions | 卡片操作组，位置在卡片底部 | Array<ReactNode> | - |
| bodyStyle | 内容区域自定义样式 | object | - |
| bordered | 是否有边框 | boolean | true |
| cover | 卡片封面 | ReactNode | - |
| extra | 卡片右上角的操作区域 | string\|ReactNode | - |
| hoverable | 鼠标移过时可浮起 | boolean | false |
| loading | 当卡片内容还在加载中时，可以用 loading 展示一个占位 | boolean | false |
| tabList | 页签标题列表 | Array&lt;{key: string, tab: ReactNode}> | - |
| activeTabKey | 当前激活页签的 key | string | - |
| defaultActiveTabKey | 初始化选中页签的 key，如果没有设置 activeTabKey | string | 第一个页签 |
| title | 卡片标题 | string\|ReactNode | - |
| type | 卡片类型，可设置为 `inner` 或 不设置 | string | - |
| selected | 是否选中 | boolean | false |
| cornerPlacement | 选中角标位置 | `bottomRight` \| `bottomLeft` \| `topLeft` \| `topRight` | bottomRight |
| onSelectChange | 选中事件的回调，点击卡片内容区域触发 | (selected) => void | - |
| onTabChange | 页签切换的回调 | (key) => void | - |
| onHeadClick | 卡片头部的点击事件 | React.MouseEventHandler<any> | - |

### Card.Grid

| 属性 | 说明 | 类型 | 默认值 |
| -------- | ----------- | ---- | ------- |
| className | 网格容器类名 | string | - |
| style | 定义网格容器类名的样式 | object | - |
| selected | 是否选中 | boolean | false |
| cornerPlacement | 选中角标位置 | `bottomRight` \| `bottomLeft` \| `topLeft` \| `topRight` | bottomRight |
| onSelectChange | 选中事件的回调 | (selected) => void | - |

### Card.Meta

| 属性 | 说明 | 类型 | 默认值 |
| -------- | ----------- | ---- | ------- |
| avatar | 头像/图标 | ReactNode | - |
| className | 容器类名 | string | - |
| description | 描述内容 | ReactNode | - |
| style | 定义容器类名的样式 | object | - |
| title | 标题内容 | ReactNode | - |
