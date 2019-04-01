---
order: 1
title:
  zh-CN: 受控数字输入框
  en-US: Controlled NumberField
---

## zh-CN

受控数字输入框

## en-US

Controlled NumberField

````jsx
import { NumberField } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 'default',
    };
  }

  handleChange = (value, oldValue) => {
    console.log('[newValue]', value, '[oldValue]', oldValue);
    this.setState({
      value,
    });
  }

  handleInput = (e) => {
    console.log('[input]', e.target.value);
  }

  render() {
    return <NumberField value={this.state.value} onChange={this.handleChange} onInput={this.handleInput} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
