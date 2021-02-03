import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Switch style={{margin:'.1rem'}}  size="large" defaultChecked />
    <br />
    <Switch style={{margin:'.1rem'}}  size="default" defaultChecked />
    <br />
    <Switch style={{margin:'.1rem'}}  size="small" defaultChecked />
  </div>,
  document.getElementById('container'),
);
