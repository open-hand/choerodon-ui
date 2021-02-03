import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';
import moment from 'moment';

const { MonthPicker, RangePicker } = DatePicker;

const dateFormat = 'YYYY/MM/DD';
const monthFormat = 'YYYY/MM';
ReactDOM.render(
  <div>
    <div style={{ marginBottom: 10 }}>
      <DatePicker
        defaultValue={moment('2015/01/01', dateFormat)}
        format={dateFormat}
      />
    </div>
    <div style={{ marginBottom: 10 }}>
      <MonthPicker
        defaultValue={moment('2015/01', monthFormat)}
        format={monthFormat}
      />
    </div>
    <RangePicker
      defaultValue={[
        moment('2015/01/01', dateFormat),
        moment('2015/01/01', dateFormat),
      ]}
      format={dateFormat}
    />
  </div>,
  document.getElementById('container'),
);
