---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

下拉选择器。
## en-US

Select

```jsx
import { Select, Tooltip, Row, Col } from 'choerodon-ui/pro';

const { Option } = Select;

class App extends React.Component {
  state = {
    visible: true,
  };

  handleClick = () => this.setState({ visible: !this.state.visible });

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <Tooltip title='111'>
            <Select onClick={(e)=>{console.log('click',e);debugger}} multiple >
              <Option value="A">A</Option>
              <Option value="B">B</Option>
            </Select>
            </Tooltip>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
