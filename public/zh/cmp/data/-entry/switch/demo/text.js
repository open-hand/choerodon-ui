import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
    <br />
    <Switch checkedChildren="1" unCheckedChildren="0" />
  </div>,
  document.getElementById('container'));
