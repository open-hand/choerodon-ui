import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Switch size="large" defaultChecked />
    <br />
    <Switch defaultChecked />
    <br />
    <Switch size="small" defaultChecked />
  </div>,
  document.getElementById('container'));
