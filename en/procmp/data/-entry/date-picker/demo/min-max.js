import React from 'react';
import ReactDOM from 'react-dom';
import { Divider } from 'choerodon-ui';
import {
  DataSet,
  DatePicker,
  MonthPicker,
  YearPicker,
  DateTimePicker,
  Row,
  Col,
} from 'choerodon-ui/pro';
import moment from 'moment';

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

function filterRangeDate(currentDate, selected, mode, rangeTarget, rangeValue) {
  // range模式过滤
  // 限制：开始日期小于等于结束日期，结束日期大于等于开始日期
  if (!currentDate) return true;
  const [startValue, endValue] = Array.isArray(rangeValue) ? rangeValue : [];
  if (rangeTarget === 0 && endValue) {
    if (mode === 'decade' || mode === 'year') {
      return currentDate.year() <= endValue.year();
    } else if (mode === 'month') {
      return (
        currentDate.year() < endValue.year() ||
        (currentDate.year() === endValue.year() &&
          currentDate.month() <= endValue.month())
      );
    }
    return currentDate.isBefore(endValue) || currentDate.isSame(endValue);
  }
  if (rangeTarget === 1 && startValue) {
    if (mode === 'decade') {
      return currentDate.year() + 9 >= startValue.year();
    } else if (mode === 'year') {
      return currentDate.year() >= startValue.year();
    } else if (mode === 'month') {
      return (
        currentDate.year() > startValue.year() ||
        (currentDate.year() === startValue.year() &&
          currentDate.month() >= startValue.month())
      );
    }
    return currentDate.isAfter(startValue) || currentDate.isSame(startValue);
  }
  return true;
}

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
        <Divider orientation="left">字段 max/min 限制日期选择</Divider>
        <Col style={{ marginBottom: 10 }} span={12}>
          <DatePicker
            dataSet={this.ds}
            name="startDate"
            placeholder="start date"
          />
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <DatePicker dataSet={this.ds} name="endDate" placeholder="end date" />
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">
            currentDate 配合 mode，限制只能选择每周二
          </Divider>
          <DatePicker
            min={moment()}
            filter={filterDate}
            placeholder="Moment min & filter"
          />
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">限制月份选择不小于当前日期</Divider>
          <MonthPicker min={new Date()} placeholder="Date min" />
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">限制年份选择不小于 2021-12-10</Divider>
          <YearPicker max="2021-12-10" placeholder="string max" />
        </Col>
        <Col style={{ marginBottom: 10 }} span={12}>
          <Divider orientation="left">限制只能选择每天的8点以后：</Divider>
          <DateTimePicker filter={filterTime} placeholder="Select date time" />
        </Col>
        <Col span={24}>
          <Divider orientation="left">
            range
            模式过滤，限制开始日期小于等于结束日期，结束日期大于等于开始日期：
          </Divider>
          <DatePicker
            dataSet={this.ds}
            name="date2"
            placeholder={['Start Date', 'End Date']}
            filter={filterRangeDate}
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
