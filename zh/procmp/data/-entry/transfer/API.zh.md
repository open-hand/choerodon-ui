---
title: API
---

### Transfer

> 1.5.0 版本及以上新增属性。

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| operations | 操作文案集合，顺序从下至上 | string\[] \| ReactNode[] | ['>', '<'] |
| sortable | 是否显示排序按钮 | boolean | false |
| sortOperations | 排序文案集合 | string\[] \| ReactNode[] | ['∧', '∨'] |
| oneWay(1.5.1) | 是否单向穿梭 | boolean | false |

更多属性请参考 [Select](/zh/procmp/data-entry/select/#Select)。


### Transfer.OptGroup 

| 参数      | 说明                                     | 类型        |
|-----------|------------------------------------------|------------|
| label | 选项组标题 | string |

### Transfer.Option

| 参数      | 说明                                     | 类型        |
|-----------|------------------------------------------|------------|
| value | 选项值 | any |

