---
order: 1
title:
  zh-CN: 受控货币输入框
  en-US: Controlled Currency
---

## zh-CN

受控货币输入框

## en-US

Controlled Currency

````jsx
import { Currency } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 100,
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  render() {
    return <Currency value={this.state.value} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
