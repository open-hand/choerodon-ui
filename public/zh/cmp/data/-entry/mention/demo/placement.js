import React from 'react';
import ReactDOM from 'react-dom';
import { Mention } from 'choerodon-ui';

const { toString } = Mention;

function onChange(contentState) {
  console.log(toString(contentState));
}

function onSelect(suggestion) {
  console.log('onSelect', suggestion);
}

ReactDOM.render(
  <Mention
    style={{ width: '100%' }}
    onChange={onChange}
    suggestions={['afc163', 'benjycui', 'yiminghe', 'RaoHai', '中文', 'にほんご']}
    onSelect={onSelect}
    placement="top"
  />,
  document.getElementById('container'),
);
