---
category: Pro Components
type: Data Entry
subtitle: 提及
title: Mentions
---

提及组件。

## 何时使用

用于在输入中提及某人或某事，常用于发布、聊天或评论功能。

## API

```jsx
<Mentions onChange={onChange}>
  <Mentions.Option value="sample">Sample</Mentions.Option>
</Mentions>
```

### Mentions API

| API | 说明 | 类型 |
| --- | --- | --- |
| getMentions | 根据输入值解析提及人的列表信息 | Function(value: string, config?: { prefix?: string \| string[], split?: string }): { prefix: string, value: string }[] |

### Mentions

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| notFoundContent | 当下拉列表为空时显示的内容 | ReactNode | 无匹配结果。 |
| split | 设置选中项前后分隔符 | string | ' ' |
| transitionName | 动画名称，可选值：`zoom` `fade` `slide-up` `slide-down` `slide-left` `slide-right` `swing` `move` | string |  |
| placement | 弹出层展示位置 | `top` \| `bottom` |  |
| prefix | 设置触发关键字 | string \| string[] | @ |
| filterOption | 自定义过滤逻辑 | false \| (input: string, option: OptionProps) => boolean |  |
| validateSearch | 自定义触发验证逻辑 | (text: string, props: MentionsProps) => void |  |
| onSelect | 选择选项时触发 | (option: OptionProps, prefix: string) => void |  |
| onSearch | 搜索时触发 | (text: string, prefix: string) => void |  |
| getPopupContainer | 指定建议框挂载的 HTML 节点 | (triggerNode: Element) => HTMLElement |  |
| loading | 是否正在加载选项 | boolean |  |

### Option

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 选择时填充的值 | string |  |
| key | 唯一值 | string |  |
| disabled | 是否禁用 | boolean |  |
| children | 选项内容 | ReactNode |  |
| className | 选项类名 | string |  |
| style | 选项样式 | CSSProperties |  |

更多属性请参考 [TextArea](/components-pro/text-area/#TextArea)。
