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
import { QuarterPicker, DatePicker, MonthPicker, DateTimePicker, YearPicker, TimePicker, WeekPicker, Row, Col, Button } from 'choerodon-ui/pro';
import moment from 'moment';

function handleChange(value, oldValue) {
  if (value.length) {
    console.log('[datepicker]', value, '[oldValue]', oldValue);
    return;
  }
  console.log('[datepicker]', value && value.format(), '[oldValue]', oldValue && oldValue.format());
}

const renderExtraFooter = ({ choose, type }) => {
  let footerButton = null;
  switch (type) {
    case 'date':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'day').startOf('day'));
          }}
        >
          昨天
        </Button>
      );
      break;
    case 'range-date':
      footerButton = [
        // 聚焦 start 或 end 框后单独赋值
        <Button
          key="0"
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'day').startOf('day'));
          }}
        >
          昨天
        </Button>,
        // start & end 一起赋值
        <Button
          key="1"
          funcType="link"
          onClick={() => {
            choose([moment().subtract(1, 'day').startOf('day'), moment().subtract(0, 'day').startOf('day')]);
          }}
        >
          昨天~今天
        </Button>,
        // 聚焦 start 或 end 框后单独赋值
        <Button
          key="2"
          funcType="link"
          onClick={() => {
            choose(moment().subtract(0, 'day').startOf('day'));
          }}
        >
          今天
        </Button>
      ];
      break;
    case 'month':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'month').startOf('month'));
          }}
        >
          上月
        </Button>
      );
      break;
    case 'year':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'year').startOf('year'));
          }}
        >
          去年
        </Button>
      );
      break;
    case 'dateTime':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'hour').startOf('hour'));
          }}
        >
          上一小时
        </Button>
      );
      break;
      case 'time':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'hour').startOf('hour'));
          }}
        >
          上一小时
        </Button>
      );
      break;
    case 'week':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'week').startOf('week'));
          }}
        >
          上周
        </Button>
      );
      break;
    case 'quarter':
      footerButton = (
        <Button
          funcType="link"
          onClick={() => {
            choose(moment().subtract(1, 'quarter').startOf('quarter'));
          }}
        >
          上季度
        </Button>
      );
      break;
    default:
      break;
  }
  return footerButton;
};
const App = () => {
  return (
    <Row gutter={10}>
      <Col span={12}>
        <DatePicker placeholder="Select date" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'date' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <MonthPicker placeholder="Select month" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'month' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <YearPicker placeholder="Select year" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'year' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <DateTimePicker mode="dateTime" placeholder="Select date time" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'dateTime' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <TimePicker placeholder="Select time" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'time' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <WeekPicker placeholder="Select week" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'week' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <QuarterPicker placeholder="Select quarter" renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'quarter' })} onChange={handleChange} />
      </Col>
      <Col span={12}>
        <DatePicker placeholder="renderExtraFooter top" renderExtraFooter={() => 'extra footer'} extraFooterPlacement="top" />
      </Col>
      <Col span={12}>
        <DatePicker placeholder="Select range date" range renderExtraFooter={({ choose }) => renderExtraFooter({ choose, type: 'range-date' })} onChange={handleChange} />
      </Col>
    </Row>
  );
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
