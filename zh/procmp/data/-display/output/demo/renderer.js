import React from 'react';
import ReactDOM from 'react-dom';
import { Output } from 'choerodon-ui/pro';

function rendererOne(param) {
  const { text } = param;
  return <span style={{ color: 'red' }}>{text}</span>;
}

ReactDOM.render(
  <Output value="hello" renderer={rendererOne} />,
  document.getElementById('container')
);
