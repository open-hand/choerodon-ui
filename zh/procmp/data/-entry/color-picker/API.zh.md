---
title: API
---

| 属性 | 说明 | 类型 | 默认值 | 版本 |
|-----|-----|-----|------ | ------  |
| defaultValue | 默认值 | string | #ff0000 | |
| mode            | 显示模式，可选值: default \| button  | string | default | 1.5.5 |
| preset          | 是否开启备选色板                     | boolean | false | 1.5.5 |
| showNoFill      | 是否显示无填充选项                    | boolean | `true` | 1.6.9 |
| gradientMode    | 颜色模式：`single` 为单色，`gradient` 为渐变色（支持线性和径向渐变）；传入 `['single', 'gradient']` 可在两种模式间切换 | 'single' \| 'gradient' \| ('single' \| 'gradient')[] | `single` | 1.6.9 |

注意：**ColorPicker 组件设置 multiple 属性为 true 无效, DataSet 的字段属性 multiple 同理**

更多属性请参考 [TriggerField](/zh/procmp/abstract/trigger-field/#TriggerField)。
