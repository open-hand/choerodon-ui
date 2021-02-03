import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Button } from 'choerodon-ui';

class App extends React.Component {
  state = {
    disabled: true,
  };

  toggle = () => {
    this.setState({
      disabled: !this.state.disabled,
    });
  };

  render() {
    return (
      <div>
        <Switch disabled={this.state.disabled} defaultChecked />
        <br />
        <Button
          style={{ marginTop: '10px' }}
          type="primary"
          onClick={this.toggle}
        >
          Toggle disabled
        </Button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
