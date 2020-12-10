import React from 'react';
import ReactDOM from 'react-dom';
import { Timeline, Icon } from 'choerodon-ui';

ReactDOM.render(
  <Timeline>
    <Timeline.Item>Create a services site 2015-09-01</Timeline.Item>
    <Timeline.Item>Solve initial network problems 2015-09-01</Timeline.Item>
    <Timeline.Item
      dot={<Icon type="note" style={{ fontSize: '16px' }} />}
      color="red"
    >
      Technical testing 2015-09-01
    </Timeline.Item>
    <Timeline.Item>Network problems being solved 2015-09-01</Timeline.Item>
  </Timeline>,
  document.getElementById('container'),
);
