---
order: 2
title:
  zh-CN: 状态
  en-US: status
---

## zh-CN

状态

## en-US

````jsx
import { Picture } from 'choerodon-ui/pro';

const App = () => {

  return (
    <>
      <Picture border block={false} width={100} height={100} />
      <Picture src="unkown" border block={false} width={100} height={100} />
      <Picture status="empty" border block={false} width={100} height={100} />
      <Picture status="error" border block={false} width={100} height={100} />
      <Picture status="loading" border block={false} width={100} height={100} />
    </>
  )
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
