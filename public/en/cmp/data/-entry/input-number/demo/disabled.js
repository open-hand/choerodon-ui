import React from 'react';
import ReactDOM from 'react-dom';
import { InputNumber, Button } from 'choerodon-ui';

class App extends React.Component {
  state = {
    disabled: true,
  };

  toggle = () => {
    this.setState({
      disabled: !this.state.disabled,
    });
  }

  render() {
    return (
      <div>
        <InputNumber label="禁用" min={1} max={10} disabled={this.state.disabled} defaultValue={3} />
        <div style={{ marginTop: 20 }}>
          <Button onClick={this.toggle} type="primary">Toggle disabled</Button>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
