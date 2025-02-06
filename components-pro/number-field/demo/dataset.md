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
import { DataSet, NumberField, Row, Col } from 'choerodon-ui/pro';
import { configure } from 'choerodon-ui';

configure({
  useZeroFilledDecimal: true,
});

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'age', type: 'number', step: 1, required: true, precision: 3  },
      { name: 'ageRange', type: 'number', step: 1, required: true, precision: 3, range: true  },
      { name: 'ageMultiple', type: 'number', step: 1, required: true, precision: 3, multiple: true,  },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField prefix={'PX'} dataSet={this.ds} name="age" />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField prefix={'PX'} dataSet={this.ds} name="ageRange" placeholer="range" />
        </Col>
        <Col span={24} style={{ marginBottom: 10 }}>
          <NumberField prefix={'PX'} dataSet={this.ds} name="ageMultiple" placeholer="multiple" />
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
