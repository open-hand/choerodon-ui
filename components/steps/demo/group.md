---
order: 10
title:
  zh-CN: 分组用法
  en-US: Group
---

## zh-CN

分组用法。

## en-US

Group。

```jsx
import { Steps} from 'choerodon-ui';

const Step = Steps.Step;
const StepGroup = Steps.StepGroup;

ReactDOM.render(
  <Steps className="group-demo" current={0}>
    <StepGroup headerIcon="instance" headerText="必填项" >
      <Step title="标题名称"  />
      <Step title="标题名称"  />
    </StepGroup>
    <StepGroup headerIcon="mail_modal" className="group-next" headerText="选填项">
      <Step title="标题名称"  />
      <Step title="标题名称"  />
    </StepGroup>
  </Steps>,
  mountNode,
);
```

```css
.group-demo .c7n-steps-group {
  background: #F0F6FF;
  border: 1px solid #E3EFFF;
  border-radius: 0px 50px 50px 50px;
  margin-left: 50px;
  
}
.group-demo .c7n-steps-item-wait .c7n-steps-item-icon {
    color: gray;
    border: 1px solid gray;
    background:white;
}

.group-demo .c7n-steps-horizontal:not(.c7n-steps-label-vertical) .c7n-steps-item{
  margin-right:10%;
}

.group-demo .c7n-steps-item-title {
  padding-right:70%;
}
.group-demo .group-next > .c7n-steps-header {
  background: #6699CC;
}
.group-demo .c7n-steps-item-content > .c7n-steps-item-title::after{
  background: #6699CC;
}
.group-demo .group-next {
  background: #F0F6F6;
}

.group-demo .group-next::before {
    position: absolute;
    content: " ";
    width: 50px;
    height: 50px;
    background: #F0F6F6;
    margin-left: -70px;
    margin-top: -30px;
}

.group-demo .group-next::after {
  position: absolute;
    content: " ";
    width: 50px;
    height: 50px;
    background: white;  
    margin-left: -70px;
    margin-top: -30px;
    border-radius: 0 50px 0 0;  
}

```

