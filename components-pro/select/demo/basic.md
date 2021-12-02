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
import { Select, Button, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { Option } = Select;

class App extends React.Component {
  state = {
    visible: true,
  };

  handleClick = () => this.setState({ visible: !this.state.visible });

  render() {
    const { visible } = this.state;
    return (
      <Row gutter={10}>
        <Col span={8}>
          <Select placeholder="请选择" dropdownMatchSelectWidth={false} onChange={handleChange} optionTooltip={visible ? 'overflow' : 'always'}>
            <Option value="jack"><em>Jack</em> </Option>
            {
              visible && (
                <>
                  <Option value="lucy" disabled><b style={{ color: '#08c' }}>Lucy</b></Option>
                  <Option value="wu">
                    Wu Wu Wu Wu Wu Wu Wu Wu Wu Wu Wu
                  </Option>
                </>
              )
            }
          </Select>
        </Col>
        <Col span={4}>
          <Button onClick={this.handleClick}>修改选项</Button>
        </Col>
        <Col span={12}>
          <Select placeholder="请选择" disabled optionTooltip="overflow">
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy Lucy</Option>
            <Option value="wu">Wu</Option>
          </Select>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
