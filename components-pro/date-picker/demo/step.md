---
order: 8
title:
  zh-CN: 时间步距
  en-US: Time step
---

## zh-CN

时间步距。

## en-US

Time step.

```jsx
import { DataSet, TimePicker } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[range dataset newValue]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'time',
        type: 'time',
        step: {
          minute: 15,
          second: 10,
        },
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <TimePicker dataSet={this.ds} name="time" />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
