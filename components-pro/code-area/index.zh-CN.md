---
category: Pro Components
type: Data Entry
title: CodeArea
subtitle: 代码域
---

文本域用于输入一段文字。

## 何时使用

用于编辑或展示代码

## API


### CodeArea

| 属性  | 说明     | 类型     | 默认值             |
| ----- | -------- | -------- | ------------------ |
| options | 编辑器配置，详见[CodeMirror Options](https://codemirror.net/doc/manual.html#config)| object |  |
| formatHotKey | 格式化快捷键 | string | `Alt+F` |
| unFormatHotKey | 清除格式化快捷键 | string | `Alt+R` |
| formatter | `CodeAreaFormatter`类的实例，用于格式化 | CodeAreaFormatter | `new JSONFormatter()` |
| editorDidMount | 在实例挂载前回调函数 | (editor: IInstance, value: string, cb: () => void) => void; |  |
| themeSwitch | 默认主题切换设置( options 中设置 theme 或者不设置 themeSwitch，则不显示主题切换按钮)。不设置，默认 idea 主题，可选值 `idea` \| `material` | string |  |
| title | 标题 | ReactNode |  |
| placeholder | 占位词 | string |  |
| valueChangeAction | 触发值变更的动作, 可选值：`blur` `input` | `blur` |  |
| wait | 设置值变更间隔时间，只有在 valueChangeAction 为 input 时起作用 | number | - |
| waitType | 设置值变更间隔类型，只有在 valueChangeAction 为 input 时起作用，可选值： `throttle` `debounce` | string | `debounce` |
| prettierOptions | formatter 格式化的参数(prettier 的参数) 详见[prettier Options](https://www.prettier.cn/docs/options.html) | object |  |

更多属性请参考 [FormField](/components-pro/field/#FormField)。

### 自定义主题

组件内置`'neat'` `'idea'` `'material'`三个主题，默认 `'idea'`，使用更多主题需要引入对应的样式文件，如下：

```less
// style.less
@import '~codemirror/theme/eclipse.css';
```

或在`*.js`文件中引用

```js
import 'codemirror/theme/eclipse.css';
```

所有可用主题请参考 [CodeMirror Themes](https://codemirror.net/demo/theme.html)。

### 更多编辑器配置项

更多编辑器配置可以直接作为输入属性传递给组件，如下：

```ts
const options = { tabSize: 4, viewportMargin: Infinity };
<CodeArea options={options} />
```

所有可用的配置项请参考 [CodeMirror Options](https://codemirror.net/doc/manual.html#config)。
