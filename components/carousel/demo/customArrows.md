---
order: 4
title:
  zh-CN: 自定义箭头
  en-US: Custom Arrows
---

## zh-CN

配置 class 类名来自定义箭头样式，也可以使用 prevArrow、nextArrow 返回自定义 dom 结构样式。

## en-US

Configure the class class name to customize the arrow style, or you can use prevArrow, nextArrow to return a custom dom structure style.

````jsx
import { Carousel } from 'choerodon-ui';

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "red" }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "green" }}
      onClick={onClick}
    />
  );
}

ReactDOM.render(
  <Carousel arrows className="my-class" prevArrow={<SamplePrevArrow />} nextArrow={<SampleNextArrow />}>
    <div><h3>1</h3></div>
    <div><h3>2</h3></div>
    <div><h3>3</h3></div>
    <div><h3>4</h3></div>
  </Carousel>,
  mountNode);
````

````css
/* For demo */
.my-class .slick-next::before {
  content: "->";
  font-size: 12px;
  line-height: 1.5;
  padding-left: 5px;
}
.my-class .slick-prev::before {
  content: "<-";
  font-size: 12px;
  line-height: 1.5;
  padding-left: 5px;
}
.my-class {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: #364d79;
  overflow: hidden;
}
.my-class h3 {
  color: #fff;
}
````
