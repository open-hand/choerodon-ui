---
order: 5
title:
  zh-CN: 关闭按钮
  en-US: Close Button
---

## zh-CN

关闭按钮。

## en-US

No Close Button.

```jsx
import { useModal, Button } from 'choerodon-ui/pro';

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Close button',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      closable: true,
    });
  }, [Modal]);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(<App />, mountNode);
```
