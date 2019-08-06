---
category: Pro Components
subtitle: 抽象表单控件
type: Abstract
title: FormField
---

表单控件的抽象基类。

## API

### FormField

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| label | 标签, 只在Form下生效 | ReactNode  |  |
| name | 字段名 | string  |  |
| value | <受控>当前值 | any  |  |
| defaultValue | 默认值 | any  |  |
| required | 是否必输 | boolean  | false |
| readOnly | 是否只读 | boolean | false |
| form | 对照表单id | string |   |
| dataIndex | 对照record在DataSet中的index | number | ds.currentIndex |
| record | 对照record, 优先级高于dataSet和dataIndex | Record |  |
| multiple | 是否是多值 | boolean | false |
| validator | 校验器，回调返回值为`true` 或 `Promise.resolve(true)`为校验通过，否则为不通过 | (value, name, form) => string \| boolean \| Promise&lt;string \| boolean&gt; |   |
| help | 额外信息，常用于提示 | `string` | `undefined` |
| showHelp | 展示提示信息的方式，`'tooltip'`只有在`TextField`及其子类上生效 | `'tooltip' \| 'newLine' \| 'none'` | `'newLine'` |
| renderer | 渲染器，覆盖默认渲染行为 | ({ value, text, name, record, dataSet }) => ReactNode | ({ text }) => text |
| noValidate | 不校验，不影响DataSet校验 | boolean | false |
| maxTagPlaceholder | 多值标签超出最大数量时的占位描述 | ReactNode \| (restValues) => ReactNode |  |
| maxTagCount | 多值标签最大数量 | number |  |
| maxTagTextLength | 多值标签文案最大长度 | number |  |
| pristine | 显示原始值 | boolean | false |
| onInvalid | 校验失败回调 | (validationMessage, validity, name) => void |   |
| onChange | 值变化回调 | (value, oldValue, form) => void |   |
| onInput | 输入回调 | Function |   |
| onEnterDown | 键盘回车回调 | Function |   |
| onClear | 值清空回调 | Function |   |

注意，当绑定DataSet时，以DataSet的校验为主，校验规则应设置在DataSet的Field上。

更多属性请参考 [DataSetComponent](/components-pro/core/#DataSetComponent)。

#### RenderParam

```ts
export type RendererParam = {
  value?: any;
  text?: any;
  record?: Record | null;
  name?: string;
  dataSet?: DataSet | null;
}
```
