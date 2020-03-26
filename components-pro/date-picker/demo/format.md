---
order: 7
title:
  zh-CN: 时间格式
  en-US: Time format
---

## zh-CN

时间格式。

## en-US

Time format.

```jsx
import {
  DataSet,
  TimePicker,
  Row,
  Col,
} from 'choerodon-ui/pro';

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
        format: 'hh:mm:ss A',
      },
      {
        name: 'time2',
        type: 'time',
        format: 'HH:mm',
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <TimePicker dataSet={this.ds} name="time" />
        </Col>
        <Col span={12}>
          <TimePicker dataSet={this.ds} name="time2" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
