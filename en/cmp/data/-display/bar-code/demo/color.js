import React from 'react';
import ReactDOM from 'react-dom';
import { BarCode } from 'choerodon-ui';

class Demo extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div
        style={{ display: 'flex', width: 400, justifyContent: 'space-around' }}
      >
        <BarCode
          value="我是一个有颜色的二维码"
          bgColor="#3f51b5"
          fgColor="#FFFFFF"
        />
        <BarCode
          type="bar"
          value="123456789"
          bgColor="#3f51b5"
          fgColor="#FFFFFF"
        />
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
