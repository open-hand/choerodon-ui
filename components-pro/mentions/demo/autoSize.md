---
order: 5
title:
  zh-CN: 自动大小
  en-US: autoSize
---

## zh-CN

自适应内容高度。

## en-US

Height autoSize.

```jsx
import { Mentions } from 'choerodon-ui/pro';

const { Option } = Mentions;

ReactDOM.render(
  <Mentions autoSize style={{ width: '100%' }}>
    <Option value="afc163">afc163</Option>
    <Option value="zombieJ">zombieJ</Option>
    <Option value="yesmeck">yesmeck</Option>
  </Mentions>,
  mountNode,
);
```
