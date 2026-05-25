---
title: API
---

> Multiple-line mode added in version 1.5.0.

| Property | Description | Type | Default |
| ---------- | ------------------------------------------------------------- | ------ | ------ |
| modalProps | Popup properties; see [ModalProps](/en/procmp/feedback/modal/#Modal) | object |        |
| maxLengths | Maximum input length of options in multi-language popup (main language Field maxLength takes precedence) | object |        |
| type | Single or multiple lines of input, options: `singleLine` `multipleLine` | string | singleLine |
| rows | Text field height(The property is available when type is multipleLine) | number  | 3 |
| resize | Whether you can drag and drop to resize(The property is available when type is multipleLine), options： `none` `both` `vertical` `horizontal` | string  | vertical |
| [displayOutput(1.5.5)](/en/procmp/data-display/output#Use%20in%20Form) | Display as `Output` style | boolean | |

For more attributes, please refer to [TextField](/en/procmp/data-entry/text-field/#TextField) or [TextArea](/en/procmp/data-entry/text-area/#TextArea).
