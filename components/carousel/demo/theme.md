---
order: 6
title:
  zh-CN: 主题
  en-US: Theme
---

## zh-CN

指示器和箭头可分为浅色主题和深色主题.

## en-US

There are light themes and dark themes.

````jsx
import { Carousel } from 'choerodon-ui';

ReactDOM.render(
  <Carousel className="c7n-dark-slick-slide" theme="dark" arrows>
    <div><h3>1</h3></div>
    <div><h3>2</h3></div>
    <div><h3>3</h3></div>
    <div><h3>4</h3></div>
  </Carousel>,
  mountNode);
````

````css
/* For demo */
.c7n-dark-slick-slide {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: aliceblue;
  overflow: hidden;
}

````
