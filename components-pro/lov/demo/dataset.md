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
import { DataSet, Lov, Row, Col, Modal } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
console.log('123')
 Modal.confirm({
  title: 'Confirm',
  key: 'ConfirmConfirmConfirm',
  children: (
   <div>
    <p>Some contents...</p >
    <p>Some contents...</p >
    <p>Some contents...</p >
   </div>
  ),
 }).then((button) => {
  Modal.info(`Click ${button}`);
 });
 console.log(
  '[dataset]',
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
   {
    name: 'code',
    textField: 'code',
    type: 'object',
    lovCode: 'LOV_CODE',
    lovPara: { code: '111' },
    required: true,
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
      name="code"
      noCache
      tableProps={{ alwaysShowRowBox: true }}
     />
    </Col>
    <Col span={12}>
     <Lov dataSet={this.ds} name="code_string" searchFieldInPopup />
    </Col>
   </Row>
  );
 }
}

ReactDOM.render(<App />, mountNode);
```
