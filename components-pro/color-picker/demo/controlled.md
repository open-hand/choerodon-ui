---
order: 1
title:
  zh-CN: 受控颜色输入框
  en-US: Controlled ColorPicker
---

## zh-CN

受控输入框

## en-US

Controlled ColorPicker

````jsx
import { ColorPicker } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '#0000ff',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    return <ColorPicker value={this.state.value} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
