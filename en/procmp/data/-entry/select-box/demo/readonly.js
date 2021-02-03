import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, SelectBox, Row, Col } from 'choerodon-ui/pro';

const { Option } = SelectBox;

const optionData = [
  { text: 'Jack', value: 'jack' },
  { text: 'Zhangsan', value: 'zhangsan' },
  { text: 'Lucy', value: 'lucy' },
  { text: 'Niu', value: 'jiaqin' },
  { text: 'Shao', value: 'shao' },
];

const data = [{
  name: 'zhangsan',
}];

class App extends React.Component {
  optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });

  ds = new DataSet({
    data,
    fields: [
      { name: 'name', textField: 'text', valueField: 'value', options: this.optionDs, readOnly: true },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <SelectBox readOnly>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </SelectBox>
        </Col>
        <Col span={12}>
          <SelectBox dataSet={this.ds} name="name" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
