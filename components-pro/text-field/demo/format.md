---
order: 2
title:
  zh-CN: Format
  en-US: 格式化
---

## zh-CN

格式化。

## en-US

Format.

```jsx
import { DataSet, TextField, Row, Col } from 'choerodon-ui/pro';

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
        defaultValue: 'huazhen',
        required: true,
        format: 'uppercase',
      },
      {
        name: 'middle-name',
        type: 'string',
        defaultValue: 'HUGH',
        required: true,
        format: 'lowercase',
      },
      {
        name: 'last-name',
        type: 'string',
        defaultValue: 'wu',
        required: true,
        format: 'capitalize',
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row>
        <Col span={8}>
          <TextField dataSet={this.ds} name="first-name" />
        </Col>
        <Col span={8}>
          <TextField dataSet={this.ds} name="middle-name" />
        </Col>
        <Col span={8}>
          <TextField dataSet={this.ds} name="last-name" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
