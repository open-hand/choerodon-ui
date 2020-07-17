---
order: 8
title:
  zh-CN: 自定义 icon
  en-US: Custom icon
---

## zh-CN

自定义 icon。

## en-US

Custom icon.

```jsx
import { Result, Button, Icon} from 'choerodon-ui';


ReactDOM.render(
  <Result
    icon={<Icon type="wb_incandescent-o" />}
    title="Great, we have done all the operations!"
    extra={<Button funcType="raised" type="primary">Next</Button>}
  />,
  mountNode,
);
```
