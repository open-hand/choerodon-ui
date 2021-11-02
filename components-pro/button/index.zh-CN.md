---
category: Pro Components
type: General
title: Button
subtitle: 按钮
---

按钮用于开始一个即时操作。

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。

## API

## Button

按钮的属性说明如下：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 设置按钮类型，可选值为 `button` `submit` `reset` | string | `button` |
| color | 设置按钮颜色风格，可选值为 `default` `primary` `blue` `yellow` `red` `dark` `green` `purple` | string | `default` |
| funcType | 设置按钮展现模式，可选值为 `flat` `raised` | string | `raised` |
| loading | 设置按钮是否是加载状态,**注意设置false与不设置的表现是不一样的**，不设置时，当onClick为返回`Promise`的时候,会自动开启loading，设置为`false`时不会开启loading状态，当设置为`true`的时候则一直使用loading状态，建议通过onClick控制loading状态 | boolean |  |
| icon | 设置按钮图标 | string | - |
| href | 点击跳转的地址，指定此属性 button 的行为和 a 链接一致 | string | - |
| target | 相当于 a 链接的 target 属性，href 存在时生效 | string | - |
| wait | 设置按钮点击间隔时间 | number | - |
| waitType | 设置按钮点击间隔类型，可选值： `throttle` `debounce` | string | `throttle` |
| onClick | 点击按钮时的回调, 当回调返回值为 Promise，则会出现 loading 状态直到 Promise 的状态不为 pending | (e) => void | Promise |
| block | 块级按钮 | boolean | false |

更多属性请参考 [ViewComponent](/components-pro/core/#ViewComponent)。

<style>
.code-box-demo .c7n-pro-btn {
  margin-bottom: 12px;
}
</style>
