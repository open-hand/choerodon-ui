import React from 'react';
import ReactDOM from 'react-dom';
import { BarCode } from 'choerodon-ui';

class Demo extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return <BarCode type="bar" value="123456789" />;
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
