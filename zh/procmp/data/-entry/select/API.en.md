---
title: API
---

### Select

| 属性名 | 说明                                                                                                                                                                        | 类型                                                           | 默认值                                                                      | 版本 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- | ----- |
| combo                     | 复合输入值                                                                                                                                                                  | boolean                                                        | false                                                                       |      |
| searchable                | 是否可搜索                                                                                                                                                                  | boolean                                                        | false                                                                       |      |
| reverse                | 是否显示反选按钮                                                                                                                                                               | boolean                                                        | true                                                                       | 1.0.0      |
| searchMatcher             | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。                                                                                                                | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 |      |
| optionsFilter             | 选项过滤                                                                                                                                                                    | (record) => boolean                                            |                                                                             |      |
| paramMatcher | 参数匹配器。当为字符串时，进行参数拼接 | string | ({ record, text, textField, valueField }) => string | | |
| defaultActiveFirstOption | 是否默认高亮第一个选项。 | boolean | true | 1.5.0-beta.0 |
| checkValueOnOptionsChange | 关联 DataSet, 且 field 设置 cascadeMap 属性, 当选项改变时，检查并清除不在选项中的值                                                                                                                                      | boolean                                                        | true                                                                        |      |
| dropdownMatchSelectWidth  | 下拉框匹配输入框宽度                                                                                                                                                        | boolean                                                        | true                                                                        |      |
| dropdownMenuStyle         | 下拉框菜单样式名                                                                                                                                                            | object                                                         |                                                                             |      |
| options                   | 下拉框选项数据源（使用后需要自行处理参数等）                                                                                                                                | DataSet                                                        |                                                                             |      |
| primitiveValue            | 是否为原始值（建议以绑定的数据源 Field 的 type 来决定值类型，如 type 设为 object 相当于 primitiveValue 设为 false）true - 选项中 valueField 对应的值 false - 选项值对象 | boolean                                                        |                                                                             |      |
| optionRenderer            | 渲染 Option 本文的钩子                                                                                                                                                      | ({ record, text, value }) => ReactNode                         |                                                                             |      |
| groupRenderer | 渲染 Group 文本的钩子 | ({ record, text, value }) => ReactNode | | 1.6.4 |
| optionTooltip | 用tooltip显示选项内容 | string  |      none \| always \| overflow                   | 1.4.0 |
| notFoundContent           | 当下拉列表为空时显示的内容                                                                                                                                                  | ReactNode                                                      |                                                                             |      |
| pagingOptionContent | 渲染分页 option | ReactNode | | |
| onOption                  | 设置选项属性，如 disabled         |
| commonItem | 设置常用项 | Array&lt;string&gt; | |     |
| maxCommonTagPlaceholder | 设置常用项标签超出最大数量时的占位描述 | ReactNode \| (restValues) => ReactNode |  |        |
| maxCommonTagCount | 设置常用项标签最大数量 | number |  |      |
| maxCommonTagTextLength | 设置常用项标签文案最大长度 | number |  |                                                                                                                          | ({ dataSet, record })) => object                               |                                                                             |       |
| noCache    | 下拉时自动重新查询，不缓存下拉数据源                                   | boolean |   |       |
| selectAllButton | 多选模式下，是否显示全选按钮， 支持自定义按钮 | boolean \| (ButtonProps[]) => ButtonProps[] | true | 1.0.0       |
| popupContent | 下拉框的自定义内容, 注意函数参数 dataSet 为下拉列表的 options | ReactNode \| ({ dataSet, field, record, textField, valueField, content, setValue(value), setPopup(popup) }) => ReactNode | | 1.4.1      |
| searchFieldInPopup | 搜索框显示在下拉框中  | boolean |  | 1.4.4 |
| searchFieldProps | 搜索框显示在下拉框中时，可以设置输入框的属性  | TextFieldProps |  | 1.4.4 |
| reserveParam | 多选模式下，搜索选中后是否保留参数显示 | boolean | [globalConfig.selectReserveParam](/zh/procmp/configure/configure#api)  | 1.5.7 |
| scrollLoad | 是否开启选项滚动加载  | boolean |  | 1.6.7 |
| popupShowComboValue | popup 弹窗中的选项是否显示 combo 复合值; 当不展示复合值时, defaultActiveFirstOption 无效, enter 或者 失焦选中复合值; | boolean | true | 1.6.7 |
| virtual | 支持虚拟滚动 | boolean| false | 1.6.7 |


更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。

### Select.OptGroup

| 属性名 | 说明       | 类型   |
| ----- | ---------- | ------ |
| label | 选项组标题 | ReactNode |

### Select.Option

| 属性名 | 说明   | 类型    |
| -------- | ------ | ------- |
| value    | 选项值 | any     |
| disabled | 禁用   | boolean |


### 多选时输入框显示过长

参考 [Select maxTagCount](/en/tutorials/select#when-set-multiple-then-input-field-too-long) 说明。