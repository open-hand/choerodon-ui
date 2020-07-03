import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker } from 'choerodon-ui';

const { RangePicker } = DatePicker;

ReactDOM.render(
  <div>
    <DatePicker
      dateRender={current => {
        const style = {};
        if (current.date() === 1) {
          style.border = '1px solid #1890ff';
          style.borderRadius = '50%';
        }
        return (
          <div className="c7n-calendar-date" style={style}>
            {current.date()}
          </div>
        );
      }}
    />
    <RangePicker
      dateRender={current => {
        const style = {};
        if (current.date() === 1) {
          style.border = '1px solid #1890ff';
          style.borderRadius = '50%';
        }
        return (
          <div className="c7n-calendar-date" style={style}>
            {current.date()}
          </div>
        );
      }}
    />
  </div>,
  document.getElementById('container'),
);
