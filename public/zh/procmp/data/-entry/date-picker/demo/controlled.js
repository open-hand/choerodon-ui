import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {};

  handleChange = moment => {
    console.log('[controlled]', moment && moment.format());
    this.setState({
      moment,
    });
  };

  render() {
    return (
      <DatePicker value={this.state.moment} placeholder="controlled" onChange={this.handleChange} />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
