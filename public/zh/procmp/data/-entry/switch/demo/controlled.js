import React from 'react';
import ReactDOM from 'react-dom';
import { Switch } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: ['A'],
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[controlled]', value, '[oldValues]', oldValue);
    const { values } = this.state;
    if (value) {
      values.push(value);
    } else {
      values.splice(values.indexOf(value), 1);
    }
    this.setState({
      values,
    });
  }

  render() {
    const { values } = this.state;
    return (
      <div>
        <Switch
          name="controlled"
          value="A"
          checked={values.indexOf('A') !== -1}
          onChange={this.handleChange}
        />
        <br />
        <Switch
          name="controlled"
          value="B"
          checked={values.indexOf('B') !== -1}
          onChange={this.handleChange}
        />
        <br />
        <Switch
          name="controlled"
          value="C"
          checked={values.indexOf('C') !== -1}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
);
