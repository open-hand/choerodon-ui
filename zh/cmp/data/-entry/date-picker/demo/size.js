import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker, Radio } from 'choerodon-ui';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

class PickerSizesDemo extends React.Component {
  state = {
    size: 'default',
  };

  handleSizeChange = (e) => {
    this.setState({ size: e.target.value });
  };

  render() {
    const { size } = this.state;
    return (
      <div>
        <div style={{ marginBottom: 10 }}>
          <Radio.Group value={size} onChange={this.handleSizeChange}>
            <Radio.Button value="large">Large</Radio.Button>
            <Radio.Button value="default">Default</Radio.Button>
            <Radio.Button value="small">Small</Radio.Button>
          </Radio.Group>
        </div>
        <div style={{ marginBottom: 10 }}>
          <DatePicker size={size} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <MonthPicker size={size} placeholder="Select Month" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <RangePicker size={size} />
        </div>
        <WeekPicker size={size} placeholder="Select Week" />
      </div>
    );
  }
}

ReactDOM.render(<PickerSizesDemo />, document.getElementById('container'));
