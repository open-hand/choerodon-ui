import React from 'react';
import ReactDOM from 'react-dom';
import {
  DataSet,
  DatePicker,
  DateTimePicker,
  TimePicker,
  Row,
  Col,
} from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import moment from 'moment';

function handleDataSetChange({ value, oldValue }) {
  console.log('[range dataset newValue]', value, '[oldValue]', oldValue);
}

function handleChange(value, oldValue) {
  console.log('[range newValue]', value, '[oldValue]', oldValue);
}

function rangeValidator(value, name) {
  console.log(`[validation ${name} value]`, value);
  return true;
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'date',
        type: 'date',
        range: ['start', 'end'],
        defaultValue: { start: '1984-11-22', end: new Date() },
        required: true,
        validator: rangeValidator,
      },
      {
        name: 'date2',
        type: 'date',
        range: true,
        required: true,
        validator: rangeValidator,
      },
      {
        name: 'multipleDate',
        type: 'date',
        range: true,
        multiple: true,
        required: true,
      },
      {
        name: 'time',
        type: 'time',
        range: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Divider orientation="left">
          绑定数据源，editorInPopup & isFlat：
        </Divider>
        <Col style={{ marginBottom: 10 }} span={24}>
          <DateTimePicker
            dataSet={this.ds}
            name="date"
            editorInPopup
            isFlat
            defaultTime={[
              moment('00:00:00', 'HH:mm:ss'),
              moment('23:59:59', 'HH:mm:ss'),
            ]}
          />
        </Col>
        <Divider orientation="left">绑定数据源，日期范围选择：</Divider>
        <Col style={{ marginBottom: 10 }} span={24}>
          <DatePicker
            dataSet={this.ds}
            name="date2"
            placeholder={['Start Date', 'End Date']}
          />
        </Col>
        <Divider orientation="left">组件使用，disabled 状态：</Divider>
        <Col style={{ marginBottom: 10 }} span={24}>
          <DatePicker
            range
            disabled
            defaultValue={['1986-11-22', new Date()]}
            placeholder={['Start Date', 'End Date']}
            onChange={handleChange}
          />
        </Col>
        <Divider orientation="left">
          组件使用，range 配置 ['start', 'end']：
        </Divider>
        <Col style={{ marginBottom: 10 }} span={24}>
          <DatePicker
            range={['start', 'end']}
            defaultValue={{ start: '1987-11-22', end: new Date() }}
            placeholder={['Start Date', 'End Date']}
            onChange={handleChange}
          />
        </Col>
        <Divider orientation="left">绑定数据源，时间范围选择：</Divider>
        <Col style={{ marginBottom: 10 }} span={24}>
          <TimePicker dataSet={this.ds} name="time" placeholder="Choose Time" />
        </Col>
        <Divider orientation="left">绑定数据源，多选日期范围选择：</Divider>
        <Col style={{ marginBottom: 10 }} span={24}>
          <DatePicker
            dataSet={this.ds}
            name="multipleDate"
            placeholder="Choose Date"
          />
        </Col>
        <Divider orientation="left">range 模式，弹窗组合显示：</Divider>
        <Col span={24}>
          <DatePicker
            range
            placeholder={['date', 'comboRangeMode']}
            onChange={handleChange}
            mode="date"
            comboRangeMode
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
