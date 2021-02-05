---
order: 1
title:
  zh-CN: 受控输入框
  en-US: Controlled TextField
---

## zh-CN

受控输入框

## en-US

Controlled TextField

````jsx
import { TextField, Row, Col } from 'choerodon-ui/pro';

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
    return (
      <Row gutter={10}>
        <Col span={8}>
          <TextField value={this.state.value} onChange={this.handleChange} onInput={this.handleInput} />
        </Col>
        <Col span={8}>
          <TextField value={this.state.value} onChange={this.handleChange} onInput={this.handleInput} valueChangeAction="input" wait={300} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
