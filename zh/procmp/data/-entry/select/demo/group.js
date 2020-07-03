import React from 'react';
import ReactDOM from 'react-dom';
import { Select } from 'choerodon-ui/pro';

const { Option, OptGroup } = Select;

ReactDOM.render(
  <Select>
    <OptGroup label="Manager">
      <Option value="jack">Jack</Option>
      <Option value="lucy">Lucy</Option>
    </OptGroup>
    <OptGroup label="Engineer">
      <Option value="wu">Wu</Option>
    </OptGroup>
  </Select>,
  document.getElementById('container')
);
