import React from 'react';
import ReactDOM from 'react-dom';
import { AutoComplete } from 'choerodon-ui';

const Option = AutoComplete.Option;

class Complete extends React.Component {
  state = {
    result: [],
  }

  handleSearch = (value) => {
    let result;
    if (!value || value.indexOf('@') >= 0) {
      result = [];
    } else {
      result = ['gmail.com', '163.com', 'qq.com'].map(domain => `${value}@${domain}`);
    }
    this.setState({ result });
  }

  render() {
    const { result } = this.state;
    const children = result.map((email) => {
      return <Option key={email}>{email}</Option>;
    });
    return (
      <AutoComplete
        style={{ width: 200 }}
        onSearch={this.handleSearch}
        placeholder="input here"
      >
        {children}
      </AutoComplete>
    );
  }
}

ReactDOM.render(<Complete />, document.getElementById('container'));
