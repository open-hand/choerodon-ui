import React from 'react';
import ReactDOM from 'react-dom';
import { Input } from 'choerodon-ui';

const { TextArea } = Input;

ReactDOM.render(
  <div>
    <TextArea placeholder="Autosize height based on content lines" autosize />
    <div style={{ margin: '24px 0' }} />
    <TextArea
      placeholder="Autosize height with minimum and maximum number of lines"
      autosize={{ minRows: 2, maxRows: 6 }}
    />
  </div>,
  document.getElementById('container'),
);
