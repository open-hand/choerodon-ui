import React from 'react';
import ReactDOM from 'react-dom';
import { Range } from 'choerodon-ui/pro';

ReactDOM.render(
  <div style={{ height: 200 }}>
    <Range vertical min={0} max={100} step={5} />
  </div>,
  document.getElementById('container')
);
