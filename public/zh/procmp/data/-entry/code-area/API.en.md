---
title: API
---

### CodeArea

| 属性           | 说明                                                                                | 类型              | 默认值                |
| -------------- | ----------------------------------------------------------------------------------- | ----------------- | --------------------- |
| options        | 编辑器配置，详见[CodeMirror Options](https://codemirror.net/doc/manual.html#config) | object            |                       |
| formatHotKey   | 格式化快捷键                                                                        | string            | `Alt+F`               |
| unFormatHotKey | 清除格式化快捷键                                                                    | string            | `Alt+R`               |
| formatter      | `CodeAreaFormatter`类的实例，用于格式化                                             | CodeAreaFormatter | `new JSONFormatter()` |

更多属性请参考 [FormField](/zh/procmp/abstract/field#FormField)。

### 自定义主题

组件内置`'neat'`和`'monokai'`两个主题，使用更多主题需要引入对应的样式文件，如下：

```less
// style.less
@import '~codemirror/theme/material.css';
```

或在`*.js`文件中引用

```js
import 'codemirror/theme/material.css';
```

所有可用主题请参考 [CodeMirror Themes](https://codemirror.net/demo/theme.html)。

### 更多编辑器配置项

更多编辑器配置可以直接作为输入属性传递给组件，如下：

```ts
const options = { tabSize: 4, viewportMargin: Infinity };
<CodeArea options={options} />;
```

所有可用的配置项请参考 [CodeMirror Options](https://codemirror.net/doc/manual.html#config)。
