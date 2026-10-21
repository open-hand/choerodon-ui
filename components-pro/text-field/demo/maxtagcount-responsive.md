---
order: 11
title:
  zh-CN: 多值响应式
  en-US: maxTagCount - responsive
---

## zh-CN

多值标签最大数量，支持响应式配置。

## en-US

Maximum number of tags displayed for multiple values. Supports responsive configuration.

````jsx
import { TextField } from 'choerodon-ui/pro';

ReactDOM.render(
  <>
    <p key="1">
      <TextField style={{ width: 200 }} multiple maxTagCount="responsive" defaultValue={['1111', '2222', '3333', '4444', '5555', '6666', '7777']} />
    </p>
    <p key="2">
      <TextField style={{ width: 300 }} multiple maxTagCount="responsive" defaultValue={['1111', '2222', '3333', '4444', '5555', '6666', '7777']} />
    </p>
    <p key="3">
      <TextField style={{ width: 400 }} multiple maxTagCount="responsive" defaultValue={['1111', '2222', '3333', '4444', '5555', '6666', '7777']} />
    </p>
    <p key="4">
      <TextField style={{ width: '100%' }} multiple maxTagCount="responsive" defaultValue={['1111', '2222', '3333', '4444', '5555', '6666', '7777']} />
    </p>
  </>,
  mountNode
);
````
