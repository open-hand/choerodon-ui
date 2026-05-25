import React from 'react';
import ReactDOM from 'react-dom';
import { TextField } from 'choerodon-ui/pro';

const tooltip = ['overflow', { autoPlacement: true }];

const App = () => {
  return (
    <div>
      <TextField
        tooltip={tooltip}
        value={`${new Array(50).fill('选择最佳位置弹出').join(' ')}`}
        style={{ marginTop: 20, width: '100%' }}
      />
      <div
        style={{
          margin: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <TextField
          tooltip={tooltip}
          key="1"
          value={`${new Array(50).fill('选择最佳位置弹出').join(' ')}`}
          style={{ width: 200 }}
        />
        <TextField
          tooltip={tooltip}
          key="2"
          value={`${new Array(50).fill('选择最佳位置弹出').join(' ')}`}
          style={{ width: 200 }}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
