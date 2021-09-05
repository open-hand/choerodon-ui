import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Lov, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'code',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
          },
          {
            name: 'code_string',
            type: 'object',
            lovCode: 'LOV_CODE',
            multiple: true,
            defaultValue: [{ value: 'c7n', code: 'c7n' }],
          },
        ],
      }),
    [],
  );
  return (
    <Row gutter={10}>
      <Col span={12}>
        <Lov dataSet={ds} name="code" viewMode="popup" />
      </Col>
      <Col span={12}>
        <Lov dataSet={ds} name="code_string" viewMode="popup" />
      </Col>
    </Row>
  );
};
ReactDOM.render(<App />, document.getElementById('container'));
