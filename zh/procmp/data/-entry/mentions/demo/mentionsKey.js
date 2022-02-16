import React from 'react';
import ReactDOM from 'react-dom';
import { Mentions } from 'choerodon-ui/pro';

const { Option } = Mentions;

const MOCK_DATA = {
  '@': ['mike', 'jason', 'Kevin'],
  '#': ['1.0', '2.0', '3.0'],
};

class App extends React.Component {
  state = {
    mentionsKey: '@',
  };

  onSearch = (_, mentionsKey) => {
    this.setState({ mentionsKey });
  };

  render() {
    const { mentionsKey } = this.state;

    return (
      <Mentions
        style={{ width: '100%' }}
        placeholder="input @ to mention people, # to mention tag"
        mentionsKey={['@', '#']}
        onSearch={this.onSearch}
      >
        {(MOCK_DATA[mentionsKey] || []).map((value) => (
          <Option key={value} value={value}>
            {value}
          </Option>
        ))}
      </Mentions>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
