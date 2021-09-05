import React from 'react';
import ReactDOM from 'react-dom';
import { Rate, Form, DataSet, Button, Radio } from 'choerodon-ui/pro';

class App extends React.Component {
  state = {
    labelLayout: 'horizontal',
  };

  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'rate', label: '评分测试', type: 'number', required: true },
    ],
  });

  changeLayout = (value) => {
    this.setState({ labelLayout: value });
  };

  render() {
    return (
      <>
        <div>
          <Radio
            name="labelLayout"
            value="horizontal"
            onChange={this.changeLayout}
            defaultChecked
          >
            horizontal
          </Radio>
          <Radio
            name="labelLayout"
            value="placeholder"
            onChange={this.changeLayout}
          >
            placeholder
          </Radio>
          <Radio name="labelLayout" value="float" onChange={this.changeLayout}>
            float
          </Radio>
          <Radio
            name="labelLayout"
            value="vertical"
            onChange={this.changeLayout}
          >
            vertical
          </Radio>
          <Radio name="labelLayout" value="none" onChange={this.changeLayout}>
            none
          </Radio>
        </div>
        <Form dataSet={this.ds} labelLayout={this.state.labelLayout}>
          <Rate name="rate" help="help" allowHalf allowClear />
          <div>
            <Button onClick={() => this.ds.validate()}>validate</Button>
          </div>
        </Form>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
