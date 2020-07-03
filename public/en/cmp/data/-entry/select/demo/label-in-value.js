import React from 'react';
import ReactDOM from 'react-dom';
import { Select } from 'choerodon-ui';

const Option = Select.Option;

function handleChange(value) {
  console.log(value); // { key: "lucy", label: "Lucy (101)" }
}

ReactDOM.render(
  <Select
    labelInValue
    defaultValue={{ key: 'lucy' }}
    style={{ width: 120 }}
    onChange={handleChange}
  >
    <Option value="jack">Jack (100)</Option>
    <Option value="lucy">Lucy (101)</Option>
  </Select>,
  document.getElementById('container'),
);
