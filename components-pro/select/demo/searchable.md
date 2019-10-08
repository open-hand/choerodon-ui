---
order: 7
title:
  zh-CN: 可搜索
  en-US: Searchable
---

## zh-CN

可搜索。

## en-US

Searchable.

```jsx
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[searchable]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

const { Option } = Select;

const data = [
  {
    'last-name': 'huazhen',
  },
];

function searchMatcher({ record, text }) {
  return record.get('value').indexOf(text) !== -1;
}

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'last-name', type: 'string' },
      { name: 'first-name', type: 'string' },
      { name: 'sex', type: 'string', lookupCode: 'HR.EMPLOYEE_GENDER' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row>
        <Col span={8}>
          <Select dataSet={this.ds} name="last-name" searchable>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="huazhen">Huazhen</Option>
            <Option value="aaa">Huazhen</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Select dataSet={this.ds} name="first-name" searchable searchMatcher={searchMatcher}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="huazhen">Huazhen</Option>
            <Option value="aaa">Huazhen</Option>
          </Select>
        </Col>
        <Col span={8}>
          <Select dataSet={this.ds} name="sex" searchable searchMatcher="key" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
