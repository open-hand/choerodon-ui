---
order: 5
title:
  zh-CN: 自定义气泡展示
  en-US: Custom Tip
---

## zh-CN

自定义气泡展示

## en-US

Custom Tip

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
    return <Range dataSet={this.ds} name="range" tipFormatter={(value)=> `${value}%` } />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);

````
