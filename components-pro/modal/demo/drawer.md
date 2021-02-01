---
order: 10
title:
  zh-CN: 多层抽屉
  en-US: Drawer
---

## zh-CN

通过设定多个 drawer 类型的弹出框形成多层抽屉，可指定弹出层宽度，弹出动画。

## en-US

Drawer.

```jsx
import { useModal, Button } from 'choerodon-ui/pro';

const App = () => {
  const Modal = useModal();

  const openSubModal2 = React.useCallback(() => {
    return new Promise(resolve => {
      Modal.open({
        title: 'Sub Mode 2',
        size: 'large',
        drawer: true,
        drawerTransitionName: 'slide-left',
        children: (
          <div>
            <p>Open Sub Modal2...</p>
            <p>Open Sub Modal2...</p>
          </div>
        ),
        onOk: resolve,
      });
    });
  }, [Modal]);

  const openSubModal1 = React.useCallback(() => {
    return new Promise(resolve => {
      Modal.open({
        title: 'Sub Mode 1',
        drawer: true,
        children: (
          <div>
            <Button onClick={openSubModal2}>Open Sub Modal2...</Button>
            <p>Open Sub Modal1...</p>
            <p>Open Sub Modal1...</p>
          </div>
        ),
        onOk: resolve,
        onCancel: resolve,
      });
    });
  }, [Modal, openSubModal2]);

  const openModal = React.useCallback(() => {
    Modal.open({
      closable: true,
      title: 'Multilayer',
      drawer: true,
      size: 'small',
      children: (
        <div>
          <Button onClick={openSubModal1}>Open Sub Modal1...</Button>
          <p>Modal...</p>
          <p>Modal...</p>
        </div>
      ),
      afterClose: () => {
        window.console.log('after close');
      },
    });
  }, [Modal, openSubModal1]);

  return (
    <Button onClick={openModal}>Drawer</Button>
  );
}

ReactDOM.render(<App />, mountNode);
```
