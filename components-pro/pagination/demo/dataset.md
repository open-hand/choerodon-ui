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
import { DataSet, Pagination } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoQuery: true,
    name: 'user',
    pageSize: 20,
  });

  render() {
    return <Pagination dataSet={this.ds} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
