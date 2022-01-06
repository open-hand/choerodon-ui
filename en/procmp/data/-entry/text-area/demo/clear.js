import React from 'react';
import ReactDOM from 'react-dom';
import { TextArea } from 'choerodon-ui/pro';

const App = () => {
  return (
    <TextArea
      defaultValue="默认值"
      placeholder="适应文本高度"
      rows="4"
      resize="both"
      clearButton
      maxLength={50}
      showLengthInfo
    />
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
