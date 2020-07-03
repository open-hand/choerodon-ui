import React from 'react';
import ReactDOM from 'react-dom';
import { CodeArea } from 'choerodon-ui/pro';

const style = { height: 30 };

class App extends React.Component {
  state = {
    value: 'Controlled Value',
  }

  handleChange = (value) => {
    this.setState({ value });
  }

  render() {
    return <CodeArea value={this.state.value} style={style} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
