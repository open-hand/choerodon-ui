import React from 'react';
import ReactDOM from 'react-dom';
import { Select } from 'choerodon-ui';

const Option = Select.Option;

class App extends React.Component {
  state = {
    options: [],
  };

  handleChange = value => {
    let options;
    if (!value || value.indexOf('@') >= 0) {
      options = [];
    } else {
      options = ['gmail.com', '163.com', 'qq.com'].map(domain => {
        const email = `${value}@${domain}`;
        return <Option key={email}>{email}</Option>;
      });
    }
    this.setState({ options });
  };

  render() {
    // filterOption needs to be false，as the value is dynamically generated
    return (
      <Select
        mode="combobox"
        style={{ width: 200 }}
        onChange={this.handleChange}
        filterOption={false}
        placeholder="Enter the account name"
      >
        {this.state.options}
      </Select>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
