import React from 'react';
import ReactDOM from 'react-dom';
import { CheckBox } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[button]', value, '[oldValue]', oldValue);
}

ReactDOM.render(
  <div>
    <CheckBox mode="button" name="base" value="A" onChange={handleChange} defaultChecked>A</CheckBox>
    <CheckBox mode="button" name="base" value="B" onChange={handleChange}>B</CheckBox>
    <CheckBox mode="button" name="base" value="C" onChange={handleChange}>C</CheckBox>
  </div>,
  document.getElementById('container')
);
