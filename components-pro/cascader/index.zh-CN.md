---
category: Pro Components
type: Data Entry
title: Cascader
subtitle: 级联选择
---

级联选择框。

## 何时使用

- 需要从一组相关联的数据集合进行选择，例如省市区，公司层级，事物分类等。
- 从一个较大的数据集合中进行选择时，用多级分类进行分隔，方便选择。
- 比起 Select 组件，可以在同一个浮层中完成选择，有较好的体验。
- 注意点在于该pro组件支持多选，单选时候返回value 为 `[a,b,c,d]`，多选返回值为`[[a,b,c,d],[a,b,c,d]]`

## API

```html
<Cascader options={options} onChange={onChange} />
```

### Cascader

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| expandTrigger | 次级菜单的展开方式，可选 'click' 和 'hover' | string | 'click' |
| dropdownMatchSelectWidth | 下拉单个      框匹配输入框宽度 | boolean | true |
| dropdownMenuStyle | 下拉框菜单样式名 | object |  |
| options | 下拉框选项数据源 | DataSet \| Array:[{meaning:``,value:``}] |  |
| primitiveValue | 是否为原始值（建议以绑定的数据源 Field 的 type 来决定值类型，如 type 设为 object 相当于 primitiveValue 设为 false）`true` - 选项中 valueField 对应的值 `false` - 选项值对象 | boolean |  |
| notFoundContent | 当下拉列表为空时显示的内容 | ReactNode |  |
| onOption | 设置选项属性，如 disabled | ({ dataSet, record })) => object \| ({ options, item })) => object |  |

更多属性请参考 [TriggerField](/components-pro/trigger-field/#TriggerField)。


> 注意，如果需要获得中国省市区数据，可以参考 [china-division](https://gist.github.com/afc163/7582f35654fd03d5be7009444345ea17)。
