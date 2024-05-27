---
category: Pro Components
subtitle: 穿梭框
type: Data Entry
title: Transfer
cols: 1
---

表单控件。

## 何时使用

- 平铺选项便于用户选择操作，作用同[Select.multiple](/components-pro/select/)。

## API

### Transfer

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| operations | 操作文案集合，顺序从下至上 | string\[] \| ReactNode[] | ['>', '<'] |
| sortable | 是否显示排序按钮 | boolean | false |
| sortOperations | 排序文案集合 | string\[] \| ReactNode[] | ['∧', '∨'] |
| placeholderOperations | 搜索文案集合 | string\[]\| string | 请输入搜索内容 |
| oneWay | 是否单向穿梭 | boolean | false |

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
