import React from 'react';
import ReactDOM from 'react-dom';
import { EmailField } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'abc@123.com',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  handleInput = (e) => {
    console.log('[input]', e.target.value);
  }

  render() {
    return <EmailField value={this.state.value} onChange={this.handleChange} onInput={this.handleInput} />;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
