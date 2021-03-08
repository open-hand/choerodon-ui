---
order: 6
title:
  zh-CN: 多值
  en-US: Multiple
---

## zh-CN

通过属性`multiple`设置为多值。

## en-US

Multiple values via property `multiple`.

````jsx
import { DataSet, TextField, Row, Col } from 'choerodon-ui/pro';

function handleChange(value, oldValue) {
  console.log('[multiple]', value, '[oldValue]', oldValue);
}

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset multiple]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'user', type: 'string', label: '用户', defaultValue: '', required: true, multiple: ',' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <Row gutter={10}>
        <Col span={12}>
          <TextField dataSet={this.ds} name="user" placeholder="数据源多选" />
        </Col>
        <Col span={12}>
          <TextField multiple onChange={handleChange} placeholder="多选" defaultValue={['wu']} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
