import React from 'react';
import ReactDOM from 'react-dom';
import { Carousel } from 'choerodon-ui';

ReactDOM.render(
  <Carousel
    vertical
    draggable
    theme="dark"
    verticalSwiping
    style={{ height: 200 }}
    className="pic-carousel"
  >
    <div>
      <div>
        <img alt="1" src="http://placekitten.com/g/400/200" />
      </div>
    </div>
    <div>
      <div>
        <img alt="2" src="http://placekitten.com/g/400/200" />
      </div>
    </div>
    <div>
      <div>
        <img alt="3" src="http://placekitten.com/g/400/200" />
      </div>
    </div>
    <div>
      <div>
        <img alt="4" src="http://placekitten.com/g/400/200" />
      </div>
    </div>
  </Carousel>,
  document.getElementById('container'),
);
