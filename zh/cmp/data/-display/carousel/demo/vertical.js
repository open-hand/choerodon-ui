import React from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'choerodon-ui';

ReactDOM.render(
  <Carousel vertical>
    <div>
      <h3 style={{ height: 150 }}>1</h3>
    </div>
    <div>
      <h3 style={{ height: 150 }}>2</h3>
    </div>
    <div>
      <h3 style={{ height: 150 }}>3</h3>
    </div>
    <div>
      <h3 style={{ height: 150 }}>4</h3>
    </div>
  </Carousel>,
  document.getElementById('container'),
);
