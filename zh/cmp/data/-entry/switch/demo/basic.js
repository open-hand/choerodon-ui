import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui';

function onChange(checked) {
  console.log(`switch to ${checked}`);
}

ReactDOM.render(<Switch defaultChecked onChange={onChange} />, document.getElementById('container'));
