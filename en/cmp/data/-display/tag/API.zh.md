---
title: API
---

### Tag

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterClose | 关闭动画完成后的回调 | () => void | - |
| closable | 标签是否可以关闭 | boolean | false |
| color | 标签色 | string | - |
| onClose | 关闭时的回调 | (e) => void | - |

### Tag.CheckableTag

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| checked | 设置标签的选中状态 | boolean | false |
| onChange | 点击标签时触发的回调 | (checked) => void | - |
