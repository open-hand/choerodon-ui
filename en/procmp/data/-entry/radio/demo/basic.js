import React from 'react';
import ReactDOM from 'react-dom';
import { Radio } from 'choerodon-ui/pro';

function handleChange(value) {
  console.log('[basic]', value);
}

ReactDOM.render(
  <div>
    <Radio name="base" value="A" onChange={handleChange} defaultChecked>A</Radio>
    <Radio name="base" value="B" onChange={handleChange}>B</Radio>
    <Radio name="base" value="C" onChange={handleChange}>C</Radio>
  </div>,
  document.getElementById('container')
);
