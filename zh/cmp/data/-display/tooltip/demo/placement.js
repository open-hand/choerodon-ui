import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Button } from 'choerodon-ui';

const text = <span>prompt text</span>;

const buttonWidth = 70;

ReactDOM.render(
  <div className="demo">
    <div style={{ marginLeft: buttonWidth, whiteSpace: 'nowrap' }}>
      <Tooltip placement="topLeft" title={text}>
        <Button style={{ marginRight: '4px' }}>TL</Button>
      </Tooltip>
      <Tooltip placement="top" title={text}>
        <Button style={{ marginRight: '4px' }}>Top</Button>
      </Tooltip>
      <Tooltip placement="topRight" title={text}>
        <Button style={{ marginRight: '4px' }}>TR</Button>
      </Tooltip>
    </div>
    <div style={{ width: buttonWidth, float: 'left' }}>
      <Tooltip placement="leftTop" title={text}>
        <Button style={{ marginTop: '4px' }}>LT</Button>
      </Tooltip>
      <Tooltip placement="left" title={text}>
        <Button style={{ marginTop: '4px' }}>Left</Button>
      </Tooltip>
      <Tooltip placement="leftBottom" title={text}>
        <Button style={{ marginTop: '4px' }}>LB</Button>
      </Tooltip>
    </div>
    <div style={{ width: buttonWidth, marginLeft: buttonWidth * 4 }}>
      <Tooltip placement="rightTop" title={text}>
        <Button style={{ marginTop: '4px' }}>RT</Button>
      </Tooltip>
      <Tooltip placement="right" title={text}>
        <Button style={{ marginTop: '4px' }}>Right</Button>
      </Tooltip>
      <Tooltip placement="rightBottom" title={text}>
        <Button style={{ marginTop: '4px' }}>RB</Button>
      </Tooltip>
    </div>
    <div
      style={{ marginLeft: buttonWidth, clear: 'both', whiteSpace: 'nowrap' }}
    >
      <Tooltip placement="bottomLeft" title={text}>
        <Button style={{ marginRight: '4px' }}>BL</Button>
      </Tooltip>
      <Tooltip placement="bottom" title={text}>
        <Button style={{ marginRight: '4px' }}>Bottom</Button>
      </Tooltip>
      <Tooltip placement="bottomRight" title={text}>
        <Button style={{ marginRight: '4px' }}>BR</Button>
      </Tooltip>
    </div>
  </div>,
  document.getElementById('container'),
);
