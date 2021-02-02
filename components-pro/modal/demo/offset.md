---
order: 4
title:
  zh-CN: 自定义坐标
  en-US: Custom Position
---

## zh-CN

自定义坐标。

## en-US

Custom Position.

````jsx
import { useModal, Button } from 'choerodon-ui/pro';

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'No Footer',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      style: {
        left: 100,
        top: 200,
      },
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
