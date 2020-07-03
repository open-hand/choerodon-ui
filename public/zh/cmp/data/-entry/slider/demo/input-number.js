import React from 'react';
import ReactDOM from 'react-dom';
import { Slider, InputNumber, Row, Col } from 'choerodon-ui';

class IntegerStep extends React.Component {
  state = {
    inputValue: 1,
  }

  onChange = (value) => {
    this.setState({
      inputValue: value,
    });
  }

  render() {
    return (
      <Row>
        <Col span={12}>
          <Slider min={1} max={20} onChange={this.onChange} value={this.state.inputValue} />
        </Col>
        <Col span={4}>
          <InputNumber
            min={1}
            max={20}
            style={{ marginLeft: 16 }}
            value={this.state.inputValue}
            onChange={this.onChange}
          />
        </Col>
      </Row>
    );
  }
}

class DecimalStep extends React.Component {
  state = {
    inputValue: 0,
  }

  onChange = (value) => {
    this.setState({
      inputValue: value,
    });
  }

  render() {
    return (
      <Row>
        <Col span={12}>
          <Slider min={0} max={1} onChange={this.onChange} value={this.state.inputValue} step={0.01} />
        </Col>
        <Col span={4}>
          <InputNumber
            min={0}
            max={1}
            style={{ marginLeft: 16 }}
            step={0.01}
            value={this.state.inputValue}
            onChange={this.onChange}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <div>
    <IntegerStep />
    <DecimalStep />
  </div>,
  document.getElementById('container'));
