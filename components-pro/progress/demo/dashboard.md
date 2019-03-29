---
order: 4
title:
  zh-CN: 仪表盘进度条
  en-US: Dashboard Progress
---

## zh-CN

仪表盘


## en-US

Dashboard Progress.


````jsx
import { Progress } from 'choerodon-ui/pro';

ReactDOM.render(
  <div>
    <Progress value={75} type="dashboard" />
    <Progress value={100} type="dashboard" status="success" />
    <Progress value={25} type="dashboard" status="exception" />
  </div>,
  mountNode
);

````
