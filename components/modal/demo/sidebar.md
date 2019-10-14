---
order: 9
title:
  zh-CN: 侧边弹出
  en-US: Sidebar
---

## zh-CN

侧边弹出。

## en-US

Sidebar.

```jsx
import { Modal, Button } from 'choerodon-ui';

const { Sidebar } = Modal;

class App extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Open
        </Button>
        <Sidebar
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          cancelText="取消"
          okText="确定"
          width={400}
          closable
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Sidebar>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```

<style>
.c7n-modal p {
  margin: 0;
}
</style>
