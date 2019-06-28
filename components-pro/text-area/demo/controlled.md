---
order: 1
title:
  zh-CN: 受控输入框
  en-US: Controlled TextArea
---

## zh-CN

受控输入框

## en-US

Controlled TextArea

````jsx
import { TextArea } from 'choerodon-ui/pro';

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
    console.log('[textarea]', e.target.value);
  }

  render() {
    return <TextArea value={this.state.value} onChange={this.handleChange} onInput={this.handleInput} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
