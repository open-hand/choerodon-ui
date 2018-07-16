---
order: 3
title:
  zh-CN: 消息位置
  en-US: Message Placement
---

## zh-CN

定义消息位置

## en-US

Message Placement

````jsx
import { message, Button } from 'choerodon-ui';

const handleClick = (placement) => {
  message.destroy();
  message.config({
    top: 100,
    bottom: 100,
    duration: 5,
  });
  message.success(placement, undefined, undefined, placement);
};

ReactDOM.render(
  <div>
    <Button onClick={() => { handleClick('topLeft'); }}>topLeft</Button>
    <Button onClick={() => { handleClick('top'); }}>top</Button>
    <Button onClick={() => { handleClick('topRight'); }}>topRight</Button>
    <Button onClick={() => { handleClick('leftTop'); }}>leftTop</Button>
    <Button onClick={() => { handleClick('left'); }}>left</Button>
    <Button onClick={() => { handleClick('leftBottom'); }}>leftBottom</Button>
    <Button onClick={() => { handleClick('rightTop'); }}>rightTop</Button>
    <Button onClick={() => { handleClick('right'); }}>right</Button>
    <Button onClick={() => { handleClick('rightBottom'); }}>rightBottom</Button>
    <Button onClick={() => { handleClick('bottomLeft'); }}>bottomLeft</Button>
    <Button onClick={() => { handleClick('bottom'); }}>bottom</Button>
    <Button onClick={() => { handleClick('bottomRight'); }}>bottomRight</Button>
  </div>,
  mountNode);
````
