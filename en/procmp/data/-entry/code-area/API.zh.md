---
title: API
---

### CodeArea

| 属性           | 说明                                                                                | 类型              | 默认值                |
| -------------- | ----------------------------------------------------------------------------------- | ----------------- | --------------------- |
| options        | 编辑器配置，详见[CodeMirror Options](https://codemirror.net/doc/manual.html#config) | object            |                       |
| formatHotKey   | 格式化快捷键                                                                        | string            | Alt+F               |
| unFormatHotKey | 清除格式化快捷键                                                                    | string            | Alt+R               |
| formatter      | CodeAreaFormatter类的实例，用于格式化                                             | CodeAreaFormatter | new JSONFormatter() |
| editorDidMount | 在实例挂载前回调函数 | (editor: IInstance, value: string, cb: () => void) => void; |  |
| themeSwitch(1.5.0) | 默认主题切换设置( options 中设置 theme 或者不设置 themeSwitch，则不显示主题切换按钮)。不设置，默认 idea 主题，可选值 `idea` \| `material` | string |  |
| title(1.5.0) | 标题 | ReactNode |  |
| placeholder(1.6.4) | 占位词 | string |  |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。

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

关于 CodeArea 引入主题资源教程请参考 [CodeArea 引入主题资源](/zh/tutorials/codearea-theme)。

### 更多编辑器配置项

更多编辑器配置可以直接作为输入属性传递给组件，如下：

```ts
const options = { tabSize: 4, viewportMargin: Infinity };
<CodeArea options={options} />;
```

<style>
.hidden-content .react-codemirror2 {
  visibility: hidden;
}
</style>

所有可用的配置项请参考 [CodeMirror Options](https://codemirror.net/doc/manual.html#config)。
