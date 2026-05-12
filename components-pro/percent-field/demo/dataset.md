---
order: 1
title:
  zh-CN: 数据源
  en-US: DataSet
---

## zh-CN

绑定数据源。

## en-US

DataSet binding.

````jsx
import { DataSet, PercentField, Row, Col } from 'choerodon-ui/pro';
import { configure } from 'choerodon-ui';

configure({
  useZeroFilledDecimal: true,
  inputDecimalSeparatorFollowLang: true,
});

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'age', type: 'percentage', required: true, precision: 3  },
      { name: 'ageRange', type: 'percentage', required: true, precision: 3, range: true  },
      { name: 'ageMultiple', type: 'percentage', required: true, precision: 3, multiple: true,  },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={24} style={{ marginBottom: 10 }}>
          <PercentField dataSet={this.ds} name="age" />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <PercentField dataSet={this.ds} name="ageRange" placeholder="range" />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <PercentField dataSet={this.ds} name="ageMultiple" placeholder="multiple" />
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
