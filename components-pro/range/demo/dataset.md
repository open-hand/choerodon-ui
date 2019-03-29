---
order: 2
title:
  zh-CN: 绑定数据源
  en-US: DataSet Binding
---

## zh-CN

绑定数据源。

## en-US

DataSet Binding

````jsx

import { DataSet, Range } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[dataset]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'range', defaultValue: 20, min: 10, max: 100, step: 1 },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <Range dataSet={this.ds} name="range" />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);

````
