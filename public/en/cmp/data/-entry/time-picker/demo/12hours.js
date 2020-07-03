import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';

function onChange(time, timeString) {
  console.log(time, timeString);
}

ReactDOM.render(
  <div>
    <TimePicker use12Hours onChange={onChange} />
    <TimePicker use12Hours format="h:mm:ss A" onChange={onChange} />
    <TimePicker use12Hours format="h:mm a" onChange={onChange} />
  </div>,
  document.getElementById('container'));
