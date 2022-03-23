import React from 'react';
import ReactDOM from 'react-dom';
import { Rate } from 'choerodon-ui/pro';

ReactDOM.render(
  <Rate allowHalf defaultValue={2.5} />,
  document.getElementById('container'),
);
