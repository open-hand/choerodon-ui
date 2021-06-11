---
title: API
---

| 参数       | 说明                                                 | 类型             | 默认值  | 版本 |
| ---------- | ---------------------------------------------------- | ---------------- | ------- | --- |
| modalProps | 弹窗属性，详见[ModalProps](/zh/procmp/feedback/modal/#Modal)，优先级高于视图配置  | object           |         ||
| tableProps | 表格属性，详见[TableProps](/zh/procmp/data-display/table/#Table)，优先级高于视图配置  | object           |       |  |
| noCache    | 弹窗时自动重新查询                                   | string\| boolean | false   ||
| mode       | 显示模式，可选值: default \| button                 | string           | default ||
| searchMatcher | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。 | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 ||
| paramMatcher | 参数匹配器。当为字符串时，进行参数拼接。 | string \| ({ record, text, textField, valueField }) => string | ||
| searchAction | 搜索触发变更的动作, 可选值：`blur` `input`， | string | input ||
| fetchSingle | searchAction 为 blur 时生效，获取记录有重复时弹出选择窗口 | boolean | false ||
| autoSelectSingle | 点击查询仅存在一条数据时自动选中 | boolean | false |

更多属性请参考[Select](/zh/procmp/data-entry/select/#API), [TextField](/zh/procmp/data-entry/text-field/#TextField), [Button](/zh/procmp/general/button/#Button)。

