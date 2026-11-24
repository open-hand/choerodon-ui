import React from 'react';
import ReactDOM from 'react-dom';
import { PercentField, Row, Col } from 'choerodon-ui/pro';

const handleChange = (value, oldValue) => {
  console.log('[newValue]', value, '[oldValue]', oldValue);
};

const App = () => {
  return (
    <div>
      <Row gutter={10} style={{ marginBottom: 10 }}>
        <Col span={12}>
          <PercentField
            onChange={handleChange}
            placeholder="精确四位小数"
            precision={4}
          />
        </Col>
        <Col span={12}>
          <PercentField
            onChange={handleChange}
            placeholder="精确四位小数"
            precision={4}
            defaultValue={0.0126}
            step={0.0002}
          />
        </Col>
      </Row>
      <Row gutter={10} style={{ marginBottom: 10 }}>
        <Col span={12}>
          <PercentField
            onChange={handleChange}
            placeholder="德语数字格式"
            precision={4}
            lang="de-DE"
          />
        </Col>
        <Col span={12}>
          <PercentField
            onChange={handleChange}
            placeholder="未设置 precision"
          />
        </Col>
      </Row>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
