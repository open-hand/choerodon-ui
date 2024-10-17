---
title: API
---

| 属性名 | 说明                                                                                                                                                                        | 类型                                                               | 默认值  | 版本 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- | --- |
| expandTrigger            | 次级菜单的展开方式，可选： click \| hover                                                                                                                                 | string                                                             | click |   |
| dropdownMatchSelectWidth | 下拉单个 框匹配输入框宽度                                                                                                                                                   | boolean                                                            | true    |   |
| dropdownMenuStyle        | 下拉框菜单样式名                                                                                                                                                            | object                                                             |         |   |
| options                  | 下拉框选项数据源                                                                                                                                                            | DataSet \| Array:[{meaning:'',value:''}]                           |         |   |
| primitiveValue           | 是否为原始值（建议以绑定的数据源 Field 的 type 来决定值类型，如 type 设为 object 相当于 primitiveValue 设为 false）true - 选项中 valueField 对应的值 false - 选项值对象 | boolean                                                            |         |   |
| notFoundContent          | 当下拉列表为空时显示的内容                                                                                                                                                  | ReactNode                                                          |         |   |
| pagingOptionContent | 渲染分页 option | ReactNode | | 1.4.4 |
| onOption                 | 设置选项属性，如 disabled                                                                                                                                                   | ({ dataSet, record })) => object \| ({ options, item })) => object |         |   |
| menuMode | 单弹框属性 | single \| multiple | |  |
| onChoose | 选择一个值的时候触发| (value,record) => void | |   |
| onUnChoose | 取消选中一个值的时候触发多选时候生效|  (value,record) => void | |    |
| changeOnSelect | 所选既所得 | boolean | | |
| searchable | 是否可搜索 | boolean | false | 1.3.0  |
| searchMatcher | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。 | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField) && record.get(textField).indexOf(text) !== -1 | 1.3.0   |
| loadData |	用于动态加载选项，无法与 showSearch 一起使用 |	(selectedOptions) => void	| | 1.4.4 |
| async |	用于数据源异步加载选项，无法与 showSearch 一起使用 |	boolean | | 1.4.4 |
| optionRenderer(1.5.6) | 渲染 Option 本文的钩子。isFilterSearch 代表是否搜索过滤中 | ({ text, value, record, dataSet, isFilterSearch }) => ReactNode |  |

`menuMode` 为 `single`，其中可以添加的配置：

| 属性名 | 说明 | 类型 | 
| --- | --- | --- | 
| singleMenuStyle | 由于渲染在body下可以方便按照业务配置弹出框的大小 | CSSProperties |  
| singleMenuItemStyle | 由于渲染在body下可以方便按照业务配置超出大小样式和最小宽度等 | CSSProperties |  
| singlePleaseRender | 设置需要的提示配置 | ({key,className,text}) => ReactElement |  
| singleMenuItemRender | 头部可以渲染出想要的tab样子 | (title:string) => ReactElement |  

无法配置的参数 `expandIcon`，

> 注意，如果需要获得中国省市区数据，可以参考 [china-division](https://gist.github.com/afc163/7582f35654fd03d5be7009444345ea17)。

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。
