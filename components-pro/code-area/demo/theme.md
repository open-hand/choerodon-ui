---
order: 3
title:
  zh-CN: 主题
  en-US: Theme
iframe: 650
across: true
---

## zh-CN

使用不同主题。

## en-US

Using different themes.

````jsx
import { CodeArea, Switch, DataSet } from 'choerodon-ui/pro';
// 这两个主题不是组件内置的主题，需要手动引入
import 'codemirror/theme/eclipse.css';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
if (typeof window !== 'undefined') {
  // 提供对应语言的语法高亮
  require('codemirror/mode/javascript/javascript');
}

const jsonText = `{
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
      "es2017.object"]
  },
  "exclude": [
    "node_modules",
    "lib",
    "es"
  ]
}
`;

const style = { height: 525 };

const placeholder = `demo:
function example() {
  console.log('xxx');
}`;

class App extends React.Component {
  state = {
    theme: 'neat',
  }

  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'content', type: 'string', defaultValue: jsonText, required: true },
    ],
  });

  handleThemeChange = (value) => {
    this.setState({ theme: value ? 'eclipse' : 'neat' });
  }

  render() {
    return (
      <div>
        <CodeArea
          dataSet={this.ds}
          name="content"
          options={{ theme: this.state.theme }}
          style={style}
          placeholder={placeholder}
        />
        <Switch onChange={this.handleThemeChange} unCheckedChildren="neat">eclipse</Switch>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
````
