---
order: 6
title:
  zh-CN: 自定义指示符
  en-US: Custom spinning indicator
---

## zh-CN

使用自定义指示符。

## en-US

Use custom loading indicator.

````jsx
import { Spin } from 'choerodon-ui';

const c7nIcon = (
  <span className="custom-spin-dot">
    <i />
    <i />
    <i />
    <i />
  </span>
);

ReactDOM.render((
  <div>
    <Spin indicator={c7nIcon} size="small" />
    <Spin indicator={c7nIcon} />
    <Spin indicator={c7nIcon} size="large" />
  </div>
), mountNode);
````

```css

.custom-spin-dot {
  transform: rotate(45deg);
  animation: c7nRotate 1.2s infinite linear;
}
.custom-spin-dot i {
  width: 45%;
  height: 45%;
  border-radius: 100%;
  background-color: #3f51b5;
  transform: scale(.75);
  display: block;
  position: absolute;
  opacity: .3;
  animation: c7nSpinMove 1s infinite linear alternate;
  transform-origin: 50% 50%;
}
.custom-spin-dot i:nth-child(1) {
  left: 0;
  top: 0;
}
.custom-spin-dot i:nth-child(2) {
  right: 0;
  top: 0;
  animation-delay: .4s;
}
.custom-spin-dot i:nth-child(3) {
  right: 0;
  bottom: 0;
  animation-delay: .8s;
}
.custom-spin-dot i:nth-child(4) {
  left: 0;
  bottom: 0;
  animation-delay: 1.2s;
}
@keyframes c7nSpinMove {
  to {
    opacity: 1;
  }
}
@keyframes c7nRotate {
  to {
    transform: rotate(405deg);
  }
}
```
