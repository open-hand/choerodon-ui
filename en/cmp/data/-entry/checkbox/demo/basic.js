import React from 'react';
import ReactDOM from 'react-dom';
import { Checkbox } from 'choerodon-ui';

function onChange(e) {
  console.log(`checked = ${e.target.checked}`);
}

ReactDOM.render(
  <Checkbox onChange={onChange}>Checkbox</Checkbox>,
  document.getElementById('container'));
