import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';

const { RangePicker } = DatePicker;

function onChange(value, dateString) {
  console.log('Selected Time: ', value);
  console.log('Formatted Selected Time: ', dateString);
}

function onOk(value) {
  console.log('onOk: ', value);
}

ReactDOM.render(
  <div>
    <div style={{ marginBottom: 10 }}>
      <DatePicker
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="Select Time"
        onChange={onChange}
        onOk={onOk}
      />
    </div>
    <RangePicker
      showTime={{ format: 'HH:mm' }}
      format="YYYY-MM-DD HH:mm"
      placeholder={['Start Time', 'End Time']}
      onChange={onChange}
      onOk={onOk}
    />
  </div>,
  document.getElementById('container'),
);
