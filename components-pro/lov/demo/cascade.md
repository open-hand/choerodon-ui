---
order: 2
title:
  zh-CN: LOV级联
  en-US: LOV Cascade
---

## zh-CN

LOV 级联。

## en-US

LOV Cascade

```jsx
import { DataSet, Lov, Select, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    '[record.toJSONData()]',
    record.toJSONData(),
  );
}

class App extends React.Component {
  ds = new DataSet({
    fields: [
      {
        name: 'mySex',
        type: 'string',
        label: '性别',
        lookupCode: 'HR.EMPLOYEE_GENDER',
      },
      {
        name: 'code',
        type: 'object',
        label: 'LOV',
        lovCode: 'LOV_CODE',
        computedProps: {
          lovPara: ({ record }) => ({
            companyId: record.get('mySex'),
          }),
        },
        cascadeMap: { sex: 'mySex' },
      },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <Select dataSet={this.ds} name="mySex" />
        </Col>
        <Col span={12}>
          <Lov dataSet={this.ds} name="code" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
