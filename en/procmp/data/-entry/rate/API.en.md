---
title: API
---

| Property | Description | type | Default |
| -------- | ----------- | ---- | ------- |
| onChange | Value change callback | (value, oldValue, form) => void | |
| allowClear | whether to allow clear when click again | boolean | true |
| allowHalf | whether to allow semi selection | boolean | false |
| autoFocus | get focus when component mounted | boolean | false |
| character | custom character of rate | ReactNode | `<Icon type="star" />` |
| className | custom class name of rate | string | - |
| count | star count | number | 5 |
| defaultValue | default value | number | 0 |
| disabled | read only, unable to interact | boolean | false |
| style | custom style object of rate | object | - |
| value | current value | number | - |
| onBlur | callback when component lose focus | Function() | - |
| onFocus | callback when component get focus | Function() | - |
| onHoverChange | callback when hover item | Function(value: number) | - |
| onKeyDown | callback when keydown on component | Function(event) | - |

## Methods

| Name | Description |
| ---- | ----------- |
| blur() | remove focus |
| focus() | get focus |

更多属性请参考 [Field](/zh/procmp/abstract/field#Field)。