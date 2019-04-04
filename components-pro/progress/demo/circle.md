---
order: 4
title:
  zh-CN: 圆形进度条
  en-US: Circle Progress
---

## zh-CN

圆形进度条。


## en-US

Circle Progress.


````jsx
import { Progress } from 'choerodon-ui/pro';

function format() {
  return 'Done';
}

ReactDOM.render(
  <div>
    <Progress value={75} type="circle" size="small" />
    <Progress value={100} type="circle" format={format} status="success" />
    <Progress value={35} type="circle" status="exception" size="large" />
  </div>,
  mountNode
);

````
