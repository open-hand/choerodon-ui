import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';
ReactDOM.render(
  <div>
    <div style={{ marginBottom: 10 }}>
      <DatePicker defaultValue={moment('2015-06-06', dateFormat)} disabled />
    </div>
    <div style={{ marginBottom: 10 }}>
      <MonthPicker defaultValue={moment('2015-06', 'YYYY-MM')} disabled />
    </div>
    <div style={{ marginBottom: 10 }}>
      <RangePicker
        defaultValue={[
          moment('2015-06-06', dateFormat),
          moment('2015-06-06', dateFormat),
        ]}
        disabled
      />
    </div>
  </div>,
  document.getElementById('container'),
);
