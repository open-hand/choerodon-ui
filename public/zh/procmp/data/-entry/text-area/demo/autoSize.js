import React from 'react';
import ReactDOM from 'react-dom';
import { TextArea } from 'choerodon-ui/pro';

class App extends React.Component {

  render() {
    return (
      <TextArea
        placeholder="适应文本高度"
        autoSize={{ minRows: 2, maxRows: 8 }}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
