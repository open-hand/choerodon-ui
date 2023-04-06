---
category: Pro Components
subtitle: 弹出选择输入框
type: Data Entry
title: Lov
---

表单控件。

## 何时使用

优先级高于视图配置的属性开发者慎重修改，避免配置修改造成不一致。

## API

### Lov

弹出选择输入框

| 参数       | 说明                                                 | 类型             | 默认值  |
| ---------- | ---------------------------------------------------- | ---------------- | ------- |
| modalProps | 弹窗属性，详见[ModalProps](/components/modal/#Modal)，优先级高于视图配置 | object           |         |
| tableProps | 表格属性，详见[TableProps](/components-pro/table/#Table)，优先级高于视图配置 | object \| (lovTablePropsConfig) => object          |         |
| noCache    | 弹窗时自动重新查询                                   | string\| boolean | false   |
| mode       | 显示模式，可选值: `default` `button`                 | string           | default |
| searchMatcher | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。 | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 |
| paramMatcher | 参数匹配器。当为字符串时，进行参数拼接。 | string \| ({ record, text, textField, valueField }) => string | |
| searchAction | 搜索触发变更的动作, 可选值：`blur` `input`， | string | input |
| fetchSingle | searchAction 为 blur 时生效，获取记录有重复时弹出选择窗口 | boolean | false |
| autoSelectSingle | 点击查询仅存在一条数据时自动选中 | boolean | false |
| showCheckedStrategy | 定义选中项回填的方式。`SHOW_CHILD`: 只显示子节点. `SHOW_PARENT`: 只显示父节点(当父节点下所有子节点都选中时). 默认显示所有选中节点(包括父节点). | string | SHOW_ALL |
| onBeforeSelect | 确认勾选前回调，返回 false 弹窗不关闭。支持返回一个 Promise 对象，Promise 对象 resolve(false) 或 reject 时弹窗不关闭。 | (records: Record \| Record[]) => boolean \| undefined |  |
| onSearchMatcherChange | viewMode 为 popup 时，查询条选项值变更事件 | (searchMatcher?:string) => void \| undefined |  |
| viewRenderer | 自定义弹窗视图渲染器 | ({ dataSet, lovConfig, textField, valueField, multiple, modal}) => ReactNode |  |
| viewMode | 弹窗视图渲染模式，可选值: `modal` `drawer` `popup` | string | modal |
| showSelectedInView | 多选时，viewMode 为 modal 或 drawer，在对话框中显示已选记录(TableProps 的 showSelectionTips会被设置为 false) | boolean |  |
| selectionProps | 显示已选记录时的参数 | SelectionProps |  |
| popupSearchMode | viewMode 为 popup 时，查询条件显示位置 | PopupSearchMode: 'single', 'multiple' | multiple |

### SelectionProps

| 参数        | 说明                   | 类型   | 默认值   |
| ----------- | ---------------------- | ------ | -------- |
| nodeRenderer | 节点渲染器 | (record: Record) => ReactNode | |
| placeholder | 已选记录为空时的默认文案 | string \| ReactNode  | |


更多属性请参考 [Select](/components-pro/select/#Select), [Button](/components-pro/button/#Button)。

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
