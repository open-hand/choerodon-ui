import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Button } from 'choerodon-ui/pro';

class Demo extends React.Component {
  state = {
    hidden: true,
  };

  handleOpen = () => {
    this.setState({
      hidden: false,
    });
  };

  handleClose = () => {
    this.setState({
      hidden: true,
    });
  };

  render() {
    return (
      <div>
        <Button onClick={this.handleOpen}>Open</Button>
        <Button onClick={this.handleClose} color="red">
          Close
        </Button>
        <Tooltip hidden={this.state.hidden} title="Prompt Text">
          <span style={{ marginLeft: 15 }}>Under control</span>
        </Tooltip>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
