import React from 'react';
import ReactDOM from 'react-dom';
import { Mentions } from 'choerodon-ui/pro';

const { Option, getMentions } = Mentions;

class App extends React.Component {
  state = {
    value: '@mike',
  };

  handleChange = (editorState) => {
    console.log(
      'getMentions: ',
      editorState && getMentions(editorState, { mentionsKey: '@', split: ' ' }),
    );

    this.setState({
      value: editorState,
    });
  };

  render() {
    const { value } = this.state;
    return (
      <Mentions
        style={{ width: '100%' }}
        onChange={this.handleChange}
        value={value}
      >
        <Option value="mike">mike</Option>
        <Option value="jason">jason</Option>
        <Option value="Kevin">Kevin</Option>
      </Mentions>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
