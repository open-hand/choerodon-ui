---
title: API
---

> 多行模式在 1.5.0 版本新增。 

| 属性名       | 说明                                                          | 类型   | 默认值  |
| ---------- | ------------------------------------------------------------- | ------ | ----- |
| modalProps | 弹窗属性，详见[ModalProps](/zh/procmp/feedback/modal/#Modal)          | object |  |
| maxLengths | 多语言弹窗内选项输入最大长度(主语言 Field maxLength 配置优先) | object |  |
| type | 单行或多行输入，可选值：`singleLine` \| `multipleLine` | string | singleLine |
| rows | 文本域高(type为multipleLine有效) | number  | 3 |
| resize | 是否能够拖拽调整大小(type为multipleLine有效)，可选值： `none` \| `both` \| `vertical` \| `horizontal` | string  | vertical |
| [displayOutput(1.5.5)](/zh/procmp/data-display/output#在表单中使用) | 显示为 Output 样式 | boolean | |

更多属性请参考 [TextField](/zh/procmp/data-entry/text-field/#TextField) 或 [TextArea](/zh/procmp/data-entry/text-area/#TextArea)。
