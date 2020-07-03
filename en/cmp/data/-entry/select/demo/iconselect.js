import React from 'react';
import ReactDOM from 'react-dom';
import { IconSelect } from 'choerodon-ui';

ReactDOM.render(
  <IconSelect showAll style={{ width: '300px' }} defaultValue={['root']} />,
  document.getElementById('container'));
