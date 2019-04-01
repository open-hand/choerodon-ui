---
order: 2
title:
  zh-CN: 数据源
  en-US: DataSet
---

## zh-CN

绑定数据源。

## en-US

DataSet binding.

````jsx
import { DataSet, IntlField, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    primaryKey: 'pk',
    data: [{}],
    tlsUrl: '/intl.mock',
    fields: [
      { name: 'first-name', type: 'string', defaultValue: 'Huazhen', required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  ds2 = new DataSet({
    lang: 'en_GB',
    primaryKey: 'pk',
    data: [{}],
    tlsUrl: '/intl.mock',
    fields: [
      { name: 'first-name', type: 'string', required: true },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <IntlField dataSet={this.ds} name="first-name" />
        </Col>
        <Col span={12}>
          <IntlField placeholder="默认英文" dataSet={this.ds2} name="first-name" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
