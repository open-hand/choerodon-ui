---
category: Pro Components
subtitle: 弹出选择输入框
type: Data Entry
title: Lov
---

表单控件。

## 何时使用

## API

### Lov

多语言输入框

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| configUrl | 查询LOV配置的地址 | string\| (code) => string  | (code) => `/sys/lov/lov_define?code=${code}` |
| queryUrl | LOV数据源查询地址 | string\| (code) => string | (code) => `/common/lov/${code}`  |

更多属性请参考 [ViewComponent](/components-pro/text-field/#TextField)。

<style>
.code-box .c7n-pro-row {
  margin-bottom: .24rem;
}
</style>
