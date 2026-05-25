---
title: API
---

| Property                   | Description                                                                                                                           | Type                        | Default                    | Version |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------- | --- |
| action                 | Form submit request URL; when DataSet is set, this property has no effect                                                               | string                      |                           |    |
| method                 | Form submit HTTP method; options: GET \| POST                                                                                           | string                      | POST                      | |
| target                 | Form submit target; when target is set and there is no DataSet, performs browser default submission; otherwise performs Ajax submission | string                      |                           |    |
| layout | Layout; options: table \| none | string | table | 1.4.0 |
| processParams          | Parameters callback for Ajax submission                                                                                                  | (event) => object           |                           |    |
| useColon | Whether to use colon; when enabled, adds colon after all labels; not displayed when there is no label. | boolean | false | |
| requiredMarkAlign | Position of required asterisk | left \| right | left | 1.6.3 |
| labelWidth | Label width of inner controls. If an array, corresponds to each column’s label width. If array length is less than column count, fill with defaults. For responsive, see [Responsive](#响应式). If auto, align all labels based on the longest internal label. When setting minWidth or maxWidth, table layout style is auto. | number\| 'auto' \| ('auto' \| number)[] \| ({ minWidth?: number; maxWidth?: number }) \| object | [Global Config](/en/procmp/configure/configure) labelWidth | |
| labelAlign             | Label text alignment; applies only when labelLayout is horizontal; options: left \| center \| right; for responsive see [Responsive](#响应式) | string \| object            | right                     | |
| labelLayout            | Label position; options horizontal \| vertical \| placeholder \| float \| none; for responsive see [Responsive](#响应式)                       | string \| object            | horizontal                |  |
| labelTooltip | Display label content with Tooltip; options 'none'\|'always'\|'overflow' | string | 'none' | |
| dataIndex              | Index of record in DataSet                                                                                                               | number                      | ds.currentIndex           |    |
| record                 | Record; priority is higher than dataSet and dataIndex                                                                                    | Record                      |                           |    |
| columns                | Number of columns; for responsive see [Responsive](#响应式)                                                                              | number \| object            | 1                         |    |
| pristine               | Display original value                                                                                                                   | boolean                     | false                     |    |
| onSubmit               | Submit callback                                                                                                                          | Function                    |                           |    |
| onReset                | Reset callback                                                                                                                           | Function                    |                           |    |
| onSuccess              | Submit success callback                                                                                                                  | Function                    |                           |    |
| onError                | Submit failure callback                                                                                                                  | Function                    |                           |    |
| separateSpacing | Split cell spacing; when label layout is the default horizontal, using padding to change horizontal spacing may need to combine with labelWidth for better effect | number \| \[number, number \] \| {width:number,height:number} |  | |
| spacingType | Spacing type; options between \| around \| evenly | SpacingType \| \[SpacingType, SpacingType\] \| {width:SpacingType,height:SpacingType} | between | 1.5.2 |
| fieldHighlightRenderer | Highlight renderer | ({ title, content, dataSet, record, name, className, style }, element) => ReactNode |  |    |
| showValidation | Validation info prompt mode | tooltip \| newLine | | 1.4.4 |
| autoValidationLocate | Auto locate on validation failure. If multiple components conflict in positioning, disable auto locate and call focus manually to locate | boolean | true | 1.5.3 |
| labelWordBreak | Set whether label wraps (only supports fixed labelWidth)  | boolean |  | 1.6.5 |

For more properties, please refer to [DataSetComponent](/en/procmp/abstract/ViewComponent#datasetcomponent).

### Form Layout

#### Form Child Element Properties

| Property       | Description                                                                                            | Type                | Default | Version    |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------------- | ------ | ------ |
| rowSpan    | Number of rows spanned by the control under the form                                                    | number              | 1      |     |
| colSpan    | Number of columns spanned by the control under the form                                                | number              | 1      |     |
| newLine    | Start a new line                                                                                        | boolean             |        |     |
| label      | Label                                                                                                   | string \| ReactNode |        |     |
| name       | Field name. You can get DataSet field properties such as label, require, etc.; typically used when nesting other elements outside the control. | string              |        |     |
| labelWidth | Label width. In the same column, label width takes the maximum set value. Child element labelWidth is not responsive. | number              |        | 1.1.0    |
| useColon | Whether to use colon; when enabled, adds colon after all labels; not displayed when there is no label. | boolean | false | |
| requiredMarkAlign | Position of required asterisk | left \| right | left | 1.6.3 |
| hidden | Whether to hide the field (it will still be validated) | boolean | | 1.4.4 |
| labelWordBreak | Set whether label wraps (only supports fixed labelWidth)  | boolean |  | 1.6.5 |

#### Form.Item

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| label | Label | string \| ReactNode |  | 1.4.2  |
| name | Field name. You can get DataSet field properties such as label, require, etc.; typically used when nesting other elements outside the control. | string |  | 1.4.2 |
| labelWidth | Label width. In the same column, label width takes the maximum set value. Child element labelWidth is not responsive. | number |  | 1.4.2 |
| useColon | Whether to use colon; when enabled, adds colon after all labels; not displayed when there is no label. | boolean | false | |
| requiredMarkAlign | Position of required asterisk | left \| right | left | 1.6.3 |
| hidden | Whether to hide the field (it will still be validated) | boolean | | 1.4.4 |
| labelWordBreak | Set whether label wraps (only supports fixed labelWidth)  | boolean |  | 1.6.5 |

#### Form.ItemGroup

> Added in 1.5.3.

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| className | Custom class name | string |  | |
| style | Custom styles | React.CSSProperties |  | |
| label | Label | string \| ReactNode |  | |
| labelWidth | Label width. In the same column, label width takes the maximum set value. | number |  | |
| labelTooltip | Display label content with Tooltip; options 'none'\|'always'\|'overflow' | string | 'none' | |
| labelTooltip | Display label content with Tooltip; options none \| always \| overflow | string |  | |
| help | Help text (shown beside label) | string |  | |
| required | Show required style (no validation) | boolean |  | |
| useColon | Whether to use colon; when enabled, adds colon after all labels, and the required * is moved to the front; not shown when there is no label. If not set, inherits Form’s useColon property | boolean | | |
| compact | Use compact mode | boolean |  | |
| hidden | Whether to hide the field (it will still be validated) |	boolean	| | |
| rowSpan | Number of rows spanned by the control under the form | number | 1 | |
| colSpan | Number of columns spanned by the control under the form | number | 1 | |
| newLine | Start a new line | boolean |  | |
| labelWordBreak | Set whether label wraps (only supports fixed labelWidth)  | boolean |  | 1.6.5 |
| groupItemStyle | group item custom style | React.CSSProperties[] |  | 1.6.8 |

### Form.FormVirtualGroup

> Use when you need to group some form controls for unified control, such as controlling show/hide. In addition, using `FormVirtualGroup` allows unified attribute injection into form controls, such as a unified `className`. Note that the `FormVirtualGroup` component itself does not produce actual `dom` output; its effect is equivalent to removing `FormVirtualGroup` and writing show/hide control etc. individually into the form controls.

### Form Responsive

Responsive configurable parameters columns \| labelWidth \| labelAlign \| labelLayout can be set as a key-value mapping.

Refer to [Responsive BreakPoints](/en/cmp/data-display/responsive#breakpoints) for key values.
