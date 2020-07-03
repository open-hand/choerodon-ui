import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Button } from 'choerodon-ui/pro';

const text = <span>prompt text</span>;

const buttonWidth = 70;

ReactDOM.render(
  <div className="demo">
    <div style={{ marginLeft: buttonWidth, whiteSpace: 'nowrap' }}>
      <Tooltip placement="topLeft" title={text} theme="light">
        <Button>TL</Button>
      </Tooltip>
      <Tooltip placement="top" title={text}>
        <Button>Top</Button>
      </Tooltip>
      <Tooltip placement="topRight" title={text}>
        <Button>TR</Button>
      </Tooltip>
    </div>
    <div style={{ width: buttonWidth, float: 'left' }}>
      <Tooltip placement="leftTop" title={text}>
        <Button style={{ marginLeft: 10 }}>LT</Button>
      </Tooltip>
      <Tooltip placement="left" title={text} theme="light">
        <Button>Left</Button>
      </Tooltip>
      <Tooltip placement="leftBottom" title={text}>
        <Button>LB</Button>
      </Tooltip>
    </div>
    <div style={{ width: buttonWidth, marginLeft: buttonWidth * 3 + 26 }}>
      <Tooltip placement="rightTop" title={text} theme="light">
        <Button style={{ marginLeft: 10 }}>RT</Button>
      </Tooltip>
      <Tooltip placement="right" title={text}>
        <Button>Right</Button>
      </Tooltip>
      <Tooltip placement="rightBottom" title={text}>
        <Button>RB</Button>
      </Tooltip>
    </div>
    <div
      style={{ marginLeft: buttonWidth, clear: 'both', whiteSpace: 'nowrap' }}
    >
      <Tooltip placement="bottomLeft" title={text} theme="light">
        <Button>BL</Button>
      </Tooltip>
      <Tooltip placement="bottom" title={text}>
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip placement="bottomRight" title={text}>
        <Button>BR</Button>
      </Tooltip>
    </div>
  </div>,
  document.getElementById('container'),
);
