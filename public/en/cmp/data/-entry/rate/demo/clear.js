import React from 'react';
import ReactDOM from 'react-dom';
import { Rate } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Rate defaultValue={3} /> allowClear: true
    <br />
    <Rate allowClear={false} defaultValue={3} /> allowClear: false
  </div>,
  document.getElementById('container'));
