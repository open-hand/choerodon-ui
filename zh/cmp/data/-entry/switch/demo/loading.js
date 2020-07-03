import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Switch loading defaultChecked />
    <br />
    <Switch size="small" loading />
  </div>,
  document.getElementById('container'));
