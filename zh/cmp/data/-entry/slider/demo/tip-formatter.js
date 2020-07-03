import React from 'react';
import ReactDOM from 'react-dom';
import { Slider } from 'choerodon-ui';

function formatter(value) {
  return `${value}%`;
}

ReactDOM.render(
  <div>
    <Slider tipFormatter={formatter} />
    <Slider tipFormatter={null} />
  </div>,
  document.getElementById('container'),
);
