import React from 'react';
import ReactDOM from 'react-dom';
import { Select } from 'choerodon-ui';

const Option = Select.Option;

ReactDOM.render(
  <Select
    style={{ width: 300 }}
    placeholder="Select a person"
    optionFilterProp="children"
    filterOption={(input, option) =>
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
    filter
  >
    <Option value="jack">Jack</Option>
    <Option value="lucy">Lucy</Option>
    <Option value="tom">Tom</Option>
    <Option value="jack1">Jack1</Option>
    <Option value="lucy1">Lucy1</Option>
    <Option value="tom1">Tom1</Option>
    <Option value="jack2">Jack2</Option>
    <Option value="lucy2">Lucy2</Option>
    <Option value="tom2">Tom2</Option>
  </Select>,
  document.getElementById('container'),
);
