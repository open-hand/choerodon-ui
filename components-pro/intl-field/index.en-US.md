---
category: Pro Components
subtitle: 多语言输入框
type: Data Entry
title: IntlField
---

表单控件。

## 何时使用



## API

### IntlField

多语言输入框

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| modalProps | 弹窗属性，详见[ModalProps](/components/modal/#Modal) | object  |  |
| maxLengths | 多语言弹窗内选项输入最大长度(主语言 Field maxLength 配置优先) | object |  |
| type | Single or multiple lines of input, options: `singleLine` `multipleLine` | string | singleLine |
| rows | Text field height(The property is available when type is multipleLine) | number  | 3 |
| resize | Whether you can drag and drop to resize(The property is available when type is multipleLine), options： `none` `both` `vertical` `horizontal` | string  | vertical |

更多属性请参考 [TextField](/components-pro/text-field/#TextField) 或 [TextArea](/components-pro/text-area/#TextArea)。

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
