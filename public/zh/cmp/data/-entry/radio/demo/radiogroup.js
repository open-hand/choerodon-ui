import React from 'react';
import ReactDOM from 'react-dom';
import { Radio } from 'choerodon-ui';

const RadioGroup = Radio.Group;

class App extends React.Component {
  state = {
    value: 1,
  };

  onChange = e => {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    return (
      <RadioGroup label="这是一个label" onChange={this.onChange} value={this.state.value} disabled>
        <Radio value={1}>A</Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
        <Radio value={4}>D</Radio>
      </RadioGroup>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
