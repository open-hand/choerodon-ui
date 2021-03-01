---
category: Pro Components
subtitle: 抽象组件基类
type: Abstract
title: ViewComponent
---

所有组件的抽象基类。

## API

### ViewComponent

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| id | 组件id | string  |  |
| className | 自定义样式名 | string  |  |
| style | 内链样式 | CSSProperties  |  |
| disabled | 禁用 | boolean  | false |
| tabIndex | 键盘Tab键焦点序号，设为-1时不会获得焦点，设为0时为节点树的顺序。 | number  |  |
| title | 悬浮提示，建议用[ToolTip]组件 | string  |  |
| hidden | 是否隐藏 | boolean  | false |
| autoFocus | 自动获取焦点，多个组件同时设置该参数时，以节点树的顺序最末的组件获取焦点 | boolean  | false |
| size | 组件大小<未实现>，可选值 `default` `small` `large` | string  | default |
| lang | 国际化语言编码， 默认使用localeContext.locale.lang | string  |  |
| onFocus | 获取焦点回调 | Function |  |
| onBlur | 失去焦点回调 | Function |  |
| onClick | 单击回调 | Function |  |
| onDoubleClick | 双击回调 | Function |  |
| onContextMenu | 右点击回调 | Function |  |
| onMouseUp | 鼠标抬起回调 | Function |  |
| onMouseDown | 鼠标点下回调 | Function |  |
| onMouseMove | 鼠标移动回调 | Function |  |
| onMouseEnter | 鼠标进入回调 | Function |  |
| onMouseLeave | 鼠标离开回调 | Function |  |
| onMouseOver | 鼠标进入回调，与onMouseEnter区别在于鼠标进入子节点时会触发onMouseOut | Function |  |
| onMouseOut | 鼠标离开回调 | Function |  |
| onKeyDown | 键盘按下时的回调 | Function |  |
| onKeyUp | 键盘抬起时的回调 | Function |  |
| onKeyPress | 键盘敲击后的回调 | Function |  |

### ViewComponent Methods

| 名称 | 说明 |
| --- | --- |
| blur() | 取消焦点 |
| focus() | 获取焦点 |

注意，有些组件默认不支持获取焦点，请设置tabIndex来开启获取焦点功能

### DataSetComponent

可绑定数据源的组件抽象类。

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| dataSet | 绑定数据源 | DataSet  |  |

更多属性请参考 [ViewComponent](#ViewComponent)。
