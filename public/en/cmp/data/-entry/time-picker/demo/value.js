import React from 'react';
import ReactDOM from 'react-dom';
import { TimePicker } from 'choerodon-ui';

class Demo extends React.Component {
  state = {
    value: null,
  };

  onChange = (time) => {
    console.log(time);
    this.setState({ value: time });
  }

  render() {
    return <TimePicker value={this.state.value} onChange={this.onChange} />;
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
