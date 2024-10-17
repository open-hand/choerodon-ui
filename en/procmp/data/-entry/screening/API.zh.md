---
title: API
---

### Screening

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| tagRender | 顶部的 tag 位置的渲染可以自定义已选值的展示 | ({ labelTitle, TagsProps }) => ReactElement<any> |
| onChange | 当值改变触发的回调方法 | (value: any, oldValue: any) => void |

### ScreeningItem

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| multiple | 初始打开多选 | string |  |
| name | 绑定指定 field（必填） | string |  |
| primitiveValue | 原始值效果和使用 filed object 类似 | boolean | false |
| onChange | 修改值触发的回调 | string |  |
| renderer | 整个选择框的渲染 | (props: RenderProps) => ReactNode |  |
| colProps | 栅格布局配置 | ColProps |  |
| rowProps | 栅格布局配置 | RowProps |  |
| optionRenderer | 自定义控制选项的展示 | ({text, value, record}) => ReactElement<any>; |  |

### PropsTab 

| 属性名 | 说明 | 类型 |
| --- | --- | --- |
| text | 每个小 tag 展示的内容文本 | string |
| label | tag 的小标题 | string |
| handleClose | 点击关闭按钮需要触发的方法来删除值 | (key) => void |
| key | 当前字段的标记配合 handleClose 以及定义为唯一值 | string |

更多属性请参考 [DataSetComponent](/zh/procmp/abstract/ViewComponent#datasetcomponent)。
