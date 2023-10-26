import React from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'choerodon-ui';

ReactDOM.render(
  <Carousel dotsClass="mydot-class" className="c7n-slick-slide">
    <div>
      <h3>1</h3>
    </div>
    <div>
      <h3>2</h3>
    </div>
    <div>
      <h3>3</h3>
    </div>
    <div>
      <h3>4</h3>
    </div>
  </Carousel>,
  document.getElementById('container'),
);
