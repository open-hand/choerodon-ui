---
title: API
---

| 参数       | 说明                                                 | 类型             | 默认值  |
| ---------- | ---------------------------------------------------- | ---------------- | ------- |
| modalProps | 弹窗属性，详见[ModalProps](/zh/procmp/feedback/modal/#Modal) | object           |         |
| tableProps | 表格属性，详见[TableProps](/zh/procmp/data-display/table/#Table) | object           |         |
| noCache    | 弹窗时自动重新查询                                   | string\| boolean | false   |
| mode       | 显示模式，可选值: default \| button                 | string           | default |
| searchMatcher | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。 | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 |
| paramMatcher | 参数匹配器。当为字符串时，进行参数拼接。 | string \| ({ record, text, textField, valueField }) => string | |
| lovEvents | Lov 数据源 DataSet Events。 | Events | |
| searchAction | 搜索触发变更的动作, 可选值：`blur` `input`， | string | input |
| fetchSingle | searchAction 为 blur 时生效，获取记录有重复时弹出选择窗口 | boolean | false |

更多属性请参考 [TextField](/zh/procmp/data-entry/text-field/#TextField), [Button](/zh/procmp/general/button/#Button)。

