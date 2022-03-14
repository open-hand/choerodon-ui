---
order: 13
title:
  zh-CN: 内嵌
  en-US: Embedded
---

## zh-CN

内嵌。

## en-US

Embedded.

```jsx
import { useModal, Button, ModalProvider } from 'choerodon-ui/pro';

const ModalContent = () => {
  return (
    <div>
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </div>
  );
};

const OpenModalButton = ({ children, drawer, autoCenter }) => {
  const Modal = useModal();
  const openModal = React.useCallback(() => {
    Modal.open({
      drawer,
      title: 'Basic',
      children: <ModalContent />,
      closeOnLocationChange: false,
      mask: !drawer,
      size: 'small',
      autoCenter,
    });
  }, [Modal]);

  return (
<ModalProvider>
    <Button onClick={openModal} style={{ verticalAlign: 'top' }}>{children}</Button>
</ModalProvider>
  );
}

const App = () => {
  const containerRef = React.useRef();
  const getContainer = React.useCallback(() => containerRef.current, []);
  return (
    <div ref={containerRef} style={{ height: 300, backgroundColor: '#eee', overflow: 'auto' }}>
      <ModalProvider getContainer={false}>
        <OpenModalButton drawer>Open Drawer</OpenModalButton>
      </ModalProvider>
      <div style={{ marginTop: 400 }}>
        <ModalProvider getContainer={getContainer}>
          <OpenModalButton autoCenter>Open autoCenter Modal</OpenModalButton>
          <OpenModalButton>Open Modal</OpenModalButton>
        </ModalProvider>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, mountNode);
```
