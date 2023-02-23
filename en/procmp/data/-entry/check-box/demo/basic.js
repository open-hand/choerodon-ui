import React from 'react';
import ReactDOM from 'react-dom';
import { CheckBox } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic]', value, '[oldValue]', oldValue);
}

const App = () => (
  <div>
    <CheckBox name="base" value="A" onChange={handleChange} defaultChecked>
      A
    </CheckBox>
    <CheckBox name="base" value="B" onChange={handleChange}>
      B
    </CheckBox>
    <CheckBox name="base" value="C" onChange={handleChange}>
      C
    </CheckBox>
    <CheckBox name="base" value="C" onChange={handleChange}>
      C
    </CheckBox>
  </div>
);

ReactDOM.render(<App />, document.getElementById('container'));
