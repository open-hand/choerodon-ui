import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip } from 'choerodon-ui/pro';

ReactDOM.render(
  <Tooltip title="prompt text" theme="light">
    <span>Tooltip will show when mouse enter.</span>
  </Tooltip>,
  document.getElementById('container'));
