---
category: Components
subtitle: 全局提示
type: Feedback
noinstant: true
title: Message
---

全局展示操作反馈信息。

## 何时使用

- 可提供成功、警告和错误等反馈信息。
- 顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。

## API

组件提供了一些静态方法，使用方式和参数如下：

- `message.success(content, [duration], [onClose], placement)`
- `message.error(content, [duration], [onClose], placement)`
- `message.info(content, [duration], [onClose], placement)`
- `message.warning(content, [duration], [onClose], placement)`
- `message.warn(content, [duration], [onClose], placement)` // alias of warning
- `message.loading(content, [duration], [onClose], placement)`

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 提示内容 | string\|ReactNode | - |
| duration | 自动关闭的延时，单位秒 | number | 3 |
| onClose | 关闭时触发的回调函数 | Function | - |
| placement | 消息展示的位置, 可选值： `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom`| string | `leftBottom`|


还提供了全局配置和全局销毁方法：

- `message.config(options)`
- `message.destroy()`

### message.config

```js
message.config({
  top: 100,
  duration: 2,
});
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| duration | 默认自动关闭延时，单位秒 | number | 3 |
| getContainer | 配置渲染节点的输出位置 | () => HTMLElement | () => document.body |
| top | 消息在顶部出现时距离顶部的位置 | number | 24 |
| bottom | 消息在底部出现时距离底部的位置 | number | 24 |
| placement | 消息展示的位置, 可选值： `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom`| string | `leftBottom`|
| maxCount | 最大显示数, 超过限制时，最早的消息会被自动关闭 | number |  |
