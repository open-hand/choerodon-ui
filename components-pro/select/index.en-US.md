---
category: Pro Components
subtitle: 选择框
type: Data Entry
title: Select
---

表单控件。

## 何时使用

- 弹出一个下拉菜单给用户选择操作，用于代替原生的选择器，或者需要一个更优雅的多选器时。
- 当选项少时（少于 5 项），建议直接将选项平铺，使用 [SelectBox](/components-pro/select-box) 是更好的选择。

## API

### Select

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| combo | 复合输入值 | boolean | false |
| searchable | 是否可搜索 | boolean | false |
| searchMatcher | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。 | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField) && record.get(textField).indexOf(text) !== -1 |
| paramMatcher | 参数匹配器。当为字符串时，进行参数拼接。 | string \| ({ record, text, textField, valueField }) => string | |
| optionsFilter | 选项过滤 | (record) => boolean |  |
| checkValueOnOptionsChange | 关联 DataSet, 且 field 设置 cascadeMap 属性, 当选项改变时，检查并清除不在选项中的值 | boolean | true |
| defaultActiveFirstOption | 是否默认高亮第一个选项。 | boolean | true |
| dropdownMatchSelectWidth | 下拉框匹配输入框宽度 | boolean | true |
| dropdownMenuStyle | 下拉框菜单样式名 | object |  |
| options | 下拉框选项数据源（使用后需要自行处理参数等） | DataSet |  |
| primitiveValue | 是否为原始值（建议以绑定的数据源 Field 的 type 来决定值类型，如 type 设为 object 相当于 primitiveValue 设为 false）`true` - 选项中 valueField 对应的值 `false` - 选项值对象 | boolean |  |
| optionRenderer | 渲染 Option 文本的钩子 | ({ record, text, value }) => ReactNode |  |
| groupRenderer | 渲染 Group 文本的钩子 | ({ record, text, value }) => ReactNode |  |
| notFoundContent | 当下拉列表为空时显示的内容 | ReactNode |  |
| pagingOptionContent | 渲染分页 option | ReactNode | |
| onOption | 设置选项属性，如 disabled | ({ dataSet, record })) => object |  |
| commonItem | 设置常用项 | Array&lt;string&gt;  | undefined |
| maxCommonTagPlaceholder | 设置常用项标签超出最大数量时的占位描述 | ReactNode \| (restValues) => ReactNode |  |
| maxCommonTagCount | 设置常用项标签最大数量 | number |  |
| maxCommonTagTextLength | 设置常用项标签文案最大长度 | number |  |
| noCache    | 下拉时自动重新查询，不缓存下拉数据源                                   | boolean |   |
| selectAllButton | 多选模式下，是否显示全选按钮， 支持自定义按钮  | boolean \| (ButtonProps[]) => ButtonProps[] | true  |
| reverse | 多选模式下，是否显示反选按钮 | boolean | false  |
| reserveParam | 多选模式下，搜索选中后是否保留参数显示 | boolean | [globalConfig.selectReserveParam](/components/configure#API)  |
| popupContent | 下拉框的自定义内容, 注意函数参数 dataSet 为下拉列表的 options  | ReactNode \| ({ dataSet, field, record, textField, valueField, content, setValue(value), setPopup(popup) }) => ReactNode |  |
| searchFieldInPopup | 搜索框显示在下拉框中  | boolean |  |
| searchFieldProps | 搜索框显示在下拉框中时，可以设置输入框的属性  | TextFieldProps |  |

更多属性请参考 [TriggerField](/components-pro/trigger-field/#TriggerField)。

### Select.OptGroup

| 参数  | 说明       | 类型   | 默认值 |
| ----- | ---------- | ------ | ------ |
| label | 选项组标题 | ReactNode |        |

### Select.Option

| 参数     | 说明   | 类型    | 默认值 |
| -------- | ------ | ------- | ------ |
| value    | 选项值 | any     |
| disabled | 禁用   | boolean |        |  |

<style>
.code-box-demo .c7n-pro-select-wrapper {
  margin-bottom: .1rem;
}
</style>
