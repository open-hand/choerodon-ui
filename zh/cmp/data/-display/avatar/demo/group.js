import React from 'react';
import ReactDOM from 'react-dom';
import { Avatar, Divider, Tooltip } from 'choerodon-ui';

ReactDOM.render(
  <>
    <Avatar.Group>
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
      <Tooltip title="User" placement="top">
        <Avatar style={{ backgroundColor: '#87d068' }} icon="person" />
      </Tooltip>
      <Avatar style={{ backgroundColor: '#1890ff' }} icon="event_available-o" />
    </Avatar.Group>
    <Divider />
    <Avatar.Group size={64}>
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
      <Tooltip title="User" placement="top">
        <Avatar style={{ backgroundColor: '#87d068' }} icon="person" />
      </Tooltip>
      <Avatar style={{ backgroundColor: '#1890ff' }} icon="event_available-o" />
    </Avatar.Group>
    <Divider />
    <Avatar.Group maxCount={2} size="large">
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
      <Tooltip title="User" placement="top">
        <Avatar style={{ backgroundColor: '#87d068' }} icon="person" />
      </Tooltip>
      <Avatar style={{ backgroundColor: '#1890ff' }} icon="event_available-o" />
    </Avatar.Group>
    <Divider />
    <Avatar.Group maxCount={2} size="small" maxPopoverTrigger="click">
      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
      <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
      <Tooltip title="User" placement="top">
        <Avatar style={{ backgroundColor: '#87d068' }} icon="person" />
      </Tooltip>
      <Avatar style={{ backgroundColor: '#1890ff' }} icon="event_available-o" />
    </Avatar.Group>
  </>,
  document.getElementById('container'),
);
