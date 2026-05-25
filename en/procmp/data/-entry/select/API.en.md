---
title: API
---

### Select

| Property | Description | Type | Default | Version |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- | ----- |
| combo | Composite input value | boolean | false |      |
| searchable | Whether searchable | boolean | false |      |
| reverse | Whether to show invert selection button | boolean | true | 1.0.0 |
| searchMatcher | Search matcher. When a string, used as lookup parameter name to re-fetch value list. | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 |      |
| optionsFilter | Options filter | (record) => boolean |  |      |
| paramMatcher | Parameter matcher. When a string, performs parameter concatenation | string | ({ record, text, textField, valueField }) => string | | |
| defaultActiveFirstOption | Whether to highlight the first option by default | boolean | true | 1.5.0-beta.0 |
| checkValueOnOptionsChange | When associated with DataSet and field has cascadeMap, check and clear values not in options when options change | boolean | true |      |
| dropdownMatchSelectWidth | Make dropdown match input width | boolean | true |      |
| dropdownMenuStyle | Dropdown menu style | object |  |      |
| options | Dropdown options data source (process parameters yourself after using) | DataSet |  |      |
| primitiveValue | Whether to use primitive value. Suggest deciding based on bound DataSet Field type; type object is equivalent to primitiveValue false. true - valueField value in option; false - entire option object | boolean |  |      |
| optionRenderer | Hook to render Option text | ({ record, text, value }) => ReactNode |  |      |
| groupRenderer | Hook to render Group text | ({ record, text, value }) => ReactNode |  | 1.6.4 |
| optionTooltip | Show option content with tooltip | string | none \| always \| overflow | 1.4.0 |
| notFoundContent | Content shown when dropdown list is empty | ReactNode |  |      |
| pagingOptionContent | Render paging option | ReactNode |  | |
| onOption | Set option properties, such as disabled |
| commonItem | Set common items | Array&lt;string&gt; |  |     |
| maxCommonTagPlaceholder | Placeholder when common item tags exceed maximum count | ReactNode \| (restValues) => ReactNode |  |        |
| maxCommonTagCount | Maximum count of common item tags | number |  |      |
| maxCommonTagTextLength | Maximum text length of common item tags | number |  |                                                                                                                          | ({ dataSet, record })) => object |  |       |
| noCache | Re-query automatically on dropdown; do not cache dropdown data source | boolean |   |       |
| selectAllButton | In multiple mode, whether to show Select All button; supports custom buttons | boolean \| (ButtonProps[]) => ButtonProps[] | true | 1.0.0 |
| popupContent | Custom dropdown content; note function parameter dataSet is dropdown options | ReactNode \| ({ dataSet, field, record, textField, valueField, content, setValue(value), setPopup(popup) }) => ReactNode | | 1.4.1 |
| searchFieldInPopup | Show search field in dropdown | boolean |  | 1.4.4 |
| searchFieldProps | Props of search field when shown in dropdown | TextFieldProps |  | 1.4.4 |
| reserveParam | In multiple mode, whether to retain parameters after selecting search result | boolean | [globalConfig.selectReserveParam](/en/procmp/configure/configure#api) | 1.5.7 |
| scrollLoad | Enable option scroll loading | boolean |  | 1.6.7 |
| popupShowComboValue | Whether to show combo composite value in popup options; when not showing composite value, defaultActiveFirstOption is invalid; enter or blur selects composite value | boolean | true | 1.6.7 |
| virtual | Support virtual scrolling | boolean| false | 1.6.7 |
| showInputPrompt | Whether to display input prompts in the drop-down box when input is available. When true or a string is returned, it will be displayed in the placeholder at the same time. | boolean \| ReactNode \| (({ searchable, combo }) => boolean \| ReactNode) \| undefined |  | 1.6.8 |
| addNewOptionPrompt | Customized new option function: pass in path (rendered according to addNewOptionPromptRender) or completely customized rendering; | [AddNewOptionPromptResultProps](#AddNewOptionPromptResultProps) \| ((props: [AddNewOptionPromptRenderProps](#AddNewOptionPromptRenderProps)) => (ReactNode \| AddNewOptionPromptResultProps)) |  | 1.6.8 |


For more properties, please refer to [TriggerField](/en/procmp/abstract/trigger-field/#TriggerField).

### Select.OptGroup

| Property | Description | Type |
| ----- | ---------- | ------ |
| label | Option group title | ReactNode |

### Select.Option

| Property | Description | Type |
| -------- | ------ | ------- |
| value    | Option value | any     |
| disabled | Disabled   | boolean |

### Select.AddNewOptionPromptRenderProps

| Property | Description | Type | Default |
| --------| ------| -------| ------|
| type | Rendering type: prompt Render when there is data, noDataPrompt Render when there is no data | 'prompt' \| 'noDataPrompt' | |
| component | rendering component name | 'Select' \| 'Lov' | |
| renderEmptyComponent | Empty state rendering component name | string | |
| record | Record | Record | |
| field | Field | Field | |
| code | lookupCode or lovCode | string | |

### Select.AddNewOptionPromptResultProps

| Property | Description | Type | Default |
| --------| ------| -------| ------|
| path | Verify permissions, and jump to page | string | |
| disabledTooltip | When disabled TooltipProps | TooltipProps | |
| onClick | Button click event, use path to verify permissions, no longer jump after setting path | (path: string, record?: Record, field?: Field) => void | |
| \[key: string\] | Other configuration properties, which can be used in the parameters of global configuration addNewOptionPromptRender | any | |


### Input Field Too Long In Multiple Mode

Refer to [Select maxTagCount](/en/tutorials/select#when-set-multiple-then-input-field-too-long).
