---
order: 15
title:
  zh-CN: 个性化
  en-US: Customized
---

## zh-CN

个性化。

## en-US

Customized.

```jsx
import { useModal, Button } from 'choerodon-ui/pro';

const ModalContent = ({ modal }) => {
  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </div>
  );
};

const App = () => {
  const Modal = useModal();

  const openModal = React.useCallback((mode) => {
    Modal.open({
      title: 'Customized',
      children: <ModalContent />,
      drawer: mode === 'Drawer',
      resizable: true,
      customizable: true,
      customizedCode: `customized${mode}Code`
    });
  }, [Modal]);

  return (
      <>
        <Button onClick={() => openModal('Modal')}>Open Modal</Button>
        <Button onClick={() => openModal('Drawer')}>Open Drawer</Button>
      </>
  );
}

ReactDOM.render(<App />, mountNode);
```
