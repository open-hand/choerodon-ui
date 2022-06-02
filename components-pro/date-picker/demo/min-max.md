---
order: 3
title:
  zh-CN: 最大最小值
  en-US: Max and Min
---

## zh-CN

指定最大最小值。

## en-US

Specify Max value and Min value.

```jsx
import {
  DataSet,
  DatePicker,
  MonthPicker,
  YearPicker,
  DateTimePicker,
  Row,
  Col,
} from 'choerodon-ui/pro';
import { ViewMode } from 'choerodon-ui/pro/lib/date-picker/enum';
import moment from 'moment';
import { observer } from 'mobx-react';

function filterDate(currentDate, selected, mode) {
  // currentDate 配合 mode，限制只能选择每周二
  // 选择面板的mode会变化，需要根据mode变化设置是否过滤
  if (mode !== 'date') {
    // 设置日期之外的层级都可以点击，如月、年
    return true;
  }
  const dayInWeek = currentDate.get('d');
  return dayInWeek === 2;
}

function filterTime(currentDate, selected, mode) {
  if (mode === 'time') {
    // currentDate 配合 mode
    // 限制只能选择每天的8点以后
    return currentDate.get('hour') >= 8;
  }
  return true;
}

const minDisabledDate = (ds) => {
  return (moment) => {
    const end = ds.current.get('endFilter')
    return end && moment.isAfter(end);
  }
}
const maxDisabledDate = (ds) => {
  return (moment) => {
    const start = ds.current.get('startFilter')
    return start && moment.isBefore(start);
  }
}
const minMaxFilter = (disabledDate) => {
  return (current, _selected, viewMode) => {
    if (disabledDate && viewMode !== ViewMode.time) {
      const start = current.clone();
      const end = current.clone();
      switch (viewMode) {
        case ViewMode.decade:
          return !disabledDate(
            end
              .endOf('y')
              .add(9 - (end.year() % 10), 'y')
              .endOf('d'),
          ) || !disabledDate(
            start
              .startOf('y')
              .subtract(start.year() % 10, 'y')
              .startOf('d'),
          );
        case ViewMode.month:
          return !disabledDate(end.endOf('M')) || !disabledDate(start.startOf('M'));
        case ViewMode.year:
          return !disabledDate(end.endOf('y')) || !disabledDate(start.startOf('y'));
        case ViewMode.dateTime:
          return !disabledDate(end.endOf('d')) || !disabledDate(start.startOf('d'));
        default:
          return !disabledDate(end);
      }
    }
    return true;
  }
}

@observer
class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'startDate',
        type: 'date',
        max: 'endDate',
      },
      {
        name: 'endDate',
        type: 'date',
        min: 'startDate',
      },
      { name: 'startFilter', type: 'date' },
      { name: 'endFilter', type: 'date' },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="startDate" placeholder="start date"/>
        </Col>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="endDate" placeholder="end date"/>
        </Col>
        <Col span={12}>
          <DatePicker min={moment()} filter={filterDate} placeholder="Moment min & filter"/>
        </Col>
        <Col span={12}>
          <MonthPicker min={new Date()} placeholder="Date min"/>
        </Col>
        <Col span={12}>
          <YearPicker max="2021-12-10" placeholder="string max"/>
        </Col>
        <Col span={12}>
          <DateTimePicker filter={filterTime} placeholder="Select date time" />
        </Col>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="startFilter" filter={minMaxFilter(minDisabledDate(this.ds))} placeholder="min by filter"/>
        </Col>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="endFilter" filter={minMaxFilter(maxDisabledDate(this.ds))} placeholder="max by filter"/>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App/>, mountNode);
```
