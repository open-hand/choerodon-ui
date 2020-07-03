import React from 'react';
import ReactDOM from 'react-dom';
import { InputNumber } from 'choerodon-ui';

function onChange(value) {
  console.log('changed', value);
}

ReactDOM.render(
  <InputNumber label="数字" min={1} max={10} defaultValue={3} onChange={onChange} />,
  document.getElementById('container'));
