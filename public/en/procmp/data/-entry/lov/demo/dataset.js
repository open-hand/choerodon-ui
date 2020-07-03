import React from 'react';
import ReactDOM from 'react-dom';
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
          <Lov dataSet={this.ds} name="code" noCache triggerMode='input' tableProps={{ selectionMode: 'rowbox' }} />
        </Col>
        <Col span={12}>
          <Lov dataSet={this.ds} name="code_string" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
