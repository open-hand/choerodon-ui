---
order: 9
title:
  zh-CN: 自定义 状态展示
  en-US: Custom status Renderer
---

## zh-CN

自定义 状态展示。

## en-US

Custom status Renderer.

```jsx
import { Result, Button} from 'choerodon-ui';

ReactDOM.render(
  <Result
    statusRenderer={{
      '204': <img style={{width:'200px'}} alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />,
    }}
    status={204}
    title="204"
    subTitle="客户端发送给客户端的请求得到了成功处理，但在返回的响应报文中不含实体的主体部分"
    extra={<Button funcType="raised" type="primary">No Content, Go Home Page</Button>}
  />,
  mountNode,
);
```
