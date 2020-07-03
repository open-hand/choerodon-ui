import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Button } from 'choerodon-ui';

class App extends React.Component {
  state = {
    disabled: true,
  }

  toggle = () => {
    this.setState({
      disabled: !this.state.disabled,
    });
  }

  render() {
    return (
      <div>
        <Switch disabled={this.state.disabled} defaultChecked />
        <br />
        <Button type="primary" onClick={this.toggle}>Toggle disabled</Button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
