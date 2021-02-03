import React from 'react';
import ReactDOM from 'react-dom';
import { CodeArea, Switch, Row, Col } from 'choerodon-ui/pro';

const style = { height: 60 };

class App extends React.Component {
  state = { readOnly: true, disabled: true };

  handleChange = (value) => {
    this.setState({ readOnly: value });
  };

  handleDisabledChange = (value) => {
    this.setState({ disabled: value });
  };

  render() {
    const { readOnly, disabled } = this.state;
    return (
      <Row gutter={10}>
        <Col span={8}>
          <CodeArea style={style} />
        </Col>
        <Col span={8}>
          <CodeArea readOnly={readOnly} style={style} defaultValue="ReadOnly" />
          <Switch onChange={this.handleChange} checked={readOnly}>
            只读
          </Switch>
        </Col>
        <Col span={8}>
          <CodeArea disabled={disabled} style={style} defaultValue="Disabled" />
          <Switch onChange={this.handleDisabledChange} checked={disabled}>
            禁用
          </Switch>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
