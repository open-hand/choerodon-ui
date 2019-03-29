---
order: 2
title:
  zh-CN: 数据源
  en-US: DataSet
---

## zh-CN

绑定数据源。

## en-US

DataSet binding.

````jsx
import { DataSet, Output } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'first-name', type: 'string', defaultValue: 'Huazhen', required: true },
    ],
  });

  render() {
    return <Output dataSet={this.ds} name="first-name" />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
