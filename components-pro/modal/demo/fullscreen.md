---
order: 8
title:
  zh-CN: 全屏显示
  en-US: Full Screen
---

## zh-CN

全屏显示。

## en-US

Full screen.

````jsx
import { useModal, Button } from 'choerodon-ui/pro';

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Full screen',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      fullScreen: true,
    });
  }, [Modal]);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
