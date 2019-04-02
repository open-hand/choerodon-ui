---
category: Components
type: Other
cols: 1
title: Animate
subtitle: 动画
---

动画。

## 何时使用


## API


按钮的属性说明如下：

属性 | 说明 | 类型 | 默认值
-----|-----|-----|------
component | 动画容器元素 | reactElement | span
componentProps | 动画容器元素属性 | object | 
transitionName | 动画名称，可选值：`zoom` `fade` `slide-up` `slide-down` `slide-left` `slide-right` `swing` `move` | string | 
transitionEnter | 子元素进入时是否展示动画 | boolean | true
transitionAppear | 子元素出现时是否展示动画 | boolean | false
transitionLeave | 子元素离开时是否展示动画 | boolean | true
exclusive | 是否立即停止之前的动画 | boolean | false
onEnd | 动画结束是的钩子 | function |
onLeave | 子元素离开时的钩子 | function |
onAppear | 子元素出现时的钩子 | function |
hiddenProp | 决定子元素是否离开的属性名 | string |
