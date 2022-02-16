import React from 'react';
import ReactDOM from 'react-dom';
import { Mentions } from 'choerodon-ui/pro';

const { Option } = Mentions;

function getOptions() {
  return ['mike', 'jason', 'Kevin'].map((value) => (
    <Option key={value} value={value}>
      {value}
    </Option>
  ));
}

function App() {
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Mentions
          style={{ width: '100%' }}
          placeholder="this is disabled Mentions"
          disabled
        >
          {getOptions()}
        </Mentions>
      </div>
      <Mentions
        style={{ width: '100%' }}
        placeholder="this is readOnly Mentions"
        readOnly
      >
        {getOptions()}
      </Mentions>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('container'));
