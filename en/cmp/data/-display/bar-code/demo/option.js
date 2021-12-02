import React from 'react';
import ReactDOM from 'react-dom';
import { BarCode } from 'choerodon-ui';

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const option = {
      width: 3,
      height: 50,
      text: 'Hi',
      textAlign: 'left',
      textPosition: 'top',
      textMargin: 15,
      fontSize: 24,
    };

    return <BarCode type="bar" value="123456789" option={option} />;
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
