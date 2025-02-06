---
order: 5
title:
  zh-CN: 范围
  en-US: Range
---

## zh-CN

范围。

## en-US

Range.

```jsx
import { DataSet, NumberField, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[range dataset newValue]', value, '[oldValue]', oldValue);
}

function handleChange(value, oldValue) {
  console.log('[range newValue]', value, '[oldValue]', oldValue);
}

function rangeValidator(value, name) {
  console.log(`[validation ${name} value]`, value);
  return true;
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'number1',
        type: 'number',
        range: ['start', 'end'],
        defaultValue: { start: 0, end: 4 },
        required: true,
        min: 1,
        max: 10,
        step: 1,
        validator: rangeValidator,
      },
      {
        name: 'number2',
        type: 'number',
        range: true,
        defaultValue: [0, 4],
        validator: rangeValidator,
      },
      { name: 'multipleNumber', type: 'number', range: true, multiple: true, required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField
            dataSet={this.ds}
            name="number1"
            placeholder={['Range Start', 'Range End']}
          />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField
            dataSet={this.ds}
            name="number2"
            placeholder={['Range Start', 'Range End']}
          />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField
            range
            defaultValue={[0, 4]}
            placeholder={['Range Start', 'Range End']}
            onChange={handleChange}
          />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField
            range={['start', 'end']}
            defaultValue={{ start: 0, end: 4 }}
            placeholder={['Range Start', 'Range End']}
            onChange={handleChange}
          />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField dataSet={this.ds} name="multipleNumber" placeholder="Input Number" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
