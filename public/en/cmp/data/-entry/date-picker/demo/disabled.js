import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';
ReactDOM.render(
  <div>
    <DatePicker defaultValue={moment('2015-06-06', dateFormat)} disabled />
    <br />
    <MonthPicker defaultValue={moment('2015-06', 'YYYY-MM')} disabled />
    <br />
    <RangePicker
      defaultValue={[moment('2015-06-06', dateFormat), moment('2015-06-06', dateFormat)]}
      disabled
    />
  </div>,
  document.getElementById('container'),
);
