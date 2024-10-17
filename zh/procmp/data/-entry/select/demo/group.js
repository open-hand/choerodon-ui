import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, Select, Row, Col } from 'choerodon-ui/pro';

const { Option, OptGroup } = Select;

const App = () => {
  const optionDs = React.useMemo(
    () =>
      new DataSet({
        queryUrl: '/common/lov/dataset/LOV_CODE',
        fields: [{ name: 'enabledFlag', type: 'string', group: true }],
        autoQuery: true,
      }),
  );
  const ds = React.useMemo(
    () =>
      new DataSet({
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
      }),
  );
  return (
    <Row gutter={10}>
      <Col span={12}>
        <Select placeholder="子组件 OptGroup 分组">
          <OptGroup label="Manager">
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
          </OptGroup>
          <OptGroup label={<em>Engineer</em>}>
            <Option value="wu">Wu</Option>
          </OptGroup>
        </Select>
      </Col>
      <Col span={12}>
        <Select dataSet={ds} name="code" placeholder="字段 group 属性分组" />
      </Col>
    </Row>
  );
};
ReactDOM.render(<App />, document.getElementById('container'));
