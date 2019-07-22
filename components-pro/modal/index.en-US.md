---
category: Pro Components
subtitle: 模态框
type: Feedback
title: Modal
---

表单控件。

## 何时使用



## API

### Modal

| 参数      | 说明                                     | 类型        |默认值 |
|---|------------------------------------------------------|--------|--------|
| key | 唯一键， 当destroyOnClose为false时，必须指定key。为了避免与其他modal的key重复，可通过Modal.key()来获取唯一key。 | string |  |
| title | 标题 | ReactNode |  |
| header | 是否显示头部 | ReactNode |  |
| closable | 显示右上角关闭按钮 | boolean | true |
| movable | 可移动， drawer无法移动 | boolean | true |
| fullScreen | 全屏显示 | boolean | false |
| maskClosable | 点击蒙层是否允许关闭 | boolean | false |
| keyboardClosable | 按esc键是否允许关闭 | boolean | true |
| destroyOnClose | 关闭时是否销毁 | boolean | true |
| footer | 底部内容 | ReactNode |  |
| okText | 确认按钮文字 | ReactNode | 确定 |
| cancelText | 取消按钮文字 | ReactNode | 取消 |
| onClose | 关闭时回调，返回`false` `Promise.resolve(false)`或`Promise.reject()`不会关闭， 其他自动关闭 | () => Promise&lt;boolean&gt; |  |
| onOk | 点击确定回调，返回`false` `Promise.resolve(false)`或`Promise.reject()`不会关闭， 其他自动关闭 | () => Promise&lt;boolean&gt; |  |
| onCancel | 点击取消回调，返回`false` `Promise.resolve(false)`或`Promise.reject()`不会关闭， 其他自动关闭 | () => Promise&lt;boolean&gt; |  |
| afterClose | 关闭后回调 | () => void |  |
| drawer | 抽屉模式 | boolean | false |
| okCancel | 同时显示ok和cancel按钮，false的时候只显示ok按钮 | boolean | true |
| okFirst | ok按钮是否排在第一个 | boolean | true |
| okProps | ok按钮属性 | object |  |
| cancelProps | cancel按钮属性 | object |  |

<style>
.code-box-demo .c7n-pro-btn {
    margin-right: 8px;
}
</style>

### ModalContainer

* 使用Modal前，需要在页面Root内插入ModalContainer。如果路由切换时要清空所有Modal，需要在ModalContiner传入location，如下所示。
* 如要使用react-intl之类的多语言库，请将ModalContainer至于IntlProvider之下。

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
      </div>
    );
  }
}

render(
  <App />
  , mountNode
)

```

### Modal.open

Modal.open()返回一个对象，该对象具有如下方法：

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| close(destroy) | 关闭 | `destroy` - 是否销毁 |
| open() | 打开 |  |
| update(props) | 更新 |  |


### props.modal

Modal会向内部组件注入modal对象，该对象具有如下属性与方法：

| 名称 | 说明 | 参数 |
| --- | --- | --- |
| handleOk(callback) | 注册响应ok按钮的钩子，返回值为false将阻止关闭 | `callback` - 钩子 |
| handleCancel(callback) | 注册响应cancel按钮的钩子，返回值为false将阻止关闭 | `callback` - 钩子 |
| close(destroy) | 关闭 | `destroy` - 是否销毁 |
| update(props) | 更新 |  |
| props | modal的props |  |
