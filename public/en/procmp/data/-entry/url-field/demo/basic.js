import React from 'react';
import ReactDOM from 'react-dom';
import { UrlField, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log('[basic]', value);
}

ReactDOM.render(
  <Row gutter={10}>
    <Col span={8}>
      <UrlField placeholder="请输入" onChange={log} />
    </Col>
    <Col span={8}>
      <UrlField placeholder="清除按钮" defaultValue="点击清除" clearButton onChange={log} />
    </Col>
    <Col span={8}>
      <UrlField value="不可用" disabled />
    </Col>
  </Row>,
  document.getElementById('container')
);
