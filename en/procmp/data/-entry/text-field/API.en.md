---
title: API
---

| Property | Description | Type | Default | Version |
| ------------ | ----------------------------------------- | ------------------- | ------ | ----- |
| placeholder  | Placeholder; for range, can set two placeholders | string \| string[]    |        |       |
| prefix       | Prefix, typically used for icons | ReactNode           |        |     |
| suffix       | Suffix, typically used for icons | ReactNode           |        |     |
| clearButton  | Whether to show clear button | boolean             | false  |     |
| minLength    | Minimum length | number              |        |     |
| maxLength    | Maximum length | number              |        |     |
| pattern      | Regular expression validation | string \| RegExp      |        |       |
| autoComplete | Autocomplete; options: on \| off | string              | off    |      |
| addonBefore  | Prepend label | string \| ReactNode |        |     |
| addonAfter   | Append label | string \| ReactNode |        |     |
| addonBeforeStyle | Style for prepend label | CSSProperties |  |      |
| addonAfterStyle | Style for append label | CSSProperties |  |       |
| restrict | Restrict input characters; string means allowed characters rule, RegExp means disallowed characters rule | string \| RegExp |  |       |
| valueChangeAction | Action that triggers value change; options: blur \| input | blur |  | 1.1.0      |
| wait | Interval for value changes; only effective when valueChangeAction is input | number | | 1.1.0     |
| waitType | Interval type; options: throttle \| debounce | string | debounce | 1.1.0    |
| showLengthInfo | Whether to display length information; when it is auto, if the input content reaches 80% of maxLength, the length information will be automatically displayed. | boolean \| 'auto'(1.6.8) | | 1.4.0      |
| border | Whether to show border | boolean | true | 1.4.4 |
| isFlat | Auto width mode | boolean | false | 1.4.5 |
| forceShowRangeSeparator | Whether to force show separator for range fields; in isFlat mode, shows only when there is a placeholder or value | boolean |  | 1.6.7 |
| tooltip | Input box `tooltip` configuration | TextTooltip \| \[TextTooltip, TooltipProps\] |  |
| placeholderTooltip | Input box `placeholder` `tooltip` configuration, empty value is valid | TextTooltip \| \[TextTooltip, TooltipProps\] |  | 1.6.8 |

For more properties, please refer to [FormField](/en/procmp/abstract/field#FormField).

<style>
.custom-suffix-button label .c7n-pro-input-suffix {
  height: 28px;
}
.custom-suffix-text label .c7n-pro-input-suffix {
  line-height: 20px;
}
</style>
