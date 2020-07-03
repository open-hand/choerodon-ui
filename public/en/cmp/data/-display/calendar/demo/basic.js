import React from 'react';
import ReactDOM from 'react-dom';
import { Calendar } from 'choerodon-ui';

function onPanelChange(value, mode) {
  console.log(value, mode);
}

ReactDOM.render(
  <Calendar onPanelChange={onPanelChange} />,
  document.getElementById('container'));
