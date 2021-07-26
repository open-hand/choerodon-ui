---
order: 11
title:
  zh-CN: 穿越 iframe
  en-US: Across iframe
iframe: 200
across: true
---

## zh-CN

穿越 iframe, 跨域时不生效, 不支持 ModalProvider 提供的 modal， 保证顶层引入了 choerodon-ui/pro 的样式。

## en-US

Across iframe, Does not take effect when cross-domain.

```jsx
import { Modal, Button, DatePicker } from 'choerodon-ui/pro';

const App = () => {
  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Across Iframe',
      children: <DatePicker />,
      okText: '确定'
    });
  }, []);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(<App />, mountNode);
```
