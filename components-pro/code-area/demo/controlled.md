---
order: 1
title:
  zh-CN: 受控代码框
  en-US: Controlled Code Area
iframe: 150
across: true
---

## zh-CN

受控代码框。

## en-US

Controlled Code Area.

````jsx
import { CodeArea } from 'choerodon-ui/pro';

const style = { height: 30 };

class App extends React.Component {
  state = {
    value: 'Controlled Value',
  }

  handleChange = (value) => {
    this.setState({ value });
  }

  render() {
    return <CodeArea value={this.state.value} style={style} onChange={this.handleChange} />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
