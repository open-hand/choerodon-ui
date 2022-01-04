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

<style>
.code-box-demo .c7n-hap-transfer-wrapper {
  margin-bottom: .1rem;
}
</style>
