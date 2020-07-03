import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Button, Icon } from 'choerodon-ui/pro';

class Demo extends React.Component {
  state = {
    theme: 'dark',
  };

  handleLighten = () => {
    this.setState({
      theme: 'light',
    });
  };

  handleDarken = () => {
    this.setState({
      theme: 'dark',
    });
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleLighten}>Light</Button>
        <Button onClick={this.handleDarken} color="dark">
          Dark
        </Button>
        <Tooltip
          theme={this.state.theme}
          title={
            <span style={{ color: 'red' }}>
              <Icon type="error" />
              Prompt Text
            </span>
          }
          hidden={false}
        >
          <span style={{ marginLeft: 15 }}>Change Theme</span>
        </Tooltip>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
