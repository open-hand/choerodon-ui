---
order: 3
title:
  zh-CN: 多行
  en-US: MultipleLine
---

## zh-CN

多行输入。

## en-US

Input multiple-line.

```jsx
import { DataSet, IntlField, Row, Col } from 'choerodon-ui/pro';

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
    primaryKey: 'pk',
    data: [{ 'first-name': '吴' }],
    tlsUrl: '/dataset/user/languages',
    fields: [
      {
        name: 'first-name',
        type: 'intl',
        defaultValue: 'Huazhen',
        required: true,
      },
      {
        name: 'last-name',
        type: 'intl',
        maxLength: 5,
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <IntlField dataSet={this.ds} name="first-name" type="multipleLine" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
