---
order: 9
title:
  zh-CN: 额外的页脚
  en-US: Extra Footer
---

## zh-CN

额外的页脚

## en-US

Extra Footer

````jsx
import { QuarterPicker, DatePicker, MonthPicker, DateTimePicker, YearPicker, TimePicker, WeekPicker, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[datepicker]', value && value.format(), '[oldValue]', oldValue && oldValue.format());
}

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <DatePicker placeholder="Select date" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
    <Col span={12}>
      <MonthPicker placeholder="Select month" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
    <Col span={12}>
      <YearPicker placeholder="Select year" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
    <Col span={12}>
      <DateTimePicker mode="dateTime" placeholder="Select date time" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
    <Col span={12}>
      <TimePicker placeholder="Select time" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
    <Col span={12}>
      <WeekPicker placeholder="Select week" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
    <Col span={12}>
      <DatePicker placeholder="renderExtraFooter top" renderExtraFooter={() => 'extra footer'} extraFooterPlacement="top" />
    </Col>
    <Col span={12}>
      <QuarterPicker placeholder="Select quarter" renderExtraFooter={() => 'extra footer'} onChange={handleChange} />
    </Col>
  </Row>,
  mountNode,
);
````
