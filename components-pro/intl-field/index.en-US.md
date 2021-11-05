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
| intlType | 单行或多行输入，可选值：`singleLine` \| `multipleLine` | string | singleLine |
| cols | 文本域宽(intlType为multipleLine有效) | number  | - |
| rows | 文本域高(intlType为multipleLine有效) | number  | 3 |
| resize | 是否能够拖拽调整大小(intlType为multipleLine有效)，可选值： `none` `both` `vertical` `horizontal` | string  | vertical |
| autoSize | 自适应内容高度(intlType为multipleLine有效)，可设置为 true\| false 或对象：{ minRows: 2, maxRows: 6 } | boolean\| object  | false |
| onResize | 大小调整回调(intlType为multipleLine有效) | (width, height) => void |  |

更多属性请参考 [ViewComponent](/components-pro/text-field/#TextField)。

<style>
.code-box .c7n-row {
  margin-bottom: .24rem;
}
</style>
