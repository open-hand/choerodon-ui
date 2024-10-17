---
title: API
---

```jsx
<Badge count={5}>
  <a href="#" className="head-example" />
</Badge>
```

```jsx
<Badge count={5} />
```

| 属性名 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| count | 展示的数字，大于 overflowCount 时显示为 `${overflowCount}+`，为 0 时隐藏 | ReactNode  |  | |
| dot | 不展示数字，只有一个小红点 | boolean | false | |
| offset | 设置状态点的位置偏移，格式为 `[x, y]` | `[number, number]` | | |
| overflowCount | 展示封顶的数字值 | number | 99 | |
| showZero | 当数值为 0 时，是否展示 Badge | boolean | false | |
| status | 设置 Badge 为状态点 | Enum{ 'success', 'processing, 'default', 'error', 'warning' } | '' | |
| text | 在设置了 `status` 或 `color` 的前提下有效，设置状态点的文本 | ReactNode | '' | |
| color | 自定义小圆点的颜色 | string |  | 1.5.0-beta.0 |
| size | 在设置了 `count` 的前提下有效，设置小圆点的大小 | `default` \| `small` | `default` | 1.5.0-beta.0 |
| title | 设置鼠标放在状态点上时显示的文字 | string |  | 1.5.0-beta.0 |

