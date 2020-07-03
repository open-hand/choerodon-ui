import React from 'react';
import ReactDOM from 'react-dom';
import { Transfer } from 'choerodon-ui/pro';

const { Option } = Transfer;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'wu',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[constrolled]', 'newValue', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    return (
      <Transfer value={this.state.value} onChange={this.handleChange}>
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Transfer>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
