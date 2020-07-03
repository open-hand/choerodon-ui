import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';
import moment from 'moment';

const format = 'HH:mm';

ReactDOM.render(
  <TimePicker defaultValue={moment('12:08', format)} format={format} />,
  document.getElementById('container'));
