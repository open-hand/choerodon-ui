import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Currency, Row, Col } from 'choerodon-ui/pro';
import { configure, Divider } from 'choerodon-ui';

configure({
  // 开启补零显示，不影响真实值
  useZeroFilledDecimal: true,
});

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'money', type: 'number', defaultValue: 123.123, currency: 'CNY' },
      {
        name: 'moneyPrecision',
        type: 'number',
        defaultValue: 123.123,
        currency: 'CNY',
        precision: 2,
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
          precision 未设置：显示时根据设置的 currency 和 lang
          决定显示位数，人民币显示 2 位小数，输入时是真实值
        </Divider>
        <Col span={24}>
          <Currency dataSet={this.ds} name="money" />
        </Col>
        <Divider orientation="left">
          precision: 3, 显示和输入时根据设置的 precision
          显示小数位数，真实值不受影响
        </Divider>
        <Col span={24}>
          <Currency dataSet={this.ds} name="moneyPrecision" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
