---
category: Pro Components
subtitle: 文本输入框
type: Data Entry
title: TextField
---

文本输入框。

## 何时使用



## API

### TextField

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| placeholder | 占位词 | string  |  |
| prefix | 前缀，一般用于放置图标 | ReactNode  |  |
| suffix | 后缀，一般用于放置图标 | ReactNode  |  |
| clearButton | 是否显示清除按钮 | boolean  | false |
| minLength | 最小长度 | number  |  |
| maxLength | 最大长度 | number |   |
| pattern | 正则校验 | string\|RegExp |   |
| autoComplete | 自动完成，可选值：`on` `off` | string | off |
| addonBefore | 设置前置标签 | string \| ReactNode |  |
| addonAfter | 设置后置标签 | string \| ReactNode |  |
| restrict | 限制可输入的字符 | string |  |

更多属性请参考 [FormField](/components-pro/field/#FormField)。

<style>
.code-box .c7n-pro-row {
  margin-bottom: .24rem;
}
</style>
