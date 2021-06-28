import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Button } from 'choerodon-ui';

const text = <span>prompt text</span>;

const buttonWidth = 70;

const App = () => {
  const [theme, setTheme] = React.useState();
  return (
    <div className="demo">
      <div style={{ marginLeft: buttonWidth, whiteSpace: 'nowrap' }}>
        <Tooltip placement="topLeft" title={text} theme={theme}>
          <Button>TL</Button>
        </Tooltip>
        <Tooltip placement="top" title={text} theme={theme}>
          <Button>Top</Button>
        </Tooltip>
        <Tooltip placement="topRight" title={text} theme={theme}>
          <Button>TR</Button>
        </Tooltip>
      </div>
      <div style={{ width: buttonWidth, float: 'left' }}>
        <Tooltip placement="leftTop" title={text} theme={theme}>
          <Button>LT</Button>
        </Tooltip>
        <Tooltip placement="left" title={text} theme={theme}>
          <Button>Left</Button>
        </Tooltip>
        <Tooltip placement="leftBottom" title={text} theme={theme}>
          <Button>LB</Button>
        </Tooltip>
      </div>
      <div style={{ width: buttonWidth, marginLeft: (buttonWidth * 4) + 24 }}>
        <Tooltip placement="rightTop" title={text} theme={theme}>
          <Button>RT</Button>
        </Tooltip>
        <Tooltip placement="right" title={text} theme={theme}>
          <Button>Right</Button>
        </Tooltip>
        <Tooltip placement="rightBottom" title={text} theme={theme}>
          <Button>RB</Button>
        </Tooltip>
      </div>
      <div style={{ marginLeft: buttonWidth, clear: 'both', whiteSpace: 'nowrap' }}>
        <Tooltip placement="bottomLeft" title={text} theme={theme}>
          <Button>BL</Button>
        </Tooltip>
        <Tooltip placement="bottom" title={text} theme={theme}>
          <Button>Bottom</Button>
        </Tooltip>
        <Tooltip placement="bottomRight" title={text} theme={theme}>
          <Button>BR</Button>
        </Tooltip>
      </div>
      <Button onClick={() => setTheme('light')}>Light</Button>
      <Button onClick={() => setTheme('dark')} color="dark">Dark</Button>
    </div>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('container'),
);
