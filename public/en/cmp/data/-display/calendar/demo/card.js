import React from 'react';
import ReactDOM from 'react-dom';
import { Calendar } from 'choerodon-ui';

function onPanelChange(value, mode) {
  console.log(value, mode);
}

ReactDOM.render(
  <div style={{ width: 300, border: '1px solid #d9d9d9', borderRadius: 4 }}>
    <Calendar fullscreen={false} onPanelChange={onPanelChange} />
  </div>,
  document.getElementById('container'));
