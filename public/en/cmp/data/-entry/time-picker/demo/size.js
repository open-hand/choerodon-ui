import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';
import moment from 'moment';

ReactDOM.render(
  <div>
    <TimePicker defaultValue={moment('12:08:23', 'HH:mm:ss')} size="large" />
    <TimePicker defaultValue={moment('12:08:23', 'HH:mm:ss')} />
    <TimePicker defaultValue={moment('12:08:23', 'HH:mm:ss')} size="small" />
  </div>,
  document.getElementById('container'));
