---
order: 4
title:
  zh-CN: 受控
  en-US: Under control
---

## zh-CN

通过`hidden`属性控制Tooltip的行为。

设置`hidden`属性后，将不再监听鼠标悬浮等事件，`Tooltip`的显示与否完全取决于`hidden`属性。此特性可用于编程控制错误信息的显示。

## en-US

Control a Tooltip's behavior via setting `hidden` property.

After defining `hidden` property, the `Tooltip` component won't listen to regular events like mouse hover. The visibility of the `Tooltip` depends entirely on the `hidden` property. This feature can be used for displaying error message programatically.

````jsx
import { Tooltip, Button } from 'choerodon-ui/pro';

class Demo extends React.Component {
  state = {
    hidden: true,
  };

  handleOpen = () => {
    this.setState({
      hidden: false,
    });
  }

  handleClose = () => {
    this.setState({
      hidden: true,
    });
  }

  render() {
    return (
      <div>
        <Button onClick={this.handleOpen}>Open</Button>
        <Button onClick={this.handleClose} color="red">Close</Button>
        <Tooltip
          hidden={this.state.hidden}
          title="Prompt Text"
        >
          <span>Under control</span>
        </Tooltip>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, mountNode);
````
