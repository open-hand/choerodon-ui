import React from 'react';
import ReactDOM from 'react-dom';
import { DatePicker, Row, Col } from 'choerodon-ui';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

function onChange(date, dateString) {
  console.log(date, dateString);
}

ReactDOM.render(
  <div>
    <Row>
      <Col span={12}>
        <h3>DatePicker</h3>
        <DatePicker
          style={{ margin: '5 0' }}
          onChange={onChange}
          label="日期框"
        />
      </Col>
      <Col span={12}>
        <h3>MonthPicker</h3>
        <MonthPicker onChange={onChange} placeholder="Select month" />
      </Col>
    </Row>

    <Row>
      <Col span={12}>
        <h3>RangePicker</h3>
        <RangePicker onChange={onChange} label="日期范围" />
      </Col>
      <Col span={12}>
        <h3>WeekPicker</h3>
        <WeekPicker
          onChange={onChange}
          placeholder="Select week"
          label="选择周"
        />
      </Col>
    </Row>
  </div>,
  document.getElementById('container'),
);
