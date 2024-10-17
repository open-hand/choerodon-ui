---
title: API
---

> 多行模式在 1.5.0 版本新增。 

| 属性名       | 说明                                                          | 类型   | 默认值 |
| ---------- | ------------------------------------------------------------- | ------ | ------ |
| modalProps | 弹窗属性，详见[ModalProps](/zh/procmp/feedback/modal/#Modal)          | object |        |
| maxLengths | 多语言弹窗内选项输入最大长度(主语言 Field maxLength 配置优先) | object |        |
| type | Single or multiple lines of input, options: `singleLine` `multipleLine` | string | singleLine |
| rows | Text field height(The property is available when type is multipleLine) | number  | 3 |
| resize | Whether you can drag and drop to resize(The property is available when type is multipleLine), options： `none` `both` `vertical` `horizontal` | string  | vertical |
| [displayOutput(1.5.5)](/en/procmp/data-display/output#Use%20in%20Form) | 显示为 `Output` 样式 | boolean | |

更多属性请参考 [TextField](/en/procmp/data-entry/text-field/#TextField) 或 [TextArea](/en/procmp/data-entry/text-area/#TextArea).
