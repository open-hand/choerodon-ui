import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';
import moment from 'moment';

ReactDOM.render(
  <TimePicker defaultValue={moment('12:08:23', 'HH:mm:ss')} disabled />,
  document.getElementById('container'));
