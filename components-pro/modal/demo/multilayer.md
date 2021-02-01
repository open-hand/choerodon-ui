---
order: 3
title:
  zh-CN: 多层
  en-US: Multilayer
---

## zh-CN

多层。

## en-US

Multilayer.

````jsx
import { useModal, Button, Modal } from 'choerodon-ui/pro';

const { confirm } = Modal;

const App = () => {
  const Modal = useModal();

  const openSubModal = React.useCallback(async () => {
    return await confirm('确认关闭？') === 'ok';
  }, [Modal])

  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Multilayer',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      onClose: openSubModal,
    });
  }, [Modal, openSubModal]);

  return (
    <Button onClick={openModal}>Open</Button>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
