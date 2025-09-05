import React from 'react';
import ReactDOM from 'react-dom';
import {
  QuarterPicker,
  DatePicker,
  MonthPicker,
  DateTimePicker,
  YearPicker,
  TimePicker,
  WeekPicker,
  Row,
  Col,
} from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log(
    '[datepicker]',
    value && value.format(),
    '[oldValue]',
    oldValue && oldValue.format(),
  );
}

ReactDOM.render(
  <Row gutter={10}>
    <Col style={{ marginBottom: 10 }} span={12}>
      <DatePicker placeholder="Select date" onChange={handleChange} />
    </Col>
    <Col style={{ marginBottom: 10 }} span={12}>
      <MonthPicker placeholder="Select month" onChange={handleChange} />
    </Col>
    <Col style={{ marginBottom: 10 }} span={12}>
      <YearPicker placeholder="Select year" onChange={handleChange} />
    </Col>
    <Col style={{ marginBottom: 10 }} span={12}>
      <DateTimePicker
        mode="dateTime"
        placeholder="Select date time"
        onChange={handleChange}
      />
    </Col>
    <Col style={{ marginBottom: 10 }} span={12}>
      <TimePicker placeholder="Select time" onChange={handleChange} />
    </Col>
    <Col style={{ marginBottom: 10 }} span={12}>
      <WeekPicker placeholder="Select week" onChange={handleChange} />
    </Col>
    <Col style={{ marginBottom: 10 }} span={12}>
      <DatePicker placeholder="禁用" disabled />
    </Col>
    <Col span={12}>
      <QuarterPicker placeholder="Select quarter" onChange={handleChange} />
    </Col>
  </Row>,
  document.getElementById('container'),
);
