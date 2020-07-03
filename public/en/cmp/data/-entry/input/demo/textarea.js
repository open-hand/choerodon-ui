import React from 'react';
import ReactDOM from 'react-dom';
import { Input } from 'choerodon-ui';

const { TextArea } = Input;

ReactDOM.render(
  <TextArea rows={4} maxLength={20} label="textarea" placeholder="textarea usage" />,
  document.getElementById('container'),
);
