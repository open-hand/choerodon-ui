---
order: 2
title:
  zh-CN: 数据绑定
  en-US: Dataset
iframe: 650
across: true
---

## zh-CN

数据绑定

## en-US

Dataset.

````jsx
import { CodeArea, DataSet } from 'choerodon-ui/pro';

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

const style = { height: 550 };

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'content', type: 'string', defaultValue: jsonText, required: true, readOnly: true },
    ],
  });

  render() {
    return <CodeArea dataSet={this.ds} name="content" style={style} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
