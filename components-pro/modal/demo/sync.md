---
order: 1
title:
  zh-CN: 异步关闭
  en-US: Synchronize Close
---

## zh-CN

异步关闭。

## en-US

Synchronize Close.

````jsx
import { useModal, Button } from 'choerodon-ui/pro';

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Synchronize',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      onOk: () => new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      }),
      onCancel: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('error'));
        }, 1000);
      }),
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
