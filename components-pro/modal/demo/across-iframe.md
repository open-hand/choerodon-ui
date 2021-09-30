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
import { Modal, Button, Table, DataSet } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(() => new DataSet({ autoCreate: true, fields:[{ name: 'birth', type: 'date' }] }), []);
  const openModal = React.useCallback(() => {
    Modal.open({
      title: 'Across Iframe',
      children: (
        <Table dataSet={ds}>
          <Table.Column name="id" />
          <Table.Column name="birth" editor />
        </Table>
      ),
      okText: '确定',
    });
  }, []);

  return (
    <>
      <Button onClick={openModal}>Open</Button>
      <Table dataSet={ds}>
        <Table.Column name="id" />
        <Table.Column name="birth" editor />
      </Table>
    </>
  );
}

ReactDOM.render(<App />, mountNode);
```
