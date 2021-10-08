---
order: 3
title:
  zh-CN: 从浮层内关闭
  en-US: Controlling the close of the dialog
---

## zh-CN

使用 `visible` 属性控制浮层显示。

## en-US

Use `visible` prop to control the display of the card.

````jsx
import { Popover, Button } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    visible: false,
  }

  ds = new DataSet({ data: [{ name: 'Hugh' }]})

  hide = () => {
    this.setState({
      visible: false,
    });
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible });
  }

  render() {
    return (
      <Popover
        content={() => <a onClick={this.hide}>{this.ds.current.get('name')}</a>}
        title="Title"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Button type="primary" onClick={() => this.ds.current.set('name', 'Wu')}>Click me</Button>
      </Popover>
    );
  }
}

ReactDOM.render(<App />, mountNode);
````
