import React from 'react';
import ReactDOM from 'react-dom';
import { Checkbox } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Checkbox defaultChecked={false} disabled />
    <br />
    <Checkbox defaultChecked disabled />
  </div>,
  document.getElementById('container'));
