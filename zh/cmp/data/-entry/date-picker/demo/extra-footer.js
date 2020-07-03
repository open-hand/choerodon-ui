import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';

const { RangePicker, MonthPicker } = DatePicker;

ReactDOM.render(
  <div>
    <DatePicker renderExtraFooter={() => 'extra footer'} />
    <DatePicker renderExtraFooter={() => 'extra footer'} showTime />
    <RangePicker renderExtraFooter={() => 'extra footer'} />
    <RangePicker renderExtraFooter={() => 'extra footer'} showTime />
    <MonthPicker renderExtraFooter={() => 'extra footer'} placeholder="Select month" />
  </div>,
  document.getElementById('container'),
);
