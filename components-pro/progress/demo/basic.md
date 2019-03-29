---
order: 0
title:
  zh-CN: 进度条
  en-US: Progress
---

## zh-CN

进度条。


## en-US

Progress.


````jsx
import { Progress } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Progress value={40} />
    <Progress value={50} status="active" />
    <Progress value={70} status="exception" />
    <Progress value={50} status="success" />
    <Progress value={40} showInfo={false} />
  </div>,
  mountNode
);

````
