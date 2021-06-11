import React from 'react';
import ReactDOM from 'react-dom';
import { Radio } from 'choerodon-ui/pro';

function handleChange(value) {
  console.log('[basic]', value);
  document.addEventListener('click', { handleEvent(e) { console.log(e);} }, { capture: false, once: true });
}

ReactDOM.render(
  <form>
    <Radio name="base" value="A" onChange={handleChange} defaultChecked>A</Radio>
    <Radio name="base" value="B" onChange={handleChange}>B</Radio>
    <Radio name="base" value="C" onChange={handleChange}>C</Radio>
  </form>,
  document.getElementById('container'),
);
