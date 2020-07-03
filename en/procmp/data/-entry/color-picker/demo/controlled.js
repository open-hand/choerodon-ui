import React from 'react';
import ReactDOM from 'react-dom';
import { ColorPicker } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '#0000ff',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    return <ColorPicker value={this.state.value} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
