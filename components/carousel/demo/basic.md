---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

最简单的用法。

## en-US

Basic usage.

````jsx
import { Carousel } from 'choerodon-ui';

function onChange(a, b, c) {
  console.log(a, b, c);
}

ReactDOM.render(
  <Carousel className="c7n-slick-slide" afterChange={onChange} arrows>
    <div><h3>1</h3></div>
    <div><h3>2</h3></div>
    <div><h3>3</h3></div>
    <div><h3>4</h3></div>
  </Carousel>,
  mountNode);
````

````css
/* For demo */
.c7n-slick-slide {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: #364d79;
  overflow: hidden;
}

.c7n-slick-slide h3 {
  color: #fff;
}
````
