import React from 'react';
import ReactDOM from 'react-dom';
import { BarCode } from 'choerodon-ui';

ReactDOM.render(
  <BarCode value="我是二维码" />,
  document.getElementById('container'),
);
