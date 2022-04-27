import React from 'react';
import ReactDOM from 'react-dom';
import { Statistic, Row, Col } from 'choerodon-ui';

const { Countdown } = Statistic;
const deadline = Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 30; // Moment is also OK

function onFinish() {
  console.log('finished!');
}

function countDownFormatter(value) {
  return (
    <>
      <span style={{ fontWeight: 400, fontSize: 14, marginRight: 10 }}>
        COUNTDOWN:
      </span>
      {value}
    </>
  );
}

ReactDOM.render(
  <Row gutter={16}>
    <Col span={12}>
      <Countdown title="Countdown" value={deadline} onFinish={onFinish} />
    </Col>
    <Col span={12}>
      <Countdown
        title="Million Seconds"
        value={deadline}
        format="HH:mm:ss:SSS"
      />
    </Col>
    <Col span={24} style={{ marginTop: 32 }}>
      <Countdown
        title="Countdown Formatter"
        value={deadline}
        formatter={countDownFormatter}
      />
    </Col>
    <Col span={24} style={{ marginTop: 32 }}>
      <Countdown
        title="Day Level"
        value={deadline}
        format="D 天 H 时 m 分 s 秒"
      />
    </Col>
  </Row>,
  document.getElementById('container'),
);
