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

function filterRangeDate(currentDate, selected, mode, rangeTarget, rangeValue) {
  // range模式过滤
  // 限制：开始日期小于等于结束日期，结束日期大于等于开始日期
  if (!currentDate) return true;
  const [startValue, endValue] = Array.isArray(rangeValue) ? rangeValue : [];
  if (rangeTarget === 0 && endValue) {
    if (mode === 'decade' || mode === 'year') {
      return currentDate.year() <= endValue.year();
    } else if (mode === 'month') {
      return currentDate.year() < endValue.year() ||
        (currentDate.year() === endValue.year() && currentDate.month() <= endValue.month());
    }
    return currentDate.isBefore(endValue) || currentDate.isSame(endValue);
  }
  if (rangeTarget === 1 && startValue) {
    if (mode === 'decade') {
      return currentDate.year() + 9 >= startValue.year();
    } else if (mode === 'year') {
      return currentDate.year() >= startValue.year();
    } else if (mode === 'month') {
      return currentDate.year() > startValue.year() ||
        (currentDate.year() === startValue.year() && currentDate.month() >= startValue.month());
    }
    return currentDate.isAfter(startValue) || currentDate.isSame(startValue);
  }
  return true;
}

@observer
class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'startDate',
        type: 'dateTime',
        max: 'endDate',
      },
      {
        name: 'endDate',
        type: 'dateTime',
        min: 'startDate',
      },
      { name: 'startFilter', type: 'date' },
      { name: 'endFilter', type: 'date' },
      {
        name: 'date2',
        type: 'date',
        range: true,
      },
    ],
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <DateTimePicker dataSet={this.ds} name="startDate" placeholder="start date" defaultTime={moment('00:00:10', 'HH:mm:ss')} />
        </Col>
        <Col span={12}>
          <DateTimePicker dataSet={this.ds} name="endDate" placeholder="end date" defaultTime={moment('23:59:59', 'HH:mm:ss')} />
        </Col>
        <Col span={12}>
          <DatePicker min={moment()} filter={filterDate} placeholder="Moment min & filter" />
        </Col>
        <Col span={12}>
          <MonthPicker min={new Date()} placeholder="Date min" />
        </Col>
        <Col span={12}>
          <YearPicker max="2021-12-10" placeholder="string max" />
        </Col>
        <Col span={12}>
          <DateTimePicker filter={filterTime} placeholder="Select date time" />
        </Col>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="startFilter" filter={minMaxFilter(minDisabledDate(this.ds))} placeholder="min by filter" />
        </Col>
        <Col span={12}>
          <DatePicker dataSet={this.ds} name="endFilter" filter={minMaxFilter(maxDisabledDate(this.ds))} placeholder="max by filter" />
        </Col>
        <Col span={24}>
          <DatePicker dataSet={this.ds} name="date2" placeholder={['Start Date', 'End Date']}  filter={filterRangeDate} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
