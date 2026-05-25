---
title: API
---

### CodeArea

| Property | Description | Type | Default |
| -------------- | ----------------------------------------------------------------------------------- | ----------------- | --------------------- |
| options | Editor configuration, see [CodeMirror Options](https://codemirror.net/doc/manual.html#config) | object |  |
| formatHotKey | Formatting shortcut key | string | Alt+F |
| unFormatHotKey | Clear formatting shortcut key | string | Alt+R |
| formatter | Instance of CodeAreaFormatter used for formatting | CodeAreaFormatter | new JSONFormatter() |
| editorDidMount | Callback before the instance is mounted | (editor: IInstance, value: string, cb: () => void) => void; |  |
| themeSwitch(1.5.0) | Default theme switch settings (if theme is set in options or themeSwitch is not set, the theme switch button is hidden). Default theme is 'idea'. Options: `idea` \| `material` | string |  |
| title(1.5.0) | Title | ReactNode |  |
| placeholder(1.6.4) | Placeholder | string |  |
| valueChangeAction(1.6.6) | Action that triggers value change; options: `blur` `input` | `blur` |  |
| wait(1.6.6) | Set value change interval; effective only when valueChangeAction is `input` | number | - |
| waitType(1.6.6) | Set value change interval type; effective only when valueChangeAction is `input`; options: `throttle` `debounce` | string | `debounce` |
| prettierOptions(1.6.7) | Formatter options (Prettier parameters), see [Prettier Options](https://www.prettier.cn/docs/options.html) | object |  |

For more properties, please refer to [FormField](/en/procmp/abstract/field#FormField).

### Custom Theme

The component has built-in themes `'neat'`, `'idea'`, and `'material'`; the default is `'idea'`. To use more themes, import the corresponding styles as follows:

```less
// style.less
@import '~codemirror/theme/eclipse.css';
```

Or import in a `*.js` file

```js
import 'codemirror/theme/eclipse.css';
```

Refer to [CodeMirror Themes](https://codemirror.net/demo/theme.html) for all available themes.

For the tutorial on importing theme resources for CodeArea, see [CodeArea Theme Resources](/en/tutorials/codearea-theme).

### More Editor Configuration

More editor configurations can be passed directly as input props to the component, as follows:

```ts
const options = { tabSize: 4, viewportMargin: Infinity };
<CodeArea options={options} />;
```

<style>
.hidden-content .react-codemirror2 {
  visibility: hidden;
}
</style>

Refer to [CodeMirror Options](https://codemirror.net/doc/manual.html#config) for all available configuration options.
