---
title: API
---

```html
<Cascader options={options} onChange={onChange} />
```

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| allowClear | whether allow clear | boolean | true |
| autoFocus | get focus when component mounted | boolean | false |
| changeOnSelect | change value on each selection if set to true, see above demo for details | boolean | false |
| className | additional css class | string | - |
| defaultValue | initial selected value | string\[] | \[] |
| disabled | whether disabled select | boolean | false |
| displayRender | render function of displaying selected options | (label, selectedOptions) => ReactNode | label => string |
| expandTrigger | expand current item when click or hover, one of 'click' 'hover' | string | 'click' |
| getPopupContainer | Parent Node which the selector should be rendered to. Default to `body`. When position issues happen, try to modify it into scrollable content and position it relative.[example](https://codepen.io/afc163/pen/zEjNOy?editors=0010) | Function(triggerNode) | () => document.body |
| loadData | To load option lazily, and it cannot work with `showSearch` | (selectedOptions) => void | - |
| notFoundContent | Specify content to show when no result matches. | string | 'Not Found' |
| options | data options of cascade | object | - |
| placeholder | input placeholder | string | 'Please select' |
| popupClassName | additional className of popup overlay | string | - |
| popupPlacement | use preset popup align config from builtinPlacements：`bottomLeft` `bottomRight` `topLeft` `topRight` | string | `bottomLeft` |
| popupVisible | set visible of cascader popup | boolean | - |
| showSearch | Whether show search input in single mode. | boolean\|object | false |
| size | input size, one of `large` `default` `small` | string | `default` |
| style | additional style | string | - |
| value | selected value | string\[] | - |
| onChange | callback when finishing cascader select | (value, selectedOptions) => void | - |
| onPopupVisibleChange | callback when popup shown or hidden | (value) => void | - |
| menuMode | Single box pop-up form switch| `single` \| `multiple` | - |

Fields in `showSearch`:

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| filter | The function will receive two arguments, inputValue and option, if the function returns true, the option will be included in the filtered set; Otherwise, it will be excluded. | (inputValue, path) => boolean |  |
| matchInputWidth | Whether the width of result list equals to input's | boolean |  |
| render | Used to render filtered options. | (inputValue, path) => ReactNode |  |
| sort | Used to sort filtered options. | (a, b, inputValue) => options |  |

When `menuMode` is `single` configuration can be added：

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| singleMenuStyle | Because rendering under the Body makes it easy to configure the size of the pop-up box according to the business | CSSProperties |  |
| singleMenuItemStyle | Because rendering under the Body can easily be configured according to the business beyond the size style, minimum width and so on | CSSProperties |  |
| singlePleaseRender | Set the required prompt configuration | ({key,className,text}) => ReactElement |  |
| singleMenuItemRender | The header can render the desired TAB | (title) => ReactElement |  |

## Methods

| Name | Description |
| ---- | ----------- |
| blur() | remove focus |
| focus() | get focus |

<style>
.c7n-cascader-picker {
  width: 300px;
}
</style>
