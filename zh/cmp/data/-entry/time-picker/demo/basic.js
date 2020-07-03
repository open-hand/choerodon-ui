import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';
import moment from 'moment';

function onChange(time, timeString) {
  console.log(time, timeString);
}

ReactDOM.render(
  <TimePicker
    label="时间选择框"
    onChange={onChange}
    defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}
  />,
  document.getElementById('container'),
);
