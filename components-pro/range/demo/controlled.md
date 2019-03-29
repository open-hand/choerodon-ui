---
order: 1
title:
  zh-CN: 受控
  en-US: Controlled
---

## zh-CN

受控。

## en-US

Controlled

````jsx

import { Range, TextField } from 'choerodon-ui/pro';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 30,
    };
  }

  handleChange = (value) => {
    this.setState({
      value,
    });
  }

  render() {
    return (
      <div>
        <Range onChange={this.handleChange} value={this.state.value} name="range" min={10} max={50} step={1} />
        <TextField style={{ margin: '0.2rem 0 0 0' }} value={this.state.value} />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);

````

