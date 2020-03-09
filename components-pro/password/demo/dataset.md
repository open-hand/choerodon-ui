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

```jsx
import { DataSet, Password } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'first-name',
        type: 'string',
        defaultValue: 'choerodon-pro',
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return <Password dataSet={this.ds} name="first-name" />;
  }
}

ReactDOM.render(<App />, mountNode);
```
