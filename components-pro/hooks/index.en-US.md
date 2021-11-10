---
category: Pro Components
subtitle: 钩子
cols: 1
type: Other
title: Hooks
---

钩子。

## 使用

```jsx
import { ConfigProvider, useConfig } from 'choerodon-ui';
import { Button, ModalProvider, useDataSet, useModal } from 'choerodon-ui/pro';

const App = () => {
  const config = useConfig();
  const modal = useModal();
  const dataSet = useDataSet(() => {
    autoQuery: true,
  }, []);
  const handleOpenModal = React.useCallback(() => modal.open({
    children: (
      <Form dataSet={dataSet} />
    ),
  }), [modal]);
  console.log(config.getConfig('prefixCls'));
  return <Button onClick={handleOpenModal}>Open Modal</Button>
}

export default () => (
  <ConfigProvider prefixCls="c7n">
    <ModalProvider>
     <App />
    </ModalProvider>
  </ConfigProvider>
);

```

## API

| 钩子 | 说明 | 参数 |
| --- | --- | --- |
| useConfig() | 获取配置实例, 受 [ConfigProvider](/components/config-provider) 控制 |  |
| useDataSet(factory, deps) | 获取DataSet实例, 相关配置受 [ConfigProvider](/components/config-provider) 控制 | `factory` - 返回 DataSet 配置的函数  `deps` -  钩子依赖列表  |
| useModal() | 获取 Modal 实例， 配合 [ModalProvider](/components/modal-provider) 使用时可以传递上下文 |   |
