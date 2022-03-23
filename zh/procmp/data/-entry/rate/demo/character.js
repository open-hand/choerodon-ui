import React from 'react';
import ReactDOM from 'react-dom';
import { Rate, Icon } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <Rate character={<Icon type="heart" />} allowHalf />
    <br />
    <Rate character="A" allowHalf style={{ fontSize: 36 }} />
    <br />
    <Rate character="好" allowHalf />
  </div>,
  document.getElementById('container'),
);
