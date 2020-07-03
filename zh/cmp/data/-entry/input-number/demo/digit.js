import React from 'react';
import ReactDOM from 'react-dom';
import { InputNumber } from 'choerodon-ui';

function onChange(value) {
  console.log('changed', value);
}

ReactDOM.render(
  <InputNumber label="小数" min={0} max={10} step={0.1} onChange={onChange} />,
  document.getElementById('container'));
