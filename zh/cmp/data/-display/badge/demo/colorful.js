import React from 'react';
import ReactDOM from 'react-dom';
import { Badge, Divider } from 'choerodon-ui';

const colors = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
  'dark',
  'gray',
];

ReactDOM.render(
  <>
    <Divider orientation="left">Presets</Divider>
    <div>
      {colors.map((color) => (
        <div key={color}>
          <Badge color={color} text={color} />
        </div>
      ))}
    </div>
    <Divider orientation="left">Custom</Divider>
    <>
      <Badge color="#f50" text="#f50" />
      <br />
      <Badge color="#2db7f5" text="#2db7f5" />
      <br />
      <Badge color="#87d068" text="#87d068" />
      <br />
      <Badge color="#108ee9" text="#108ee9" />
    </>
  </>,
  document.getElementById('container'),
);
