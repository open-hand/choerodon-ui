---
category: Pro Components
subtitle: 模态框
type: Feedback
title: Modal
---

模态框。

## 何时使用

## API

### Modal

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 唯一键， 当 destroyOnClose 为 false 时，必须指定 key。为了避免与其他 modal 的 key 重复，可通过 Modal.key()来获取唯一 key。 | string |  |
| title | 标题 | ReactNode |  |
| closable | 显示右上角关闭按钮 | boolean | false |
| border | 默认 Modal 的头和脚有边框线 | boolean | true |
| drawerBorder | 默认 drawer 的头和脚有边框线 | boolean | true |
| movable | 可移动， drawer 无法移动 | boolean | true |
| fullScreen | 全屏显示 | boolean | false |
| maskClosable | 点击蒙层是否允许关闭，可选 boolean \| click \| dblclick | boolean \| string | false |
| mask | 是否显示蒙层 | boolean | true |
| maskStyle | 蒙层样式 | CSSProperties |  |
| maskClassName | 蒙层自定义样式名 | string |  |
| keyboardClosable | 按 esc 键是否允许关闭 | boolean | true |
| destroyOnClose | 关闭时是否销毁 | boolean | true |
| footer | 底部内容 | ReactNode 或`(okBtn: ReactNode, cancelBtn: ReactNode) => ReactNode` |  |
| okText | 确认按钮文字 | ReactNode | 确定 |
| cancelText | 取消按钮文字 | ReactNode | 取消 |
| onClose | 关闭时回调，返回`false` `Promise.resolve(false)`或`Promise.reject()`不会关闭， 其他自动关闭 | () => Promise&lt;boolean&gt; |  |
| onOk | 点击确定回调，返回`false` `Promise.resolve(false)`或`Promise.reject()`不会关闭， 其他自动关闭 | () => Promise&lt;boolean&gt; |  |
| onCancel | 点击取消回调，返回`false` `Promise.resolve(false)`或`Promise.reject()`不会关闭， 其他自动关闭 | () => Promise&lt;boolean&gt; |  |
| afterClose | 关闭后回调 | () => void |  |
| drawer | 抽屉模式 | boolean | false |
| drawerTransitionName | 抽屉模式使用的动画， 可选值： 'slide-right' 'slide-left' 'slide-up' 'slide-down' | string | 'slide-right' |
| drawerOffset | 抽屉之间的位移距离 | number | 150 |
| okButton | 显示 ok 按钮 | boolean | true |
| cancelButton | 显示 cancel 按钮 | boolean | |
| okCancel | \<deprecated\> 同时显示 ok 和 cancel 按钮，false 的时候只显示 ok 按钮 | boolean | true |
| okFirst | ok 按钮是否排在第一个 | boolean | true |
| okProps | ok 按钮属性 | object |  |
| cancelProps | cancel 按钮属性 | object |  |
| keyboard	| 是否支持键盘 esc 关闭	| boolean	| true |
| autoCenter	| 是否居中显示	| boolean	| false |
| contentStyle | 内容样式 | object |  |
| bodyStyle | 内容体样式 | object |  |

<style>
.code-box-demo .c7n-pro-btn {
    margin-right: 8px;
}
</style>

### ModalProvider > v0.8.50

- 使用 Modal 前，需要在页面根节点外包裹 [ModalProvider](/components-pro/modal-provider/#ModalProvider)。如果路由切换时要清空所有 Modal，需要在 ModalProvider 传入 location，如下所示。
- 如果 Modal 要获取 React Context，请在对应的 Context.Provider 子节点外包裹 [ModalProvider](/components-pro/modal-provider/#ModalProvider)，并使用 ModalProvider 提供的 injectModal 或 useModal 来代替 Modal.open。

```jsx harmony
import { ModalProvider } from 'choerodon-ui/pro';
import { withRouter } from 'react-router';

@withRouter
class App extends React.Component {
  render() {
    const { location } = this.props;
    return (
      <ModalProvider location={location}>
        <Main />
      </ModalProvider>
    );
  }
}

render(<App />, mountNode);
```

### ModalContent <= v0.8.50

- 使用 Modal 前，需要在页面 Root 内插入 ModalContainer。如果路由切换时要清空所有 Modal，需要在 ModalContiner 传入 location，如下所示。
- 如果 Modal 要获取 React Context，请将 ModalContainer 至于 Context.Provider 之下。
- 为了避免多个 ModalContainer 之间 Context 错乱， ModalContainer 务必作为第一个子元素使用。

```jsx harmony
import { ModalContainer } from 'choerodon-ui/pro';
import { withRouter } from 'react-router';

@withRouter
class App extends React.Component {
  render() {
    const { location } = this.props;
    return (
      <div>
        <ModalContainer location={location} />
        <Main />
      </div>
    );
  }
}

render(<App />, mountNode);
```

### Modal.open

Modal.open()返回一个对象，该对象具有如下方法：

| 名称           | 说明 | 参数                 |
| -------------- | ---- | -------------------- |
| close(destroy) | 关闭 | `destroy` - 是否销毁 |
| open()         | 打开 |                      |
| update(props)  | 更新 |                      |

### props.modal

Modal 会向内部组件注入 modal 对象，该对象具有如下属性与方法：

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| handleOk(callback) | 注册响应 ok 按钮的钩子，返回值为 false 将阻止关闭 | `callback` - 钩子 |
| handleCancel(callback) | 注册响应 cancel 按钮的钩子，返回值为 false 将阻止关闭 | `callback` - 钩子 |
| close(destroy) | 关闭 | `destroy` - 是否销毁 |
| update(props) | 更新 |  |
| props | modal 的 props |  |
