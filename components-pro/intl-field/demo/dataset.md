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

```jsx
import { DataSet, IntlField, Row, Col } from 'choerodon-ui/pro';

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
    primaryKey: 'pk',
    data: [{ 'first-name': '吴' }],
    tlsUrl: '/dataset/user/languages',
    fields: [
      {
        name: 'first-name',
        type: 'intl',
        defaultValue: 'Huazhen',
        required: true,
      },
      {
        name: 'last-name',
        type: 'intl',
        maxLength: 5,
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  ds2 = new DataSet({
    lang: 'en_GB',
    primaryKey: 'pk',
    data: [{}],
    tlsUrl: '/dataset/user/languages',
    fields: [
      {
        name: 'first-name',
        type: 'intl',
                maxLength: 5,
        required: true,
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <IntlField dataSet={this.ds} name="first-name" fieldType="textarea" rows={4} cols={80} resize='both' />
        </Col>
        <Col span={8}>
          <IntlField maxLengths={{ en_GB: 6, en_US: 10 }}  placeholder="默认英文" dataSet={this.ds2} name="first-name" />
        </Col>
        <Col span={8}>
          <IntlField placeholder="限制输入长度" dataSet={this.ds} name="last-name" maxLengths={{ zh_CN: 6, en_US: 10 }} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
