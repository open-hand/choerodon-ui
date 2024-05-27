---
category: Pro Components
subtitle: 穿梭框
type: Data Entry
title: Transfer
---

表单控件。

## 何时使用

- 平铺选项便于用户选择操作，作用同[Select.multiple](/components-pro/select/)。

## API

### Transfer

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| operations | A set of operations that are sorted from bottom to top. | string\[] \| ReactNode[] | ['>', '<'] |
| sortable | If included, it will show sort button | boolean | false |
| sortOperations | A set of sort that are sorted raise and down. | string\[] \| ReactNode[] | ['∧', '∨'] |
| placeholderOperations | 搜索文案集合 | string\[]\| string | Please enter your search |
| oneWay | One way shuttle | boolean | false |

更多属性请参考 [Select](/components-pro/select/#Select)。


### Transfer.OptGroup 

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| label | 选项组标题 | string |  |

### Transfer.Option

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| value | 选项值 | any |  |

### Render Props

- Transfer 支持接收 children 自定义渲染列表，并返回以下参数：

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| direction | 渲染列表的方向 | `left` \| `right`  |  |
| targetOption | 目标数据源 | Record[]  |  |
| setTargetOption | 设置目标数据源 | (values: any[]) => void  |  |
| onItemSelect | 勾选条目 | (Records: Record[])  |  |

#### 参考示例

```
<Transfer {...props}>{({ direction, targetOption, onItemSelect}) => <YourComponent {...listProps} />}</Transfer>
 ```

<style>
.code-box-demo .c7n-hap-transfer-wrapper {
  margin-bottom: .1rem;
}
</style>
