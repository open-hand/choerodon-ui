import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';

const { RangePicker, MonthPicker } = DatePicker;

ReactDOM.render(
  <div>
    <div style={{ marginBottom: 10 }}>
      <DatePicker renderExtraFooter={() => 'extra footer'} />
    </div>
    <div style={{ marginBottom: 10 }}>
      <DatePicker renderExtraFooter={() => 'extra footer'} showTime />
    </div>
    <div style={{ marginBottom: 10 }}>
      <RangePicker renderExtraFooter={() => 'extra footer'} />
    </div>
    <div style={{ marginBottom: 10 }}>
      <RangePicker renderExtraFooter={() => 'extra footer'} showTime />
    </div>
    <MonthPicker
      renderExtraFooter={() => 'extra footer'}
      placeholder="Select month"
    />
  </div>,
  document.getElementById('container'),
);
