---
category: Pro Components
subtitle: 抽象表单控件
type: Abstract
title: FormField
---

表单控件的抽象基类。

## API

### FormField

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| label | 标签, 只在 Form 下生效 | ReactNode |  |
| name | 字段名 | string |  |
| value | <受控>当前值 | any |  |
| defaultValue | 默认值 | any |  |
| required | 是否必输 | boolean | false |
| readOnly | 是否只读 | boolean | false |
| disabled | 是否禁用 | boolean | false |
| form | 对照表单 id | string |  |
| dataIndex | 对照 record 在 DataSet 中的 index | number | ds.currentIndex |
| record | 对照 record, 优先级高于 dataSet 和 dataIndex | Record |  |
| multiple | 是否是多值 | boolean | false |
| validator | 校验器，回调返回值为`true` 或 `Promise.resolve(true)`为校验通过，否则为不通过 | (value, name, form) => string \| boolean \| Promise&lt;string \| boolean&gt; |  |
| help | 额外信息，常用于提示 | `string` | `undefined` |
| showHelp | 展示提示信息的方式，`tooltip`只有在`TextField`及其子类上生效， 可选值 `tooltip` `newLine` `none` | string | `newLine` |
| renderer | 渲染器，覆盖默认渲染行为 | ({ value, text, name, record, dataSet }) => ReactNode | ({ text }) => text |
| noValidate | 不校验，不影响 DataSet 校验 | boolean | false |
| maxTagPlaceholder | 多值标签超出最大数量时的占位描述 | ReactNode \| (restValues) => ReactNode |  |
| maxTagCount | 多值标签最大数量 | number |  |
| maxTagTextLength | 多值标签文案最大长度 | number |  |
| pristine | 显示原始值 | boolean | false |
| trim | 字符串值是否去掉首尾空格，如果绑定 DataSet 需要在 DataSet 的 Field 上设置 trim，可选值: `both` `left` `right` `none` | string | `both` |
| format | 字符串格式化，可选值: `uppercase` `lowercase` `capitalize` | string |  |
| validationRenderer | 校验信息渲染 | (validationResult, validationProps) => ReactNode |  |
| onInvalid | 校验失败回调 | (validationResults, validity, name) => void |  |
| onChange | 值变化回调 | (value, oldValue, form) => void |  |
| onInput | 输入回调 | Function |  |
| onEnterDown | 键盘回车回调 | Function |  |
| onClear | 值清空回调 | Function |  |

注意，当绑定 DataSet 时，以 DataSet 的校验为主，校验规则应设置在 DataSet 的 Field 上。

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

#### RenderParam

```ts
export type RendererParam = {
  value?: any;
  text?: any;
  record?: Record | null;
  name?: string;
  dataSet?: DataSet | null;
};
```
