import React from 'react';
import ReactDOM from 'react-dom';
import { Radio } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[button]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <form>
    <Radio mode="button" name="base" value="A" onChange={handleChange} defaultChecked>A</Radio>
    <Radio mode="button" name="base" value="B" onChange={handleChange}>B</Radio>
    <Radio mode="button" name="base" value="C" onChange={handleChange}>C</Radio>
  </form>,
  document.getElementById('container')
);
