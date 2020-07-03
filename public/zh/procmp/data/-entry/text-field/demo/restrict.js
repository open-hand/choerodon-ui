import React from 'react';
import ReactDOM from 'react-dom';
import { TextField } from 'choerodon-ui/pro';

ReactDOM.render(
  <TextField placeholder="限制数字" restrict="0-9" />,
  document.getElementById('container')
);
