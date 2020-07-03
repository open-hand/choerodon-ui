import React from 'react';
import ReactDOM from 'react-dom';
import { Popover, Button } from 'choerodon-ui';

const content = (
  <div>
    <p>Content</p>
    <p>Content</p>
  </div>
);

ReactDOM.render(
  <Popover content={content} title="Title">
    <Button type="primary">Hover me</Button>
  </Popover>,
  document.getElementById('container'));
