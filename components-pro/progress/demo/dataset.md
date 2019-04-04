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
import { DataSet, Progress } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'percent', type: 'number', defaultValue: 20 },
    ],
  });

  render() {
    return <Progress dataSet={this.ds} name="percent" />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
