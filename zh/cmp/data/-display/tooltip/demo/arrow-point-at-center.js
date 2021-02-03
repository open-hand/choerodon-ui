import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Button } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Tooltip placement="topLeft" title="Prompt Text">
      <Button style={{ marginRight: '4px' }}>Align edge / 边缘对齐</Button>
    </Tooltip>
    <Tooltip placement="topLeft" title="Prompt Text" arrowPointAtCenter>
      <Button style={{ marginRight: '4px' }}>
        Arrow points to center / 箭头指向中心
      </Button>
    </Tooltip>
  </div>,
  document.getElementById('container'),
);
