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
import 'codemirror/theme/material.css';
import 'codemirror/theme/idea.css';

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

class App extends React.Component {
  state = {
    theme: 'idea',
  }

  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'content', type: 'string', defaultValue: jsonText, required: true },
    ],
  });

  handleThemeChange = (value) => {
    this.setState({ theme: value ? 'material' : 'idea' });
  }

  render() {
    return (
      <div>
        <CodeArea
          dataSet={this.ds}
          name="content"
          options={{ theme: this.state.theme }}
          style={style}
        />
        <Switch onChange={this.handleThemeChange} unCheckedChildren="idea">material</Switch>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
````
