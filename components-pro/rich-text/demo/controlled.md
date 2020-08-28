---
order: 2
title:
  zh-CN: 受控
  en-US: Controlled
---

## zh-CN

受控。

## en-US

Controlled.

````jsx
import { RichText } from 'choerodon-ui/pro';

const style = { height: 200 };

class App extends React.Component {
  state = {
    value: [{insert: "Controlled Value"}],
    // string 类型值会被转为 Delta 对象
    // value: "Controlled Value",
  }

  handleChange = (value, oldValue) => {
    console.log('handleChange', value, oldValue)
    this.setState({ value: value });
  }

  render() {
    return <RichText value={this.state.value} style={style} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
