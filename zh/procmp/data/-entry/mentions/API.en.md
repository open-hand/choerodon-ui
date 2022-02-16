---
title: API
---


```jsx
<Mentions onChange={onChange}>
  <Mentions.Option value="sample">Sample</Mentions.Option>
</Mentions>
```

### Mentions API

| API | Description | Type |
| --- | ----------- | ---- |
| getMentions | get mentioned people in input value | Function(value: string, config?: { mentionsKey?: string \| string[], split?: string }): { mentionsKey: string, value: string }[] |

### Mentions

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| notFoundContent | Set mentions content when not match | ReactNode | No matching results. |
| split | Set split string before and after selected mention | string | ' ' |
| transitionName | Animation name, optional value: `zoom` `fade` `slide-up` `slide-down` `slide-left` `slide-right` `swing` `move` | string |  |
| placement | Set popup placement | `top` \| `bottom` |  |
| mentionsKey | Set trigger mentionsKey keyword | string \| string[] | @ |
| filterOption | Customize filter option logic | false \| (input: string, option: OptionProps) => boolean |  |
| validateSearch | Customize trigger search logic | (text: string, props: MentionsProps) => void |  |
| onSelect | Trigger when user select the option | (option: OptionProps, mentionsKey: string) => void |  |
| onSearch | Trigger when mentionsKey hit | (text: string, mentionsKey: string) => void |  |
| getPopupContainer | Set the mount `HTML` node for suggestions | (triggerNode: Element) => HTMLElement |  |
| loading | Whether the option is being loaded | boolean |  |

### Option

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| value | The value of suggestion, the value will insert into input filed while selected | string |  |
| key | Only value | string |  |
| disabled | Whether to disable | boolean |  |
| children | Suggestion content | ReactNode |  |
| className | The class name of the option | string |  |
| style | Styles of options | CSSProperties |  |

<style>
.demo-dynamic-option img {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
</style>

For more properties, see [TextArea](/en/procmp/data-entry/text-area/#TextArea).
