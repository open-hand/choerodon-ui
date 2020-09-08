import React from 'react';
import ReactDOM from 'react-dom';
import { RichText } from 'choerodon-ui/pro';

const style = { height: 200 };


class App extends React.Component {
  state = {
    value: [{insert: "Controlled Value"}],
    // string 类型值会被转为 Delta 对象
    // value: "Controlled Value",
  };

  handleChange = (value, oldValue) => {
    console.log('handleChange', value, oldValue)
    this.setState({ value });
  };

  render() {
    return <RichText value={this.state.value} style={style} onChange={this.handleChange} />;
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
