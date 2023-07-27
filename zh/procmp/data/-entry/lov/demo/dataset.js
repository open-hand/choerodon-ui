import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Lov, Row, Col } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

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
        optionsProps: (dsProps) => {
          console.log(dsProps);
          return dsProps;
        },
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
          <Divider orientation="left">默认单选模式：</Divider>
          <Lov dataSet={this.ds} name="code_string" />
        </Col>
        <Col span={12}>
          <Divider orientation="left">rowbox 单选模式：</Divider>
          <Lov
            dataSet={this.ds}
            name="code"
            // noCache 无数据缓存，每次弹窗时自动重新查询
            tableProps={{ selectionMode: 'rowbox' }} // 勾选模式为 rowbox
          />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
