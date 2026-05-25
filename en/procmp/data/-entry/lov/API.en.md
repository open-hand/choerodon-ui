---
title: API
---

| Property | Description | Type | Default | Version |
| ---------- | ---------------------------------------------------- | ---------------- | ------- | --- |
| modalProps | Popup properties; see [ModalProps](/en/procmp/feedback/modal/#Modal). Takes precedence over view configuration | object |  |  |
| tableProps | Table properties; see [TableProps](/en/procmp/data-display/table/#Table). Takes precedence over view configuration (modal parameter exists only in modal mode) | object \| (lovTablePropsConfig, modal) => object |  |  |
| noCache | Automatically re-query on popup | string\| boolean | false |  |
| mode | Display mode; options: default \| button | string | default |  |
| searchMatcher | Search matcher. When a string, used as lookup parameter name to re-fetch value list. | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 |  |
| paramMatcher | Parameter matcher. When a string, performs parameter concatenation. | string \| ({ record, text, textField, valueField }) => string |  |  |
| searchAction | Action that triggers search change; options: blur \| input | string | input | 1.1.1 |
| fetchSingle | Effective when searchAction is blur; if multiple duplicate records found, popup selection window | boolean | false | 1.1.1 |
| autoSelectSingle | Auto-select when only one data record exists after query; Button mode is not supported by default. Set `force` to support it. | boolean \| 'force'(1.6.8) | false | 1.3.2 |
| showCheckedStrategy | Define how selected items are displayed. SHOW_CHILD: only show child nodes. SHOW_PARENT: only show parent nodes (when all children under parent are selected). Default shows all selected nodes (including parent nodes). | string | SHOW_ALL | 1.4.2 |
| onBeforeSelect | Callback before confirming selection; return false keeps popup open. Supports returning a Promise (1.5.6); if Promise resolves(false) or rejects, popup stays open. | (records: Record \| Record[]) => boolean \| undefined |  | 1.4.4 |
| onSearchMatcherChange | When viewMode is popup, event for changes in search bar option value | (searchMatcher?:string) => void \| undefined |  | 1.5.0-beta.0 |
| nodeRenderer | Tree node renderer | (record: Record) => ReactNode |  | 1.5.0 |
| viewRenderer | Custom popup view renderer | ({ dataSet }) => ReactNode |  | 1.5.0 |
| viewMode | Popup view render mode; options: modal \| drawer \| popup | string | modal |  |
| showSelectedInView | In multiple selection, when viewMode is modal or drawer, display selected records in dialog (TableProps showSelectionTips is set to false) | boolean |  | 1.5.0 |
| selectionProps | Parameters when displaying selected records; see [selectionProps](#selectionprops) | object |  | 1.5.1 |
| popupSearchMode | When viewMode is popup, position of search conditions | PopupSearchMode: 'single', 'multiple' | multiple | 1.5.7 |
| showDetailWhenReadonly | When the component is readOnly or disabled, click suffix to view selected item details (value set must support detail query) | boolean |  | 1.6.6 |

## SelectionProps

> Added in version 1.5.1.

| Property | Description | Type | Default |
| ----------- | ---------------------- | ------ | -------- |
| nodeRenderer | Node renderer | (record: Record) => ReactNode | |
| placeholder | Default text when selected records are empty | string \| ReactNode  | |

For more properties, please refer to [Select](/en/procmp/data-entry/select/#API), [TextField](/en/procmp/data-entry/text-field/#TextField), [Button](/en/procmp/general/button/#Button).

## Q & A
### Lov Input Too Long In Multiple Selection

Refer to [Select maxTagCount](/en/tutorials/select#when-set-multiple-then-input-field-too-long); Lov behaves the same.

### How To Configure A Tree Lov

Refer to [Lov Tree Tutorial Example](/en/tutorials/lov#树形-lov).


### Lov Search Dropdown Popup Rules
Refer to [Lov Search Dropdown Popup Rules](/en/tutorials/lov#搜索下拉菜单).
