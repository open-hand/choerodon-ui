import React from 'react';
import ReactDOM from 'react-dom';
import { SelectBox, Button, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[basic new]', value, '[basic old]', oldValue);
}

const { Option } = SelectBox;

class App extends React.Component {
  state = {
    visible: true,
  };

  handleClick = () => this.setState({ visible: !this.state.visible });

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <SelectBox onChange={handleChange}>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            {this.state.visible && (
              <Option value="wu" disabled>
                Wu
              </Option>
            )}
          </SelectBox>
        </Col>
        <Col span={4}>
          <Button onClick={this.handleClick}>修改选项</Button>
        </Col>
        <Col span={12}>
          <SelectBox disabled>
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
            <Option value="wu">Wu</Option>
          </SelectBox>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
