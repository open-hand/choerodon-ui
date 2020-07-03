import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Icon } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Switch unCheckedChildren="关" defaultChecked>开</Switch>
    <br />
    <Switch unCheckedChildren="0">1</Switch>
    <br />
    <Switch unCheckedChildren={<Icon type="close" />}><Icon type="check" /></Switch>
  </div>,
  document.getElementById('container'));
