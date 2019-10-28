---
order: 7
title:
  zh-CN: 按钮节流
  en-US: throttle
---

## zh-CN

按钮点击节流。该类型按钮事件无法冒泡。

## en-US

Button click throttle. This type of Button event cannot bubble.

```jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    num: 0,
  };

  handleClick = e => {
    e.stopPropagation();
    this.setState({
      num: this.state.num + 1,
    });
  };

  handleBubbleClick = () => {
    console.log('bubble click');
  };

  render() {
    return (
      <div onClick={this.handleBubbleClick}>
        <Button onClick={this.handleClick} wait={1000} waitType="throttle">
          节流按钮{this.state.num}
        </Button>
        <Button onClick={this.handleClick} wait={1000} waitType="debounce">
          去抖按钮{this.state.num}
        </Button>
      </div>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
