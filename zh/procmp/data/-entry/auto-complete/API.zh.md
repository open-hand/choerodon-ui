---
title: API
---

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| options | 自动完成的数据源 | DataSet | |
| optionRenderer | 渲染 Option 文本的钩子 | ({ record, text, value }) => ReactNode | |
| matcher | 匹配器 | (value,inputText) => boolean | (value, inputText) => value.indexOf(inputText) !== -1 |

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。
