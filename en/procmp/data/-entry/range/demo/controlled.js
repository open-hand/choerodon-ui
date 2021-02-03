import React from 'react';
import ReactDOM from 'react-dom';

import { Range, TextField, Row, Col } from 'choerodon-ui/pro';

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
  };

  render() {
    return (
      <Row>
        <Col span={4}>
          <TextField value={this.state.value} />
        </Col>
        <Col span={20}>
          <Range
            onChange={this.handleChange}
            value={this.state.value}
            name="range"
            min={10}
            max={50}
            step={1}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
