---
order: 5
title:
  zh-CN: 自定义指示器
  en-US: Custom Dots
---

## zh-CN

配置 dotsClass 类名，可根据类名自定义指示器样式。

## en-US

Configure the dotsClass class name to customize the indicator style based on the class name.

````jsx
import { Carousel } from 'choerodon-ui';


ReactDOM.render(
  <Carousel dotsClass="mydot-class" className="c7n-slick-slide">
    <div><h3>1</h3></div>
    <div><h3>2</h3></div>
    <div><h3>3</h3></div>
    <div><h3>4</h3></div>
  </Carousel>,
  mountNode);
````

````css
/* For demo */

.c7n-carousel .mydot-class li button{
  background: red;
  opacity: 1;
}

````
