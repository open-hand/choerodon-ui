import React from 'react';
import ReactDOM from 'react-dom';

import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const optionDs = new DataSet({
    selection: 'single',
    queryUrl: '/common/lov/dataset/LOV_CODE',
    fields: [{ name: 'enabledFlag', type: 'string', group: 0 }],
    autoQuery: true,
  });

  const ds = new DataSet({
    fields: [
      {
        name: 'code',
        type: 'string',
        textField: 'description',
        valueField: 'code',
        label: '用户',
        options: optionDs,
      },
    ],
  });

  return (
    <Row gutter={10}>
      <Col span={8}>
        <Select dataSet={ds} name="code" />
      </Col>
    </Row>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
