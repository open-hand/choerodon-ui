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
| header | 标题 | ReactNode |  |
| closable | 显示右上角关闭按钮 | boolean | true |
| movable | 可移动 | boolean | true |
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

<style>
.code-box-demo .c7n-pro-btn {
    margin-right: 8px;
}
</style>

### ModalContainer

使用Modal前，需要在页面Root内插入ModalContainer。如果路由切换时要清空所有Modal，需要在ModalContiner传入location，如下所示。

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
