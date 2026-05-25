---
title: API
---

| Property | Description                                                                                                                                                               | Type                                                               | Default | Version |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- | --- |
| expandTrigger            | Submenu expand trigger; options: click \| hover                                                                                                                             | string                                                             | click  |     |
| dropdownMatchSelectWidth | Dropdown panel matches input width                                                                                                                                          | boolean                                                            | true   |     |
| dropdownMenuStyle        | Dropdown menu style name                                                                                                                                                     | object                                                             |        |     |
| options                  | Dropdown options data source                                                                                                                                                 | DataSet \| Array:[{meaning:'',value:''}]                           |        |     |
| primitiveValue           | Whether value is primitive (recommend deciding by bound DataSet Field type; if type is object, equivalent to primitiveValue = false). true - valueField value in options; false - option value object | boolean                                                            |        |     |
| notFoundContent          | Content displayed when the dropdown list is empty                                                                                                                            | ReactNode                                                          |        |     |
| pagingOptionContent      | Render pagination option                                                                                                                                                     | ReactNode                                                          |        | 1.4.4 |
| onOption                 | Set option properties, such as disabled                                                                                                                                      | ({ dataSet, record })) => object \| ({ options, item })) => object |        |     |
| menuMode                 | Single box pop-up form switch                                                                                                                                                | single \| multiple                                                 |        |     |
| onChoose                 | Triggered when a value is chosen (When checking in batches, the parameter is an array)                                                                                                                                             | (value,record) => void                                             |        |     |
| onUnChoose               | Triggered when a value is unselected; effective in multiple selection (When checking in batches, the parameter is an array)                                                                                                        | (value,record) => void                                             |        |     |
| changeOnSelect           | Change on select                                                                                                                                                              | boolean                                                            |        |     |
| searchable               | Whether searchable                                                                                                                                                            | boolean                                                            | false  | 1.3.0  |
| searchMatcher            | Search matcher. When a string, used as lookup parameter name to re-fetch the value list.                                                                                    | string \| ({ record, text, textField, valueField }) => boolean     | ({ record, text, textField }) => record.get(textField) && record.get(textField).indexOf(text) !== -1 | 1.3.0   |
| loadData                 | Used to dynamically load options; cannot be used with showSearch                                                                                                             | (selectedOptions) => void                                          |        | 1.4.4 |
| async                    | Used to asynchronously load options from data source; cannot be used with showSearch                                                                                         | boolean                                                            |        | 1.4.4 |
| optionRenderer(1.5.6)    | Hook to render Option content; isFilterSearch indicates whether filtering during search                                                                                      | ({ text, value, record, dataSet, isFilterSearch }) => ReactNode    |        |     |
| checkable | Whether to display check boxes in multi-select mode (asynchronous is not supported), please note: when batch checking, the onChoose/onUnChoose parameters are arrays | boolean |  | 1.6.8 |

`menuMode` is `single`; additional configurations:

| Property | Description | Type |
| --- | --- | --- |
| singleMenuStyle | Since it renders under body, you can configure popup size per business needs | CSSProperties |  
| singleMenuItemStyle | Since it renders under body, you can configure overflow styles and minimum width, etc. | CSSProperties |  
| singlePleaseRender | Configure required hint rendering | ({key,className,text}) => ReactElement |  
| singleMenuItemRender | Render desired tab-like header | (title:string) => ReactElement |  

Parameter `expandIcon` cannot be configured.

> Note: For China province/city/district data, refer to [china-division](https://gist.github.com/afc163/7582f35654fd03d5be7009444345ea17).

For more properties, please refer to [TriggerField](/en/procmp/abstract/trigger-field/#TriggerField).
