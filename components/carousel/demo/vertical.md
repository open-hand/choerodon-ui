---
order: 1
title:
  zh-CN: 垂直
  en-US: Vertical
---

## zh-CN

垂直显示，可上下拖拽切换。

## en-US

Vertical pagination.

````jsx
import { Carousel } from 'choerodon-ui';

ReactDOM.render(
  <Carousel vertical draggable theme="dark" verticalSwiping>
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
  mountNode);
````

````css
/* For demo */
.slick-slide img {
  margin: auto;
}
````
