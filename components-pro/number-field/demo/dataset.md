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
import { DataSet, NumberField } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'age', type: 'number', step: 1, required: true, validator: (value) => value > 10 ? '错误' : true  },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <NumberField dataSet={this.ds} name="age" />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
