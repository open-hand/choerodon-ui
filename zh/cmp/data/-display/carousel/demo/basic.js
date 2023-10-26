import React from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'choerodon-ui';

function onChange(a, b, c) {
  console.log(a, b, c);
}

ReactDOM.render(
  <Carousel className="c7n-slick-slide" afterChange={onChange} arrows>
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
