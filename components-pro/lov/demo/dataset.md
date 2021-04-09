---
order: 0
title:
  zh-CN: 数据源
  en-US: DataSet
---

## zh-CN

绑定数据源。

## en-US

DataSet binding.

```jsx
import { DataSet, Lov, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

function handleUserDSLoad({ dataSet }) {
  console.log(dataSet, 'handleUserDSLoad')
  const first = dataSet.get(0);
  if (first) {
    first.selectable = false;
  }
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'code',
        textField: 'code',
        type: 'object',
        lovCode: 'LOV_CODE',
        lovPara: { code: '111' },
        required: true,
        optionsProps: { events: { load: handleUserDSLoad } },
      },
      {
        name: 'code_string',
        type: 'object',
        lovCode: 'LOV_CODE',
        required: true,
      },
      { name: 'code_code', type: 'string', bind: 'code.code' },
      { name: 'code_description', type: 'string', bind: 'code.description' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <Lov
             dataSet={this.ds}
             searchAction="blur"
             name="code"
             noCache
             tableProps={{ 
               selectionMode: 'rowbox',
               onRow:({ dataSet, record, index, expandedRow }) => {
                  if (index === 2) {
                    return {
                      style: { height: 50 },
                    };
                  }
                } }}
          />
        </Col>
        <Col span={12}>
          <Lov dataSet={this.ds} name="code_string" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
