import { DataSet, Select, Row, Col, Tooltip, Icon } from 'choerodon-ui/pro';
import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  const optionDs = new DataSet({
    selection: 'single',
    queryUrl: '/dataset/user/queries',
    autoQuery: true,
    paging: false,
  });

  const ds = new DataSet({
    fields: [
      {
        name: 'user',
        type: 'string',
        textField: 'name',
        valueField: 'userid',
        label: '用户',
        options: optionDs,
      },
    ],
  });

  return (
    <Row gutter={10}>
      <Col span={8}>
        <Select
          dataSet={ds}
          name="user"
          optionRenderer={optionRenderer}
          renderer={renderer}
        />
      </Col>
    </Row>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
