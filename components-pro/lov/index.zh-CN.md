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
| tableProps | 表格属性，详见[TableProps](/components-pro/table/#Table)，优先级高于视图配置 | object           |         |
| noCache    | 弹窗时自动重新查询                                   | string\| boolean | false   |
| mode       | 显示模式，可选值: `default` `button`                 | string           | default |
| searchMatcher | 搜索器。当为字符串时，作为 lookup 的参数名来重新请求值列表。 | string \| ({ record, text, textField, valueField }) => boolean | ({ record, text, textField }) => record.get(textField).indexOf(text) !== -1 |
| paramMatcher | 参数匹配器。当为字符串时，进行参数拼接。 | string \| ({ record, text, textField, valueField }) => string | |
| searchAction | 搜索触发变更的动作, 可选值：`blur` `input`， | string | input |
| fetchSingle | searchAction 为 blur 时生效，获取记录有重复时弹出选择窗口 | boolean | false |

更多属性请参考 [TextField](/components-pro/text-field/#TextField), [Button](/components-pro/button/#Button)。

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
