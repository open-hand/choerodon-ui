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
import { configure } from 'choerodon-ui';

configure({
  selectShowInputPrompt: true,
});

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
    'last-name': 'jack',
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

  searchMatcher = ({ text, props: { text: propText } }) => {
    return propText.toLowerCase().indexOf(text.toLowerCase()) !== -1;
  }

  render() {
    return (
      <Row>
        <Col span={12}>
          <Select dataSet={this.ds} name="last-name" searchable searchMatcher={this.searchMatcher}>
            <Option value="jack" text="Jack"><p>Jack</p></Option>
            <Option value="lucy" text="Lucy"><p><em>lucy</em></p ></Option>
            <Option value="huazhen" text="Huazhen">Huazhen</Option>
            <Option value="aaa" text="Huazhen">Huazhen</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select dataSet={this.ds} name="first-name" searchable searchMatcher={searchMatcher}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="huazhen">Huazhen</Option>
            <Option value="aaa">Huazhen</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select dataSet={this.ds} name="last-name" searchable searchFieldInPopup searchMatcher={this.searchMatcher}>
            <Option value="jack" text="Jack"><p>Jack</p></Option>
            <Option value="lucy" text="Lucy"><p><em>lucy</em></p ></Option>
            <Option value="huazhen" text="Huazhen">Huazhen</Option>
            <Option value="aaa" text="Huazhen">Huazhen</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select dataSet={this.ds} name="first-name" searchable searchFieldInPopup searchFieldProps={{ multiple: true}} searchMatcher={searchMatcher}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="huazhen">Huazhen</Option>
            <Option value="aaa">Huazhen</Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select dataSet={this.ds} name="sex" searchable searchMatcher="key" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
