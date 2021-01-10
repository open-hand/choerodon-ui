---
title: API
---

```html
<Cascader options="{options}" onChange="{onChange}" />
```

### Cascader

| 参数                     | 说明                                                                                                                                                                        | 类型                                                               | 默认值  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- |
| expandTrigger            | 次级菜单的展开方式，可选 'click' 和 'hover'                                                                                                                                 | string                                                             | 'click' |
| dropdownMatchSelectWidth | 下拉单个 框匹配输入框宽度                                                                                                                                                   | boolean                                                            | true    |
| dropdownMenuStyle        | 下拉框菜单样式名                                                                                                                                                            | object                                                             |         |
| options                  | 下拉框选项数据源                                                                                                                                                            | DataSet \| Array:[{meaning:``,value:``}]                           |         |
| primitiveValue           | 是否为原始值（建议以绑定的数据源 Field 的 type 来决定值类型，如 type 设为 object 相当于 primitiveValue 设为 false）`true` - 选项中 valueField 对应的值 `false` - 选项值对象 | boolean                                                            |         |
| notFoundContent          | 当下拉列表为空时显示的内容                                                                                                                                                  | ReactNode                                                          |         |
| onOption                 | 设置选项属性，如 disabled                                                                                                                                                   | ({ dataSet, record })) => object \| ({ options, item })) => object |         |

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。

`menuMode` 为 `single`，其中可以添加的配置：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| singleMenuStyle | 由于渲染在body下可以方便按照业务配置弹出框的大小 | CSSProperties |  |
| singleMenuItemStyle | 由于渲染在body下可以方便按照业务配置超出大小样式和最小宽度等 | CSSProperties |  |
| singlePleaseRender | 设置需要的提示配置 | ({key,className,text}) => ReactElement |  |
| singleMenuItemRender | 头部可以渲染出想要的tab样子 | (title:string) => ReactElement |  |

无法配置的参数 `expandIcon`，

> 注意，如果需要获得中国省市区数据，可以参考 [china-division](https://gist.github.com/afc163/7582f35654fd03d5be7009444345ea17)。
