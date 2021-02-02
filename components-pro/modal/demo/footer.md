---
order: 2
title:
  zh-CN: 自定义页脚
  en-US: Custom Footer
---

## zh-CN

自定义页脚。

## en-US

Custom Footer.

```jsx
import { useModal, Button } from 'choerodon-ui/pro';

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback(() => {
    const modal = Modal.open({
      title: 'Custom Footer',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      footer: <Button onClick={closeModal}>关闭</Button>,
    });

    function closeModal() {
      modal.close();
    }
  }, [Modal]);

  const openNoFooter = React.useCallback(() => {
    Modal.open({
      title: 'No Footer',
      maskClosable: true,
      destroyOnClose: true,
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      footer: null,
    });
  }, [Modal]);

  const openMoreButtons = React.useCallback(() => {
    Modal.open({
      title: 'More Buttons',
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          <Button color="primary">Custom</Button>
          {cancelBtn}
        </div>
      ),
    });
  }, [Modal]);

  return (
    <div>
      <Button onClick={openModal}>Custom</Button>
      <Button onClick={openNoFooter}>No Footer</Button>
      <Button onClick={openMoreButtons}>More Buttons</Button>
    </div>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
```
