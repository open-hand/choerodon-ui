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
import { DataSet, Currency } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'money', type: 'number', defaultValue: 100000000000000, required: true, currency: 'USD' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <Currency dataSet={this.ds} name="money" />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
