import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Switch size="large" defaultChecked />
    <br />
    <Switch size="default" defaultChecked />
    <br />
    <Switch size="small" defaultChecked />
  </div>,
  document.getElementById('container'),
);
