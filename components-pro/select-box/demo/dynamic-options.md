---
order: 0
title:
  zh-CN: 动态选项
  en-US: Dynamic Options
---

## zh-CN

动态生成选项

## en-US

Generate options dynamicly.

````jsx
import { SelectBox, Button, Row, Col } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    options: [],
  };

  handleClick = () => this.setState(prevState => ({
    ...prevState,
    options: [...prevState.options, new Date()],
  }));

  render() {
    return (
      <Row>
        <Col span={4}>
          <Button onClick={this.handleClick}>修改选项</Button>
        </Col>
        <Col span={12}>
          <SelectBox>
            {this.state.options.map((option, index) => <Option value={option.toLocaleString()} key={index}>{option.toLocaleString()}</Option>)}
          </SelectBox>
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
