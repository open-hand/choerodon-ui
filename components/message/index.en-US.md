---
category: Components
type: Feedback
noinstant: true
title: Message
---

Display global messages as feedback in response to user operations.

## When To Use

- To provide feedback such as success, warning, error etc.
- A message is displayed at top and center and will be dismissed automatically, as a non-interrupting light-weighted prompt.

## API

This components provides some static methods, with usage and arguments as following:

- `message.success(content, [duration], [onClose], placement)`
- `message.error(content, [duration], [onClose], placement)`
- `message.info(content, [duration], [onClose], placement)`
- `message.warning(content, [duration], [onClose], placement)`
- `message.warn(content, [duration], [onClose], placement)` // alias of warning
- `message.loading(content, [duration], [onClose], placement)`

| Argument | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| content | content of the message | string\|ReactNode | - |
| duration | time before auto-dismiss, in seconds | number | 1.5 |
| onClose | Specify a function that will be called when the message is closed | Function | - |
| placement | the position of message, values: `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom`| string | `leftBottom` |

Methods for global configuration and destruction are also provided:

- `message.config(options)`
- `message.destroy()`

### message.config

```js
message.config({
  top: 100,
  duration: 2,
});
```

| Argument | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| duration | time before auto-dismiss, in seconds | number | 1.5 |
| getContainer | Return the mount node for Message | () => HTMLElement | () => document.body |
| top | the position of the message when it appears on the top | number | 24 |
| bottom | the position of the message when it appears on the bottom | number | 24 |
| placement | the position of message, values: `top` `left` `right` `bottom` `topLeft` `topRight` `bottomLeft` `bottomRight` `leftTop` `leftBottom` `rightTop` `rightBottom`| string | `leftBottom` |
