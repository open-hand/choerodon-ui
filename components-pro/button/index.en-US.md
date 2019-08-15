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


按钮的属性说明如下：

属性 | 说明 | 类型 | 默认值
-----|-----|-----|------
type | 按钮类型，可选值为 `button` `submit` `reset` | string | `button`
color | 按钮颜色风格，可选值为 `default` `primary` `blue` `yellow` `red` `dark` `green` `purple` | string | `default`
funcType | 按钮展现模式，可选值为 `flat` `raised` | string | `raised`
loading | 按钮是否是加载状态 | boolean | false
icon | 按钮图标 | string |
href | 点击跳转的地址，指定此属性 button 的行为和 a 链接一致 | string |
target | 相当于 a 链接的 target 属性，href 存在时生效 | string |
wait | 点击间隔时间 | number |
waitType | 点击间隔类型，可选值： `throttle` `debounce` | string | `throttle`
onClick | 单击回调, 当回调返回值为Promise，则会出现loading状态直到Promise的状态不为pending | (e) => void | Promise |  |

更多属性请参考 [ViewComponent](/components-pro/core/#ViewComponent)。

<style>
[id^="components-button-demo-"] .c7n-pro-btn, [id^="components-button-demo-"] .c7n-pro-button {
  margin-right: 8px;
  margin-bottom: 12px;
}
[id^="components-button-demo-"] .c7n-pro-btn-group > .c7n-pro-btn {
  margin-right: 0;
}
</style>
