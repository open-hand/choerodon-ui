import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Icon } from 'choerodon-ui';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: 'xxx',
    };
  }

  emitEmpty = () => {
    this.userNameInput.focus();
    this.setState({ userName: '' });
  }

  onChangeUserName = (e) => {
    this.setState({ userName: e.target.value });
  }

  render() {
    const { userName } = this.state;
    const suffix = userName ? <Icon type="close" onClick={this.emitEmpty} /> : null;
    return (
      <Input
        placeholder="Enter your username"
        prefix="input-"
        suffix={suffix}
        label="username"
        value={userName}
        onChange={this.onChangeUserName}
        ref={node => this.userNameInput = node}
        copy
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
