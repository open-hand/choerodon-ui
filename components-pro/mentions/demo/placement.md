---
order: 4
title:
  zh-CN: 向上展开
  en-US: Placement
---

## zh-CN

向上展开建议。

## en-US

Change the suggestions placement.

```jsx
import { Mentions } from 'choerodon-ui/pro';

const { Option } = Mentions;

ReactDOM.render(
  <Mentions style={{ width: '100%' }} placement="top">
    <Option value="mike">mike</Option>
    <Option value="jason">jason</Option>
    <Option value="Kevin">Kevin</Option>
  </Mentions>,
  mountNode,
);
```
