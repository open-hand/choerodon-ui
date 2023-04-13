---
category: Pro Components
subtitle: 下拉菜单
type: Navigation
title: Dropdown
---

向下弹出的列表。

## 何时使用

当页面上的操作命令过多时，用此组件可以收纳操作元素。点击或移入触点，会出现一个下拉菜单。可在列表中进行选择，并执行相应的命令。

## API

属性如下

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 菜单是否禁用 | boolean | - |
| getPopupContainer | 菜单渲染父节点。默认渲染到 body 上，如果你遇到菜单滚动定位问题，试试修改为滚动的区域，并相对其定位。[示例](https://codepen.io/afc163/pen/zEjNOy?editors=0010) | Function(triggerNode) | `() => document.body` |
| overlay | 菜单。建议使用函数返回菜单，可提高性能 | [Menu](/components/menu) \| () => [Menu](/components/menu) | - |
| placement | 菜单弹出位置：`bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight` | String | `bottomLeft` |
| trigger | 触发下拉的行为 | Array&lt;`click`\|`hover`\|`contextMenu`> | `['click', 'focus']` |
| hidden | 菜单是否隐藏 | boolean | - |
| onHiddenBeforeChange | 菜单显示状态改变前调用，参数为 hidden， 返回值为false将阻止改变 | (hidden) => boolean | 无 |
| onHiddenChange | 菜单显示状态改变时调用，参数为 hidden | Function(hidden) | - |
| onOverlayClick | 点击菜单时调用，参数为 event | Function(event) | - |

`overlay` 菜单使用 [Menu](/components/menu/)，还包括菜单项 `Menu.Item`，分割线 `Menu.Divider`。

### Dropdown.Button

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型，和 [Button](/components-pro/button/) 一致 | string | 'button' |
| funcType | 按钮展现模式，和 [Button](/components-pro/button/) 一致 | string | 'raised' |
| size | 整体大小，和 [Button](/components-pro/button/) 一致 | string | 'default' |
| icon | 自定义下拉图标 | ReactNode | |
| onClick | 点击左侧按钮的回调，和 [Button](/components-pro/button/) 一致 | Function | - |

更多属性请参考 [Dropdown](/components-pro/dropdown#API) 和 [Button](/components-pro/button#API)
