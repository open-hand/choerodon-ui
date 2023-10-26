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
  <div>
    <Popover content={content} title="Title" trigger="hover">
      <Button>Hover me</Button>
    </Popover>
    <Popover content={content} title="Title" trigger="focus">
      <Button>Focus me</Button>
    </Popover>
    <Popover content={content} title="Title" trigger="click">
      <Button>Click me</Button>
    </Popover>
    <Popover content={content} title="Title" trigger="contextMenu">
      <Button>Right mouse click</Button>
    </Popover>
  </div>,
  document.getElementById('container'),
);
