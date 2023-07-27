import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

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
  };

  render() {
    return (
      <Row>
        <Divider orientation="left">
          开启 searchable，配置 searchMatcher 函数：
        </Divider>
        <Col span={12} style={{ marginBottom: 10 }}>
          <Select
            dataSet={this.ds}
            name="last-name"
            searchable
            searchMatcher={this.searchMatcher}
          >
            <Option value="jack" text="Jack">
              <p style={{ marginBottom: 0 }}>Jack</p>
            </Option>
            <Option value="lucy" text="Lucy">
              <p style={{ marginBottom: 0 }}>
                <em>lucy</em>
              </p>
            </Option>
            <Option value="zhangsan" text="Zhangsan">
              Zhangsan
            </Option>
            <Option value="aaa" text="Zhangsan">
              Zhangsan
            </Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginBottom: 10 }}>
          <Select
            dataSet={this.ds}
            name="first-name"
            searchable
            searchMatcher={searchMatcher}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="zhangsan">Zhangsan</Option>
            <Option value="aaa">Zhangsan</Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginBottom: 10 }}>
          <Divider orientation="left">下拉内搜索：</Divider>
          <Select
            dataSet={this.ds}
            name="last-name"
            searchable
            searchFieldInPopup
            searchMatcher={this.searchMatcher}
          >
            <Option value="jack" text="Jack">
              <p style={{ marginBottom: 0 }}>Jack</p>
            </Option>
            <Option value="lucy" text="Lucy">
              <p style={{ marginBottom: 0 }}>
                <em>lucy</em>
              </p>
            </Option>
            <Option value="zhangsan" text="Zhangsan">
              Zhangsan
            </Option>
            <Option value="aaa" text="Zhangsan">
              Zhangsan
            </Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginBottom: 10 }}>
          <Divider orientation="left">下拉内多值搜索：</Divider>
          <Select
            dataSet={this.ds}
            name="first-name"
            searchable
            searchFieldInPopup
            searchFieldProps={{ multiple: true }}
            searchMatcher={searchMatcher}
          >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="zhangsan">Zhangsan</Option>
            <Option value="aaa">Zhangsan</Option>
          </Select>
        </Col>
        <Col span={12} style={{ marginBottom: 10 }}>
          <Divider orientation="left">配置 searchMatcher 为 key：</Divider>
          <Select dataSet={this.ds} name="sex" searchable searchMatcher="key" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
