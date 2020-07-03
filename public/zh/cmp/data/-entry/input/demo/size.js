import React from 'react';
import ReactDOM from 'react-dom';
import { Input } from 'choerodon-ui';

ReactDOM.render(
  <div className="example-input">
    <Input size="large" placeholder="large size" label="Large" maxLength="20" />
    <Input placeholder="default size" />
    <Input size="small" placeholder="small size" label="small" />
  </div>,
  document.getElementById('container'));
