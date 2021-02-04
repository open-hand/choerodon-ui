import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, SelectBox, Form, Row, Col } from 'choerodon-ui/pro';

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

const { Option } = SelectBox;
const data = [
  {
    'last-name': 'zhangsan',
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
        <Col span={24}>
          <Form labelLayout="float">
            <SelectBox
              label="demo"
              dataSet={this.ds}
              name="last-name"
              searchable
              vertical
              placeholder="请输入关键字进行搜索"
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="zhangsan">Zhangsan</Option>
              <Option value="aaa">Zhangsan</Option>
            </SelectBox>
          </Form>
        </Col>
        <Col span={12}>
          <SelectBox
            dataSet={this.ds}
            name="first-name"
            searchable
            searchMatcher={searchMatcher}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="zhangsan">Zhangsan</Option>
            <Option value="aaa">Zhangsan</Option>
          </SelectBox>
        </Col>
        <Col span={12}>
          <SelectBox
            dataSet={this.ds}
            name="sex"
            searchable
            searchMatcher="key"
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
