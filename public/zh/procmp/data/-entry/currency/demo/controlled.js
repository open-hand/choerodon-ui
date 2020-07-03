import React from 'react';
import ReactDOM from 'react-dom';
import { Currency } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 100,
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    return <Currency value={this.state.value} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
