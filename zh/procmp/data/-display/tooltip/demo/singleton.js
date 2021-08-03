import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const handleMouseEnter = React.useCallback(
    (e) =>
      Tooltip.show(e.target, {
        title: e.target.textContent,
        placement: 'topLeft',
      }),
    [],
  );
  const handleMouseLeave = React.useCallback(() => Tooltip.hide(), []);
  return (
    <Row>
      <Col span={12}>
        <div onMouseEnter={handleMouseEnter}>mouseEnter</div>
      </Col>
      <Col span={12}>
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          mouseEnter & mouseLeave
        </div>
      </Col>
    </Row>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
