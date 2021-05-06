---
category: Pro Components
type: Navigation
title: Dropdown
---

A dropdown list.

## When To Use

If there are too many operations to display, you can wrap them in a `Dropdown`. By clicking/hovering on the trigger, a dropdown menu should appear, which allows you to choose one option and execute relevant actions.

## API

### Dropdown

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| disabled | whether the dropdown menu is disabled | boolean | - |
| getPopupContainer | to set the container of the dropdown menu. The default is to create a `div` element in `body`, you can reset it to the scrolling area and make a relative reposition. [example](https://codepen.io/afc163/pen/zEjNOy?editors=0010) | Function(triggerNode) | `() => document.body` |
| overlay | the dropdown menu | [Menu](/components/menu) \| () => [Menu](/components/menu) | - |
| placement | placement of pop menu: `bottomLeft` `bottomCenter` `bottomRight` `topLeft` `topCenter` `topRight` | String | `bottomLeft` |
| trigger | the trigger mode which executes the drop-down action | Array&lt;`click`\|`hover`\|`contextMenu`> | `['click', 'focus']` |
| hidden | whether the dropdown menu is hidden | boolean | - |
| onHiddenChange | a callback function takes an argument: `hidden`, is executed when the hidden state is changed | Function(visible) | - |
| onOverlayClick | a callback function takes an argument: `event`, is executed when the overlay click | Function(event) | - |

You should use [Menu](/components/menu/) as `overlay`. The menu items and dividers are also available by using `Menu.Item` and `Menu.Divider`.

> Warning: You must set a unique `key` for `Menu.Item`.
>
> Menu of Dropdown is unselectable by default, you can make it selectable via `<Menu selectable>`.
