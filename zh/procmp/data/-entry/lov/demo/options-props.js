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
        type: 'object',
        lovCode: 'LOV_CODE',
        optionsProps: (dsProps) => {
          console.log(dsProps);
          return {
            ...dsProps,
            // 修改值集配置，取消分页
            // 注意：组件内存在固定逻辑，个别配置优先级低于内置配置逻辑，具体实现可查看源码
            paging: false,
            events: {
              query({ dataSet, params, data }) {
                console.log('lov 值集查询事件', dataSet, params, data);
                // 根据需要可返回值为 false 阻止查询，实现用户控制查询
                return true;
              },
            },
          };
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
          <Divider orientation="left">optionsProps 控制 Lov 值集配置：</Divider>
          <Lov dataSet={this.ds} name="code" />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
