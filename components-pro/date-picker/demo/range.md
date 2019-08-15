---
order: 6
title:
  zh-CN: 范围
  en-US: Range
---

## zh-CN

范围。

## en-US

Range.

````jsx
import { DataSet, DatePicker, MonthPicker, YearPicker, DateTimePicker, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[range dataset newValue]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'date', type: 'date', range: true, defaultValue: ['1984-11-22', '2019-08-12'] },
      { name: 'multipleDate', type: 'date', range: true, multiple: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={24}>
          <DatePicker dataSet={this.ds} name="date" placeholder={['Start Date', 'End Date']} />
        </Col>
        <Col span={24}>
          <DatePicker dataSet={this.ds} name="multipleDate" placeholder="Choose Date" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
