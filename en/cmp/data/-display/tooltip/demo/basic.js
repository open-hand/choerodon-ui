import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip } from 'choerodon-ui';

ReactDOM.render(
  <Tooltip title="prompt text">
    <span>Tooltip will show when mouse enter.</span>
  </Tooltip>,
  document.getElementById('container'));
