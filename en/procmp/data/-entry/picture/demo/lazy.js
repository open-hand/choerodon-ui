import React from 'react';
import ReactDOM from 'react-dom';
import { Picture } from 'choerodon-ui/pro';

const App = () => {
  return (
    <div style={{ height: 200, width: 200, overflow: 'auto' }}>
      <Picture
        style={{ marginTop: 300 }}
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width={100}
        height={100}
        lazy
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
