import React from 'react';
import ReactDOM from 'react-dom';
import { Card } from 'choerodon-ui';

const { Meta } = Card;

ReactDOM.render(
  <Card
    hoverable
    style={{ width: 240 }}
    cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
  >
    <Meta title="Europe Street beat" description="www.instagram.com" />
  </Card>,
  document.getElementById('container'),
);
