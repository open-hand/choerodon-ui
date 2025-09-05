import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider, configure } from 'choerodon-ui';
import { DataSet, DatePicker, Row, Col } from 'choerodon-ui/pro';

// 使用 configure 全局配置或者 ConfigProvider 局部配置开启日期时间组件的确定按钮
// configure({
//   dateTimePickerOkButton: true,
// });

function handleDataSetChange({ value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value && value.format(),
    '[oldValue]',
    oldValue && oldValue.format(),
  );
}

class App extends React.Component {
  ds = new DataSet({
    fields: [
      { name: 'birth', type: 'dateTime' },
      { name: 'creationTime', type: 'dateTime' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <h4>默认无确定按钮：</h4>
          <DatePicker mode="dateTime" dataSet={this.ds} name="birth" />
        </Col>
        <Col span={12}>
          <h4>配置确定按钮：</h4>
          <ConfigProvider dateTimePickerOkButton>
            <DatePicker mode="dateTime" dataSet={this.ds} name="creationTime" />
          </ConfigProvider>
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
