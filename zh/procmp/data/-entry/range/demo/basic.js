import React from 'react';
import ReactDOM from 'react-dom';

import { Range } from 'choerodon-ui/pro';

ReactDOM.render(
  <div style={{ height: '.4rem' }}>
    <Range min={0} max={1} step={0.01} />
    <Range
      style={{ margin: '0.2rem 0 0 0' }}
      value={20}
      min={0}
      max={100}
      step={5}
      disabled
    />
  </div>,
  document.getElementById('container'),
);
