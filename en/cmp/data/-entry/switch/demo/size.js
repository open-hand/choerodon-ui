import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Switch defaultChecked />
    <br />
    <Switch size="small" defaultChecked />
  </div>,
  document.getElementById('container'));
