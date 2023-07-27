import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Row, Col, Tooltip, Icon } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

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

  const renderer = ({ text }) => (
    <div style={{ width: '100%' }}>
      {text && <Icon type="people" />} {text}
    </div>
  );

  const optionRenderer = ({ text }) => (
    <Tooltip title={text} placement="left">
      {renderer({ text })}
    </Tooltip>
  );

  return (
    <Row gutter={10}>
      <Col span={8}>
        <Divider orientation="left">选项渲染添加 icon & 独立 tooltip：</Divider>
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
