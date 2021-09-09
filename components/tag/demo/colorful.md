---
order: 1
title:
  zh-CN: 多彩标签
  en-US: Colorful Tag
---

## zh-CN

我们添加了多种预设色彩的标签样式，用作不同场景使用。如果预设值不能满足你的需求，可以设置为具体的色值。

## en-US

We preset a series of colorful tag style for different situation usage.
And you can always set it to a hex color string for custom color.

````jsx
import { Tag } from 'choerodon-ui';

ReactDOM.render(
  <div>
    <h4 style={{ marginBottom: 16 }}>Presets:</h4>
    <div>
      <Tag color="pink">pink</Tag>
      <Tag color="magenta">magenta</Tag>
      <Tag color="red">red</Tag>
      <Tag color="volcano">volcano</Tag>
      <Tag color="orange">orange</Tag>
      <Tag color="yellow">yellow</Tag>
      <Tag color="gold">gold</Tag>
      <Tag color="cyan">cyan</Tag>
      <Tag color="lime">lime</Tag>
      <Tag color="green">green</Tag>
      <Tag color="blue">blue</Tag>
      <Tag color="geekblue">geekblue</Tag>
      <Tag color="purple">purple</Tag>
    </div>
    <h4 style={{ marginBottom: 16 }}>Presets inverse:</h4>
    <div>
      <Tag color="pink-inverse">pink-inverse</Tag>
      <Tag color="magenta-inverse">magenta-inverse</Tag>
      <Tag color="red-inverse">red-inverse</Tag>
      <Tag color="volcano-inverse">volcano-inverse</Tag>
      <Tag color="orange-inverse">orange-inverse</Tag>
      <Tag color="yellow-inverse">yellow-inverse</Tag>
      <Tag color="gold-inverse">gold-inverse</Tag>
      <Tag color="cyan-inverse">cyan-inverse</Tag>
      <Tag color="lime-inverse">lime-inverse</Tag>
      <Tag color="green-inverse">green-inverse</Tag>
      <Tag color="blue-inverse">blue-inverse</Tag>
      <Tag color="geekblue-inverse">geekblue-inverse</Tag>
      <Tag color="purple-inverse">purple-inverse</Tag>
    </div>
    <h4 style={{ margin: '16px 0' }}>Custom:</h4>
    <div>
      <Tag color="#f50">#f50</Tag>
      <Tag color="#2db7f5">#2db7f5</Tag>
      <Tag color="#87d068">#87d068</Tag>
      <Tag color="#108ee9">#108ee9</Tag>
    </div>
  </div>,
  mountNode);
````

````css
.c7n-tag {
  margin-bottom: 8px;
}
````
