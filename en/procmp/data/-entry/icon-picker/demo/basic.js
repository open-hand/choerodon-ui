import React from 'react';
import ReactDOM from 'react-dom';
import { IconPicker } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[datepicker]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <IconPicker onChange={handleChange} />,
  document.getElementById('container')
);
