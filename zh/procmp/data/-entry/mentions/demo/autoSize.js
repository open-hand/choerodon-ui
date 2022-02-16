import React from 'react';
import ReactDOM from 'react-dom';
import { Mentions } from 'choerodon-ui/pro';

const { Option } = Mentions;

ReactDOM.render(
  <Mentions autoSize style={{ width: '100%' }}>
    <Option value="mike">mike</Option>
    <Option value="jason">jason</Option>
    <Option value="Kevin">Kevin</Option>
  </Mentions>,
  document.getElementById('container'),
);
