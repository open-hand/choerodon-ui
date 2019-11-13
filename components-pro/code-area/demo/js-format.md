---
order: 4
title:
  zh-CN: Javascript格式化
  en-US: Javascript Format
---

## zh-CN

使用快捷键格式化代码，要传入一个 formatter 对象。默认的格式化快捷键是`Alt + F`，去格式化快捷键是`Alt + R`，可以通过属性手动配置。

## en-US

Use hotkey to format code.

```jsx
import { CodeArea, DataSet } from 'choerodon-ui/pro';
// 引入格式化器
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
// 引入 javascript lint
import 'choerodon-ui/pro/lib/code-area/lint/javascript';
// 提供对应语言的语法高亮
import 'codemirror/mode/javascript/javascript';

const options = { mode: 'javascript' };

const jsText = `function getOptions() {
  var options = {
    "compilerOptions": {
      "strictNullChecks": true,
      "moduleResolution": "node",
      "allowSyntheticDefaultImports": true,
      "experimentalDecorators": true,
      "jsx": "preserve",
      "noUnusedParameters": true,
      "noUnusedLocals": true,
      "declaration": true,
      "target": "es6",
      "lib": [
        "dom",
        "dom.iterable",
        "es7",
        "es2017.object"
      ]
    },
    "exclude": [
      "node_modules",
      "lib",
      "es"
    ]
  };

  return options;
}
`;

const jsStyle = { height: 500 };

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'content', type: 'string', defaultValue: jsText, required: true }],
  });

  render() {
    return (
      <div>
        <h4>Javascript</h4>
        <CodeArea
          dataSet={this.ds}
          name="content"
          style={jsStyle}
          formatter={JSFormatter}
          options={options}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
