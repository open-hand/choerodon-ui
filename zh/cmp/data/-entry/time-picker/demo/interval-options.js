import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';

ReactDOM.render(
  <TimePicker minuteStep={15} secondStep={10} />,
  document.getElementById('container'));
