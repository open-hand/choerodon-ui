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
| intlType | Single or multiple lines of input, options: `singleLine` `multipleLine` | string | singleLine |
| cols | Text field width(The property is available when intlType is multipleLine) | number  | - |
| rows | Text field height(The property is available when intlType is multipleLine) | number  | 3 |
| resize | Whether you can drag and drop to resize(The property is available when intlType is multipleLine), options： `none` `both` `vertical` `horizontal` | string  | vertical |
| autoSize | Adaptive content height(The property is available when intlType is multipleLine), options: true\| false or object：{ minRows: 2, maxRows: 6 } | boolean\| object  | false |
| onResize | Resizing callback(The property is available when intlType is multipleLine) | (width, height) => void |  |

更多属性请参考 [ViewComponent](/components-pro/text-field/#TextField)。

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
