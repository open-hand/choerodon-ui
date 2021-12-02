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
| searchAction | 搜索触发变更的动作, 可选值：blur \| input， | string | input || 1.1.1 |
| fetchSingle | searchAction 为 blur 时生效，获取记录有重复时弹出选择窗口 | boolean | false | 1.1.1 |
| autoSelectSingle | 点击查询仅存在一条数据时自动选中 | boolean | false | 1.3.2 |
| showCheckedStrategy | 定义选中项回填的方式。SHOW_CHILD: 只显示子节点. SHOW_PARENT: 只显示父节点(当父节点下所有子节点都选中时). 默认显示所有选中节点(包括父节点). | string | SHOW_ALL | 1.4.2 |
| onBeforeSelect | 确认勾选前回调，返回 false 弹窗不关闭 | (records: Record \| Record[]) => boolean \| undefined |  | 1.4.4 |
| onSearchMatcherChange | viewMode 为 popup 时，查询条选项值变更事件 | (searchMatcher?:string) => void \| undefined | | 1.5.0-beta.0 |
| viewRenderer | 自定义弹窗视图渲染器 | ({ dataSet, lovConfig, textField, valueField, multiple, modal}) => ReactNode |  | 1.5.0 |
| nodeRenderer | 树形展示节点渲染器 | (record: Record) => ReactNode |  | 1.5.0 |
| showSelectedInView | 多选时，viewMode 为 modal 或 drawer，在对话框中显示已选记录(TableProps 的 showSelectionTips会被设置为 false) | boolean |  | 1.5.0 |

### Lov多选时输入框显示过长

参考 [Select maxTagCount](/zh/tutorials/select#多选时输入框显示过长) 说明，Lov 相同。

更多属性请参考[Select](/zh/procmp/data-entry/select/#API), [TextField](/zh/procmp/data-entry/text-field/#TextField), [Button](/zh/procmp/general/button/#Button)。

