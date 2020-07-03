import React from 'react';
import ReactDOM from 'react-dom';
import { Slider, Switch } from 'choerodon-ui';

class Demo extends React.Component {
  state = {
    disabled: false,
  }

  handleDisabledChange = (disabled) => {
    this.setState({ disabled });
  }

  render() {
    const { disabled } = this.state;
    return (
      <div>
        <Slider defaultValue={30} disabled={disabled} />
        <Slider range defaultValue={[20, 50]} disabled={disabled} />
        Disabled: <Switch size="small" checked={disabled} onChange={this.handleDisabledChange} />
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('container'));
