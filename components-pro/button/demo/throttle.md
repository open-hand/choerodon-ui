---
order: 7
title:
  zh-CN: 按钮节流
  en-US: throttle
---

## zh-CN

按钮点击节流。


## en-US

Button click throttle.


````jsx
import { Button } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    num: 0,
  };

  handleClick = () => {
    this.setState({
      num: this.state.num + 1,
    });
  }

  render() {
    return [
      <Button key="throttle" onClick={this.handleClick} wait={1000} waitType="throttle">节流按钮{this.state.num}</Button>,
      <Button key="debounce" onClick={this.handleClick} wait={1000} waitType="debounce">去抖按钮{this.state.num}</Button>,
    ];
  }
}

ReactDOM.render(
  <App />,
  mountNode);

````
