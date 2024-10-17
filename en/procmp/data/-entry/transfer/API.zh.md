---
title: API
---

### Transfer

> 1.5.0 版本及以上新增属性。

| 属性名 | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| titles | 标题集合，顺序从左至右 | \[ReactNode, ReactNode] |  |
| footer | 底部渲染函数 | (props) => ReactNode |  |
| operations | 操作文案集合，顺序从下至上 | string\[] \| ReactNode[] | ['>', '<'] |
| sortable | 是否显示排序按钮 | boolean | false |
| sortOperations | 排序文案集合 | string\[] \| ReactNode[] | ['∧', '∨'] |
| placeholderOperations(1.6.6) | 搜索文案集合 | string\[]\| string | Please enter your search |
| oneWay(1.5.1) | 是否单向穿梭 | boolean | false |

更多属性请参考 [Select](/zh/procmp/data-entry/select/#Select)。


### Transfer.OptGroup 

| 属性名 | 说明                                     | 类型        |
|-----------|------------------------------------------|------------|
| label | 选项组标题 | string |

### Transfer.Option

| 属性名 | 说明                                     | 类型        |
|-----------|------------------------------------------|------------|
| value | 选项值 | any |

### Render Props

> 1.5.3 版本新增组件。

- Transfer 支持接收 children 自定义渲染列表，并返回以下参数：

| 属性名 | 说明                                     | 类型        |
|-----------|------------------------------------------|------------|
| direction | 渲染列表的方向 | `left` \| `right`  |
| targetOption | 目标数据源 | Record[]  |
| setTargetOption(1.5.5) | 设置目标数据源 | (values: any[]) => void  |  |
| onItemSelect | 勾选条目 | (Records: Record[])  |

#### 参考示例

```
<Transfer {...props}>{({ direction, targetOption, onItemSelect}) => <YourComponent {...listProps} />}</Transfer>
 ```