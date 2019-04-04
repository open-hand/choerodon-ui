---
order: 3
title:
  zh-CN: 自定义文字格式
  en-US: Custom Font Format
---

## zh-CN

自定义文字格式。


## en-US

Custom Font Format.


````jsx
import { Progress } from 'choerodon-ui/pro';

function format() {
  return 'Done';
}

ReactDOM.render(
  <Progress value={100} format={format} status="success" />,
  mountNode
);

````
