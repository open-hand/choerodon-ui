import React from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  // 注意单例模式修改参数影响当前界面使用的所有单例实例;特别注意挂载节点的修改（getPopupContainer）
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
