import React from 'react';
import ReactDOM from 'react-dom';
import { Tag } from 'choerodon-ui';

function log(e) {
  console.log(e);
}

function preventDefault(e) {
  e.preventDefault();
  console.log('Clicked! But prevent default.');
}

ReactDOM.render(
  <div>
    <Tag>Tag 1</Tag>
    <Tag>
      <a href="https://github.com/choerodon/choerodon-ui">Link</a>
    </Tag>
    <Tag closable onClose={log}>
      Tag 2
    </Tag>
    <Tag closable onClose={preventDefault}>
      Prevent Default
    </Tag>
  </div>,
  document.getElementById('container'),
);
